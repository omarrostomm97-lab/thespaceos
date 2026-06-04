import { pgTable, serial, text, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tenantsTable } from "./tenants";
import { financeAssetsTable } from "./finance-assets";
import { financeTransactionsTable } from "./finance-transactions";

export const financeAssetMaintenanceTable = pgTable("finance_asset_maintenance", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  assetId: integer("asset_id").notNull().references(() => financeAssetsTable.id),
  title: text("title").notNull(),
  description: text("description"),
  maintenanceCost: numeric("maintenance_cost", { precision: 12, scale: 2 }),
  maintenanceDate: timestamp("maintenance_date").notNull().defaultNow(),
  vendorName: text("vendor_name"),
  financeTransactionId: integer("finance_transaction_id").references(() => financeTransactionsTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFinanceAssetMaintenanceSchema = createInsertSchema(financeAssetMaintenanceTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFinanceAssetMaintenance = z.infer<typeof insertFinanceAssetMaintenanceSchema>;
export type FinanceAssetMaintenance = typeof financeAssetMaintenanceTable.$inferSelect;
