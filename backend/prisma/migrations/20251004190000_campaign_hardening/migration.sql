-- Campaign hardening migration: adds slug, status, startsAt, version, minContributionCents
-- and idempotency keys table

-- Project table alterations
ALTER TABLE "Project"
  ADD COLUMN IF NOT EXISTS "minContributionCents" INTEGER,
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'PUBLISHED',
  ADD COLUMN IF NOT EXISTS "startsAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;

-- Unique index for slug
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = current_schema() AND indexname = 'Project_slug_key'
  ) THEN
    CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
  END IF;
END $$;

-- Enum emulation: constrain status to allowed values
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'project_status_check'
  ) THEN
    ALTER TABLE "Project" ADD CONSTRAINT project_status_check CHECK ("status" IN ('DRAFT','PUBLISHED','ARCHIVED'));
  END IF;
END $$;

-- Composite index for status + deadline
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = current_schema() AND indexname = 'Project_status_deadline_idx'
  ) THEN
    CREATE INDEX "Project_status_deadline_idx" ON "Project"("status", "deadline");
  END IF;
END $$;

-- Create IdempotencyKey table
CREATE TABLE IF NOT EXISTS "IdempotencyKey" (
  "key" TEXT PRIMARY KEY,
  "endpoint" TEXT NOT NULL,
  "requestHash" TEXT NOT NULL,
  "responseStatus" INTEGER,
  "responseBody" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL
);


