import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { tenantsTable } from "./tenants";
import { sessionsTable } from "./sessions";
import { usersTable } from "./users";

export const sessionLogsTable = pgTable("session_logs", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  sessionId: integer("session_id").notNull().references(() => sessionsTable.id),
  action: text("action").notNull(),
  previousStatus: text("previous_status"),
  newStatus: text("new_status"),
  note: text("note"),
  performedByUserId: integer("performed_by_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SessionLog = typeof sessionLogsTable.$inferSelect;
