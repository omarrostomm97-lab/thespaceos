import { pgTable, serial, integer, numeric } from "drizzle-orm/pg-core";
import { tenantsTable } from "./tenants";
import { productsTable } from "./products";
import { inventoryItemsTable } from "./inventory";

export const recipeItemsTable = pgTable("recipe_items", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  inventoryItemId: integer("inventory_item_id").notNull().references(() => inventoryItemsTable.id),
  quantityUsed: numeric("quantity_used", { precision: 10, scale: 3 }).notNull(),
});

export type RecipeItem = typeof recipeItemsTable.$inferSelect;
