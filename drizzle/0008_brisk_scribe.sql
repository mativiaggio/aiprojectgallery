CREATE TABLE IF NOT EXISTS "localized_text_cache" (
	"id" text PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"field" text NOT NULL,
	"target_locale" text NOT NULL,
	"source_hash" text NOT NULL,
	"translated_text" text NOT NULL,
	"model" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "localized_text_cache_unique" ON "localized_text_cache" USING btree ("entity_type","entity_id","field","target_locale","source_hash");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "localized_text_cache_lookup_idx" ON "localized_text_cache" USING btree ("entity_type","entity_id","target_locale","field");
