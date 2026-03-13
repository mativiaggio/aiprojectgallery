CREATE TABLE "organization" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "logo" text,
  "created_at" timestamp NOT NULL,
  "metadata" text
);
--> statement-breakpoint
CREATE UNIQUE INDEX "organization_slug_uidx" ON "organization" USING btree ("slug");
--> statement-breakpoint
CREATE TABLE "member" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL,
  "user_id" text NOT NULL,
  "role" text DEFAULT 'member' NOT NULL,
  "created_at" timestamp NOT NULL,
  CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "member_organizationId_idx" ON "member" USING btree ("organization_id");
--> statement-breakpoint
CREATE INDEX "member_userId_idx" ON "member" USING btree ("user_id");
--> statement-breakpoint
CREATE TABLE "invitation" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL,
  "email" text NOT NULL,
  "role" text,
  "status" text DEFAULT 'pending' NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "inviter_id" text NOT NULL,
  CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "invitation_organizationId_idx" ON "invitation" USING btree ("organization_id");
--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" USING btree ("email");
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "active_organization_id" text;
--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "organization_id" text;
--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "created_by_user_id" text;
--> statement-breakpoint
INSERT INTO "organization" ("id", "name", "slug", "created_at", "metadata")
SELECT
  'org_personal_' || u."id",
  CASE
    WHEN nullif(trim(u."name"), '') IS NOT NULL THEN trim(u."name") || ' Workspace'
    ELSE split_part(u."email", '@', 1) || ' Workspace'
  END,
  concat(
    coalesce(
      nullif(
        regexp_replace(
          regexp_replace(
            lower(coalesce(nullif(trim(u."name"), ''), split_part(u."email", '@', 1), 'workspace')),
            '[^a-z0-9]+',
            '-',
            'g'
          ),
          '(^-+|-+$)',
          '',
          'g'
        ),
        ''
      ),
      'workspace'
    ),
    '-',
    substring(md5(u."id") from 1 for 8)
  ),
  u."created_at",
  null
FROM "user" u;
--> statement-breakpoint
INSERT INTO "member" ("id", "organization_id", "user_id", "role", "created_at")
SELECT
  'member_owner_' || u."id",
  'org_personal_' || u."id",
  u."id",
  'owner',
  u."created_at"
FROM "user" u;
--> statement-breakpoint
UPDATE "project"
SET
  "organization_id" = 'org_personal_' || "user_id",
  "created_by_user_id" = "user_id";
--> statement-breakpoint
UPDATE "session"
SET "active_organization_id" = 'org_personal_' || "user_id"
WHERE "active_organization_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "organization_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "created_by_user_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "project"
  ADD CONSTRAINT "project_organization_id_organization_id_fk"
  FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "project"
  ADD CONSTRAINT "project_created_by_user_id_user_id_fk"
  FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "project_organization_id_idx" ON "project" USING btree ("organization_id");
--> statement-breakpoint
CREATE INDEX "project_created_by_user_id_idx" ON "project" USING btree ("created_by_user_id");
--> statement-breakpoint
ALTER TABLE "project" DROP CONSTRAINT "project_user_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "project_user_id_idx";
--> statement-breakpoint
ALTER TABLE "project" DROP COLUMN "user_id";
