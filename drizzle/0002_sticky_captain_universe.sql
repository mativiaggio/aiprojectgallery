ALTER TABLE "project" ADD COLUMN "verification_token" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "verification_last_checked_at" timestamp;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "verification_error" text;--> statement-breakpoint
UPDATE "project"
SET "verification_token" = md5("id" || random()::text || clock_timestamp()::text || coalesce("app_url", ''));--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "verification_token" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "project_verification_token_unique" ON "project" USING btree ("verification_token");
