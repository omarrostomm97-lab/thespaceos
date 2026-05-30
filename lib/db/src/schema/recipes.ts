import { pgTable, serial, integer, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { tenantsTable } from "./tenants";
import { productsTable } from "./products";
import { inventoryItemsTable } from "./inventory";

// A recipe groups the ingredients needed to make a product.
export const recipesTable = pgTable("recipes", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  name: text("name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Each recipe_item is one ingredient line of a recipe.
export const recipeItemsTable = pgTable("recipe_items", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  inventoryItemId: integer("inventory_item_id").notNull().references(() => inventoryItemsTable.id),
  quantityUsed: numeric("quantity_used", { precision: 10, scale: 3 }).notNull(),
});

export type Recipe = typeof recipesTable.$inferSelect;
export type RecipeItem = typeof recipeItemsTable.$inferSelect;
