import { Router } from "express";
import { db } from "@workspace/db";
import { shiftsTable, usersTable, paymentsTable } from "@workspace/db";
import { eq, and, gte } from "drizzle-orm";
import { requireAuth, requireTenant } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";

const router = Router();

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
    if (!shift) { res.status(404).json({ error: "No open shift" }); return; }
    const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, shift.userId)).limit(1);
    res.json(fmtShift(shift, user?.name));
  } catch {
    res.status(500).json({ error: "Failed to get current shift" });
  }
});

router.post("/shifts", requireAuth, requireTenant, async (req, res) => {
  try {
    const { openingCash } = req.body;
    if (openingCash === undefined) { res.status(400).json({ error: "openingCash required" }); return; }
    // Check no open shift
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

router.post("/shifts/:shiftId/close", requireAuth, requireTenant, async (req, res) => {
  try {
    const id = parseInt(req.params.shiftId as string);
    const { actualCash, differenceExplanation } = req.body;
    if (actualCash === undefined) { res.status(400).json({ error: "actualCash required" }); return; }
    const [shift] = await db.select().from(shiftsTable)
      .where(and(eq(shiftsTable.id, id), eq(shiftsTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!shift || shift.status !== "open") { res.status(400).json({ error: "Shift not open" }); return; }
    // Calculate expected: opening + cash payments during shift
    const cashPayments = await db.select({ amount: paymentsTable.amount })
      .from(paymentsTable)
      .where(and(
        eq(paymentsTable.tenantId, req.user!.tenantId!),
        eq(paymentsTable.method, "cash"),
        eq(paymentsTable.status, "verified"),
        gte(paymentsTable.createdAt, shift.openedAt)
      ));
    const cashTotal = cashPayments.reduce((sum, p) => sum + parseFloat(p.amount as string), 0);
    const opening = parseFloat(shift.openingCash as string);
    const expectedCash = opening + cashTotal;
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

export default router;
