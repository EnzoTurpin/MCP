-- CreateTable
CREATE TABLE "project_favorites" (
    "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID        NOT NULL,
    "user_id"    UUID        NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_favorites_project_id_user_id_key"
    ON "project_favorites"("project_id", "user_id");

-- AddForeignKey
ALTER TABLE "project_favorites"
    ADD CONSTRAINT "project_favorites_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_favorites"
    ADD CONSTRAINT "project_favorites_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
