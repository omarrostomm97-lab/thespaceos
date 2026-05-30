import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";

const router = Router();

const formatUser = (u: typeof usersTable.$inferSelect) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  nameAr: u.nameAr,
  role: u.role,
  tenantId: u.tenantId,
  isActive: u.isActive,
  createdAt: u.createdAt,
});

router.get("/users", requireAuth, async (req, res) => {
  try {
    let query;
    if (req.user!.role === "platform_owner") {
      query = db.select().from(usersTable).orderBy(usersTable.createdAt);
    } else {
      query = db.select().from(usersTable).where(eq(usersTable.tenantId, req.user!.tenantId!)).orderBy(usersTable.createdAt);
    }
    const users = await query;
    res.json(users.map(formatUser));
  } catch {
    res.status(500).json({ error: "Failed to list users" });
  }
});

router.post("/users", requireAuth, requireRole("platform_owner", "owner", "manager"), async (req, res) => {
  try {
    const { email, name, nameAr, role, password } = req.body;
    if (!email || !name || !role || !password) {
      res.status(400).json({ error: "email, name, role, password required" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const tenantId = req.user!.role === "platform_owner" ? req.body.tenantId : req.user!.tenantId;
    const [user] = await db.insert(usersTable).values({ email, name, nameAr, role, passwordHash, tenantId }).returning();
    await writeAuditLog({ user: req.user, action: "create_user", entityType: "user", entityId: user.id, newValue: { email, name, role } });
    res.status(201).json(formatUser(user));
  } catch {
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.get("/users/:userId", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.userId);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (!user) { res.status(404).json({ error: "Not found" }); return; }
    if (req.user!.role !== "platform_owner" && user.tenantId !== req.user!.tenantId) {
      res.status(403).json({ error: "Forbidden" }); return;
    }
    res.json(formatUser(user));
  } catch {
    res.status(500).json({ error: "Failed to get user" });
  }
});

router.patch("/users/:userId", requireAuth, requireRole("platform_owner", "owner", "manager"), async (req, res) => {
  try {
    const id = parseInt(req.params.userId);
    const { name, nameAr, role, password } = req.body;
    const updates: Partial<typeof usersTable.$inferInsert> = { name, nameAr, role };
    if (password) updates.passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
    if (!user) { res.status(404).json({ error: "Not found" }); return; }
    await writeAuditLog({ user: req.user, action: "update_user", entityType: "user", entityId: id });
    res.json(formatUser(user));
  } catch {
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.post("/users/:userId/deactivate", requireAuth, requireRole("platform_owner", "owner", "manager"), async (req, res) => {
  try {
    const id = parseInt(req.params.userId);
    const [user] = await db.update(usersTable).set({ isActive: false }).where(eq(usersTable.id, id)).returning();
    if (!user) { res.status(404).json({ error: "Not found" }); return; }
    await writeAuditLog({ user: req.user, action: "deactivate_user", entityType: "user", entityId: id });
    res.json(formatUser(user));
  } catch {
    res.status(500).json({ error: "Failed to deactivate user" });
  }
});

export default router;
