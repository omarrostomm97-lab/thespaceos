import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";

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
    await writeAuditLog({
      user: { id: user.id, email: user.email, name: user.name, nameAr: user.nameAr, role: user.role, tenantId: user.tenantId, isActive: user.isActive },
      action: "login",
      entityType: "user",
      entityId: user.id,
      ipAddress: req.ip,
    });
    res.json({
      token,
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
  res.json({
    id: req.user!.id,
    email: req.user!.email,
    name: req.user!.name,
    nameAr: req.user!.nameAr,
    role: req.user!.role,
    tenantId: req.user!.tenantId,
    isActive: req.user!.isActive,
    createdAt: new Date(),
  });
});

export default router;
