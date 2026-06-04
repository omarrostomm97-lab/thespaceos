import { pgTable, serial, text, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tenantsTable } from "./tenants";
import { financeCategoriesTable } from "./finance-categories";
import { financeAccountsTable } from "./finance-accounts";
import { usersTable } from "./users";

export const financeTransactionsTable = pgTable("finance_transactions", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  type: text("type").notNull(), // income | expense | capital_injection | owner_withdrawal | transfer | adjustment
  categoryId: integer("category_id").references(() => financeCategoriesTable.id),
  accountId: integer("account_id").references(() => financeAccountsTable.id),
  title: text("title"),
  description: text("description"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  transactionDate: timestamp("transaction_date").notNull().defaultNow(),
  paymentMethod: text("payment_method"), // cash | instapay | visa | bank_transfer | other
  status: text("status").notNull().default("paid"), // paid | pending | partial | cancelled
  referenceType: text("reference_type"), // payment | session | order | shift | manual | asset | maintenance | capital | withdrawal | account_transfer | adjustment
  referenceId: text("reference_id"),
  vendorName: text("vendor_name"),
  receiptUrl: text("receipt_url"),
  notes: text("notes"),
  createdByUserId: integer("created_by_user_id").references(() => usersTable.id),
  approvedByUserId: integer("approved_by_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFinanceTransactionSchema = createInsertSchema(financeTransactionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFinanceTransaction = z.infer<typeof insertFinanceTransactionSchema>;
export type FinanceTransaction = typeof financeTransactionsTable.$inferSelect;
