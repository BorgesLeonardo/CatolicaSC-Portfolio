/*
  Warnings:

  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `Contribution` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeCheckoutSessionId]` on the table `Contribution` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_contributorId_fkey";

-- AlterTable
ALTER TABLE "Contribution" ALTER COLUMN "contributorId" DROP NOT NULL,
ALTER COLUMN "currency" SET DEFAULT 'brl';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "raisedCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "supportersCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Contribution_stripePaymentIntentId_key" ON "Contribution"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Contribution_stripeCheckoutSessionId_key" ON "Contribution"("stripeCheckoutSessionId");

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
