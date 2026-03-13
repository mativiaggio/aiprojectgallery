CREATE TABLE "project_analysis_run" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"trigger" text DEFAULT 'manual' NOT NULL,
	"queued_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"finished_at" timestamp,
	"error_message" text,
	"pages_attempted" integer DEFAULT 0 NOT NULL,
	"pages_succeeded" integer DEFAULT 0 NOT NULL,
	"snapshot_id" text
);
--> statement-breakpoint
CREATE TABLE "project_evidence_item" (
	"id" text PRIMARY KEY NOT NULL,
	"snapshot_id" text NOT NULL,
	"snapshot_page_id" text,
	"category" text NOT NULL,
	"signal_key" text NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"excerpt" text NOT NULL,
	"source_url" text NOT NULL,
	"confidence" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_snapshot_page" (
	"id" text PRIMARY KEY NOT NULL,
	"snapshot_id" text NOT NULL,
	"url" text NOT NULL,
	"page_type" text DEFAULT 'general' NOT NULL,
	"status_code" integer DEFAULT 0 NOT NULL,
	"final_url" text NOT NULL,
	"title" text,
	"canonical_url" text,
	"meta_description" text,
	"html_hash" text,
	"text_hash" text,
	"captured_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_signal" ADD COLUMN "analysis_method" text DEFAULT 'deterministic' NOT NULL;--> statement-breakpoint
ALTER TABLE "project_signal" ADD COLUMN "pages_visited" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "project_signal" ADD COLUMN "coverage_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "project_signal" ADD COLUMN "market_clarity_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "project_signal" ADD COLUMN "conversion_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "project_signal" ADD COLUMN "trust_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "project_signal" ADD COLUMN "technical_depth_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "project_signal" ADD COLUMN "proof_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "project_signal" ADD COLUMN "freshness_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "project_signal" ADD COLUMN "executive_abstract" text;--> statement-breakpoint
ALTER TABLE "project_signal" ADD COLUMN "forensic_summary" text;--> statement-breakpoint
ALTER TABLE "project_signal" ADD COLUMN "methodology_note" text;--> statement-breakpoint
ALTER TABLE "project_snapshot" ADD COLUMN "analysis_run_id" text;--> statement-breakpoint
ALTER TABLE "project_snapshot" ADD COLUMN "executive_abstract" text;--> statement-breakpoint
ALTER TABLE "project_snapshot" ADD COLUMN "forensic_summary" text;--> statement-breakpoint
ALTER TABLE "project_snapshot" ADD COLUMN "pages_visited" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "project_snapshot" ADD COLUMN "evidence_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "project_snapshot" ADD COLUMN "coverage_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "project_analysis_run" ADD CONSTRAINT "project_analysis_run_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_analysis_run" ADD CONSTRAINT "project_analysis_run_snapshot_id_project_snapshot_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."project_snapshot"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_evidence_item" ADD CONSTRAINT "project_evidence_item_snapshot_id_project_snapshot_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."project_snapshot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_evidence_item" ADD CONSTRAINT "project_evidence_item_snapshot_page_id_project_snapshot_page_id_fk" FOREIGN KEY ("snapshot_page_id") REFERENCES "public"."project_snapshot_page"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_snapshot_page" ADD CONSTRAINT "project_snapshot_page_snapshot_id_project_snapshot_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."project_snapshot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_analysis_run_project_idx" ON "project_analysis_run" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_analysis_run_status_idx" ON "project_analysis_run" USING btree ("status");--> statement-breakpoint
CREATE INDEX "project_analysis_run_queued_idx" ON "project_analysis_run" USING btree ("queued_at");--> statement-breakpoint
CREATE INDEX "project_evidence_item_snapshot_idx" ON "project_evidence_item" USING btree ("snapshot_id");--> statement-breakpoint
CREATE INDEX "project_evidence_item_page_idx" ON "project_evidence_item" USING btree ("snapshot_page_id");--> statement-breakpoint
CREATE INDEX "project_evidence_item_category_idx" ON "project_evidence_item" USING btree ("category");--> statement-breakpoint
CREATE INDEX "project_snapshot_page_snapshot_idx" ON "project_snapshot_page" USING btree ("snapshot_id");--> statement-breakpoint
CREATE INDEX "project_snapshot_page_type_idx" ON "project_snapshot_page" USING btree ("page_type");