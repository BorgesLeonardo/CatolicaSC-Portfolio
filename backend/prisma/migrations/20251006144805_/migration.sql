/*
  Warnings:

  - Made the column `status` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "videoUrl" TEXT,
ALTER COLUMN "status" SET NOT NULL;
