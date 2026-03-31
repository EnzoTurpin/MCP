-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('owner', 'admin', 'member');

-- AlterTable: convert role column from VARCHAR to ProjectRole enum
ALTER TABLE "project_members"
  ALTER COLUMN "role" TYPE "ProjectRole" USING "role"::"ProjectRole",
  ALTER COLUMN "role" SET DEFAULT 'member'::"ProjectRole";
