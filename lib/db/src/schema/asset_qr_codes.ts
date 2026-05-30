import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { tenantsTable } from "./tenants";
import { assetsTable } from "./assets";
import { usersTable } from "./users";

export const assetQrCodesTable = pgTable("asset_qr_codes", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  assetId: integer("asset_id").notNull().references(() => assetsTable.id),
  token: text("token").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  generatedByUserId: integer("generated_by_user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  revokedAt: timestamp("revoked_at"),
});

export type AssetQrCode = typeof assetQrCodesTable.$inferSelect;
