import { Router } from "express";
import { db } from "@workspace/db";
import {
  sessionsTable, ordersTable, orderItemsTable, paymentsTable, assetsTable,
  shiftsTable, inventoryItemsTable, usersTable, productsTable, productCategoriesTable,
} from "@workspace/db";
import { eq, and, inArray, gte, ne, sql, isNull, isNotNull } from "drizzle-orm";
import { requireAuth, requireTenant } from "../lib/auth";

const router = Router();

/* ─── helpers ──────────────────────────────────────────────── */
function parsePeriod(period: string, now: Date): { from: Date; days: number } {
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  if (period === "today")  return { from, days: 1 };
  if (period === "week")   { from.setDate(from.getDate() - 6);  return { from, days: 7 };  }
  /* month */               from.setDate(from.getDate() - 29); return { from, days: 30 };
}

function r2(n: number) { return Math.round(n * 100) / 100; }

/* ─── Summary ───────────────────────────────────────────────── */
router.get("/dashboard/summary", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const [activeSessions, allAssets, pendingOrders, preparingOrders, inventoryItems, openShift, shifts] = await Promise.all([
      db.select().from(sessionsTable).where(and(eq(sessionsTable.tenantId, tenantId), inArray(sessionsTable.status, ["active", "paused"]))),
      db.select().from(assetsTable).where(eq(assetsTable.tenantId, tenantId)),
      db.select().from(ordersTable).where(and(eq(ordersTable.tenantId, tenantId), eq(ordersTable.status, "pending"))),
      db.select().from(ordersTable).where(and(eq(ordersTable.tenantId, tenantId), eq(ordersTable.status, "preparing"))),
      db.select().from(inventoryItemsTable).where(eq(inventoryItemsTable.tenantId, tenantId)),
      db.select().from(shiftsTable).where(and(eq(shiftsTable.tenantId, tenantId), eq(shiftsTable.status, "open"))).limit(1),
      db.select().from(shiftsTable).where(and(eq(shiftsTable.tenantId, tenantId), eq(shiftsTable.status, "closed"), gte(shiftsTable.closedAt, today))),
    ]);

    // Ground-truth total: verified payments today
    const todayPayments = await db.select().from(paymentsTable)
      .where(and(eq(paymentsTable.tenantId, tenantId), eq(paymentsTable.status, "verified"), gte(paymentsTable.createdAt, today)));
    const revenueToday = todayPayments.reduce((sum, p) => sum + parseFloat(p.amount as string), 0);

    // Gaming time revenue today: sum(totalMinutes / 60 * pricePerHour) for ended sessions
    const endedSessionRows = await db
      .select({ totalMinutes: sessionsTable.totalMinutes, pricePerHour: assetsTable.pricePerHour })
      .from(sessionsTable)
      .innerJoin(assetsTable, eq(sessionsTable.assetId, assetsTable.id))
      .where(and(
        eq(sessionsTable.tenantId, tenantId),
        eq(sessionsTable.status, "ended"),
        gte(sessionsTable.endedAt, today),
      ));
    const gamingRevenueToday = endedSessionRows.reduce((sum, r) => {
      const mins = parseFloat((r.totalMinutes as string) ?? "0");
      const rate = parseFloat((r.pricePerHour as string) ?? "0");
      return sum + (mins / 60) * rate;
    }, 0);

    // Room orders revenue today: delivered/closed orders linked to sessions
    const roomOrderRows = await db.select({ totalAmount: ordersTable.totalAmount })
      .from(ordersTable)
      .where(and(
        eq(ordersTable.tenantId, tenantId),
        isNotNull(ordersTable.sessionId),
        inArray(ordersTable.status, ["delivered", "closed"]),
        gte(ordersTable.createdAt, today),
      ));
    const roomOrdersToday = roomOrderRows.reduce((sum, o) => sum + parseFloat(o.totalAmount as string), 0);

    // Buffet / POS revenue today: orders with no session
    const posOrderRows = await db.select({ totalAmount: ordersTable.totalAmount })
      .from(ordersTable)
      .where(and(
        eq(ordersTable.tenantId, tenantId),
        isNull(ordersTable.sessionId),
        inArray(ordersTable.status, ["delivered", "closed"]),
        gte(ordersTable.createdAt, today),
      ));
    const buffetRevenueToday = posOrderRows.reduce((sum, o) => sum + parseFloat(o.totalAmount as string), 0);

    const lowStockAlerts = inventoryItems.filter(i => {
      const stock = parseFloat(i.currentStock as string);
      const min = i.minStockLevel ? parseFloat(i.minStockLevel as string) : null;
      return min !== null && stock <= min;
    }).length;

    const cashDiscrepancyCount = shifts.filter(s => {
      const diff = s.difference ? parseFloat(s.difference as string) : 0;
      return Math.abs(diff) > 0;
    }).length;

    res.json({
      activeSessions: activeSessions.length,
      occupiedAssets: allAssets.filter(a => a.status === "busy").length,
      totalAssets: allAssets.length,
      revenueToday:       r2(revenueToday),
      gamingRevenueToday: r2(gamingRevenueToday),
      roomOrdersToday:    r2(roomOrdersToday),
      buffetRevenueToday: r2(buffetRevenueToday),
      pendingOrders: pendingOrders.length,
      preparingOrders: preparingOrders.length,
      lowStockAlerts,
      openShift: openShift.length > 0,
      cashDiscrepancyCount,
      buffetWorkload: pendingOrders.length + preparingOrders.length,
    });
  } catch {
    res.status(500).json({ error: "Failed to get dashboard summary" });
  }
});

/* ─── Revenue ────────────────────────────────────────────────── */
router.get("/dashboard/revenue", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const { period = "today", source = "all", method = "all" } = req.query as Record<string, string>;
    const now = new Date();
    const { from, days } = parsePeriod(period, now);

    // Payment-based total (ground truth — filters by source & method)
    const payConditions: any[] = [
      eq(paymentsTable.tenantId, tenantId),
      eq(paymentsTable.status, "verified"),
      gte(paymentsTable.createdAt, from),
    ];
    if (source === "gaming") payConditions.push(isNotNull(paymentsTable.sessionId));
    else if (source === "buffet") payConditions.push(isNull(paymentsTable.sessionId));
    if (method !== "all") payConditions.push(eq(paymentsTable.method, method));

    const payments = await db.select().from(paymentsTable).where(and(...payConditions));

    let cash = 0, instapay = 0, visa = 0;
    payments.forEach(p => {
      const amt = parseFloat(p.amount as string);
      if (p.method === "cash") cash += amt;
      else if (p.method === "instapay") instapay += amt;
      else if (p.method === "visa") visa += amt;
    });

    // Daily breakdown from payments
    const dailyMap: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (days - 1 - i));
      dailyMap[d.toISOString().slice(0, 10)] = 0;
    }
    payments.forEach(p => {
      const day = new Date(p.createdAt!).toISOString().slice(0, 10);
      if (day in dailyMap) dailyMap[day] += parseFloat(p.amount as string);
    });
    const dailyBreakdown = Object.entries(dailyMap).map(([date, total]) => ({ date, total: r2(total) }));

    // Gaming time revenue from ended sessions in period
    const sessionRows = await db
      .select({ totalMinutes: sessionsTable.totalMinutes, pricePerHour: assetsTable.pricePerHour })
      .from(sessionsTable)
      .innerJoin(assetsTable, eq(sessionsTable.assetId, assetsTable.id))
      .where(and(
        eq(sessionsTable.tenantId, tenantId),
        eq(sessionsTable.status, "ended"),
        gte(sessionsTable.endedAt, from),
      ));
    const sessionRevenue = sessionRows.reduce((sum, r) => {
      const mins = parseFloat((r.totalMinutes as string) ?? "0");
      const rate = parseFloat((r.pricePerHour as string) ?? "0");
      return sum + (mins / 60) * rate;
    }, 0);

    // Room orders revenue (session-linked delivered orders)
    const roomOrderRows = await db.select({ totalAmount: ordersTable.totalAmount })
      .from(ordersTable)
      .where(and(
        eq(ordersTable.tenantId, tenantId),
        isNotNull(ordersTable.sessionId),
        inArray(ordersTable.status, ["delivered", "closed"]),
        gte(ordersTable.createdAt, from),
      ));
    const roomOrderRevenue = roomOrderRows.reduce((sum, o) => sum + parseFloat(o.totalAmount as string), 0);

    // POS / buffet revenue (standalone orders, no session)
    const posRows = await db.select({ totalAmount: ordersTable.totalAmount })
      .from(ordersTable)
      .where(and(
        eq(ordersTable.tenantId, tenantId),
        isNull(ordersTable.sessionId),
        inArray(ordersTable.status, ["delivered", "closed"]),
        gte(ordersTable.createdAt, from),
      ));
    const orderRevenue = posRows.reduce((sum, o) => sum + parseFloat(o.totalAmount as string), 0);

    const total = cash + instapay + visa;
    res.json({
      total:            r2(total),
      sessionRevenue:   r2(sessionRevenue),
      roomOrderRevenue: r2(roomOrderRevenue),
      orderRevenue:     r2(orderRevenue),
      period, source, method,
      paymentMethodBreakdown: {
        cash:     r2(cash),
        instapay: r2(instapay),
        visa:     r2(visa),
      },
      dailyBreakdown,
    });
  } catch {
    res.status(500).json({ error: "Failed to get revenue stats" });
  }
});

/* ─── Employee Performance ───────────────────────────────────── */
router.get("/dashboard/employee-performance", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const users = await db.select().from(usersTable).where(and(eq(usersTable.tenantId, tenantId), eq(usersTable.isActive, true)));
    const result = await Promise.all(users.map(async u => {
      const orders = await db.select().from(ordersTable)
        .where(and(eq(ordersTable.tenantId, tenantId), eq(ordersTable.createdByUserId, u.id)));
      const sessions = await db.select().from(sessionsTable)
        .where(and(eq(sessionsTable.tenantId, tenantId), eq(sessionsTable.userId, u.id)));
      const revenue = sessions.reduce((sum, s) => sum + (s.totalCost ? parseFloat(s.totalCost as string) : 0), 0);
      return {
        userId: u.id, userName: u.name, role: u.role,
        ordersHandled: orders.length,
        sessionsStarted: sessions.length,
        revenue: r2(revenue),
      };
    }));
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to get employee performance" });
  }
});

/* ─── Breakdown ──────────────────────────────────────────────── */
const ASSET_TYPE_AR: Record<string, string> = {
  ps: "بلايستيشن",
  billiard: "بلياردو",
  air_hockey: "هوكي الهواء",
  babyfoot: "كرة القدم المصغرة",
  other: "أخرى",
};

router.get("/dashboard/breakdown", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const { period = "today", source = "all" } = req.query as Record<string, string>;
    const { from } = parsePeriod(period, new Date());

    /* ── Gaming time breakdown by asset type ── */
    let gamingByType: any[] = [];
    let gamingTotal = 0;

    if (source !== "buffet") {
      const rows = await db
        .select({
          type: assetsTable.type,
          total: sql<string>`coalesce(sum(cast(${sessionsTable.totalMinutes} as float) / 60.0 * cast(${assetsTable.pricePerHour} as float)), 0)`,
          sessions: sql<string>`count(${sessionsTable.id})`,
        })
        .from(sessionsTable)
        .innerJoin(assetsTable, eq(sessionsTable.assetId, assetsTable.id))
        .where(and(
          eq(sessionsTable.tenantId, tenantId),
          eq(sessionsTable.status, "ended"),
          gte(sessionsTable.endedAt, from),
        ))
        .groupBy(assetsTable.type);

      gamingByType = rows
        .map(r => ({
          type: r.type,
          typeAr: ASSET_TYPE_AR[r.type] ?? r.type,
          total: r2(parseFloat(r.total)),
          sessions: parseInt(r.sessions, 10),
        }))
        .sort((a, b) => b.total - a.total);

      gamingTotal = gamingByType.reduce((s, r) => s + r.total, 0);
    }

    /* ── Room orders breakdown by category (session-linked) ── */
    let roomOrdersByCategory: any[] = [];
    let roomOrdersTotal = 0;

    if (source !== "buffet") {
      const roomRows = await db
        .select({
          categoryId: productCategoriesTable.id,
          categoryName: productCategoriesTable.name,
          categoryNameAr: productCategoriesTable.nameAr,
          productId: productsTable.id,
          productName: productsTable.name,
          productNameAr: productsTable.nameAr,
          quantity: sql<string>`sum(${orderItemsTable.quantity})`,
          total: sql<string>`coalesce(sum(${orderItemsTable.totalPrice}), 0)`,
        })
        .from(orderItemsTable)
        .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
        .innerJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
        .leftJoin(productCategoriesTable, eq(productsTable.categoryId, productCategoriesTable.id))
        .where(and(
          eq(ordersTable.tenantId, tenantId),
          isNotNull(ordersTable.sessionId),
          ne(ordersTable.status, "cancelled"),
          gte(ordersTable.createdAt, from),
        ))
        .groupBy(
          productCategoriesTable.id, productCategoriesTable.name, productCategoriesTable.nameAr,
          productsTable.id, productsTable.name, productsTable.nameAr,
        );

      roomOrdersByCategory = buildCategoryMap(roomRows);
      roomOrdersTotal = roomOrdersByCategory.reduce((s, c) => s + c.total, 0);
    }

    /* ── POS / buffet breakdown by category (no session) ── */
    let posbyCategory: any[] = [];
    let buffetTotal = 0;

    if (source !== "gaming") {
      const posRows = await db
        .select({
          categoryId: productCategoriesTable.id,
          categoryName: productCategoriesTable.name,
          categoryNameAr: productCategoriesTable.nameAr,
          productId: productsTable.id,
          productName: productsTable.name,
          productNameAr: productsTable.nameAr,
          quantity: sql<string>`sum(${orderItemsTable.quantity})`,
          total: sql<string>`coalesce(sum(${orderItemsTable.totalPrice}), 0)`,
        })
        .from(orderItemsTable)
        .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
        .innerJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
        .leftJoin(productCategoriesTable, eq(productsTable.categoryId, productCategoriesTable.id))
        .where(and(
          eq(ordersTable.tenantId, tenantId),
          isNull(ordersTable.sessionId),
          ne(ordersTable.status, "cancelled"),
          gte(ordersTable.createdAt, from),
        ))
        .groupBy(
          productCategoriesTable.id, productCategoriesTable.name, productCategoriesTable.nameAr,
          productsTable.id, productsTable.name, productsTable.nameAr,
        );

      posbyCategory = buildCategoryMap(posRows);
      buffetTotal = posbyCategory.reduce((s, c) => s + c.total, 0);
    }

    res.json({
      period, source,
      gaming:      { total: r2(gamingTotal),      byType: gamingByType },
      roomOrders:  { total: r2(roomOrdersTotal),  byCategory: roomOrdersByCategory },
      buffet:      { total: r2(buffetTotal),       byCategory: posbyCategory },
      grandTotal:  r2(gamingTotal + roomOrdersTotal + buffetTotal),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get revenue breakdown" });
  }
});

/* ─── Rooms Overview ─────────────────────────────────────────── */
router.get("/dashboard/rooms", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const { period = "today" } = req.query as Record<string, string>;
    const { from } = parsePeriod(period, new Date());

    // All assets for this tenant
    const assets = await db.select().from(assetsTable).where(eq(assetsTable.tenantId, tenantId));

    // Gaming stats per asset (ended sessions)
    const gamingRows = await db
      .select({
        assetId: sessionsTable.assetId,
        sessionCount: sql<string>`count(${sessionsTable.id})`,
        totalMinutes: sql<string>`coalesce(sum(cast(${sessionsTable.totalMinutes} as float)), 0)`,
        gamingRevenue: sql<string>`coalesce(sum(cast(${sessionsTable.totalMinutes} as float) / 60.0 * cast(${assetsTable.pricePerHour} as float)), 0)`,
      })
      .from(sessionsTable)
      .innerJoin(assetsTable, eq(sessionsTable.assetId, assetsTable.id))
      .where(and(
        eq(sessionsTable.tenantId, tenantId),
        eq(sessionsTable.status, "ended"),
        gte(sessionsTable.endedAt, from),
      ))
      .groupBy(sessionsTable.assetId);

    // Room orders per asset (via session → asset join)
    const roomOrderRows = await db
      .select({
        assetId: sessionsTable.assetId,
        roomOrderRevenue: sql<string>`coalesce(sum(cast(${ordersTable.totalAmount} as float)), 0)`,
      })
      .from(ordersTable)
      .innerJoin(sessionsTable, eq(ordersTable.sessionId, sessionsTable.id))
      .where(and(
        eq(ordersTable.tenantId, tenantId),
        isNotNull(ordersTable.sessionId),
        inArray(ordersTable.status, ["delivered", "closed"]),
        gte(ordersTable.createdAt, from),
      ))
      .groupBy(sessionsTable.assetId);

    // Build lookup maps
    const gamingMap = new Map(gamingRows.map(r => [r.assetId, r]));
    const orderMap  = new Map(roomOrderRows.map(r => [r.assetId, r]));

    const result = assets.map(a => {
      const g = gamingMap.get(a.id);
      const o = orderMap.get(a.id);
      const gamingRevenue    = g ? r2(parseFloat(g.gamingRevenue))    : 0;
      const roomOrderRevenue = o ? r2(parseFloat(o.roomOrderRevenue)) : 0;
      return {
        assetId:          a.id,
        assetName:        a.name,
        assetNameAr:      a.nameAr ?? null,
        assetType:        a.type,
        assetStatus:      a.status,
        pricePerHour:     parseFloat(a.pricePerHour as string),
        sessionCount:     g ? parseInt(g.sessionCount, 10) : 0,
        totalMinutes:     g ? r2(parseFloat(g.totalMinutes)) : 0,
        gamingRevenue,
        roomOrderRevenue,
        totalRevenue:     r2(gamingRevenue + roomOrderRevenue),
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get rooms overview" });
  }
});

/* ─── Category map helper ─────────────────────────────────────── */
function buildCategoryMap(rows: any[]) {
  const map = new Map<string, {
    categoryId: number | null;
    categoryName: string;
    categoryNameAr: string | null;
    total: number;
    products: { productId: number; name: string; nameAr: string | null; quantity: number; total: number }[];
  }>();

  for (const r of rows) {
    const key = r.categoryId !== null ? String(r.categoryId) : "__none__";
    if (!map.has(key)) {
      map.set(key, {
        categoryId: r.categoryId ?? null,
        categoryName: r.categoryName ?? "غير مصنف",
        categoryNameAr: r.categoryNameAr ?? null,
        total: 0,
        products: [],
      });
    }
    const cat = map.get(key)!;
    const rowTotal = r2(parseFloat(r.total));
    cat.total = r2(cat.total + rowTotal);
    cat.products.push({
      productId: r.productId,
      name: r.productName,
      nameAr: r.productNameAr ?? null,
      quantity: parseInt(r.quantity, 10),
      total: rowTotal,
    });
  }

  return Array.from(map.values())
    .map(c => ({ ...c, products: c.products.sort((a, b) => b.total - a.total) }))
    .sort((a, b) => b.total - a.total);
}

export default router;
