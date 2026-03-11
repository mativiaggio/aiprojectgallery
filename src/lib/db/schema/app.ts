import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const userProfiles = pgTable("user_profile", {
  userId: text("user_id").primaryKey(),
  headline: text("headline"),
  company: text("company"),
  location: text("location"),
  website: text("website"),
  bio: text("bio"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  productAnnouncements: boolean("product_announcements").notNull().default(true),
  securityAlerts: boolean("security_alerts").notNull().default(true),
  weeklyDigest: boolean("weekly_digest").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
