import { Router } from "express";
import { db, leads } from "@workspace/db";

const router = Router();

const VALID_BUSINESS_TYPES = ["gaming_lounge", "coworking", "cafe", "restaurant", "other"] as const;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post("/leads", async (req, res) => {
  const { name, email, phone, company, businessType, city, _honey } = req.body ?? {};

  if (_honey) {
    return res.status(201).json({ id: 0, name, email, phone, company, businessType, city, createdAt: new Date().toISOString() });
  }

  const errors: string[] = [];
  if (!name || typeof name !== "string" || !name.trim()) errors.push("name is required");
  if (!email || !isValidEmail(email)) errors.push("valid email is required");
  if (!phone || typeof phone !== "string" || !phone.trim()) errors.push("phone is required");
  if (!company || typeof company !== "string" || !company.trim()) errors.push("company is required");
  if (!businessType || !VALID_BUSINESS_TYPES.includes(businessType)) errors.push("valid businessType is required");
  if (!city || typeof city !== "string" || !city.trim()) errors.push("city is required");

  if (errors.length > 0) {
    return res.status(400).json({ error: "Invalid input", details: errors });
  }

  try {
    const [lead] = await db.insert(leads).values({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      company: company.trim(),
      businessType,
      city: city.trim(),
    }).returning();
    return res.status(201).json(lead);
  } catch (err) {
    return res.status(500).json({ error: "Failed to save lead" });
  }
});

export default router;
