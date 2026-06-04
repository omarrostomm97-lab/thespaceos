import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { usersTable, tenantsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, signImpersonateToken, requireAuth, requireRole } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  if (!secret) throw new Error("Neither JWT_SECRET nor SESSION_SECRET is set");
  return secret;
}

const router = Router();

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user || !user.isActive) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = signToken(user.id);
    const refreshToken = jwt.sign({ userId: user.id, type: "refresh" }, getJwtSecret(), { expiresIn: "30d" });
    await writeAuditLog({
      user: { id: user.id, email: user.email, name: user.name, nameAr: user.nameAr, role: user.role, tenantId: user.tenantId, isActive: user.isActive, isImpersonating: false },
      action: "login",
      entityType: "user",
      entityId: user.id,
      ipAddress: req.ip,
    });
    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        nameAr: user.nameAr,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", requireAuth, async (req, res) => {
  await writeAuditLog({
    user: req.user,
    action: "logout",
    entityType: "user",
    entityId: req.user?.id,
    ipAddress: req.ip,
  });
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  let tenantName: string | null = null;
  let tenantNameAr: string | null = null;
  if (req.user!.tenantId) {
    const [tenant] = await db.select({ name: tenantsTable.name, nameAr: tenantsTable.nameAr })
      .from(tenantsTable).where(eq(tenantsTable.id, req.user!.tenantId)).limit(1);
    if (tenant) { tenantName = tenant.name; tenantNameAr = tenant.nameAr ?? null; }
  }
  res.json({
    id: req.user!.id,
    email: req.user!.email,
    name: req.user!.name,
    nameAr: req.user!.nameAr,
    role: req.user!.role,
    tenantId: req.user!.tenantId,
    tenantName,
    tenantNameAr,
    isActive: req.user!.isActive,
    createdAt: new Date(),
  });
});

router.post("/auth/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: "refreshToken required" });
      return;
    }
    let payload: { userId: number; type?: string };
    try {
      payload = jwt.verify(refreshToken, getJwtSecret()) as { userId: number; type?: string };
    } catch {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }
    if (payload.type !== "refresh") {
      res.status(401).json({ error: "Not a refresh token" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
    if (!user || !user.isActive) {
      res.status(401).json({ error: "User not found or inactive" });
      return;
    }
    const accessToken = signToken(user.id);
    const newRefreshToken = jwt.sign({ userId: user.id, type: "refresh" }, getJwtSecret(), { expiresIn: "30d" });
    res.json({
      token: accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id, email: user.email, name: user.name, nameAr: user.nameAr,
        role: user.role, tenantId: user.tenantId, isActive: user.isActive, createdAt: user.createdAt,
      },
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/impersonate/:tenantId", requireAuth, requireRole("platform_owner"), async (req, res) => {
  try {
    const tenantId = parseInt(req.params.tenantId as string);
    if (isNaN(tenantId)) {
      res.status(400).json({ error: "Invalid tenantId" });
      return;
    }
    const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId)).limit(1);
    if (!tenant) {
      res.status(404).json({ error: "Tenant not found" });
      return;
    }
    const token = signImpersonateToken(req.user!.id, tenant.id);
    await writeAuditLog({
      user: req.user,
      action: "impersonate_tenant",
      entityType: "tenant",
      entityId: tenant.id,
      ipAddress: req.ip,
    });
    res.json({ token, tenant });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
