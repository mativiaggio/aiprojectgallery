CREATE TABLE "project" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"short_description" text NOT NULL,
	"app_url" text NOT NULL,
	"normalized_app_url" text NOT NULL,
	"repository_url" text,
	"ai_tools" text[] DEFAULT '{}' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"screenshot_url" text,
	"screenshot_file_key" text,
	"screenshot_captured_at" timestamp,
	"processing_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "project_slug_unique" ON "project" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "project_normalized_app_url_unique" ON "project" USING btree ("normalized_app_url");--> statement-breakpoint
CREATE INDEX "project_user_id_idx" ON "project" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "project_status_idx" ON "project" USING btree ("status");--> statement-breakpoint
CREATE INDEX "project_created_at_idx" ON "project" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;