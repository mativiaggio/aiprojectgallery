CREATE TABLE "market_map_membership" (
	"map_id" text NOT NULL,
	"radar_target_id" text NOT NULL,
	"cluster_label" text NOT NULL,
	"cluster_score" integer DEFAULT 0 NOT NULL,
	"rationale" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "market_map_membership_pk" PRIMARY KEY("map_id","radar_target_id")
);
--> statement-breakpoint
CREATE TABLE "market_map" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"source" text DEFAULT 'auto' NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "narrative_event" (
	"id" text PRIMARY KEY NOT NULL,
	"radar_target_id" text NOT NULL,
	"project_id" text,
	"event_key" text NOT NULL,
	"title" text NOT NULL,
	"detail" text NOT NULL,
	"impact" text DEFAULT 'medium' NOT NULL,
	"detected_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunity_cluster" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"evidence" text[] DEFAULT '{}' NOT NULL,
	"impact" text DEFAULT 'medium' NOT NULL,
	"target_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_claim" (
	"id" text PRIMARY KEY NOT NULL,
	"radar_target_id" text NOT NULL,
	"project_id" text NOT NULL,
	"claimed_by_user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"status" text DEFAULT 'claimed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "radar_target" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"app_url" text NOT NULL,
	"normalized_app_url" text NOT NULL,
	"status" text DEFAULT 'unclaimed' NOT NULL,
	"source" text DEFAULT 'user' NOT NULL,
	"screenshot_url" text,
	"screenshot_file_key" text,
	"screenshot_captured_at" timestamp,
	"primary_use_case" text,
	"buyer_type" text,
	"interaction_model" text,
	"pricing_visibility" text,
	"deployment_surface" text,
	"model_vendor_mix" text,
	"primary_headline" text,
	"research_summary" text,
	"likely_icp" text,
	"comparison_note" text,
	"pricing_page_detected" boolean DEFAULT false NOT NULL,
	"docs_detected" boolean DEFAULT false NOT NULL,
	"demo_cta_detected" boolean DEFAULT false NOT NULL,
	"auth_wall_detected" boolean DEFAULT false NOT NULL,
	"enterprise_cue_detected" boolean DEFAULT false NOT NULL,
	"self_serve_cue_detected" boolean DEFAULT false NOT NULL,
	"integration_cue_detected" boolean DEFAULT false NOT NULL,
	"collaboration_cue_detected" boolean DEFAULT false NOT NULL,
	"analytics_cue_detected" boolean DEFAULT false NOT NULL,
	"api_surface_detected" boolean DEFAULT false NOT NULL,
	"compare_surface_detected" boolean DEFAULT false NOT NULL,
	"proof_points" text[] DEFAULT '{}' NOT NULL,
	"evidence_snippets" text[] DEFAULT '{}' NOT NULL,
	"confidence_score" integer DEFAULT 0 NOT NULL,
	"credibility_score" integer DEFAULT 0 NOT NULL,
	"credibility_summary" text,
	"first_detected_at" timestamp DEFAULT now() NOT NULL,
	"last_changed_at" timestamp,
	"last_analyzed_at" timestamp,
	"next_pulse_due_at" timestamp,
	"needs_claim" boolean DEFAULT true NOT NULL,
	"project_id" text,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "market_map_membership" ADD CONSTRAINT "market_map_membership_map_id_market_map_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."market_map"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_map_membership" ADD CONSTRAINT "market_map_membership_radar_target_id_radar_target_id_fk" FOREIGN KEY ("radar_target_id") REFERENCES "public"."radar_target"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "narrative_event" ADD CONSTRAINT "narrative_event_radar_target_id_radar_target_id_fk" FOREIGN KEY ("radar_target_id") REFERENCES "public"."radar_target"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "narrative_event" ADD CONSTRAINT "narrative_event_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_claim" ADD CONSTRAINT "product_claim_radar_target_id_radar_target_id_fk" FOREIGN KEY ("radar_target_id") REFERENCES "public"."radar_target"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_claim" ADD CONSTRAINT "product_claim_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_claim" ADD CONSTRAINT "product_claim_claimed_by_user_id_user_id_fk" FOREIGN KEY ("claimed_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_claim" ADD CONSTRAINT "product_claim_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radar_target" ADD CONSTRAINT "radar_target_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radar_target" ADD CONSTRAINT "radar_target_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "market_map_membership_map_idx" ON "market_map_membership" USING btree ("map_id");--> statement-breakpoint
CREATE INDEX "market_map_membership_radar_idx" ON "market_map_membership" USING btree ("radar_target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "market_map_slug_unique" ON "market_map" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "market_map_public_idx" ON "market_map" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "narrative_event_radar_idx" ON "narrative_event" USING btree ("radar_target_id");--> statement-breakpoint
CREATE INDEX "narrative_event_project_idx" ON "narrative_event" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "narrative_event_detected_idx" ON "narrative_event" USING btree ("detected_at");--> statement-breakpoint
CREATE INDEX "narrative_event_event_key_idx" ON "narrative_event" USING btree ("event_key");--> statement-breakpoint
CREATE UNIQUE INDEX "opportunity_cluster_slug_unique" ON "opportunity_cluster" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "opportunity_cluster_impact_idx" ON "opportunity_cluster" USING btree ("impact");--> statement-breakpoint
CREATE UNIQUE INDEX "product_claim_radar_target_unique" ON "product_claim" USING btree ("radar_target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_claim_project_unique" ON "product_claim" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "product_claim_org_idx" ON "product_claim" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "product_claim_user_idx" ON "product_claim" USING btree ("claimed_by_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "radar_target_slug_unique" ON "radar_target" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "radar_target_normalized_app_url_unique" ON "radar_target" USING btree ("normalized_app_url");--> statement-breakpoint
CREATE INDEX "radar_target_status_idx" ON "radar_target" USING btree ("status");--> statement-breakpoint
CREATE INDEX "radar_target_project_idx" ON "radar_target" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "radar_target_next_pulse_due_idx" ON "radar_target" USING btree ("next_pulse_due_at");--> statement-breakpoint
CREATE INDEX "radar_target_created_by_idx" ON "radar_target" USING btree ("created_by_user_id");