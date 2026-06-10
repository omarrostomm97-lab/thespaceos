import { pgTable, serial, text, numeric, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tenantsTable } from "./tenants";
import { financeCategoriesTable } from "./finance-categories";
import { financeAccountsTable } from "./finance-accounts";

export const expenseTemplatesTable = pgTable("expense_templates", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  categoryId: integer("category_id").references(() => financeCategoriesTable.id),
  accountId: integer("account_id").references(() => financeAccountsTable.id),
  paymentMethod: text("payment_method").default("cash"),
  frequency: text("frequency").notNull().default("daily"),
  applyDay: integer("apply_day"),
  autoApply: boolean("auto_apply").notNull().default(false),
  deductFromShift: boolean("deduct_from_shift").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertExpenseTemplateSchema = createInsertSchema(expenseTemplatesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertExpenseTemplate = z.infer<typeof insertExpenseTemplateSchema>;
export type ExpenseTemplate = typeof expenseTemplatesTable.$inferSelect;
