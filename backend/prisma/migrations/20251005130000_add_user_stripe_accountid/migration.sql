-- Add optional Stripe Connect account id to User
ALTER TABLE "User" ADD COLUMN "stripeAccountId" TEXT;

-- Enforce uniqueness when present
CREATE UNIQUE INDEX IF NOT EXISTS "User_stripeAccountId_key" ON "User"("stripeAccountId");


