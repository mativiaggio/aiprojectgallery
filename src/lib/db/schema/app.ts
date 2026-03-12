import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

import { user } from "@/lib/db/schema/auth"

export const userProfiles = pgTable("user_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
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

export const projects = pgTable(
  "project",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    shortDescription: text("short_description").notNull(),
    appUrl: text("app_url").notNull(),
    normalizedAppUrl: text("normalized_app_url").notNull(),
    repositoryUrl: text("repository_url"),
    aiTools: text("ai_tools").array().notNull().default([]),
    tags: text("tags").array().notNull().default([]),
    status: text("status").notNull().default("processing"),
    screenshotUrl: text("screenshot_url"),
    screenshotFileKey: text("screenshot_file_key"),
    screenshotCapturedAt: timestamp("screenshot_captured_at"),
    processingError: text("processing_error"),
    verificationToken: text("verification_token").notNull(),
    verified: boolean("verified").notNull().default(false),
    verifiedAt: timestamp("verified_at"),
    verificationLastCheckedAt: timestamp("verification_last_checked_at"),
    verificationError: text("verification_error"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow(),
    publishedAt: timestamp("published_at"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("project_slug_unique").on(table.slug),
    uniqueIndex("project_normalized_app_url_unique").on(table.normalizedAppUrl),
    uniqueIndex("project_verification_token_unique").on(table.verificationToken),
    index("project_user_id_idx").on(table.userId),
    index("project_status_idx").on(table.status),
    index("project_created_at_idx").on(table.createdAt),
  ]
)

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(user, {
    fields: [userProfiles.userId],
    references: [user.id],
  }),
}))

export const projectsRelations = relations(projects, ({ one }) => ({
  user: one(user, {
    fields: [projects.userId],
    references: [user.id],
  }),
}))
