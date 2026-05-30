import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "@workspace/db";
import { paymentsTable, sessionsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireTenant } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";

const router = Router();

const fmtPayment = (p: typeof paymentsTable.$inferSelect, verifiedByName?: string | null) => ({
  id: p.id, sessionId: p.sessionId, method: p.method,
  amount: parseFloat(p.amount as string), status: p.status,
  transactionReference: p.transactionReference, instapayReference: p.instapayReference,
  verifiedByUserId: p.verifiedByUserId, verifiedByUserName: verifiedByName ?? null,
  verifiedAt: p.verifiedAt, createdAt: p.createdAt,
});

router.get("/payments", requireAuth, requireTenant, async (req, res) => {
  try {
    const { status, sessionId } = req.query;
    let payments = await db.select().from(paymentsTable)
      .where(eq(paymentsTable.tenantId, req.user!.tenantId!))
      .orderBy(paymentsTable.createdAt);
    if (status) payments = payments.filter(p => p.status === status);
    if (sessionId) payments = payments.filter(p => p.sessionId === parseInt(sessionId as string));
    res.json(payments.reverse().map(p => fmtPayment(p)));
  } catch {
    res.status(500).json({ error: "Failed to list payments" });
  }
});

router.post("/payments", requireAuth, requireTenant, async (req, res) => {
  try {
    const { sessionId, method, amount, transactionReference } = req.body;
    if (!sessionId || !method || amount === undefined) {
      res.status(400).json({ error: "sessionId, method, amount required" }); return;
    }
    // Verify session belongs to caller's tenant before creating payment
    const [session] = await db.select().from(sessionsTable)
      .where(and(
        eq(sessionsTable.id, sessionId),
        eq(sessionsTable.tenantId, req.user!.tenantId!)
      )).limit(1);
    if (!session) {
      res.status(404).json({ error: "Session not found in your tenant" }); return;
    }
    let instapayReference = null;
    if (method === "instapay") {
      instapayReference = `IP-${uuidv4().slice(0, 8).toUpperCase()}`;
    }
    const [payment] = await db.insert(paymentsTable).values({
      tenantId: req.user!.tenantId!,
      sessionId, method, amount: String(amount), status: "pending",
      transactionReference, instapayReference,
    }).returning();
    await writeAuditLog({ user: req.user, action: "create_payment", entityType: "payment", entityId: payment.id, newValue: { method, amount } });
    res.status(201).json(fmtPayment(payment));
  } catch {
    res.status(500).json({ error: "Failed to create payment" });
  }
});

router.post("/payments/:paymentId/verify", requireAuth, requireTenant, async (req, res) => {
  try {
    const id = parseInt(req.params.paymentId as string);
    const { transactionReference } = req.body;
    const [payment] = await db.update(paymentsTable).set({
      status: "verified",
      verifiedByUserId: req.user!.id,
      verifiedAt: new Date(),
      transactionReference: transactionReference || undefined,
    }).where(and(eq(paymentsTable.id, id), eq(paymentsTable.tenantId, req.user!.tenantId!)))
      .returning();
    if (!payment) { res.status(404).json({ error: "Not found" }); return; }
    await writeAuditLog({ user: req.user, action: "verify_payment", entityType: "payment", entityId: id });
    res.json(fmtPayment(payment, req.user!.name));
  } catch {
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

export default router;
