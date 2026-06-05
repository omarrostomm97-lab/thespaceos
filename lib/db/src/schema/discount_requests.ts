import { pgTable, serial, text, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { tenantsTable } from "./tenants";
import { sessionsTable } from "./sessions";
import { ordersTable } from "./orders";
import { usersTable } from "./users";

export const discountRequestsTable = pgTable("discount_requests", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  sessionId: integer("session_id").references(() => sessionsTable.id),
  orderId: integer("order_id").references(() => ordersTable.id),
  type: text("type").notNull(),
  discountKind: text("discount_kind").notNull(),
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
  billedMinutes: numeric("billed_minutes", { precision: 10, scale: 2 }),
  reason: text("reason"),
  status: text("status").notNull().default("pending"),
  adminNote: text("admin_note"),
  requestedByUserId: integer("requested_by_user_id").notNull().references(() => usersTable.id),
  reviewedByUserId: integer("reviewed_by_user_id").references(() => usersTable.id),
  reviewedAt: timestamp("reviewed_at"),
  originalAmount: numeric("original_amount", { precision: 12, scale: 2 }),
  discountedAmount: numeric("discounted_amount", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type DiscountRequest = typeof discountRequestsTable.$inferSelect;
