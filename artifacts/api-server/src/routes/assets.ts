import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "@workspace/db";
import { assetsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
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
    const { name, nameAr, type, pricePerHour } = req.body;
    if (!name || !type || pricePerHour === undefined) {
      res.status(400).json({ error: "name, type, pricePerHour required" });
      return;
    }
    const [asset] = await db.insert(assetsTable).values({
      tenantId: req.user!.tenantId!,
      name, nameAr, type,
      pricePerHour: String(pricePerHour),
      status: "available",
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
    const { name, nameAr, type, pricePerHour, status } = req.body;
    const updates: Partial<typeof assetsTable.$inferInsert> = { name, nameAr, type, status };
    if (pricePerHour !== undefined) updates.pricePerHour = String(pricePerHour);
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

router.post("/assets/:assetId/qr", requireAuth, requireTenant, MGMT, async (req, res) => {
  try {
    const id = parseInt(req.params.assetId as string);
    const token = uuidv4();
    const [asset] = await db.update(assetsTable).set({ qrToken: token })
      .where(and(eq(assetsTable.id, id), eq(assetsTable.tenantId, req.user!.tenantId!)))
      .returning();
    if (!asset) { res.status(404).json({ error: "Not found" }); return; }
    await writeAuditLog({ user: req.user, action: "generate_qr", entityType: "asset", entityId: id });
    res.json({ token, assetId: id, qrDataUrl: null });
  } catch {
    res.status(500).json({ error: "Failed to generate QR" });
  }
});

export default router;
