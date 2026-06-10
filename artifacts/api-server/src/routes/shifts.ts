import { Router } from "express";
import { db } from "@workspace/db";
import { shiftsTable, usersTable, paymentsTable, sessionsTable, ordersTable, financeTransactionsTable, expenseTemplatesTable } from "@workspace/db";
import { eq, and, gte, lte, inArray, desc } from "drizzle-orm";
import { requireAuth, requireTenant, requireRole } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";
import { productsTable, assetsTable, orderItemsTable } from "@workspace/db";

const router = Router();

const CASHIER_UP = requireRole("platform_owner", "owner", "manager", "cashier");

const fmtShift = (s: typeof shiftsTable.$inferSelect, userName?: string | null) => ({
  id: s.id, userId: s.userId, userName: userName ?? null,
  status: s.status, openingCash: parseFloat(s.openingCash as string),
  expectedCash: s.expectedCash ? parseFloat(s.expectedCash as string) : null,
  actualCash: s.actualCash ? parseFloat(s.actualCash as string) : null,
  difference: s.difference ? parseFloat(s.difference as string) : null,
  differenceExplanation: s.differenceExplanation,
  openedAt: s.openedAt, closedAt: s.closedAt,
});

/* ── GET /shifts — enriched list ── */
router.get("/shifts", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const isCashier = req.user!.role === "cashier";
    const shiftsWhere = isCashier
      ? and(eq(shiftsTable.tenantId, tenantId), eq(shiftsTable.userId, req.user!.id))
      : eq(shiftsTable.tenantId, tenantId);

    const shifts = await db.select().from(shiftsTable)
      .where(shiftsWhere)
      .orderBy(desc(shiftsTable.openedAt));

    if (shifts.length === 0) { res.json([]); return; }

    const minDate = shifts[shifts.length - 1].openedAt;

    const [allUsers, allSessions, allOrders, allWithdrawals] = await Promise.all([
      db.select({ id: usersTable.id, name: usersTable.name }).from(usersTable)
        .where(eq(usersTable.tenantId, tenantId)),
      db.select({
        id: sessionsTable.id, startedAt: sessionsTable.startedAt,
        totalCost: sessionsTable.totalCost,
      }).from(sessionsTable).where(and(
        eq(sessionsTable.tenantId, tenantId), gte(sessionsTable.startedAt, minDate)
      )),
      db.select({
        id: ordersTable.id, sessionId: ordersTable.sessionId,
        totalAmount: ordersTable.totalAmount, createdAt: ordersTable.createdAt,
      }).from(ordersTable).where(and(
        eq(ordersTable.tenantId, tenantId),
        gte(ordersTable.createdAt, minDate),
        inArray(ordersTable.status, ["delivered", "closed"])
      )),
      db.select({ amount: financeTransactionsTable.amount, createdAt: financeTransactionsTable.createdAt })
        .from(financeTransactionsTable).where(and(
          eq(financeTransactionsTable.tenantId, tenantId),
          eq(financeTransactionsTable.type, "owner_withdrawal"),
          gte(financeTransactionsTable.createdAt, minDate)
        )),
    ]);

    const userMap = new Map(allUsers.map(u => [u.id, u.name]));

    const result = shifts.map(s => {
      const from = new Date(s.openedAt).getTime();
      const to = s.closedAt ? new Date(s.closedAt).getTime() : Date.now();

      const shiftSessions = allSessions.filter(x => {
        const t = new Date(x.startedAt).getTime(); return t >= from && t <= to;
      });
      const shiftOrders = allOrders.filter(x => {
        const t = new Date(x.createdAt).getTime(); return t >= from && t <= to;
      });
      const shiftWithdrawals = allWithdrawals.filter(x => {
        const t = new Date(x.createdAt).getTime(); return t >= from && t <= to;
      });

      const gamingRevenue = shiftSessions.reduce((acc, x) =>
        acc + (x.totalCost ? parseFloat(x.totalCost as string) : 0), 0);
      const roomOrderRevenue = shiftOrders
        .filter(o => o.sessionId !== null)
        .reduce((acc, o) => acc + parseFloat(o.totalAmount as string), 0);
      const posRevenue = shiftOrders
        .filter(o => o.sessionId === null)
        .reduce((acc, o) => acc + parseFloat(o.totalAmount as string), 0);
      const totalRevenue = gamingRevenue + roomOrderRevenue + posRevenue;
      const withdrawalTotal = shiftWithdrawals.reduce((acc, w) =>
        acc + parseFloat(w.amount as string), 0);
      const durationMinutes = Math.round((to - from) / 60000);

      return {
        ...fmtShift(s, userMap.get(s.userId) ?? null),
        totalRevenue, gamingRevenue, roomOrderRevenue, posRevenue,
        sessionCount: shiftSessions.length,
        orderCount: shiftOrders.length,
        durationMinutes, withdrawalTotal,
      };
    });

    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list shifts" });
  }
});

/* ── GET /shifts/current — live shift with payment method breakdown ── */
router.get("/shifts/current", requireAuth, requireTenant, async (req, res) => {
  try {
    const [shift] = await db.select().from(shiftsTable)
      .where(and(eq(shiftsTable.tenantId, req.user!.tenantId!), eq(shiftsTable.status, "open")))
      .limit(1);
    if (!shift) { res.json(null); return; }

    const [user] = await db.select({ name: usersTable.name }).from(usersTable)
      .where(eq(usersTable.id, shift.userId)).limit(1);

    const [allPayments, withdrawals, shiftExpensesRows] = await Promise.all([
      db.select({ amount: paymentsTable.amount, method: paymentsTable.method })
        .from(paymentsTable)
        .where(and(
          eq(paymentsTable.tenantId, req.user!.tenantId!),
          eq(paymentsTable.status, "verified"),
          gte(paymentsTable.createdAt, shift.openedAt)
        )),
      db.select({ amount: financeTransactionsTable.amount })
        .from(financeTransactionsTable)
        .where(and(
          eq(financeTransactionsTable.tenantId, req.user!.tenantId!),
          eq(financeTransactionsTable.type, "owner_withdrawal"),
          gte(financeTransactionsTable.createdAt, shift.openedAt)
        )),
      db.select({ amount: financeTransactionsTable.amount, title: financeTransactionsTable.title })
        .from(financeTransactionsTable)
        .where(and(
          eq(financeTransactionsTable.tenantId, req.user!.tenantId!),
          eq(financeTransactionsTable.type, "expense"),
          eq(financeTransactionsTable.deductFromShift, true),
          gte(financeTransactionsTable.createdAt, shift.openedAt)
        )),
    ]);

    const cashIncome = allPayments.filter(p => p.method === "cash")
      .reduce((s, p) => s + parseFloat(p.amount as string), 0);
    const visaIncome = allPayments.filter(p => p.method === "visa")
      .reduce((s, p) => s + parseFloat(p.amount as string), 0);
    const walletIncome = allPayments.filter(p => p.method !== "cash" && p.method !== "visa")
      .reduce((s, p) => s + parseFloat(p.amount as string), 0);
    const totalIncome = cashIncome + visaIncome + walletIncome;

    const withdrawalTotal = withdrawals.reduce((s, w) => s + parseFloat(w.amount as string), 0);
    const shiftExpenses = shiftExpensesRows.reduce((s, e) => s + parseFloat(e.amount as string), 0);
    const shiftExpenseItems = shiftExpensesRows.map(e => ({
      title: e.title ?? "",
      amount: parseFloat(e.amount as string),
    }));
    const opening = parseFloat(shift.openingCash as string);
    const grossCash = opening + cashIncome;
    const liveExpectedCash = grossCash - withdrawalTotal - shiftExpenses;

    const formatted = fmtShift(shift, user?.name);
    formatted.expectedCash = liveExpectedCash;

    res.json({
      ...formatted,
      cashIncome, visaIncome, walletIncome, totalIncome,
      withdrawalTotal, grossCash, shiftExpenses, shiftExpenseItems,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get current shift" });
  }
});

/* ── POST /shifts — open shift ── */
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

    // Auto-apply daily expense templates
    try {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const templates = await db.select().from(expenseTemplatesTable)
        .where(and(
          eq(expenseTemplatesTable.tenantId, req.user!.tenantId!),
          eq(expenseTemplatesTable.autoApply, true),
          eq(expenseTemplatesTable.isActive, true),
          eq(expenseTemplatesTable.frequency, "daily"),
        ));
      for (const tmpl of templates) {
        const alreadyApplied = await db.select({ id: financeTransactionsTable.id })
          .from(financeTransactionsTable)
          .where(and(
            eq(financeTransactionsTable.tenantId, req.user!.tenantId!),
            eq(financeTransactionsTable.templateId, tmpl.id),
            gte(financeTransactionsTable.createdAt, todayStart),
          )).limit(1);
        if (alreadyApplied.length === 0) {
          await db.insert(financeTransactionsTable).values({
            tenantId: req.user!.tenantId!,
            type: "expense",
            title: tmpl.title,
            amount: tmpl.amount as string,
            categoryId: tmpl.categoryId ?? null,
            paymentMethod: tmpl.paymentMethod ?? "cash",
            status: "paid",
            templateId: tmpl.id,
            deductFromShift: tmpl.deductFromShift,
            shiftId: tmpl.deductFromShift ? shift.id : null,
            createdByUserId: req.user!.id,
            transactionDate: new Date(),
          });
        }
      }
    } catch (tmplErr) {
      console.error("Auto-apply templates error:", tmplErr);
    }

    res.status(201).json(fmtShift(shift, req.user!.name));
  } catch {
    res.status(500).json({ error: "Failed to open shift" });
  }
});

/* ── POST /shifts/:shiftId/close ── */
router.post("/shifts/:shiftId/close", requireAuth, requireTenant, CASHIER_UP, async (req, res) => {
  try {
    const id = parseInt(req.params.shiftId as string);
    const { actualCash, differenceExplanation } = req.body;
    if (actualCash === undefined) { res.status(400).json({ error: "actualCash required" }); return; }
    const [shift] = await db.select().from(shiftsTable)
      .where(and(eq(shiftsTable.id, id), eq(shiftsTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!shift || shift.status !== "open") { res.status(400).json({ error: "Shift not open" }); return; }

    const [cashPayments, withdrawalRows, shiftExpenseRows] = await Promise.all([
      db.select({ amount: paymentsTable.amount })
        .from(paymentsTable)
        .where(and(
          eq(paymentsTable.tenantId, req.user!.tenantId!),
          eq(paymentsTable.method, "cash"),
          eq(paymentsTable.status, "verified"),
          gte(paymentsTable.createdAt, shift.openedAt)
        )),
      db.select({ amount: financeTransactionsTable.amount })
        .from(financeTransactionsTable)
        .where(and(
          eq(financeTransactionsTable.tenantId, req.user!.tenantId!),
          eq(financeTransactionsTable.type, "owner_withdrawal"),
          gte(financeTransactionsTable.createdAt, shift.openedAt)
        )),
      db.select({ amount: financeTransactionsTable.amount })
        .from(financeTransactionsTable)
        .where(and(
          eq(financeTransactionsTable.tenantId, req.user!.tenantId!),
          eq(financeTransactionsTable.type, "expense"),
          eq(financeTransactionsTable.deductFromShift, true),
          gte(financeTransactionsTable.createdAt, shift.openedAt)
        )),
    ]);

    const cashTotal = cashPayments.reduce((s, p) => s + parseFloat(p.amount as string), 0);
    const withdrawalTotal = withdrawalRows.reduce((s, w) => s + parseFloat(w.amount as string), 0);
    const shiftExpensesTotal = shiftExpenseRows.reduce((s, e) => s + parseFloat(e.amount as string), 0);
    const opening = parseFloat(shift.openingCash as string);
    const grossCash = opening + cashTotal;
    const expectedCash = grossCash - withdrawalTotal - shiftExpensesTotal;
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

/* ── GET /shifts/:shiftId/summary — detail drawer data ── */
router.get("/shifts/:shiftId/summary", requireAuth, requireTenant, CASHIER_UP, async (req, res) => {
  try {
    const shiftId = parseInt(req.params.shiftId as string);
    const [shift] = await db.select().from(shiftsTable)
      .where(and(eq(shiftsTable.id, shiftId), eq(shiftsTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!shift) { res.status(404).json({ error: "Shift not found" }); return; }

    const from = shift.openedAt;
    const to = shift.closedAt ?? new Date();

    const [rawSessions, rawOrders, withdrawalRows] = await Promise.all([
      db.select().from(sessionsTable)
        .where(and(
          eq(sessionsTable.tenantId, req.user!.tenantId!),
          gte(sessionsTable.startedAt, from),
          lte(sessionsTable.startedAt, to)
        ))
        .orderBy(sessionsTable.startedAt),
      db.select().from(ordersTable)
        .where(and(
          eq(ordersTable.tenantId, req.user!.tenantId!),
          gte(ordersTable.createdAt, from),
          lte(ordersTable.createdAt, to),
          inArray(ordersTable.status, ["delivered", "closed"])
        ))
        .orderBy(ordersTable.createdAt),
      db.select({
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
        )),
    ]);

    const sessions = await Promise.all(rawSessions.map(async (s) => {
      const [asset] = await db.select({ name: assetsTable.name, nameAr: assetsTable.nameAr })
        .from(assetsTable).where(eq(assetsTable.id, s.assetId)).limit(1);
      const payments = await db.select({ method: paymentsTable.method, amount: paymentsTable.amount })
        .from(paymentsTable)
        .where(and(eq(paymentsTable.sessionId, s.id), eq(paymentsTable.status, "verified")));
      return {
        id: s.id, assetId: s.assetId,
        assetName: asset?.name ?? null, assetNameAr: asset?.nameAr ?? null,
        status: s.status, startedAt: s.startedAt, endedAt: s.endedAt,
        totalMinutes: s.totalMinutes ? parseFloat(s.totalMinutes as string) : null,
        totalCost: s.totalCost ? parseFloat(s.totalCost as string) : null,
        payments: payments.map(p => ({ method: p.method, amount: parseFloat(p.amount as string) })),
      };
    }));

    const orders = await Promise.all(rawOrders.map(async (o) => {
      const items = await db.select({
        productName: productsTable.name, productNameAr: productsTable.nameAr,
        quantity: orderItemsTable.quantity, unitPrice: orderItemsTable.unitPrice,
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
        id: o.id, source: o.source, sessionId: o.sessionId, assetId: o.assetId,
        assetName, assetNameAr,
        totalAmount: parseFloat(o.totalAmount as string),
        createdAt: o.createdAt,
        items: items.map(i => ({
          productName: i.productName ?? "—", productNameAr: i.productNameAr ?? null,
          quantity: i.quantity,
          unitPrice: parseFloat(i.unitPrice as string),
          totalPrice: parseFloat(i.totalPrice as string),
        })),
      };
    }));

    const withdrawalTotal = withdrawalRows.reduce((s, w) => s + parseFloat(w.amount as string), 0);

    res.json({
      sessions,
      roomOrders: orders.filter(o => o.sessionId !== null),
      posOrders: orders.filter(o => o.sessionId === null),
      withdrawals: {
        total: withdrawalTotal,
        items: withdrawalRows.map(w => ({
          id: w.id, amount: parseFloat(w.amount as string),
          title: w.title, createdAt: w.createdAt,
        })),
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get shift summary" });
  }
});

export default router;
