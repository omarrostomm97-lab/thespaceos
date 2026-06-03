import { Router } from "express";
import { db } from "@workspace/db";
import { bookingsTable, assetsTable, usersTable } from "@workspace/db";
import { eq, and, gte, lte, lt, gt, ne } from "drizzle-orm";
import { requireAuth, requireTenant, requireRole } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";

const router = Router();

const MGMT       = requireRole("platform_owner", "owner", "manager");
const CASHIER_UP = requireRole("platform_owner", "owner", "manager", "cashier");

function computeStatus(
  b: typeof bookingsTable.$inferSelect,
  now: Date,
): "upcoming" | "active" | "completed" | "cancelled" {
  if (b.status === "cancelled") return "cancelled";
  if (b.status === "completed") return "completed";
  const endsAt   = new Date(b.endsAt);
  const startsAt = new Date(b.startsAt);
  if (now >= endsAt)   return "completed";
  if (now >= startsAt) return "active";
  return "upcoming";
}

async function enrichBooking(
  b: typeof bookingsTable.$inferSelect,
  now = new Date(),
) {
  const [asset] = await db
    .select({ name: assetsTable.name, nameAr: assetsTable.nameAr })
    .from(assetsTable)
    .where(and(eq(assetsTable.id, b.assetId), eq(assetsTable.tenantId, b.tenantId)))
    .limit(1);
  const [user] = await db
    .select({ name: usersTable.name })
    .from(usersTable)
    .where(and(eq(usersTable.id, b.bookedByUserId), eq(usersTable.tenantId, b.tenantId)))
    .limit(1);
  return {
    id: b.id,
    assetId: b.assetId,
    assetName: asset?.name ?? null,
    assetNameAr: asset?.nameAr ?? null,
    bookedByUserId: b.bookedByUserId,
    bookedByName: user?.name ?? null,
    customerName: b.customerName,
    startsAt: b.startsAt,
    endsAt: b.endsAt,
    status: computeStatus(b, now),
    notes: b.notes,
    createdAt: b.createdAt,
  };
}

router.get("/bookings", requireAuth, requireTenant, CASHIER_UP, async (req, res) => {
  try {
    const { status } = req.query;
    const rows = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.tenantId, req.user!.tenantId!))
      .orderBy(bookingsTable.startsAt);

    const now = new Date();
    const statusFilter = status ? (status as string).split(",") : null;
    const filtered = statusFilter
      ? rows.filter(b => statusFilter.includes(computeStatus(b, now)))
      : rows;

    const result = await Promise.all(filtered.reverse().map(b => enrichBooking(b, now)));
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to list bookings" });
  }
});

router.post("/bookings", requireAuth, requireTenant, MGMT, async (req, res) => {
  try {
    const { assetId, customerName, startsAt, endsAt, notes } = req.body;
    if (!assetId || !startsAt || !endsAt) {
      res.status(400).json({ error: "assetId, startsAt, endsAt required" });
      return;
    }

    const startDate = new Date(startsAt);
    const endDate   = new Date(endsAt);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      res.status(400).json({ error: "Invalid date format" });
      return;
    }
    if (startDate >= endDate) {
      res.status(400).json({ error: "startsAt must be before endsAt" });
      return;
    }

    const [ownedAsset] = await db
      .select({ id: assetsTable.id })
      .from(assetsTable)
      .where(and(eq(assetsTable.id, assetId), eq(assetsTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!ownedAsset) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }

    const [conflict] = await db
      .select({ id: bookingsTable.id })
      .from(bookingsTable)
      .where(and(
        eq(bookingsTable.assetId, assetId),
        eq(bookingsTable.tenantId, req.user!.tenantId!),
        ne(bookingsTable.status, "cancelled"),
        lt(bookingsTable.startsAt, endDate),
        gt(bookingsTable.endsAt, startDate),
      ))
      .limit(1);

    if (conflict) {
      res.status(409).json({ error: "booking_conflict", conflictId: conflict.id });
      return;
    }

    const [booking] = await db.insert(bookingsTable).values({
      tenantId: req.user!.tenantId!,
      assetId,
      bookedByUserId: req.user!.id,
      customerName: customerName || null,
      startsAt: startDate,
      endsAt: endDate,
      notes: notes || null,
      status: "upcoming",
    }).returning();

    await writeAuditLog({
      user: req.user,
      action: "create_booking",
      entityType: "booking",
      entityId: booking.id,
      newValue: { assetId, startsAt, endsAt, customerName },
    });

    res.status(201).json(await enrichBooking(booking));
  } catch {
    res.status(500).json({ error: "Failed to create booking" });
  }
});

router.get("/bookings/upcoming-soon", requireAuth, requireTenant, CASHIER_UP, async (req, res) => {
  try {
    const now     = new Date();
    const in30min = new Date(now.getTime() + 30 * 60 * 1000);

    const rows = await db
      .select()
      .from(bookingsTable)
      .where(and(
        eq(bookingsTable.tenantId, req.user!.tenantId!),
        eq(bookingsTable.status, "upcoming"),
        gte(bookingsTable.startsAt, now),
        lte(bookingsTable.startsAt, in30min),
      ))
      .orderBy(bookingsTable.startsAt);

    const result = await Promise.all(rows.map(b => enrichBooking(b)));
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to get upcoming bookings" });
  }
});

router.post("/bookings/:id/cancel", requireAuth, requireTenant, MGMT, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const [booking] = await db
      .select()
      .from(bookingsTable)
      .where(and(eq(bookingsTable.id, id), eq(bookingsTable.tenantId, req.user!.tenantId!)))
      .limit(1);

    if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }
    const effectiveStatus = computeStatus(booking, new Date());
    if (effectiveStatus === "cancelled")  { res.status(400).json({ error: "Already cancelled" }); return; }
    if (effectiveStatus === "completed")  { res.status(400).json({ error: "Booking already completed" }); return; }
    if (effectiveStatus === "active")     { res.status(400).json({ error: "Cannot cancel an in-progress booking" }); return; }

    const [updated] = await db
      .update(bookingsTable)
      .set({ status: "cancelled" })
      .where(eq(bookingsTable.id, id))
      .returning();

    await writeAuditLog({
      user: req.user,
      action: "cancel_booking",
      entityType: "booking",
      entityId: id,
      newValue: { status: "cancelled" },
    });

    res.json(await enrichBooking(updated));
  } catch {
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

export default router;
