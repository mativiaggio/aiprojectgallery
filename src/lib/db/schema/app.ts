import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

import { organization, user } from "@/lib/db/schema/auth"

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
    primaryUseCase: text("primary_use_case"),
    buyerType: text("buyer_type"),
    interactionModel: text("interaction_model"),
    pricingVisibility: text("pricing_visibility"),
    deploymentSurface: text("deployment_surface"),
    modelVendorMix: text("model_vendor_mix"),
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
    credibilityScore: integer("credibility_score").notNull().default(0),
    credibilitySummary: text("credibility_summary"),
    lastAnalyzedAt: timestamp("last_analyzed_at"),
    nextPulseDueAt: timestamp("next_pulse_due_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow(),
    publishedAt: timestamp("published_at"),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("project_slug_unique").on(table.slug),
    uniqueIndex("project_normalized_app_url_unique").on(table.normalizedAppUrl),
    uniqueIndex("project_verification_token_unique").on(table.verificationToken),
    index("project_organization_id_idx").on(table.organizationId),
    index("project_created_by_user_id_idx").on(table.createdByUserId),
    index("project_status_idx").on(table.status),
    index("project_created_at_idx").on(table.createdAt),
    index("project_credibility_score_idx").on(table.credibilityScore),
    index("project_next_pulse_due_idx").on(table.nextPulseDueAt),
  ]
)

export const taxonomyTerms = pgTable(
  "taxonomy_term",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    label: text("label").notNull(),
    group: text("group").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("taxonomy_term_slug_unique").on(table.slug),
    index("taxonomy_term_group_idx").on(table.group),
  ]
)

export const projectTaxonomyTerms = pgTable(
  "project_taxonomy_term",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    taxonomyTermId: text("taxonomy_term_id")
      .notNull()
      .references(() => taxonomyTerms.id, { onDelete: "cascade" }),
    source: text("source").notNull().default("observed"),
    weight: integer("weight").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      columns: [table.projectId, table.taxonomyTermId, table.source],
      name: "project_taxonomy_term_pk",
    }),
    index("project_taxonomy_term_project_idx").on(table.projectId),
    index("project_taxonomy_term_taxonomy_idx").on(table.taxonomyTermId),
  ]
)

export const projectSignals = pgTable("project_signal", {
  projectId: text("project_id")
    .primaryKey()
    .references(() => projects.id, { onDelete: "cascade" }),
  likelyIcp: text("likely_icp"),
  analysisMethod: text("analysis_method").notNull().default("deterministic"),
  pagesVisited: integer("pages_visited").notNull().default(0),
  coverageScore: integer("coverage_score").notNull().default(0),
  marketClarityScore: integer("market_clarity_score").notNull().default(0),
  conversionScore: integer("conversion_score").notNull().default(0),
  trustScore: integer("trust_score").notNull().default(0),
  technicalDepthScore: integer("technical_depth_score").notNull().default(0),
  proofScore: integer("proof_score").notNull().default(0),
  freshnessScore: integer("freshness_score").notNull().default(0),
  pricingPageDetected: boolean("pricing_page_detected").notNull().default(false),
  docsDetected: boolean("docs_detected").notNull().default(false),
  demoCtaDetected: boolean("demo_cta_detected").notNull().default(false),
  authWallDetected: boolean("auth_wall_detected").notNull().default(false),
  enterpriseCueDetected: boolean("enterprise_cue_detected").notNull().default(false),
  selfServeCueDetected: boolean("self_serve_cue_detected").notNull().default(false),
  proofPoints: text("proof_points").array().notNull().default([]),
  evidenceSnippets: text("evidence_snippets").array().notNull().default([]),
  primaryHeadline: text("primary_headline"),
  researchSummary: text("research_summary"),
  comparisonNote: text("comparison_note"),
  executiveAbstract: text("executive_abstract"),
  forensicSummary: text("forensic_summary"),
  methodologyNote: text("methodology_note"),
  confidenceScore: integer("confidence_score").notNull().default(0),
  htmlHash: text("html_hash"),
  screenshotHash: text("screenshot_hash"),
  analyzedAt: timestamp("analyzed_at").notNull().defaultNow(),
})

export const projectAnalysisRuns = pgTable(
  "project_analysis_run",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("queued"),
    trigger: text("trigger").notNull().default("manual"),
    queuedAt: timestamp("queued_at").notNull().defaultNow(),
    startedAt: timestamp("started_at"),
    finishedAt: timestamp("finished_at"),
    errorMessage: text("error_message"),
    pagesAttempted: integer("pages_attempted").notNull().default(0),
    pagesSucceeded: integer("pages_succeeded").notNull().default(0),
    snapshotId: text("snapshot_id").references(() => projectSnapshots.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("project_analysis_run_project_idx").on(table.projectId),
    index("project_analysis_run_status_idx").on(table.status),
    index("project_analysis_run_queued_idx").on(table.queuedAt),
  ]
)

export const projectPeerSets = pgTable(
  "project_peer_set",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    peerProjectId: text("peer_project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    similarityScore: integer("similarity_score").notNull().default(0),
    rationale: text("rationale"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      columns: [table.projectId, table.peerProjectId],
      name: "project_peer_set_pk",
    }),
    index("project_peer_set_project_idx").on(table.projectId),
    index("project_peer_set_peer_idx").on(table.peerProjectId),
  ]
)

export const projectSnapshots = pgTable(
  "project_snapshot",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    analysisRunId: text("analysis_run_id"),
    screenshotUrl: text("screenshot_url"),
    screenshotFileKey: text("screenshot_file_key"),
    htmlHash: text("html_hash"),
    pageTitle: text("page_title"),
    primaryHeadline: text("primary_headline"),
    summary: text("summary"),
    executiveAbstract: text("executive_abstract"),
    forensicSummary: text("forensic_summary"),
    pagesVisited: integer("pages_visited").notNull().default(0),
    evidenceCount: integer("evidence_count").notNull().default(0),
    coverageScore: integer("coverage_score").notNull().default(0),
    pricingPageDetected: boolean("pricing_page_detected").notNull().default(false),
    docsDetected: boolean("docs_detected").notNull().default(false),
    demoCtaDetected: boolean("demo_cta_detected").notNull().default(false),
    authWallDetected: boolean("auth_wall_detected").notNull().default(false),
    capturedAt: timestamp("captured_at").notNull().defaultNow(),
  },
  (table) => [
    index("project_snapshot_project_idx").on(table.projectId),
    index("project_snapshot_captured_idx").on(table.capturedAt),
  ]
)

export const projectSnapshotPages = pgTable(
  "project_snapshot_page",
  {
    id: text("id").primaryKey(),
    snapshotId: text("snapshot_id")
      .notNull()
      .references(() => projectSnapshots.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    pageType: text("page_type").notNull().default("general"),
    statusCode: integer("status_code").notNull().default(0),
    finalUrl: text("final_url").notNull(),
    title: text("title"),
    canonicalUrl: text("canonical_url"),
    metaDescription: text("meta_description"),
    htmlHash: text("html_hash"),
    textHash: text("text_hash"),
    capturedAt: timestamp("captured_at").notNull().defaultNow(),
  },
  (table) => [
    index("project_snapshot_page_snapshot_idx").on(table.snapshotId),
    index("project_snapshot_page_type_idx").on(table.pageType),
  ]
)

export const projectEvidenceItems = pgTable(
  "project_evidence_item",
  {
    id: text("id").primaryKey(),
    snapshotId: text("snapshot_id")
      .notNull()
      .references(() => projectSnapshots.id, { onDelete: "cascade" }),
    snapshotPageId: text("snapshot_page_id").references(() => projectSnapshotPages.id, {
      onDelete: "set null",
    }),
    category: text("category").notNull(),
    signalKey: text("signal_key").notNull(),
    label: text("label").notNull(),
    value: text("value").notNull(),
    excerpt: text("excerpt").notNull(),
    sourceUrl: text("source_url").notNull(),
    confidence: integer("confidence").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("project_evidence_item_snapshot_idx").on(table.snapshotId),
    index("project_evidence_item_page_idx").on(table.snapshotPageId),
    index("project_evidence_item_category_idx").on(table.category),
  ]
)

export const projectChanges = pgTable(
  "project_change",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    snapshotId: text("snapshot_id").references(() => projectSnapshots.id, {
      onDelete: "set null",
    }),
    changeType: text("change_type").notNull(),
    title: text("title").notNull(),
    detail: text("detail").notNull(),
    impact: text("impact").notNull().default("medium"),
    detectedAt: timestamp("detected_at").notNull().defaultNow(),
  },
  (table) => [
    index("project_change_project_idx").on(table.projectId),
    index("project_change_detected_idx").on(table.detectedAt),
  ]
)

export const projectFeatureGaps = pgTable(
  "project_feature_gap",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    featureKey: text("feature_key").notNull(),
    title: text("title").notNull(),
    reason: text("reason").notNull(),
    impact: text("impact").notNull().default("medium"),
    confidence: integer("confidence").notNull().default(0),
    evidence: text("evidence").array().notNull().default([]),
    implementationHint: text("implementation_hint").notNull(),
    status: text("status").notNull().default("recommended"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      columns: [table.projectId, table.featureKey],
      name: "project_feature_gap_pk",
    }),
    index("project_feature_gap_project_idx").on(table.projectId),
    index("project_feature_gap_impact_idx").on(table.impact),
  ]
)

export const radarTargets = pgTable(
  "radar_target",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    appUrl: text("app_url").notNull(),
    normalizedAppUrl: text("normalized_app_url").notNull(),
    status: text("status").notNull().default("unclaimed"),
    source: text("source").notNull().default("user"),
    screenshotUrl: text("screenshot_url"),
    screenshotFileKey: text("screenshot_file_key"),
    screenshotCapturedAt: timestamp("screenshot_captured_at"),
    primaryUseCase: text("primary_use_case"),
    buyerType: text("buyer_type"),
    interactionModel: text("interaction_model"),
    pricingVisibility: text("pricing_visibility"),
    deploymentSurface: text("deployment_surface"),
    modelVendorMix: text("model_vendor_mix"),
    primaryHeadline: text("primary_headline"),
    researchSummary: text("research_summary"),
    likelyIcp: text("likely_icp"),
    comparisonNote: text("comparison_note"),
    pricingPageDetected: boolean("pricing_page_detected").notNull().default(false),
    docsDetected: boolean("docs_detected").notNull().default(false),
    demoCtaDetected: boolean("demo_cta_detected").notNull().default(false),
    authWallDetected: boolean("auth_wall_detected").notNull().default(false),
    enterpriseCueDetected: boolean("enterprise_cue_detected").notNull().default(false),
    selfServeCueDetected: boolean("self_serve_cue_detected").notNull().default(false),
    integrationCueDetected: boolean("integration_cue_detected").notNull().default(false),
    collaborationCueDetected: boolean("collaboration_cue_detected").notNull().default(false),
    analyticsCueDetected: boolean("analytics_cue_detected").notNull().default(false),
    apiSurfaceDetected: boolean("api_surface_detected").notNull().default(false),
    compareSurfaceDetected: boolean("compare_surface_detected").notNull().default(false),
    proofPoints: text("proof_points").array().notNull().default([]),
    evidenceSnippets: text("evidence_snippets").array().notNull().default([]),
    confidenceScore: integer("confidence_score").notNull().default(0),
    credibilityScore: integer("credibility_score").notNull().default(0),
    credibilitySummary: text("credibility_summary"),
    firstDetectedAt: timestamp("first_detected_at").notNull().defaultNow(),
    lastChangedAt: timestamp("last_changed_at"),
    lastAnalyzedAt: timestamp("last_analyzed_at"),
    nextPulseDueAt: timestamp("next_pulse_due_at"),
    needsClaim: boolean("needs_claim").notNull().default(true),
    projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("radar_target_slug_unique").on(table.slug),
    uniqueIndex("radar_target_normalized_app_url_unique").on(table.normalizedAppUrl),
    index("radar_target_status_idx").on(table.status),
    index("radar_target_project_idx").on(table.projectId),
    index("radar_target_next_pulse_due_idx").on(table.nextPulseDueAt),
    index("radar_target_created_by_idx").on(table.createdByUserId),
  ]
)

export const narrativeEvents = pgTable(
  "narrative_event",
  {
    id: text("id").primaryKey(),
    radarTargetId: text("radar_target_id")
      .notNull()
      .references(() => radarTargets.id, { onDelete: "cascade" }),
    projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
    eventKey: text("event_key").notNull(),
    title: text("title").notNull(),
    detail: text("detail").notNull(),
    impact: text("impact").notNull().default("medium"),
    detectedAt: timestamp("detected_at").notNull().defaultNow(),
  },
  (table) => [
    index("narrative_event_radar_idx").on(table.radarTargetId),
    index("narrative_event_project_idx").on(table.projectId),
    index("narrative_event_detected_idx").on(table.detectedAt),
    index("narrative_event_event_key_idx").on(table.eventKey),
  ]
)

export const marketMaps = pgTable(
  "market_map",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    source: text("source").notNull().default("auto"),
    isPublic: boolean("is_public").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("market_map_slug_unique").on(table.slug),
    index("market_map_public_idx").on(table.isPublic),
  ]
)

export const marketMapMemberships = pgTable(
  "market_map_membership",
  {
    mapId: text("map_id")
      .notNull()
      .references(() => marketMaps.id, { onDelete: "cascade" }),
    radarTargetId: text("radar_target_id")
      .notNull()
      .references(() => radarTargets.id, { onDelete: "cascade" }),
    clusterLabel: text("cluster_label").notNull(),
    clusterScore: integer("cluster_score").notNull().default(0),
    rationale: text("rationale"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      columns: [table.mapId, table.radarTargetId],
      name: "market_map_membership_pk",
    }),
    index("market_map_membership_map_idx").on(table.mapId),
    index("market_map_membership_radar_idx").on(table.radarTargetId),
  ]
)

export const opportunityClusters = pgTable(
  "opportunity_cluster",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    evidence: text("evidence").array().notNull().default([]),
    impact: text("impact").notNull().default("medium"),
    targetCount: integer("target_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("opportunity_cluster_slug_unique").on(table.slug),
    index("opportunity_cluster_impact_idx").on(table.impact),
  ]
)

export const productClaims = pgTable(
  "product_claim",
  {
    id: text("id").primaryKey(),
    radarTargetId: text("radar_target_id")
      .notNull()
      .references(() => radarTargets.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    claimedByUserId: text("claimed_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("claimed"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("product_claim_radar_target_unique").on(table.radarTargetId),
    uniqueIndex("product_claim_project_unique").on(table.projectId),
    index("product_claim_org_idx").on(table.organizationId),
    index("product_claim_user_idx").on(table.claimedByUserId),
  ]
)

export const researchCollections = pgTable(
  "research_collection",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    shareToken: text("share_token").notNull(),
    isPublic: boolean("is_public").notNull().default(false),
    briefMarkdown: text("brief_markdown"),
    briefGeneratedAt: timestamp("brief_generated_at"),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("research_collection_share_token_unique").on(table.shareToken),
    index("research_collection_created_by_idx").on(table.createdByUserId),
  ]
)

export const collectionItems = pgTable(
  "collection_item",
  {
    collectionId: text("collection_id")
      .notNull()
      .references(() => researchCollections.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    note: text("note"),
    addedAt: timestamp("added_at").notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      columns: [table.collectionId, table.projectId],
      name: "collection_item_pk",
    }),
    index("collection_item_collection_idx").on(table.collectionId),
    index("collection_item_project_idx").on(table.projectId),
  ]
)

export const localizedTextCache = pgTable(
  "localized_text_cache",
  {
    id: text("id").primaryKey(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    field: text("field").notNull(),
    targetLocale: text("target_locale").notNull(),
    sourceHash: text("source_hash").notNull(),
    translatedText: text("translated_text").notNull(),
    model: text("model"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("localized_text_cache_unique").on(
      table.entityType,
      table.entityId,
      table.field,
      table.targetLocale,
      table.sourceHash
    ),
    index("localized_text_cache_lookup_idx").on(
      table.entityType,
      table.entityId,
      table.targetLocale,
      table.field
    ),
  ]
)

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(user, {
    fields: [userProfiles.userId],
    references: [user.id],
  }),
}))

export const projectsRelations = relations(projects, ({ one }) => ({
  organization: one(organization, {
    fields: [projects.organizationId],
    references: [organization.id],
  }),
  createdByUser: one(user, {
    fields: [projects.createdByUserId],
    references: [user.id],
  }),
}))

export const projectSignalsRelations = relations(projectSignals, ({ one }) => ({
  project: one(projects, {
    fields: [projectSignals.projectId],
    references: [projects.id],
  }),
}))

export const projectAnalysisRunsRelations = relations(projectAnalysisRuns, ({ one }) => ({
  project: one(projects, {
    fields: [projectAnalysisRuns.projectId],
    references: [projects.id],
  }),
  snapshot: one(projectSnapshots, {
    fields: [projectAnalysisRuns.snapshotId],
    references: [projectSnapshots.id],
  }),
}))

export const projectSnapshotsRelations = relations(projectSnapshots, ({ one, many }) => ({
  project: one(projects, {
    fields: [projectSnapshots.projectId],
    references: [projects.id],
  }),
  analysisRun: one(projectAnalysisRuns, {
    fields: [projectSnapshots.analysisRunId],
    references: [projectAnalysisRuns.id],
  }),
  changes: many(projectChanges),
  pages: many(projectSnapshotPages),
  evidenceItems: many(projectEvidenceItems),
}))

export const projectChangesRelations = relations(projectChanges, ({ one }) => ({
  project: one(projects, {
    fields: [projectChanges.projectId],
    references: [projects.id],
  }),
  snapshot: one(projectSnapshots, {
    fields: [projectChanges.snapshotId],
    references: [projectSnapshots.id],
  }),
}))

export const projectSnapshotPagesRelations = relations(projectSnapshotPages, ({ one, many }) => ({
  snapshot: one(projectSnapshots, {
    fields: [projectSnapshotPages.snapshotId],
    references: [projectSnapshots.id],
  }),
  evidenceItems: many(projectEvidenceItems),
}))

export const projectEvidenceItemsRelations = relations(projectEvidenceItems, ({ one }) => ({
  snapshot: one(projectSnapshots, {
    fields: [projectEvidenceItems.snapshotId],
    references: [projectSnapshots.id],
  }),
  snapshotPage: one(projectSnapshotPages, {
    fields: [projectEvidenceItems.snapshotPageId],
    references: [projectSnapshotPages.id],
  }),
}))

export const projectFeatureGapsRelations = relations(projectFeatureGaps, ({ one }) => ({
  project: one(projects, {
    fields: [projectFeatureGaps.projectId],
    references: [projects.id],
  }),
}))

export const radarTargetsRelations = relations(radarTargets, ({ one, many }) => ({
  project: one(projects, {
    fields: [radarTargets.projectId],
    references: [projects.id],
  }),
  createdByUser: one(user, {
    fields: [radarTargets.createdByUserId],
    references: [user.id],
  }),
  narrativeEvents: many(narrativeEvents),
  memberships: many(marketMapMemberships),
  claims: many(productClaims),
}))

export const narrativeEventsRelations = relations(narrativeEvents, ({ one }) => ({
  radarTarget: one(radarTargets, {
    fields: [narrativeEvents.radarTargetId],
    references: [radarTargets.id],
  }),
  project: one(projects, {
    fields: [narrativeEvents.projectId],
    references: [projects.id],
  }),
}))

export const marketMapsRelations = relations(marketMaps, ({ many }) => ({
  memberships: many(marketMapMemberships),
}))

export const marketMapMembershipsRelations = relations(marketMapMemberships, ({ one }) => ({
  map: one(marketMaps, {
    fields: [marketMapMemberships.mapId],
    references: [marketMaps.id],
  }),
  radarTarget: one(radarTargets, {
    fields: [marketMapMemberships.radarTargetId],
    references: [radarTargets.id],
  }),
}))

export const productClaimsRelations = relations(productClaims, ({ one }) => ({
  radarTarget: one(radarTargets, {
    fields: [productClaims.radarTargetId],
    references: [radarTargets.id],
  }),
  project: one(projects, {
    fields: [productClaims.projectId],
    references: [projects.id],
  }),
  organization: one(organization, {
    fields: [productClaims.organizationId],
    references: [organization.id],
  }),
  claimedByUser: one(user, {
    fields: [productClaims.claimedByUserId],
    references: [user.id],
  }),
}))

export const researchCollectionsRelations = relations(
  researchCollections,
  ({ one, many }) => ({
    createdByUser: one(user, {
      fields: [researchCollections.createdByUserId],
      references: [user.id],
    }),
    items: many(collectionItems),
  })
)

export const collectionItemsRelations = relations(collectionItems, ({ one }) => ({
  collection: one(researchCollections, {
    fields: [collectionItems.collectionId],
    references: [researchCollections.id],
  }),
  project: one(projects, {
    fields: [collectionItems.projectId],
    references: [projects.id],
  }),
}))
