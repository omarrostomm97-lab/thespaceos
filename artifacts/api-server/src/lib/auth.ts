import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable, shiftsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

function getJwtSecret(): string {
  // JWT_SECRET is the preferred secret (set via Replit Secrets manager, never hardcoded).
  // SESSION_SECRET is used as a secure fallback — it is a pre-existing Replit-managed secret.
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Neither JWT_SECRET nor SESSION_SECRET is set. Cannot sign tokens.");
  }
  return secret;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  nameAr: string | null;
  role: string;
  tenantId: number | null;
  isActive: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(userId: number): string {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: number } {
  return jwt.verify(token, getJwtSecret()) as { userId: number };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const { userId } = verifyToken(token);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user || !user.isActive) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      nameAr: user.nameAr,
      role: user.role,
      tenantId: user.tenantId,
      isActive: user.isActive,
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}

export function requireTenant(req: Request, res: Response, next: NextFunction): void {
  if (!req.user?.tenantId) {
    res.status(403).json({ error: "No tenant access" });
    return;
  }
  next();
}

const SHIFT_EXEMPT_ROLES = ["platform_owner", "owner", "manager"];

export async function requireOpenShift(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (SHIFT_EXEMPT_ROLES.includes(req.user.role)) {
    next();
    return;
  }
  try {
    const [openShift] = await db.select({ id: shiftsTable.id })
      .from(shiftsTable)
      .where(and(
        eq(shiftsTable.tenantId, req.user.tenantId!),
        eq(shiftsTable.status, "open")
      ))
      .limit(1);
    if (!openShift) {
      res.status(403).json({ error: "no_open_shift" });
      return;
    }
    next();
  } catch {
    res.status(500).json({ error: "Failed to check shift status" });
  }
}
