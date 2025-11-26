-- Create notes table for polymorphic notes across entities
CREATE TABLE "notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "notes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create index for efficient entity lookups
CREATE INDEX "notes_entity_lookup" ON "notes"("entity_type", "entity_id");

-- Create index for user-based queries
CREATE INDEX "notes_user_id_idx" ON "notes"("user_id");

-- Create index for soft delete queries (exclude deleted notes)
CREATE INDEX "notes_deleted_at_idx" ON "notes"("deleted_at");
