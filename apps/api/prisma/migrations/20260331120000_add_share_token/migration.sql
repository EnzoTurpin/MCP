-- AlterTable: fix project_favorites id default
ALTER TABLE "project_favorites" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable: add share_token to projects
ALTER TABLE "projects" ADD COLUMN "share_token" VARCHAR(64);

-- CreateIndex: unique constraint on share_token
CREATE UNIQUE INDEX "projects_share_token_key" ON "projects"("share_token");
