import { Router } from "express";
import { db } from "@workspace/db";
import { tenantsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";

const router = Router();

router.get("/tenants", requireAuth, requireRole("platform_owner"), async (req, res) => {
  try {
    const tenants = await db.select().from(tenantsTable).orderBy(tenantsTable.createdAt);
    res.json(tenants);
  } catch {
    res.status(500).json({ error: "Failed to list tenants" });
  }
});

router.post("/tenants", requireAuth, requireRole("platform_owner"), async (req, res) => {
  try {
    const { name, nameAr, slug, language } = req.body;
    if (!name || !slug) {
      res.status(400).json({ error: "name and slug are required" });
      return;
    }
    const [tenant] = await db.insert(tenantsTable).values({ name, nameAr, slug, language: language || "ar" }).returning();
    await writeAuditLog({ user: req.user, action: "create_tenant", entityType: "tenant", entityId: tenant.id, newValue: tenant });
    res.status(201).json(tenant);
  } catch {
    res.status(500).json({ error: "Failed to create tenant" });
  }
});

router.get("/tenants/:tenantId", requireAuth, requireRole("platform_owner"), async (req, res) => {
  try {
    const id = parseInt(req.params.tenantId);
    const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, id)).limit(1);
    if (!tenant) { res.status(404).json({ error: "Not found" }); return; }
    res.json(tenant);
  } catch {
    res.status(500).json({ error: "Failed to get tenant" });
  }
});

router.patch("/tenants/:tenantId", requireAuth, requireRole("platform_owner"), async (req, res) => {
  try {
    const id = parseInt(req.params.tenantId);
    const { name, nameAr, language, isActive } = req.body;
    const [tenant] = await db.update(tenantsTable).set({ name, nameAr, language, isActive }).where(eq(tenantsTable.id, id)).returning();
    if (!tenant) { res.status(404).json({ error: "Not found" }); return; }
    await writeAuditLog({ user: req.user, action: "update_tenant", entityType: "tenant", entityId: id, newValue: tenant });
    res.json(tenant);
  } catch {
    res.status(500).json({ error: "Failed to update tenant" });
  }
});

export default router;
