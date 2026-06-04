import { pgTable, serial, text, numeric, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tenantsTable } from "./tenants";

export const financeAccountsTable = pgTable("finance_accounts", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  type: text("type").notNull().default("cash"), // cash | bank | wallet | card_processor | other
  openingBalance: numeric("opening_balance", { precision: 12, scale: 2 }).notNull().default("0"),
  currentBalance: numeric("current_balance", { precision: 12, scale: 2 }).notNull().default("0"),
  isActive: boolean("is_active").notNull().default(true),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFinanceAccountSchema = createInsertSchema(financeAccountsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFinanceAccount = z.infer<typeof insertFinanceAccountSchema>;
export type FinanceAccount = typeof financeAccountsTable.$inferSelect;
