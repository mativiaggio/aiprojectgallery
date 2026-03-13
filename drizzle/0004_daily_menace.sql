CREATE TABLE "collection_item" (
	"collection_id" text NOT NULL,
	"project_id" text NOT NULL,
	"note" text,
	"added_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "collection_item_pk" PRIMARY KEY("collection_id","project_id")
);
--> statement-breakpoint
CREATE TABLE "project_change" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"snapshot_id" text,
	"change_type" text NOT NULL,
	"title" text NOT NULL,
	"detail" text NOT NULL,
	"impact" text DEFAULT 'medium' NOT NULL,
	"detected_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_peer_set" (
	"project_id" text NOT NULL,
	"peer_project_id" text NOT NULL,
	"similarity_score" integer DEFAULT 0 NOT NULL,
	"rationale" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_peer_set_pk" PRIMARY KEY("project_id","peer_project_id")
);
--> statement-breakpoint
CREATE TABLE "project_signal" (
	"project_id" text PRIMARY KEY NOT NULL,
	"likely_icp" text,
	"pricing_page_detected" boolean DEFAULT false NOT NULL,
	"docs_detected" boolean DEFAULT false NOT NULL,
	"demo_cta_detected" boolean DEFAULT false NOT NULL,
	"auth_wall_detected" boolean DEFAULT false NOT NULL,
	"enterprise_cue_detected" boolean DEFAULT false NOT NULL,
	"self_serve_cue_detected" boolean DEFAULT false NOT NULL,
	"proof_points" text[] DEFAULT '{}' NOT NULL,
	"evidence_snippets" text[] DEFAULT '{}' NOT NULL,
	"primary_headline" text,
	"research_summary" text,
	"comparison_note" text,
	"confidence_score" integer DEFAULT 0 NOT NULL,
	"html_hash" text,
	"screenshot_hash" text,
	"analyzed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_snapshot" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"screenshot_url" text,
	"screenshot_file_key" text,
	"html_hash" text,
	"page_title" text,
	"primary_headline" text,
	"summary" text,
	"pricing_page_detected" boolean DEFAULT false NOT NULL,
	"docs_detected" boolean DEFAULT false NOT NULL,
	"demo_cta_detected" boolean DEFAULT false NOT NULL,
	"auth_wall_detected" boolean DEFAULT false NOT NULL,
	"captured_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_taxonomy_term" (
	"project_id" text NOT NULL,
	"taxonomy_term_id" text NOT NULL,
	"source" text DEFAULT 'observed' NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_taxonomy_term_pk" PRIMARY KEY("project_id","taxonomy_term_id","source")
);
--> statement-breakpoint
CREATE TABLE "research_collection" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"share_token" text NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"brief_markdown" text,
	"brief_generated_at" timestamp,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taxonomy_term" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"group" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "primary_use_case" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "buyer_type" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "interaction_model" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "pricing_visibility" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "deployment_surface" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "model_vendor_mix" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "credibility_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "credibility_summary" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "last_analyzed_at" timestamp;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "next_pulse_due_at" timestamp;--> statement-breakpoint
ALTER TABLE "collection_item" ADD CONSTRAINT "collection_item_collection_id_research_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."research_collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_item" ADD CONSTRAINT "collection_item_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_change" ADD CONSTRAINT "project_change_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_change" ADD CONSTRAINT "project_change_snapshot_id_project_snapshot_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."project_snapshot"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_peer_set" ADD CONSTRAINT "project_peer_set_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_peer_set" ADD CONSTRAINT "project_peer_set_peer_project_id_project_id_fk" FOREIGN KEY ("peer_project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_signal" ADD CONSTRAINT "project_signal_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_snapshot" ADD CONSTRAINT "project_snapshot_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_taxonomy_term" ADD CONSTRAINT "project_taxonomy_term_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_taxonomy_term" ADD CONSTRAINT "project_taxonomy_term_taxonomy_term_id_taxonomy_term_id_fk" FOREIGN KEY ("taxonomy_term_id") REFERENCES "public"."taxonomy_term"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_collection" ADD CONSTRAINT "research_collection_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "collection_item_collection_idx" ON "collection_item" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "collection_item_project_idx" ON "collection_item" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_change_project_idx" ON "project_change" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_change_detected_idx" ON "project_change" USING btree ("detected_at");--> statement-breakpoint
CREATE INDEX "project_peer_set_project_idx" ON "project_peer_set" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_peer_set_peer_idx" ON "project_peer_set" USING btree ("peer_project_id");--> statement-breakpoint
CREATE INDEX "project_snapshot_project_idx" ON "project_snapshot" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_snapshot_captured_idx" ON "project_snapshot" USING btree ("captured_at");--> statement-breakpoint
CREATE INDEX "project_taxonomy_term_project_idx" ON "project_taxonomy_term" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_taxonomy_term_taxonomy_idx" ON "project_taxonomy_term" USING btree ("taxonomy_term_id");--> statement-breakpoint
CREATE UNIQUE INDEX "research_collection_share_token_unique" ON "research_collection" USING btree ("share_token");--> statement-breakpoint
CREATE INDEX "research_collection_created_by_idx" ON "research_collection" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "taxonomy_term_slug_unique" ON "taxonomy_term" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "taxonomy_term_group_idx" ON "taxonomy_term" USING btree ("group");--> statement-breakpoint
CREATE INDEX "project_credibility_score_idx" ON "project" USING btree ("credibility_score");--> statement-breakpoint
CREATE INDEX "project_next_pulse_due_idx" ON "project" USING btree ("next_pulse_due_at");