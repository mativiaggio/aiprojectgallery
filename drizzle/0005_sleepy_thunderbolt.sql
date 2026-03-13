CREATE TABLE "project_feature_gap" (
	"project_id" text NOT NULL,
	"feature_key" text NOT NULL,
	"title" text NOT NULL,
	"reason" text NOT NULL,
	"impact" text DEFAULT 'medium' NOT NULL,
	"confidence" integer DEFAULT 0 NOT NULL,
	"evidence" text[] DEFAULT '{}' NOT NULL,
	"implementation_hint" text NOT NULL,
	"status" text DEFAULT 'recommended' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_feature_gap_pk" PRIMARY KEY("project_id","feature_key")
);
--> statement-breakpoint
ALTER TABLE "project_feature_gap" ADD CONSTRAINT "project_feature_gap_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_feature_gap_project_idx" ON "project_feature_gap" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_feature_gap_impact_idx" ON "project_feature_gap" USING btree ("impact");