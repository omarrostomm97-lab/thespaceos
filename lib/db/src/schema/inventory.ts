import { pgTable, serial, text, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tenantsTable } from "./tenants";
import { usersTable } from "./users";

export const inventoryItemsTable = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  unit: text("unit").notNull().default("pcs"),
  currentStock: numeric("current_stock", { precision: 10, scale: 3 }).notNull().default("0"),
  minStockLevel: numeric("min_stock_level", { precision: 10, scale: 3 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const inventoryMovementsTable = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  inventoryItemId: integer("inventory_item_id").notNull().references(() => inventoryItemsTable.id),
  type: text("type").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 3 }).notNull(),
  reason: text("reason"),
  approvedByUserId: integer("approved_by_user_id").references(() => usersTable.id),
  createdByUserId: integer("created_by_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItemsTable).omit({ id: true, createdAt: true });
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItemsTable.$inferSelect;

export const insertInventoryMovementSchema = createInsertSchema(inventoryMovementsTable).omit({ id: true, createdAt: true });
export type InsertInventoryMovement = z.infer<typeof insertInventoryMovementSchema>;
export type InventoryMovement = typeof inventoryMovementsTable.$inferSelect;
