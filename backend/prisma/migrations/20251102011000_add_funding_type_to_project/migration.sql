-- Create PostgreSQL enum for FundingType and add column to Project

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FundingType') THEN
    CREATE TYPE "FundingType" AS ENUM ('DIRECT','RECURRING');
  END IF;
END$$;

-- Add column fundingType with default 'DIRECT'
ALTER TABLE "Project"
  ADD COLUMN IF NOT EXISTS "fundingType" "FundingType" DEFAULT 'DIRECT';

-- Ensure existing rows have a non-null value
UPDATE "Project" SET "fundingType" = 'DIRECT' WHERE "fundingType" IS NULL;

-- Make column NOT NULL
ALTER TABLE "Project" ALTER COLUMN "fundingType" SET NOT NULL;


