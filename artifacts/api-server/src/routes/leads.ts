import { Router } from "express";
import { db, leads } from "@workspace/db";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth";

const router = Router();

const VALID_BUSINESS_TYPES = ["gaming_lounge", "coworking_space", "cafe_restaurant", "other"] as const;
const VALID_STATUSES = ["new", "contacted", "qualified", "demo_scheduled", "won", "lost"] as const;
const VALID_CONTACT_METHODS = ["call", "whatsapp", "email"] as const;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string) {
  return /^[\d\s\+\-\(\)]{7,20}$/.test(phone.trim());
}

// Simple in-memory rate limiter per IP (max 5 submissions per hour)
const ipSubmissions = new Map<string, number[]>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const times = (ipSubmissions.get(ip) ?? []).filter(t => now - t < hour);
  if (times.length >= 5) return true;
  times.push(now);
  ipSubmissions.set(ip, times);
  return false;
}

// ─── POST /api/leads (public) ───────────────────────────────────────────────
router.post("/leads", async (req, res) => {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.socket.remoteAddress ??
    "unknown";

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const {
    name, phone, email, company, businessType,
    city, message, source, _honey,
  } = req.body ?? {};

  // Honeypot: silently accept bots without saving
  if (_honey) {
    return res.status(201).json({ ok: true });
  }

  const errors: string[] = [];
  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("name is required");
  }
  if (!phone || typeof phone !== "string" || !isValidPhone(String(phone))) {
    errors.push("valid phone is required");
  }
  if (!businessType || !VALID_BUSINESS_TYPES.includes(businessType)) {
    errors.push("valid businessType is required");
  }
  if (!company || typeof company !== "string" || !company.trim()) {
    errors.push("company is required");
  }
  if (email && !isValidEmail(String(email))) {
    errors.push("email format is invalid");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Invalid input", details: errors });
  }

  try {
    const [lead] = await db.insert(leads).values({
      fullName: String(name).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim().toLowerCase() : null,
      businessType: String(businessType),
      businessName: String(company).trim(),
      message: message ? String(message).trim() : null,
      source: "landing_page",
      status: "new",
    }).returning();
    return res.status(201).json({ ok: true, id: lead.id });
  } catch (err) {
    console.error("Failed to save lead:", err);
    return res.status(500).json({ error: "Failed to save lead" });
  }
});

// ─── GET /api/admin/leads (platform_owner only) ──────────────────────────────
router.get(
  "/admin/leads",
  requireAuth,
  requireRole("platform_owner"),
  async (req, res) => {
    try {
      const {
        search,
        businessType,
        status: statusFilter,
        limit = "50",
        offset = "0",
      } = req.query as Record<string, string>;

      const conditions: any[] = [];

      if (search?.trim()) {
        const q = `%${search.trim()}%`;
        conditions.push(
          or(
            ilike(leads.fullName, q),
            ilike(leads.phone, q),
            ilike(leads.email, q),
            ilike(leads.businessName, q),
          ),
        );
      }
      if (businessType && VALID_BUSINESS_TYPES.includes(businessType as any)) {
        conditions.push(eq(leads.businessType, businessType));
      }
      if (statusFilter && VALID_STATUSES.includes(statusFilter as any)) {
        conditions.push(eq(leads.status, statusFilter));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(leads)
          .where(where)
          .orderBy(desc(leads.createdAt))
          .limit(Math.min(Number(limit), 200))
          .offset(Number(offset)),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(leads)
          .where(where),
      ]);

      return res.json({ leads: rows, total: countResult[0]?.count ?? 0 });
    } catch (err) {
      console.error("Failed to fetch leads:", err);
      return res.status(500).json({ error: "Failed to fetch leads" });
    }
  },
);

// ─── GET /api/admin/leads/:id (platform_owner only) ─────────────────────────
router.get(
  "/admin/leads/:id",
  requireAuth,
  requireRole("platform_owner"),
  async (req, res) => {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    try {
      const [lead] = await db.select().from(leads).where(eq(leads.id, id));
      if (!lead) return res.status(404).json({ error: "Lead not found" });
      return res.json(lead);
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch lead" });
    }
  },
);

// ─── PATCH /api/admin/leads/:id (platform_owner only) ───────────────────────
router.patch(
  "/admin/leads/:id",
  requireAuth,
  requireRole("platform_owner"),
  async (req, res) => {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const { status } = req.body ?? {};
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        valid: VALID_STATUSES,
      });
    }

    try {
      const [updated] = await db
        .update(leads)
        .set({ status, updatedAt: new Date() })
        .where(eq(leads.id, id))
        .returning();

      if (!updated) return res.status(404).json({ error: "Lead not found" });
      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ error: "Failed to update lead" });
    }
  },
);

export default router;
