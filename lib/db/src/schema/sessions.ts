import { pgTable, serial, text, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tenantsTable } from "./tenants";
import { assetsTable } from "./assets";
import { usersTable } from "./users";

export const sessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  assetId: integer("asset_id").notNull().references(() => assetsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  status: text("status").notNull().default("active"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  pausedAt: timestamp("paused_at"),
  endedAt: timestamp("ended_at"),
  totalMinutes: numeric("total_minutes", { precision: 10, scale: 2 }),
  totalCost: numeric("total_cost", { precision: 10, scale: 2 }),
  cancelReason: text("cancel_reason"),
  notes: text("notes"),
  pausedDurationMinutes: numeric("paused_duration_minutes", { precision: 10, scale: 2 }).default("0"),
});

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({ id: true, startedAt: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessionsTable.$inferSelect;
