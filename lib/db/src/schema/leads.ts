import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  fullName: text("full_name"),
  phone: text("phone").notNull(),
  email: text("email"),
  businessType: text("business_type").notNull(),
  businessName: text("business_name"),
  branchesCount: integer("branches_count"),
  preferredContactMethod: text("preferred_contact_method"),
  message: text("message"),
  source: text("source").default("landing_page").notNull(),
  status: text("status").default("new").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
