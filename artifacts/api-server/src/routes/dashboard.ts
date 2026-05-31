import { Router } from "express";
import { db } from "@workspace/db";
import { sessionsTable, ordersTable, orderItemsTable, paymentsTable, assetsTable, shiftsTable, inventoryItemsTable, usersTable, productsTable, productCategoriesTable } from "@workspace/db";
import { eq, and, inArray, gte, ne, sql } from "drizzle-orm";
import { requireAuth, requireTenant } from "../lib/auth";

const router = Router();

router.get("/dashboard/summary", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeSessions, allAssets, pendingOrders, preparingOrders, inventoryItems, openShift, shifts] = await Promise.all([
      db.select().from(sessionsTable).where(and(eq(sessionsTable.tenantId, tenantId), inArray(sessionsTable.status, ["active", "paused"]))),
      db.select().from(assetsTable).where(eq(assetsTable.tenantId, tenantId)),
      db.select().from(ordersTable).where(and(eq(ordersTable.tenantId, tenantId), eq(ordersTable.status, "pending"))),
      db.select().from(ordersTable).where(and(eq(ordersTable.tenantId, tenantId), eq(ordersTable.status, "preparing"))),
      db.select().from(inventoryItemsTable).where(eq(inventoryItemsTable.tenantId, tenantId)),
      db.select().from(shiftsTable).where(and(eq(shiftsTable.tenantId, tenantId), eq(shiftsTable.status, "open"))).limit(1),
      db.select().from(shiftsTable).where(and(eq(shiftsTable.tenantId, tenantId), eq(shiftsTable.status, "closed"), gte(shiftsTable.closedAt, today))),
    ]);

    // Revenue today from verified payments
    const todayPayments = await db.select().from(paymentsTable)
      .where(and(eq(paymentsTable.tenantId, tenantId), eq(paymentsTable.status, "verified"), gte(paymentsTable.createdAt, today)));
    const revenueToday = todayPayments.reduce((sum, p) => sum + parseFloat(p.amount as string), 0);

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
      revenueToday: Math.round(revenueToday * 100) / 100,
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

router.get("/dashboard/revenue", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const { period = "today" } = req.query;
    const now = new Date();
    let from: Date;
    let days = 1;
    if (period === "today") { from = new Date(); from.setHours(0,0,0,0); days = 1; }
    else if (period === "week") { from = new Date(now); from.setHours(0,0,0,0); from.setDate(from.getDate() - 6); days = 7; }
    else { from = new Date(now); from.setHours(0,0,0,0); from.setDate(from.getDate() - 29); days = 30; }

    const payments = await db.select().from(paymentsTable)
      .where(and(eq(paymentsTable.tenantId, tenantId), eq(paymentsTable.status, "verified"), gte(paymentsTable.createdAt, from)));

    let cash = 0, instapay = 0, visa = 0;
    payments.forEach(p => {
      const amt = parseFloat(p.amount as string);
      if (p.method === "cash") cash += amt;
      else if (p.method === "instapay") instapay += amt;
      else if (p.method === "visa") visa += amt;
    });

    // Build daily breakdown map
    const dailyMap: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (days - 1 - i));
      dailyMap[d.toISOString().slice(0, 10)] = 0;
    }
    payments.forEach(p => {
      const day = new Date(p.createdAt!).toISOString().slice(0, 10);
      if (day in dailyMap) dailyMap[day] += parseFloat(p.amount as string);
    });
    const dailyBreakdown = Object.entries(dailyMap).map(([date, total]) => ({
      date,
      total: Math.round(total * 100) / 100,
    }));

    res.json({
      total: Math.round((cash + instapay + visa) * 100) / 100,
      sessionRevenue: Math.round((cash + instapay + visa) * 100) / 100,
      orderRevenue: 0,
      period: period as string,
      paymentMethodBreakdown: { cash: Math.round(cash*100)/100, instapay: Math.round(instapay*100)/100, visa: Math.round(visa*100)/100 },
      dailyBreakdown,
    });
  } catch {
    res.status(500).json({ error: "Failed to get revenue stats" });
  }
});

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
        revenue: Math.round(revenue * 100) / 100,
      };
    }));
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to get employee performance" });
  }
});

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
    const { period = "today" } = req.query;
    const now = new Date();
    let from: Date;
    if (period === "today") { from = new Date(); from.setHours(0, 0, 0, 0); }
    else if (period === "week") { from = new Date(now); from.setHours(0, 0, 0, 0); from.setDate(from.getDate() - 6); }
    else { from = new Date(now); from.setHours(0, 0, 0, 0); from.setDate(from.getDate() - 29); }

    // Gaming: ended sessions in period, grouped by asset type
    const gamingRows = await db
      .select({
        type: assetsTable.type,
        total: sql<string>`coalesce(sum(${sessionsTable.totalCost}), 0)`,
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

    const gamingByType = gamingRows
      .map(r => ({
        type: r.type,
        typeAr: ASSET_TYPE_AR[r.type] ?? r.type,
        total: Math.round(parseFloat(r.total) * 100) / 100,
        sessions: parseInt(r.sessions, 10),
      }))
      .sort((a, b) => b.total - a.total);

    const gamingTotal = gamingByType.reduce((s, r) => s + r.total, 0);

    // Buffet: order_items for non-cancelled orders in period, grouped by category + product
    const buffetRows = await db
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
        ne(ordersTable.status, "cancelled"),
        gte(ordersTable.createdAt, from),
      ))
      .groupBy(
        productCategoriesTable.id,
        productCategoriesTable.name,
        productCategoriesTable.nameAr,
        productsTable.id,
        productsTable.name,
        productsTable.nameAr,
      );

    // Aggregate buffet rows into categories
    const categoryMap = new Map<string, {
      categoryId: number | null;
      categoryName: string;
      categoryNameAr: string | null;
      total: number;
      products: { productId: number; name: string; nameAr: string | null; quantity: number; total: number }[];
    }>();

    for (const r of buffetRows) {
      const key = r.categoryId !== null ? String(r.categoryId) : "__none__";
      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          categoryId: r.categoryId ?? null,
          categoryName: r.categoryName ?? "غير مصنف",
          categoryNameAr: r.categoryNameAr ?? null,
          total: 0,
          products: [],
        });
      }
      const cat = categoryMap.get(key)!;
      const rowTotal = Math.round(parseFloat(r.total) * 100) / 100;
      cat.total = Math.round((cat.total + rowTotal) * 100) / 100;
      cat.products.push({
        productId: r.productId,
        name: r.productName,
        nameAr: r.productNameAr ?? null,
        quantity: parseInt(r.quantity, 10),
        total: rowTotal,
      });
    }

    const byCategory = Array.from(categoryMap.values())
      .map(c => ({ ...c, products: c.products.sort((a, b) => b.total - a.total) }))
      .sort((a, b) => b.total - a.total);

    const buffetTotal = byCategory.reduce((s, c) => s + c.total, 0);

    res.json({
      period: period as string,
      gaming: { total: Math.round(gamingTotal * 100) / 100, byType: gamingByType },
      buffet: { total: Math.round(buffetTotal * 100) / 100, byCategory },
      grandTotal: Math.round((gamingTotal + buffetTotal) * 100) / 100,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get revenue breakdown" });
  }
});

export default router;
