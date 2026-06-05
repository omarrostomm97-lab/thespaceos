import { Router } from "express";
import { db } from "@workspace/db";
import {
  discountRequestsTable, sessionsTable, ordersTable, assetsTable, usersTable,
} from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { requireAuth, requireTenant, requireRole, requireOpenShift } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";

const router = Router();
const CASHIER_UP = requireRole("platform_owner", "owner", "manager", "cashier");
const MGMT = requireRole("platform_owner", "owner", "manager");

function calcMinutes(startedAt: Date, pausedAt: Date | null, pausedDuration: number): number {
  const end = new Date();
  const totalMs = end.getTime() - startedAt.getTime();
  return Math.max(0, totalMs / 60000 - pausedDuration);
}

async function formatRequest(row: typeof discountRequestsTable.$inferSelect) {
  const [session] = await db.select({ assetId: sessionsTable.assetId, startedAt: sessionsTable.startedAt, pausedAt: sessionsTable.pausedAt, pausedDurationMinutes: sessionsTable.pausedDurationMinutes, status: sessionsTable.status })
    .from(sessionsTable).where(eq(sessionsTable.id, row.sessionId)).limit(1);
  let sessionAssetName = null, sessionAssetNameAr = null, pricePerHour = 0;
  if (session?.assetId) {
    const [asset] = await db.select({ name: assetsTable.name, nameAr: assetsTable.nameAr, pricePerHour: assetsTable.pricePerHour })
      .from(assetsTable).where(eq(assetsTable.id, session.assetId)).limit(1);
    sessionAssetName = asset?.name ?? null;
    sessionAssetNameAr = asset?.nameAr ?? null;
    pricePerHour = asset ? parseFloat(asset.pricePerHour as string) : 0;
  }
  const [requester] = await db.select({ name: usersTable.name })
    .from(usersTable).where(eq(usersTable.id, row.requestedByUserId)).limit(1);

  let originalGamingCost: number | null = null;
  let originalOrderTotal: number | null = null;
  let discountedAmount: number | null = null;

  if (row.type === "session_time" && session) {
    const pausedDuration = parseFloat((session.pausedDurationMinutes as string) || "0");
    const actualMinutes = calcMinutes(session.startedAt, session.pausedAt, pausedDuration);
    originalGamingCost = Math.round((actualMinutes / 60) * pricePerHour * 100) / 100;

    const discountVal = parseFloat(row.discountValue as string);
    if (row.billedMinutes !== null && row.billedMinutes !== undefined) {
      const billedMins = parseFloat(row.billedMinutes as string);
      discountedAmount = Math.round((billedMins / 60) * pricePerHour * 100) / 100;
    } else if (row.discountKind === "percent") {
      discountedAmount = Math.round(originalGamingCost * (1 - discountVal / 100) * 100) / 100;
    } else {
      discountedAmount = Math.max(0, Math.round((originalGamingCost - discountVal) * 100) / 100);
    }
  } else if (row.type === "order" && row.orderId) {
    const [order] = await db.select({ totalAmount: ordersTable.totalAmount })
      .from(ordersTable).where(eq(ordersTable.id, row.orderId)).limit(1);
    originalOrderTotal = order ? Math.round(parseFloat(order.totalAmount as string) * 100) / 100 : null;
    if (originalOrderTotal !== null) {
      const discountVal = parseFloat(row.discountValue as string);
      if (row.discountKind === "percent") {
        discountedAmount = Math.round(originalOrderTotal * (1 - discountVal / 100) * 100) / 100;
      } else {
        discountedAmount = Math.max(0, Math.round((originalOrderTotal - discountVal) * 100) / 100);
      }
    }
  }

  return {
    id: row.id,
    sessionId: row.sessionId,
    orderId: row.orderId ?? null,
    type: row.type,
    discountKind: row.discountKind,
    discountValue: parseFloat(row.discountValue as string),
    billedMinutes: row.billedMinutes !== null && row.billedMinutes !== undefined ? parseFloat(row.billedMinutes as string) : null,
    reason: row.reason ?? null,
    status: row.status,
    adminNote: row.adminNote ?? null,
    requestedByUserId: row.requestedByUserId,
    requestedByName: requester?.name ?? null,
    reviewedByUserId: row.reviewedByUserId ?? null,
    reviewedAt: row.reviewedAt ?? null,
    createdAt: row.createdAt,
    sessionAssetName,
    sessionAssetNameAr,
    originalGamingCost,
    originalOrderTotal,
    discountedAmount,
  };
}

// GET /discounts — list all (admin)
router.get("/discounts", requireAuth, requireTenant, MGMT, async (req, res) => {
  try {
    const status = (req.query.status as string) ?? "pending";
    const filter =
      status === "all"      ? inArray(discountRequestsTable.status, ["pending", "approved", "rejected"]) :
      status === "history"  ? inArray(discountRequestsTable.status, ["approved", "rejected"]) :
                              eq(discountRequestsTable.status, "pending");

    const rows = await db.select().from(discountRequestsTable)
      .where(and(filter, eq(discountRequestsTable.tenantId, req.user!.tenantId!)))
      .orderBy(discountRequestsTable.createdAt);
    const result = await Promise.all(rows.map(formatRequest));
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to list discount requests" });
  }
});

// GET /discounts/session/:sessionId — cashier checks their session's discounts
// NOTE: must be before /discounts/:requestId routes
router.get("/discounts/session/:sessionId", requireAuth, requireTenant, CASHIER_UP, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const rows = await db.select().from(discountRequestsTable)
      .where(and(
        eq(discountRequestsTable.sessionId, sessionId),
        eq(discountRequestsTable.tenantId, req.user!.tenantId!),
      ));
    const result = await Promise.all(rows.map(formatRequest));
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to get session discounts" });
  }
});

// POST /discounts — cashier submits a discount request
router.post("/discounts", requireAuth, requireTenant, CASHIER_UP, requireOpenShift, async (req, res) => {
  try {
    const { sessionId, orderId, type, discountKind, discountValue, billedMinutes, reason } = req.body;
    if (!sessionId || !type || !discountKind || discountValue === undefined) {
      res.status(400).json({ error: "Missing required fields" }); return;
    }
    if (!["session_time", "order"].includes(type)) {
      res.status(400).json({ error: "Invalid type" }); return;
    }
    if (!["percent", "fixed"].includes(discountKind)) {
      res.status(400).json({ error: "Invalid discountKind" }); return;
    }
    if (discountValue <= 0) {
      res.status(400).json({ error: "discountValue must be positive" }); return;
    }
    if (discountKind === "percent" && discountValue > 100) {
      res.status(400).json({ error: "Percent discount cannot exceed 100" }); return;
    }
    if (type === "order" && !orderId) {
      res.status(400).json({ error: "orderId required for order discount" }); return;
    }

    // Verify session belongs to tenant and is active
    const [session] = await db.select().from(sessionsTable)
      .where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!session) { res.status(404).json({ error: "Session not found" }); return; }
    if (!["active", "paused"].includes(session.status)) {
      res.status(400).json({ error: "Session is not active" }); return;
    }

    // Block duplicate pending requests for same target
    const existing = await db.select({ id: discountRequestsTable.id }).from(discountRequestsTable)
      .where(and(
        eq(discountRequestsTable.sessionId, sessionId),
        eq(discountRequestsTable.status, "pending"),
        eq(discountRequestsTable.type, type),
        orderId ? eq(discountRequestsTable.orderId, orderId) : eq(discountRequestsTable.tenantId, req.user!.tenantId!),
      )).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "duplicate_pending" }); return;
    }

    const [inserted] = await db.insert(discountRequestsTable).values({
      tenantId: req.user!.tenantId!,
      sessionId,
      orderId: orderId ?? null,
      type,
      discountKind,
      discountValue: String(discountValue),
      billedMinutes: billedMinutes !== undefined ? String(billedMinutes) : null,
      reason: reason ?? null,
      status: "pending",
      requestedByUserId: req.user!.id,
    }).returning();
    await writeAuditLog({ user: req.user, action: "create_discount_request", entityType: "discount_request", entityId: inserted.id });
    res.status(201).json(await formatRequest(inserted));
  } catch {
    res.status(500).json({ error: "Failed to create discount request" });
  }
});

// POST /discounts/:requestId/approve
router.post("/discounts/:requestId/approve", requireAuth, requireTenant, MGMT, async (req, res) => {
  try {
    const id = parseInt(req.params.requestId);
    const { adminNote } = req.body ?? {};
    const [row] = await db.select().from(discountRequestsTable)
      .where(and(eq(discountRequestsTable.id, id), eq(discountRequestsTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    if (row.status !== "pending") { res.status(400).json({ error: "Already reviewed" }); return; }

    const [updated] = await db.update(discountRequestsTable)
      .set({ status: "approved", reviewedByUserId: req.user!.id, reviewedAt: new Date(), adminNote: adminNote ?? null })
      .where(eq(discountRequestsTable.id, id)).returning();
    await writeAuditLog({ user: req.user, action: "approve_discount_request", entityType: "discount_request", entityId: id });
    res.json(await formatRequest(updated));
  } catch {
    res.status(500).json({ error: "Failed to approve" });
  }
});

// POST /discounts/:requestId/reject
router.post("/discounts/:requestId/reject", requireAuth, requireTenant, MGMT, async (req, res) => {
  try {
    const id = parseInt(req.params.requestId);
    const { adminNote } = req.body ?? {};
    const [row] = await db.select().from(discountRequestsTable)
      .where(and(eq(discountRequestsTable.id, id), eq(discountRequestsTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    if (row.status !== "pending") { res.status(400).json({ error: "Already reviewed" }); return; }

    const [updated] = await db.update(discountRequestsTable)
      .set({ status: "rejected", reviewedByUserId: req.user!.id, reviewedAt: new Date(), adminNote: adminNote ?? null })
      .where(eq(discountRequestsTable.id, id)).returning();
    await writeAuditLog({ user: req.user, action: "reject_discount_request", entityType: "discount_request", entityId: id });
    res.json(await formatRequest(updated));
  } catch {
    res.status(500).json({ error: "Failed to reject" });
  }
});

// POST /discounts/:requestId/cancel — cashier cancels own pending request (or manager/owner)
router.post("/discounts/:requestId/cancel", requireAuth, requireTenant, CASHIER_UP, async (req, res) => {
  try {
    const id = parseInt(req.params.requestId);
    const [row] = await db.select().from(discountRequestsTable)
      .where(and(eq(discountRequestsTable.id, id), eq(discountRequestsTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    if (row.status !== "pending") { res.status(400).json({ error: "Not pending" }); return; }

    const isMgmt = ["platform_owner", "owner", "manager"].includes(req.user!.role ?? "");
    const isRequester = row.requestedByUserId === req.user!.id;
    if (!isMgmt && !isRequester) { res.status(403).json({ error: "Forbidden" }); return; }

    const [updated] = await db.update(discountRequestsTable)
      .set({ status: "cancelled", reviewedByUserId: req.user!.id, reviewedAt: new Date() })
      .where(eq(discountRequestsTable.id, id)).returning();
    await writeAuditLog({ user: req.user, action: "cancel_discount_request", entityType: "discount_request", entityId: id });
    res.json(await formatRequest(updated));
  } catch {
    res.status(500).json({ error: "Failed to cancel" });
  }
});

export default router;
