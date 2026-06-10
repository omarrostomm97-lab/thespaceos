import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "@workspace/db";
import { assetsTable, sessionsTable, ordersTable, orderItemsTable, productsTable, paymentsTable } from "@workspace/db";
import { eq, and, gte, lte, inArray, or } from "drizzle-orm";
import { requireAuth, requireTenant, requireRole } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";

const router = Router();

const MGMT = requireRole("platform_owner", "owner", "manager");

router.get("/assets", requireAuth, requireTenant, async (req, res) => {
  try {
    const assets = await db.select().from(assetsTable)
      .where(eq(assetsTable.tenantId, req.user!.tenantId!))
      .orderBy(assetsTable.name);
    res.json(assets.map(a => ({
      ...a,
      pricePerHour: parseFloat(a.pricePerHour as string),
    })));
  } catch {
    res.status(500).json({ error: "Failed to list assets" });
  }
});

router.post("/assets", requireAuth, requireTenant, MGMT, async (req, res) => {
  try {
    const { name, nameAr, type, pricePerHour, capacity, imageUrl } = req.body;
    if (!name || !type || pricePerHour === undefined) {
      res.status(400).json({ error: "name, type, pricePerHour required" });
      return;
    }
    const [asset] = await db.insert(assetsTable).values({
      tenantId: req.user!.tenantId!,
      name, nameAr, type,
      pricePerHour: String(pricePerHour),
      status: "available",
      capacity: capacity != null ? parseInt(capacity) : undefined,
      imageUrl: imageUrl || undefined,
    }).returning();
    await writeAuditLog({ user: req.user, action: "create_asset", entityType: "asset", entityId: asset.id, newValue: asset });
    res.status(201).json({ ...asset, pricePerHour: parseFloat(asset.pricePerHour as string) });
  } catch {
    res.status(500).json({ error: "Failed to create asset" });
  }
});

router.get("/assets/:assetId", requireAuth, requireTenant, async (req, res) => {
  try {
    const id = parseInt(req.params.assetId as string);
    const [asset] = await db.select().from(assetsTable)
      .where(and(eq(assetsTable.id, id), eq(assetsTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!asset) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...asset, pricePerHour: parseFloat(asset.pricePerHour as string) });
  } catch {
    res.status(500).json({ error: "Failed to get asset" });
  }
});

router.patch("/assets/:assetId", requireAuth, requireTenant, MGMT, async (req, res) => {
  try {
    const id = parseInt(req.params.assetId as string);
    const { name, nameAr, type, pricePerHour, status, capacity, imageUrl } = req.body;
    const updates: Partial<typeof assetsTable.$inferInsert> = { name, nameAr, type, status };
    if (pricePerHour !== undefined) updates.pricePerHour = String(pricePerHour);
    if (capacity !== undefined) updates.capacity = capacity != null ? parseInt(capacity) : null;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl || null;
    const [asset] = await db.update(assetsTable).set(updates)
      .where(and(eq(assetsTable.id, id), eq(assetsTable.tenantId, req.user!.tenantId!)))
      .returning();
    if (!asset) { res.status(404).json({ error: "Not found" }); return; }
    await writeAuditLog({ user: req.user, action: "update_asset", entityType: "asset", entityId: id });
    res.json({ ...asset, pricePerHour: parseFloat(asset.pricePerHour as string) });
  } catch {
    res.status(500).json({ error: "Failed to update asset" });
  }
});

router.post("/assets/:assetId/qr", requireAuth, requireTenant, async (req, res) => {
  try {
    const id = parseInt(req.params.assetId as string);
    const isMgmt = ["platform_owner", "owner", "manager"].includes(req.user!.role);

    // Fetch the existing asset first
    const [existing] = await db.select().from(assetsTable)
      .where(and(eq(assetsTable.id, id), eq(assetsTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!existing) { res.status(404).json({ error: "Not found" }); return; }

    // Non-MGMT: return existing token if present (no regeneration)
    if (!isMgmt && existing.qrToken) {
      res.json({ token: existing.qrToken, assetId: id, qrDataUrl: null });
      return;
    }

    // MGMT or no token yet: generate a fresh token
    const token = uuidv4();
    await db.update(assetsTable).set({ qrToken: token })
      .where(and(eq(assetsTable.id, id), eq(assetsTable.tenantId, req.user!.tenantId!)));
    await writeAuditLog({ user: req.user, action: "generate_qr", entityType: "asset", entityId: id });
    res.json({ token, assetId: id, qrDataUrl: null });
  } catch {
    res.status(500).json({ error: "Failed to generate QR" });
  }
});

router.get("/assets/:assetId/history", requireAuth, requireTenant, MGMT, async (req, res) => {
  try {
    const assetId = parseInt(req.params.assetId as string);
    const tenantId = req.user!.tenantId!;

    const [asset] = await db.select().from(assetsTable)
      .where(and(eq(assetsTable.id, assetId), eq(assetsTable.tenantId, tenantId)))
      .limit(1);
    if (!asset) { res.status(404).json({ error: "Asset not found" }); return; }

    const now = new Date();
    const defaultFrom = new Date(now); defaultFrom.setHours(0, 0, 0, 0);
    const defaultTo   = new Date(now); defaultTo.setHours(23, 59, 59, 999);
    const fromDate = req.query.from ? new Date(req.query.from as string) : defaultFrom;
    const toDate   = req.query.to   ? new Date(req.query.to   as string) : defaultTo;

    const sessions = await db.select().from(sessionsTable)
      .where(and(
        eq(sessionsTable.tenantId, tenantId),
        eq(sessionsTable.assetId, assetId),
        gte(sessionsTable.startedAt, fromDate),
        lte(sessionsTable.startedAt, toDate),
      ))
      .orderBy(sessionsTable.startedAt);

    const sessionIds = sessions.map(s => s.id);
    const payments = sessionIds.length > 0
      ? await db.select().from(paymentsTable)
          .where(and(
            eq(paymentsTable.tenantId, tenantId),
            inArray(paymentsTable.sessionId, sessionIds),
            eq(paymentsTable.status, "verified"),
          ))
      : [];

    const paymentsBySession = new Map<number, { method: string; amount: number }[]>();
    for (const p of payments) {
      if (p.sessionId != null) {
        if (!paymentsBySession.has(p.sessionId)) paymentsBySession.set(p.sessionId, []);
        paymentsBySession.get(p.sessionId)!.push({ method: p.method, amount: parseFloat(p.amount as string) });
      }
    }

    const formattedSessions = [...sessions].reverse().map(s => {
      const sp = paymentsBySession.get(s.id) ?? [];
      return {
        id: s.id,
        status: s.status,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        totalMinutes: s.totalMinutes ? parseFloat(s.totalMinutes as string) : null,
        totalCost: s.totalCost ? parseFloat(s.totalCost as string) : null,
        notes: s.notes,
        cancelReason: s.cancelReason,
        // Use the session's stored totalCost as the canonical billed amount.
        // Summing payments can inflate the figure if duplicate payments were created.
        totalCollected: s.totalCost
          ? Math.round(parseFloat(s.totalCost as string) * 100) / 100
          : Math.round(sp.reduce((sum, p) => sum + p.amount, 0) * 100) / 100,
        paymentMethod: sp[0]?.method ?? null,
      };
    });

    // Orders: date-bounded by createdAt, scoped to this asset regardless of when
    // the linked session started (handles cross-boundary/long-running sessions).
    // Fetch ALL session IDs for this asset (no date filter) so we don't miss orders
    // from sessions that started before the selected date range.
    const allAssetSessionRows = await db.select({ id: sessionsTable.id }).from(sessionsTable)
      .where(and(eq(sessionsTable.tenantId, tenantId), eq(sessionsTable.assetId, assetId)));
    const allAssetSessionIds = allAssetSessionRows.map(s => s.id);

    const orderScope = allAssetSessionIds.length > 0
      ? or(eq(ordersTable.assetId, assetId), inArray(ordersTable.sessionId, allAssetSessionIds))
      : eq(ordersTable.assetId, assetId);

    const orders = await db.select().from(ordersTable)
      .where(and(
        eq(ordersTable.tenantId, tenantId),
        gte(ordersTable.createdAt, fromDate),
        lte(ordersTable.createdAt, toDate),
        orderScope,
      ))
      .orderBy(ordersTable.createdAt);

    const orderIds = orders.map(o => o.id);
    const allItems = orderIds.length > 0
      ? await db.select({
          orderId: orderItemsTable.orderId,
          productName: productsTable.name,
          productNameAr: productsTable.nameAr,
          quantity: orderItemsTable.quantity,
          totalPrice: orderItemsTable.totalPrice,
        }).from(orderItemsTable)
          .leftJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
          .where(inArray(orderItemsTable.orderId, orderIds))
      : [];

    const itemsByOrder = new Map<number, typeof allItems>();
    for (const i of allItems) {
      if (!itemsByOrder.has(i.orderId)) itemsByOrder.set(i.orderId, []);
      itemsByOrder.get(i.orderId)!.push(i);
    }

    const formattedOrders = [...orders].reverse().map(o => ({
      id: o.id,
      source: o.source,
      status: o.status,
      sessionId: o.sessionId,
      createdAt: o.createdAt,
      totalAmount: parseFloat(o.totalAmount as string),
      items: (itemsByOrder.get(o.id) ?? []).map(i => ({
        productName: i.productName,
        productNameAr: i.productNameAr,
        quantity: i.quantity,
        totalPrice: parseFloat(i.totalPrice as string),
      })),
    }));

    res.json({
      asset: { ...asset, pricePerHour: parseFloat(asset.pricePerHour as string) },
      sessions: formattedSessions,
      orders: formattedOrders,
    });
  } catch {
    res.status(500).json({ error: "Failed to get asset history" });
  }
});

export default router;
