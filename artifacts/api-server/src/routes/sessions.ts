import { Router } from "express";
import { db } from "@workspace/db";
import { sessionsTable, sessionLogsTable, assetsTable, usersTable, paymentsTable, ordersTable, orderItemsTable, productsTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { requireAuth, requireTenant, requireRole } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";

const router = Router();

const CASHIER_UP = requireRole("platform_owner", "owner", "manager", "cashier");
const MGMT = requireRole("platform_owner", "owner", "manager");

async function writeSessionLog(params: {
  tenantId: number;
  sessionId: number;
  action: string;
  previousStatus: string | null;
  newStatus: string | null;
  performedByUserId: number;
  note?: string;
}) {
  await db.insert(sessionLogsTable).values({
    tenantId: params.tenantId,
    sessionId: params.sessionId,
    action: params.action,
    previousStatus: params.previousStatus,
    newStatus: params.newStatus,
    performedByUserId: params.performedByUserId,
    note: params.note ?? null,
  });
}

function calcMinutes(startedAt: Date, pausedAt: Date | null, endedAt: Date | null, pausedDuration: number): number {
  const end = endedAt || new Date();
  const totalMs = end.getTime() - startedAt.getTime();
  return Math.max(0, totalMs / 60000 - pausedDuration);
}

async function formatSession(s: typeof sessionsTable.$inferSelect, includeNames = true) {
  let assetName = null, assetNameAr = null, userName = null, pricePerHour = 0;
  if (includeNames) {
    const [asset] = await db.select({ name: assetsTable.name, nameAr: assetsTable.nameAr, pricePerHour: assetsTable.pricePerHour })
      .from(assetsTable).where(eq(assetsTable.id, s.assetId)).limit(1);
    const [user] = await db.select({ name: usersTable.name })
      .from(usersTable).where(eq(usersTable.id, s.userId)).limit(1);
    assetName = asset?.name ?? null;
    assetNameAr = asset?.nameAr ?? null;
    userName = user?.name ?? null;
    pricePerHour = asset ? parseFloat(asset.pricePerHour as string) : 0;
  }
  return {
    id: s.id,
    assetId: s.assetId,
    assetName,
    assetNameAr,
    userId: s.userId,
    userName,
    status: s.status,
    startedAt: s.startedAt,
    pausedAt: s.pausedAt,
    endedAt: s.endedAt,
    totalMinutes: s.totalMinutes ? parseFloat(s.totalMinutes as string) : null,
    totalCost: s.totalCost ? parseFloat(s.totalCost as string) : null,
    cancelReason: s.cancelReason,
    notes: s.notes,
    pricePerHour,
    pausedDurationMinutes: parseFloat((s.pausedDurationMinutes as string) || "0"),
  };
}

router.get("/sessions", requireAuth, requireTenant, async (req, res) => {
  try {
    const { status, assetId } = req.query;
    let q = db.select().from(sessionsTable).where(eq(sessionsTable.tenantId, req.user!.tenantId!));
    const sessions = await q.orderBy(sessionsTable.startedAt);
    let result = sessions;
    if (status) result = result.filter(s => s.status === status);
    if (assetId) result = result.filter(s => s.assetId === parseInt(assetId as string));
    const formatted = await Promise.all(result.slice(-100).map(s => formatSession(s)));
    res.json(formatted.reverse());
  } catch {
    res.status(500).json({ error: "Failed to list sessions" });
  }
});

router.get("/sessions/active", requireAuth, requireTenant, async (req, res) => {
  try {
    const sessions = await db.select().from(sessionsTable)
      .where(and(
        eq(sessionsTable.tenantId, req.user!.tenantId!),
        inArray(sessionsTable.status, ["active", "paused"])
      ));
    const result = await Promise.all(sessions.map(async s => {
      const base = await formatSession(s);
      const pausedDuration = parseFloat((s.pausedDurationMinutes as string) || "0");
      const currentMinutes = calcMinutes(s.startedAt, s.pausedAt, null, pausedDuration);
      const pricePerHour = base.pricePerHour;
      const currentCost = Math.round((currentMinutes / 60) * pricePerHour * 100) / 100;
      const allOrders = await db.select({ totalAmount: ordersTable.totalAmount, status: ordersTable.status })
        .from(ordersTable)
        .where(and(eq(ordersTable.sessionId, s.id), eq(ordersTable.tenantId, s.tenantId)));
      const deliveredCost = allOrders
        .filter(o => o.status === "delivered")
        .reduce((sum, o) => sum + parseFloat(o.totalAmount as string), 0);
      const ordersCost = Math.round(deliveredCost * 100) / 100;
      const undeliveredOrders = allOrders
        .filter(o => ["pending", "preparing", "ready"].includes(o.status as string))
        .map(o => ({ status: o.status, totalAmount: parseFloat(o.totalAmount as string) }));
      const totalCost = Math.round((currentCost + ordersCost) * 100) / 100;
      return { ...base, currentMinutes: Math.round(currentMinutes), currentCost, ordersCost, totalCost, undeliveredOrders };
    }));
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to list active sessions" });
  }
});

router.get("/sessions/:sessionId", requireAuth, requireTenant, async (req, res) => {
  try {
    const id = parseInt(req.params.sessionId as string);
    const [s] = await db.select().from(sessionsTable)
      .where(and(eq(sessionsTable.id, id), eq(sessionsTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!s) { res.status(404).json({ error: "Not found" }); return; }
    const base = await formatSession(s);
    const orders = await db.select().from(ordersTable)
      .where(and(eq(ordersTable.sessionId, id), eq(ordersTable.tenantId, req.user!.tenantId!)));
    const ordersWithItems = await Promise.all(orders.map(async o => {
      const items = await db.select({
        id: orderItemsTable.id,
        productId: orderItemsTable.productId,
        productName: productsTable.name,
        productNameAr: productsTable.nameAr,
        quantity: orderItemsTable.quantity,
        unitPrice: orderItemsTable.unitPrice,
        totalPrice: orderItemsTable.totalPrice,
        notes: orderItemsTable.notes,
      }).from(orderItemsTable)
        .leftJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
        .where(eq(orderItemsTable.orderId, o.id));
      return {
        ...o,
        totalAmount: parseFloat(o.totalAmount as string),
        items: items.map(i => ({ ...i, unitPrice: parseFloat(i.unitPrice as string), totalPrice: parseFloat(i.totalPrice as string) })),
      };
    }));
    const payments = await db.select().from(paymentsTable)
      .where(and(eq(paymentsTable.sessionId, id), eq(paymentsTable.tenantId, req.user!.tenantId!)));
    const rawLogs = await db.select({
      id: sessionLogsTable.id,
      action: sessionLogsTable.action,
      previousStatus: sessionLogsTable.previousStatus,
      newStatus: sessionLogsTable.newStatus,
      note: sessionLogsTable.note,
      performedByUserId: sessionLogsTable.performedByUserId,
      performedByName: usersTable.name,
      createdAt: sessionLogsTable.createdAt,
    }).from(sessionLogsTable)
      .leftJoin(usersTable, eq(sessionLogsTable.performedByUserId, usersTable.id))
      .where(and(eq(sessionLogsTable.sessionId, id), eq(sessionLogsTable.tenantId, req.user!.tenantId!)))
      .orderBy(sessionLogsTable.createdAt);
    res.json({
      ...base,
      orders: ordersWithItems,
      payments: payments.map(p => ({ ...p, amount: parseFloat(p.amount as string) })),
      sessionLogs: rawLogs,
    });
  } catch {
    res.status(500).json({ error: "Failed to get session" });
  }
});

// Start session: cashier and above
router.post("/sessions", requireAuth, requireTenant, CASHIER_UP, async (req, res) => {
  try {
    const { assetId, notes } = req.body;
    if (!assetId) { res.status(400).json({ error: "assetId required" }); return; }
    const [asset] = await db.select().from(assetsTable)
      .where(and(eq(assetsTable.id, assetId), eq(assetsTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!asset) { res.status(404).json({ error: "Asset not found" }); return; }
    if (asset.status === "busy") { res.status(400).json({ error: "Asset is busy" }); return; }

    const [session] = await db.insert(sessionsTable).values({
      tenantId: req.user!.tenantId!,
      assetId,
      userId: req.user!.id,
      status: "active",
      notes,
    }).returning();
    await db.update(assetsTable).set({ status: "busy" }).where(eq(assetsTable.id, assetId));
    await writeAuditLog({ user: req.user, action: "start_session", entityType: "session", entityId: session.id, newValue: { assetId } });
    await writeSessionLog({ tenantId: req.user!.tenantId!, sessionId: session.id, action: "started", previousStatus: null, newStatus: "active", performedByUserId: req.user!.id });
    res.status(201).json(await formatSession(session));
  } catch {
    res.status(500).json({ error: "Failed to start session" });
  }
});

// Pause/resume: cashier and above
router.post("/sessions/:sessionId/pause", requireAuth, requireTenant, CASHIER_UP, async (req, res) => {
  try {
    const id = parseInt(req.params.sessionId as string);
    const [s] = await db.select().from(sessionsTable)
      .where(and(eq(sessionsTable.id, id), eq(sessionsTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!s || s.status !== "active") { res.status(400).json({ error: "Session not active" }); return; }
    const [updated] = await db.update(sessionsTable).set({ status: "paused", pausedAt: new Date() })
      .where(eq(sessionsTable.id, id)).returning();
    await writeAuditLog({ user: req.user, action: "pause_session", entityType: "session", entityId: id });
    await writeSessionLog({ tenantId: req.user!.tenantId!, sessionId: id, action: "paused", previousStatus: "active", newStatus: "paused", performedByUserId: req.user!.id });
    res.json(await formatSession(updated));
  } catch {
    res.status(500).json({ error: "Failed to pause session" });
  }
});

router.post("/sessions/:sessionId/resume", requireAuth, requireTenant, CASHIER_UP, async (req, res) => {
  try {
    const id = parseInt(req.params.sessionId as string);
    const [s] = await db.select().from(sessionsTable)
      .where(and(eq(sessionsTable.id, id), eq(sessionsTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!s || s.status !== "paused") { res.status(400).json({ error: "Session not paused" }); return; }
    const pausedMinutes = s.pausedAt ? (Date.now() - s.pausedAt.getTime()) / 60000 : 0;
    const prevPaused = parseFloat((s.pausedDurationMinutes as string) || "0");
    const [updated] = await db.update(sessionsTable).set({
      status: "active",
      pausedAt: null,
      pausedDurationMinutes: String(prevPaused + pausedMinutes),
    }).where(eq(sessionsTable.id, id)).returning();
    await writeAuditLog({ user: req.user, action: "resume_session", entityType: "session", entityId: id });
    await writeSessionLog({ tenantId: req.user!.tenantId!, sessionId: id, action: "resumed", previousStatus: "paused", newStatus: "active", performedByUserId: req.user!.id });
    res.json(await formatSession(updated));
  } catch {
    res.status(500).json({ error: "Failed to resume session" });
  }
});

// End session: cashier and above; requires verified payment
router.post("/sessions/:sessionId/end", requireAuth, requireTenant, CASHIER_UP, async (req, res) => {
  try {
    const id = parseInt(req.params.sessionId as string);
    const [s] = await db.select().from(sessionsTable)
      .where(and(eq(sessionsTable.id, id), eq(sessionsTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!s || !["active", "paused"].includes(s.status)) {
      res.status(400).json({ error: "Session cannot be ended" }); return;
    }
    const [asset] = await db.select({ pricePerHour: assetsTable.pricePerHour })
      .from(assetsTable).where(eq(assetsTable.id, s.assetId)).limit(1);
    const pricePerHour = asset ? parseFloat(asset.pricePerHour as string) : 0;
    const pausedDuration = parseFloat((s.pausedDurationMinutes as string) || "0");
    let extraPause = 0;
    if (s.status === "paused" && s.pausedAt) {
      extraPause = (Date.now() - s.pausedAt.getTime()) / 60000;
    }
    const totalMinutes = calcMinutes(s.startedAt, s.pausedAt, new Date(), pausedDuration + extraPause);
    const gamingCost = (totalMinutes / 60) * pricePerHour;
    const roundedGamingCost = Math.round(gamingCost * 100) / 100;

    // Fetch all orders for this session; only delivered ones are billable now.
    const allSessionOrders = await db.select({ totalAmount: ordersTable.totalAmount, status: ordersTable.status })
      .from(ordersTable)
      .where(and(eq(ordersTable.sessionId, id), eq(ordersTable.tenantId, req.user!.tenantId!)));
    const deliveredOrdersCost = Math.round(
      allSessionOrders.filter(o => o.status === "delivered")
        .reduce((sum, o) => sum + parseFloat(o.totalAmount as string), 0) * 100
    ) / 100;
    const undeliveredOrders = allSessionOrders
      .filter(o => ["pending", "preparing", "ready"].includes(o.status as string))
      .map(o => ({ status: o.status, totalAmount: parseFloat(o.totalAmount as string) }));
    const grandTotal = Math.round((roundedGamingCost + deliveredOrdersCost) * 100) / 100;

    // Payment gating: verified payments must cover gaming cost + delivered orders cost.
    if (grandTotal > 0) {
      const existingPayments = await db.select().from(paymentsTable)
        .where(and(
          eq(paymentsTable.sessionId, id),
          eq(paymentsTable.tenantId, req.user!.tenantId!),
          eq(paymentsTable.status, "verified")
        ));
      const verifiedTotal = existingPayments.reduce((sum, p) => sum + parseFloat(p.amount as string), 0);
      if (verifiedTotal < grandTotal) {
        res.status(402).json({
          error: "Payment required before ending session. Create and verify a payment first.",
          totalCost: grandTotal,
          gamingCost: roundedGamingCost,
          deliveredOrdersCost,
          undeliveredOrders,
          verifiedAmount: Math.round(verifiedTotal * 100) / 100,
          remainingAmount: Math.round((grandTotal - verifiedTotal) * 100) / 100,
        });
        return;
      }
    }

    const [updated] = await db.update(sessionsTable).set({
      status: "ended",
      endedAt: new Date(),
      totalMinutes: String(Math.round(totalMinutes * 100) / 100),
      totalCost: String(grandTotal),
    }).where(eq(sessionsTable.id, id)).returning();
    await db.update(assetsTable).set({ status: "available" }).where(eq(assetsTable.id, s.assetId));
    await writeAuditLog({ user: req.user, action: "end_session", entityType: "session", entityId: id, newValue: { totalMinutes: Math.round(totalMinutes * 100) / 100, totalCost: grandTotal } });
    await writeSessionLog({ tenantId: req.user!.tenantId!, sessionId: id, action: "ended", previousStatus: s.status, newStatus: "ended", performedByUserId: req.user!.id });
    res.json(await formatSession(updated));
  } catch {
    res.status(500).json({ error: "Failed to end session" });
  }
});

// Cancel session: manager and above
router.post("/sessions/:sessionId/cancel", requireAuth, requireTenant, MGMT, async (req, res) => {
  try {
    const id = parseInt(req.params.sessionId as string);
    const { reason } = req.body;
    if (!reason) { res.status(400).json({ error: "reason required" }); return; }
    const [s] = await db.select().from(sessionsTable)
      .where(and(eq(sessionsTable.id, id), eq(sessionsTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!s || s.status === "cancelled") { res.status(400).json({ error: "Cannot cancel" }); return; }
    const [updated] = await db.update(sessionsTable).set({ status: "cancelled", cancelReason: reason, endedAt: new Date() })
      .where(eq(sessionsTable.id, id)).returning();
    await db.update(assetsTable).set({ status: "available" }).where(eq(assetsTable.id, s.assetId));
    await writeAuditLog({ user: req.user, action: "cancel_session", entityType: "session", entityId: id, newValue: { reason } });
    await writeSessionLog({ tenantId: req.user!.tenantId!, sessionId: id, action: "cancelled", previousStatus: s.status, newStatus: "cancelled", performedByUserId: req.user!.id, note: reason });
    res.json(await formatSession(updated));
  } catch {
    res.status(500).json({ error: "Failed to cancel session" });
  }
});

export default router;
