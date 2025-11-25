-- Create profiles table
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" VARCHAR(100) NOT NULL DEFAULT '',
    "last_name" VARCHAR(100) NOT NULL DEFAULT '',
    "phone" VARCHAR(20) NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- Create unique index on user_id (1:1 relationship)
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- Create index on user_id for faster lookups
CREATE INDEX "profiles_user_id_idx" ON "profiles"("user_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill existing users with empty profiles
INSERT INTO "profiles" ("id", "user_id", "first_name", "last_name", "phone", "created_at", "updated_at")
SELECT
    gen_random_uuid()::text,
    "id",
    '',
    '',
    '',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "users"
WHERE NOT EXISTS (
    SELECT 1 FROM "profiles" WHERE "profiles"."user_id" = "users"."id"
);
