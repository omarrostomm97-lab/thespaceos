import { Router } from "express";
import { db } from "@workspace/db";
import { shiftsTable, usersTable, paymentsTable, sessionsTable, ordersTable, orderItemsTable, productsTable, assetsTable, financeTransactionsTable } from "@workspace/db";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import { requireAuth, requireTenant, requireRole } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";

const router = Router();

const CASHIER_UP = requireRole("platform_owner", "owner", "manager", "cashier");
const MGMT = requireRole("platform_owner", "owner", "manager");

const fmtShift = (s: typeof shiftsTable.$inferSelect, userName?: string | null) => ({
  id: s.id, userId: s.userId, userName: userName ?? null,
  status: s.status, openingCash: parseFloat(s.openingCash as string),
  expectedCash: s.expectedCash ? parseFloat(s.expectedCash as string) : null,
  actualCash: s.actualCash ? parseFloat(s.actualCash as string) : null,
  difference: s.difference ? parseFloat(s.difference as string) : null,
  differenceExplanation: s.differenceExplanation,
  openedAt: s.openedAt, closedAt: s.closedAt,
});

router.get("/shifts", requireAuth, requireTenant, async (req, res) => {
  try {
    const shifts = await db.select().from(shiftsTable)
      .where(eq(shiftsTable.tenantId, req.user!.tenantId!))
      .orderBy(shiftsTable.openedAt);
    const result = await Promise.all(shifts.reverse().map(async s => {
      const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, s.userId)).limit(1);
      return fmtShift(s, user?.name);
    }));
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to list shifts" });
  }
});

router.get("/shifts/current", requireAuth, requireTenant, async (req, res) => {
  try {
    const [shift] = await db.select().from(shiftsTable)
      .where(and(eq(shiftsTable.tenantId, req.user!.tenantId!), eq(shiftsTable.status, "open")))
      .limit(1);
    if (!shift) { res.json(null); return; }
    const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, shift.userId)).limit(1);
    // Compute live expected cash: opening cash + ALL verified cash payments from every service
    // (sessions/gaming, buffet orders, babyfoot, etc.) since the shift opened
    const cashPayments = await db.select({ amount: paymentsTable.amount })
      .from(paymentsTable)
      .where(and(
        eq(paymentsTable.tenantId, req.user!.tenantId!),
        eq(paymentsTable.method, "cash"),
        eq(paymentsTable.status, "verified"),
        gte(paymentsTable.createdAt, shift.openedAt)
      ));
    const cashTotal = cashPayments.reduce((sum, p) => sum + parseFloat(p.amount as string), 0);
    const withdrawals = await db.select({ amount: financeTransactionsTable.amount })
      .from(financeTransactionsTable)
      .where(and(
        eq(financeTransactionsTable.tenantId, req.user!.tenantId!),
        eq(financeTransactionsTable.type, "owner_withdrawal"),
        gte(financeTransactionsTable.createdAt, shift.openedAt)
      ));
    const withdrawalTotal = withdrawals.reduce((sum, w) => sum + parseFloat(w.amount as string), 0);
    const liveExpectedCash = parseFloat(shift.openingCash as string) + cashTotal - withdrawalTotal;
    const formatted = fmtShift(shift, user?.name);
    formatted.expectedCash = liveExpectedCash;
    res.json({ ...formatted, withdrawalTotal, grossCash: parseFloat(shift.openingCash as string) + cashTotal });
  } catch {
    res.status(500).json({ error: "Failed to get current shift" });
  }
});

// Open shift: cashier and above
router.post("/shifts", requireAuth, requireTenant, CASHIER_UP, async (req, res) => {
  try {
    const { openingCash } = req.body;
    if (openingCash === undefined) { res.status(400).json({ error: "openingCash required" }); return; }
    const [existing] = await db.select().from(shiftsTable)
      .where(and(eq(shiftsTable.tenantId, req.user!.tenantId!), eq(shiftsTable.status, "open")))
      .limit(1);
    if (existing) { res.status(400).json({ error: "A shift is already open" }); return; }
    const [shift] = await db.insert(shiftsTable).values({
      tenantId: req.user!.tenantId!,
      userId: req.user!.id,
      openingCash: String(openingCash),
      status: "open",
    }).returning();
    await writeAuditLog({ user: req.user, action: "open_shift", entityType: "shift", entityId: shift.id });
    res.status(201).json(fmtShift(shift, req.user!.name));
  } catch {
    res.status(500).json({ error: "Failed to open shift" });
  }
});

router.post("/shifts/:shiftId/close", requireAuth, requireTenant, CASHIER_UP, async (req, res) => {
  try {
    const id = parseInt(req.params.shiftId as string);
    const { actualCash, differenceExplanation } = req.body;
    if (actualCash === undefined) { res.status(400).json({ error: "actualCash required" }); return; }
    const [shift] = await db.select().from(shiftsTable)
      .where(and(eq(shiftsTable.id, id), eq(shiftsTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!shift || shift.status !== "open") { res.status(400).json({ error: "Shift not open" }); return; }
    const cashPayments = await db.select({ amount: paymentsTable.amount })
      .from(paymentsTable)
      .where(and(
        eq(paymentsTable.tenantId, req.user!.tenantId!),
        eq(paymentsTable.method, "cash"),
        eq(paymentsTable.status, "verified"),
        gte(paymentsTable.createdAt, shift.openedAt)
      ));
    const cashTotal = cashPayments.reduce((sum, p) => sum + parseFloat(p.amount as string), 0);
    const withdrawalRows = await db.select({ amount: financeTransactionsTable.amount })
      .from(financeTransactionsTable)
      .where(and(
        eq(financeTransactionsTable.tenantId, req.user!.tenantId!),
        eq(financeTransactionsTable.type, "owner_withdrawal"),
        gte(financeTransactionsTable.createdAt, shift.openedAt)
      ));
    const withdrawalTotal = withdrawalRows.reduce((sum, w) => sum + parseFloat(w.amount as string), 0);
    const opening = parseFloat(shift.openingCash as string);
    const grossCash = opening + cashTotal;
    const expectedCash = grossCash - withdrawalTotal;
    const difference = parseFloat(String(actualCash)) - expectedCash;
    const [updated] = await db.update(shiftsTable).set({
      status: "closed",
      actualCash: String(actualCash),
      expectedCash: String(expectedCash),
      difference: String(difference),
      differenceExplanation,
      closedAt: new Date(),
    }).where(eq(shiftsTable.id, id)).returning();
    await writeAuditLog({ user: req.user, action: "close_shift", entityType: "shift", entityId: id, newValue: { actualCash, expectedCash, difference } });
    res.json(fmtShift(updated, req.user!.name));
  } catch {
    res.status(500).json({ error: "Failed to close shift" });
  }
});

/* ── GET /shifts/:shiftId/summary — drill-down data for a shift ── */
router.get("/shifts/:shiftId/summary", requireAuth, requireTenant, CASHIER_UP, async (req, res) => {
  try {
    const shiftId = parseInt(req.params.shiftId as string);
    const [shift] = await db.select().from(shiftsTable)
      .where(and(eq(shiftsTable.id, shiftId), eq(shiftsTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!shift) { res.status(404).json({ error: "Shift not found" }); return; }

    const from = shift.openedAt;
    const to = shift.closedAt ?? new Date();

    /* Sessions within shift window */
    const rawSessions = await db.select().from(sessionsTable)
      .where(and(
        eq(sessionsTable.tenantId, req.user!.tenantId!),
        gte(sessionsTable.startedAt, from),
        lte(sessionsTable.startedAt, to)
      ))
      .orderBy(sessionsTable.startedAt);

    /* Orders within shift window (delivered/closed only) */
    const rawOrders = await db.select().from(ordersTable)
      .where(and(
        eq(ordersTable.tenantId, req.user!.tenantId!),
        gte(ordersTable.createdAt, from),
        lte(ordersTable.createdAt, to),
        inArray(ordersTable.status, ["delivered", "closed"])
      ))
      .orderBy(ordersTable.createdAt);

    /* Format sessions with asset + payment info */
    const sessions = await Promise.all(rawSessions.map(async (s) => {
      const [asset] = await db.select({ name: assetsTable.name, nameAr: assetsTable.nameAr })
        .from(assetsTable).where(eq(assetsTable.id, s.assetId)).limit(1);
      const payments = await db.select({ method: paymentsTable.method, amount: paymentsTable.amount })
        .from(paymentsTable)
        .where(and(eq(paymentsTable.sessionId, s.id), eq(paymentsTable.status, "verified")));
      return {
        id: s.id,
        assetId: s.assetId,
        assetName: asset?.name ?? null,
        assetNameAr: asset?.nameAr ?? null,
        status: s.status,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        totalMinutes: s.totalMinutes ? parseFloat(s.totalMinutes as string) : null,
        totalCost: s.totalCost ? parseFloat(s.totalCost as string) : null,
        payments: payments.map(p => ({ method: p.method, amount: parseFloat(p.amount as string) })),
      };
    }));

    /* Format orders with items + asset info */
    const orders = await Promise.all(rawOrders.map(async (o) => {
      const items = await db.select({
        productName: productsTable.name,
        productNameAr: productsTable.nameAr,
        quantity: orderItemsTable.quantity,
        unitPrice: orderItemsTable.unitPrice,
        totalPrice: orderItemsTable.totalPrice,
      }).from(orderItemsTable)
        .leftJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
        .where(eq(orderItemsTable.orderId, o.id));

      let assetName = null, assetNameAr = null;
      if (o.assetId) {
        const [a] = await db.select({ name: assetsTable.name, nameAr: assetsTable.nameAr })
          .from(assetsTable).where(eq(assetsTable.id, o.assetId)).limit(1);
        assetName = a?.name ?? null; assetNameAr = a?.nameAr ?? null;
      }

      return {
        id: o.id,
        source: o.source,
        sessionId: o.sessionId,
        assetId: o.assetId,
        assetName, assetNameAr,
        totalAmount: parseFloat(o.totalAmount as string),
        createdAt: o.createdAt,
        items: items.map(i => ({
          productName: i.productName ?? "—",
          productNameAr: i.productNameAr ?? null,
          quantity: i.quantity,
          unitPrice: parseFloat(i.unitPrice as string),
          totalPrice: parseFloat(i.totalPrice as string),
        })),
      };
    }));

    /* Withdrawals within shift window */
    const withdrawalRows = await db.select({
      id: financeTransactionsTable.id,
      amount: financeTransactionsTable.amount,
      title: financeTransactionsTable.title,
      createdAt: financeTransactionsTable.createdAt,
    }).from(financeTransactionsTable)
      .where(and(
        eq(financeTransactionsTable.tenantId, req.user!.tenantId!),
        eq(financeTransactionsTable.type, "owner_withdrawal"),
        gte(financeTransactionsTable.createdAt, from),
        lte(financeTransactionsTable.createdAt, to)
      ));
    const withdrawalTotal = withdrawalRows.reduce((sum, w) => sum + parseFloat(w.amount as string), 0);

    res.json({
      sessions,
      roomOrders: orders.filter(o => o.sessionId !== null),
      posOrders:  orders.filter(o => o.sessionId === null),
      withdrawals: {
        total: withdrawalTotal,
        items: withdrawalRows.map(w => ({
          id: w.id,
          amount: parseFloat(w.amount as string),
          title: w.title,
          createdAt: w.createdAt,
        })),
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get shift summary" });
  }
});

export default router;
