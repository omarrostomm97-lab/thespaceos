import { pgTable, serial, text, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tenantsTable } from "./tenants";
import { usersTable } from "./users";

export const shiftsTable = pgTable("shifts", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  status: text("status").notNull().default("open"),
  openingCash: numeric("opening_cash", { precision: 10, scale: 2 }).notNull(),
  expectedCash: numeric("expected_cash", { precision: 10, scale: 2 }),
  actualCash: numeric("actual_cash", { precision: 10, scale: 2 }),
  difference: numeric("difference", { precision: 10, scale: 2 }),
  differenceExplanation: text("difference_explanation"),
  openedAt: timestamp("opened_at").notNull().defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const insertShiftSchema = createInsertSchema(shiftsTable).omit({ id: true, openedAt: true });
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type Shift = typeof shiftsTable.$inferSelect;
