import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { tenantsTable } from "./tenants";
import { ordersTable } from "./orders";
import { usersTable } from "./users";

export const orderAssignmentsTable = pgTable("order_assignments", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  orderId: integer("order_id").notNull().references(() => ordersTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  action: text("action").notNull().default("assigned"),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
});

export type OrderAssignment = typeof orderAssignmentsTable.$inferSelect;
