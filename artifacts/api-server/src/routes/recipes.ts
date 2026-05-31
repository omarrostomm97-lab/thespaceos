import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, recipeItemsTable, inventoryItemsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireTenant, requireRole } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";

const router = Router();

const MGMT = requireRole("platform_owner", "owner", "manager");

// GET /recipes — list all products with hasRecipe flag
router.get("/recipes", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const products = await db.select().from(productsTable)
      .where(eq(productsTable.tenantId, tenantId));
    const recipeItems = await db.select({ productId: recipeItemsTable.productId })
      .from(recipeItemsTable)
      .where(eq(recipeItemsTable.tenantId, tenantId));
    const configuredProductIds = new Set(recipeItems.map(r => r.productId));
    res.json(products.map(p => ({
      id: p.id,
      name: p.name,
      nameAr: p.nameAr,
      categoryId: p.categoryId,
      price: parseFloat(p.price as string),
      isAvailable: p.isAvailable,
      hasRecipe: configuredProductIds.has(p.id),
      recipeItemCount: recipeItems.filter(r => r.productId === p.id).length,
    })));
  } catch {
    res.status(500).json({ error: "Failed to list recipes" });
  }
});

// GET /recipes/:productId — get recipe items for a product
router.get("/recipes/:productId", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const productId = parseInt(req.params.productId as string);
    const items = await db.select({
      id: recipeItemsTable.id,
      productId: recipeItemsTable.productId,
      inventoryItemId: recipeItemsTable.inventoryItemId,
      inventoryItemName: inventoryItemsTable.name,
      inventoryItemUnit: inventoryItemsTable.unit,
      quantityUsed: recipeItemsTable.quantityUsed,
    }).from(recipeItemsTable)
      .leftJoin(inventoryItemsTable, eq(recipeItemsTable.inventoryItemId, inventoryItemsTable.id))
      .where(and(eq(recipeItemsTable.productId, productId), eq(recipeItemsTable.tenantId, tenantId)));
    res.json(items.map(i => ({
      ...i,
      quantityUsed: parseFloat(i.quantityUsed as string),
    })));
  } catch {
    res.status(500).json({ error: "Failed to get recipe" });
  }
});

// PUT /recipes/:productId — replace all recipe items (MGMT only)
router.put("/recipes/:productId", requireAuth, requireTenant, MGMT, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const productId = parseInt(req.params.productId as string);
    const { items } = req.body as { items: { inventoryItemId: number; quantityUsed: number }[] };
    if (!Array.isArray(items)) { res.status(400).json({ error: "items array required" }); return; }

    // Verify product belongs to tenant
    const [product] = await db.select({ id: productsTable.id }).from(productsTable)
      .where(and(eq(productsTable.id, productId), eq(productsTable.tenantId, tenantId))).limit(1);
    if (!product) { res.status(404).json({ error: "Product not found" }); return; }

    // Delete existing recipe items
    await db.delete(recipeItemsTable)
      .where(and(eq(recipeItemsTable.productId, productId), eq(recipeItemsTable.tenantId, tenantId)));

    // Insert new items (if any)
    if (items.length > 0) {
      await db.insert(recipeItemsTable).values(
        items.map(i => ({
          tenantId,
          productId,
          inventoryItemId: i.inventoryItemId,
          quantityUsed: String(i.quantityUsed),
        }))
      );
    }

    await writeAuditLog({ user: req.user, action: "update_recipe", entityType: "product", entityId: productId, newValue: { itemCount: items.length } });

    // Return updated recipe
    const updated = await db.select({
      id: recipeItemsTable.id,
      productId: recipeItemsTable.productId,
      inventoryItemId: recipeItemsTable.inventoryItemId,
      inventoryItemName: inventoryItemsTable.name,
      inventoryItemUnit: inventoryItemsTable.unit,
      quantityUsed: recipeItemsTable.quantityUsed,
    }).from(recipeItemsTable)
      .leftJoin(inventoryItemsTable, eq(recipeItemsTable.inventoryItemId, inventoryItemsTable.id))
      .where(and(eq(recipeItemsTable.productId, productId), eq(recipeItemsTable.tenantId, tenantId)));
    res.json(updated.map(i => ({ ...i, quantityUsed: parseFloat(i.quantityUsed as string) })));
  } catch {
    res.status(500).json({ error: "Failed to save recipe" });
  }
});

export default router;
