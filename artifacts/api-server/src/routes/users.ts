import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireRole, requireTenant } from "../lib/auth";
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

/**
 * Build the WHERE condition for a user mutation, scoping to tenant for non-platform-owners.
 */
function buildUserWhere(id: number, requestingUser: import("../lib/auth").AuthUser) {
  if (requestingUser.role === "platform_owner") {
    return eq(usersTable.id, id);
  }
  return and(eq(usersTable.id, id), eq(usersTable.tenantId, requestingUser.tenantId!));
}

router.get("/users", requireAuth, async (req, res) => {
  try {
    let query;
    if (req.user!.role === "platform_owner") {
      query = db.select().from(usersTable).orderBy(usersTable.createdAt);
    } else {
      query = db.select().from(usersTable)
        .where(eq(usersTable.tenantId, req.user!.tenantId!))
        .orderBy(usersTable.createdAt);
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
    // Non-platform-owners cannot create platform_owner accounts
    if (role === "platform_owner" && req.user!.role !== "platform_owner") {
      res.status(403).json({ error: "Cannot create platform_owner accounts" });
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
    const id = parseInt(req.params.userId as string);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (!user) { res.status(404).json({ error: "Not found" }); return; }
    // Enforce tenant scoping for non-platform-owners
    if (req.user!.role !== "platform_owner" && user.tenantId !== req.user!.tenantId) {
      res.status(404).json({ error: "Not found" }); return;
    }
    res.json(formatUser(user));
  } catch {
    res.status(500).json({ error: "Failed to get user" });
  }
});

router.patch("/users/:userId", requireAuth, requireRole("platform_owner", "owner", "manager"), async (req, res) => {
  try {
    const id = parseInt(req.params.userId as string);
    const { name, nameAr, role, password } = req.body;
    // Non-platform-owners cannot elevate to platform_owner
    if (role === "platform_owner" && req.user!.role !== "platform_owner") {
      res.status(403).json({ error: "Cannot assign platform_owner role" });
      return;
    }
    const updates: Partial<typeof usersTable.$inferInsert> = {};
    if (name !== undefined) updates.name = name;
    if (nameAr !== undefined) updates.nameAr = nameAr;
    if (role !== undefined) updates.role = role;
    if (password) updates.passwordHash = await bcrypt.hash(password, 10);

    // Scope update to tenant for non-platform-owners
    const where = req.user!.role === "platform_owner"
      ? eq(usersTable.id, id)
      : and(eq(usersTable.id, id), eq(usersTable.tenantId, req.user!.tenantId!));

    const [user] = await db.update(usersTable).set(updates).where(where).returning();
    if (!user) { res.status(404).json({ error: "Not found" }); return; }
    await writeAuditLog({ user: req.user, action: "update_user", entityType: "user", entityId: id });
    res.json(formatUser(user));
  } catch {
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.post("/users/:userId/deactivate", requireAuth, requireRole("platform_owner", "owner", "manager"), async (req, res) => {
  try {
    const id = parseInt(req.params.userId as string);
    // Prevent self-deactivation
    if (id === req.user!.id) {
      res.status(400).json({ error: "Cannot deactivate your own account" });
      return;
    }
    // Scope deactivation to tenant for non-platform-owners
    const where = req.user!.role === "platform_owner"
      ? eq(usersTable.id, id)
      : and(eq(usersTable.id, id), eq(usersTable.tenantId, req.user!.tenantId!));

    const [user] = await db.update(usersTable).set({ isActive: false }).where(where).returning();
    if (!user) { res.status(404).json({ error: "Not found" }); return; }
    await writeAuditLog({ user: req.user, action: "deactivate_user", entityType: "user", entityId: id });
    res.json(formatUser(user));
  } catch {
    res.status(500).json({ error: "Failed to deactivate user" });
  }
});

export default router;
