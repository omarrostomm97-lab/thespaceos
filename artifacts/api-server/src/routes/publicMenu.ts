import { Router } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { tenantsTable, productsTable, productCategoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";

const router = Router();

router.post("/menu-qr/generate", requireAuth, requireRole("platform_owner", "owner", "manager"), async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    if (!tenantId) {
      res.status(400).json({ error: "No tenant associated with this account" });
      return;
    }
    const token = randomUUID();
    const [tenant] = await db
      .update(tenantsTable)
      .set({ menuQrToken: token })
      .where(eq(tenantsTable.id, tenantId))
      .returning();
    if (!tenant) {
      res.status(404).json({ error: "Tenant not found" });
      return;
    }
    await writeAuditLog({ user: req.user, action: "generate_menu_qr", entityType: "tenant", entityId: tenantId });
    res.json({ token, menuUrl: `/public-menu/${token}` });
  } catch {
    res.status(500).json({ error: "Failed to generate QR token" });
  }
});

router.get("/menu-qr/current", requireAuth, requireRole("platform_owner", "owner", "manager"), async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    if (!tenantId) {
      res.status(400).json({ error: "No tenant associated with this account" });
      return;
    }
    const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId)).limit(1);
    if (!tenant) {
      res.status(404).json({ error: "Tenant not found" });
      return;
    }
    res.json({ token: tenant.menuQrToken ?? null, menuUrl: tenant.menuQrToken ? `/public-menu/${tenant.menuQrToken}` : null });
  } catch {
    res.status(500).json({ error: "Failed to get QR token" });
  }
});

router.get("/public-menu/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.menuQrToken, token)).limit(1);
    if (!tenant || !tenant.isActive) {
      res.status(404).json({ error: "Menu not found" });
      return;
    }
    const categories = await db
      .select()
      .from(productCategoriesTable)
      .where(eq(productCategoriesTable.tenantId, tenant.id))
      .orderBy(productCategoriesTable.sortOrder);
    const products = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.tenantId, tenant.id))
      .orderBy(productsTable.createdAt);
    res.json({
      tenant: { id: tenant.id, name: tenant.name, nameAr: tenant.nameAr },
      categories,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        nameAr: p.nameAr,
        categoryId: p.categoryId,
        price: parseFloat(p.price as string),
        isAvailable: p.isAvailable,
        description: p.description,
        descriptionAr: p.descriptionAr,
      })),
    });
  } catch {
    res.status(500).json({ error: "Failed to load menu" });
  }
});

export default router;
