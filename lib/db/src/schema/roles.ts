import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { tenantsTable } from "./tenants";
import { usersTable } from "./users";

export const rolesTable = pgTable("roles", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenantsTable.id),
  name: text("name").notNull(),
  description: text("description"),
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userRolesTable = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  roleId: integer("role_id").notNull().references(() => rolesTable.id),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
});

export type Role = typeof rolesTable.$inferSelect;
export type UserRole = typeof userRolesTable.$inferSelect;
