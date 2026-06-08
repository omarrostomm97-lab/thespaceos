import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  company: text("company").notNull(),
  businessType: text("business_type").notNull(),
  city: text("city").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
