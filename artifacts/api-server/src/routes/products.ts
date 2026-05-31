import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, productCategoriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireTenant, requireRole } from "../lib/auth";

import { writeAuditLog } from "../lib/audit";

const router = Router();

const MGMT = requireRole("platform_owner", "owner", "manager");

const fmtProduct = (p: typeof productsTable.$inferSelect, cat?: typeof productCategoriesTable.$inferSelect | null) => ({
  id: p.id,
  name: p.name,
  nameAr: p.nameAr,
  categoryId: p.categoryId,
  categoryName: cat?.name ?? null,
  categoryNameAr: cat?.nameAr ?? null,
  price: parseFloat(p.price as string),
  isAvailable: p.isAvailable,
  description: p.description,
  descriptionAr: p.descriptionAr,
  createdAt: p.createdAt,
});

router.get("/products", requireAuth, requireTenant, async (req, res) => {
  try {
    const { categoryId } = req.query;
    let products = await db.select().from(productsTable)
      .where(eq(productsTable.tenantId, req.user!.tenantId!))
      .orderBy(productsTable.name);
    if (categoryId) products = products.filter(p => p.categoryId === parseInt(categoryId as string));
    const categories = await db.select().from(productCategoriesTable)
      .where(eq(productCategoriesTable.tenantId, req.user!.tenantId!));
    const catMap = new Map(categories.map(c => [c.id, c]));
    res.json(products.map(p => fmtProduct(p, p.categoryId ? catMap.get(p.categoryId) : null)));
  } catch {
    res.status(500).json({ error: "Failed to list products" });
  }
});

router.post("/products", requireAuth, requireTenant, MGMT, async (req, res) => {
  try {
    const { name, nameAr, categoryId, price, description, descriptionAr } = req.body;
    if (!name || price === undefined) { res.status(400).json({ error: "name and price required" }); return; }
    const [p] = await db.insert(productsTable).values({
      tenantId: req.user!.tenantId!,
      name, nameAr, categoryId, price: String(price), description, descriptionAr,
    }).returning();
    await writeAuditLog({ user: req.user, action: "create_product", entityType: "product", entityId: p.id });
    res.status(201).json(fmtProduct(p));
  } catch {
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.get("/products/:productId", requireAuth, requireTenant, async (req, res) => {
  try {
    const id = parseInt(req.params.productId as string);
    const [p] = await db.select().from(productsTable)
      .where(and(eq(productsTable.id, id), eq(productsTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!p) { res.status(404).json({ error: "Not found" }); return; }
    let cat = null;
    if (p.categoryId) {
      const [c] = await db.select().from(productCategoriesTable).where(eq(productCategoriesTable.id, p.categoryId)).limit(1);
      cat = c ?? null;
    }
    res.json(fmtProduct(p, cat));
  } catch {
    res.status(500).json({ error: "Failed to get product" });
  }
});

router.patch("/products/:productId", requireAuth, requireTenant, MGMT, async (req, res) => {
  try {
    const id = parseInt(req.params.productId as string);
    const { name, nameAr, categoryId, price, description, descriptionAr, isAvailable } = req.body;
    const updates: Partial<typeof productsTable.$inferInsert> = { name, nameAr, categoryId, description, descriptionAr, isAvailable };
    if (price !== undefined) updates.price = String(price);
    const [p] = await db.update(productsTable).set(updates)
      .where(and(eq(productsTable.id, id), eq(productsTable.tenantId, req.user!.tenantId!)))
      .returning();
    if (!p) { res.status(404).json({ error: "Not found" }); return; }
    await writeAuditLog({ user: req.user, action: "update_product", entityType: "product", entityId: id });
    res.json(fmtProduct(p));
  } catch {
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.get("/product-categories", requireAuth, requireTenant, async (req, res) => {
  try {
    const cats = await db.select().from(productCategoriesTable)
      .where(eq(productCategoriesTable.tenantId, req.user!.tenantId!))
      .orderBy(productCategoriesTable.sortOrder);
    res.json(cats);
  } catch {
    res.status(500).json({ error: "Failed to list categories" });
  }
});

router.post("/product-categories", requireAuth, requireTenant, MGMT, async (req, res) => {
  try {
    const { name, nameAr } = req.body;
    if (!name) { res.status(400).json({ error: "name required" }); return; }
    const [cat] = await db.insert(productCategoriesTable).values({
      tenantId: req.user!.tenantId!,
      name, nameAr,
    }).returning();
    res.status(201).json(cat);
  } catch {
    res.status(500).json({ error: "Failed to create category" });
  }
});

export default router;
