import { pgTable, serial, text, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tenantsTable } from "./tenants";

export const financeAssetsTable = pgTable("finance_assets", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  category: text("category"), // console | screen | furniture | appliance | networking | other
  purchaseCost: numeric("purchase_cost", { precision: 12, scale: 2 }),
  purchaseDate: timestamp("purchase_date"),
  assignedRoomId: integer("assigned_room_id"), // soft reference to assetsTable.id (gaming room)
  condition: text("condition").notNull().default("good"), // new | good | needs_maintenance | damaged | retired
  warrantyEndDate: timestamp("warranty_end_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFinanceAssetSchema = createInsertSchema(financeAssetsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFinanceAsset = z.infer<typeof insertFinanceAssetSchema>;
export type FinanceAsset = typeof financeAssetsTable.$inferSelect;
