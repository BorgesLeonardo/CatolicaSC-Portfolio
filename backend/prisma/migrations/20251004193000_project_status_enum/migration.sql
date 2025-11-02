-- Create PostgreSQL enum type and convert Project.status to use it

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProjectStatus') THEN
    CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT','PUBLISHED','ARCHIVED');
  END IF;
END$$;

-- Remove text CHECK constraint and default if present
ALTER TABLE "Project" DROP CONSTRAINT IF EXISTS project_status_check;
ALTER TABLE "Project" ALTER COLUMN "status" DROP DEFAULT;

-- Convert column to enum type
ALTER TABLE "Project"
  ALTER COLUMN "status" TYPE "ProjectStatus" USING ("status"::text::"ProjectStatus");

-- Ensure no NULLs remain (set to PUBLISHED)
UPDATE "Project" SET "status" = 'PUBLISHED' WHERE "status" IS NULL;

-- Set enum default
ALTER TABLE "Project" ALTER COLUMN "status" SET DEFAULT 'PUBLISHED';


