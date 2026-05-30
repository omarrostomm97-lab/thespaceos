import { pgTable, serial, integer, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { tenantsTable } from "./tenants";
import { shiftsTable } from "./shifts";
import { usersTable } from "./users";

export const shiftCashLogsTable = pgTable("shift_cash_logs", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  shiftId: integer("shift_id").notNull().references(() => shiftsTable.id),
  type: text("type").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  note: text("note"),
  recordedByUserId: integer("recorded_by_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ShiftCashLog = typeof shiftCashLogsTable.$inferSelect;
