-- Migrate existing notes from Person table to Notes table
INSERT INTO "notes" ("id", "user_id", "entity_type", "entity_id", "content", "created_at", "updated_at")
SELECT
    gen_random_uuid(),
    "user_id",
    'person'::VARCHAR(50),
    "id",
    "notes",
    "created_at",
    "updated_at"
FROM "persons"
WHERE "notes" IS NOT NULL AND "notes" != '';

-- Migrate existing notes from Lease table to Notes table
INSERT INTO "notes" ("id", "user_id", "entity_type", "entity_id", "content", "created_at", "updated_at")
SELECT
    gen_random_uuid(),
    "user_id",
    'lease'::VARCHAR(50),
    "id",
    "notes",
    "created_at",
    "updated_at"
FROM "leases"
WHERE "notes" IS NOT NULL AND "notes" != '';

-- Migrate existing notes from LeasePet table to Notes table
INSERT INTO "notes" ("id", "user_id", "entity_type", "entity_id", "content", "created_at", "updated_at")
SELECT
    gen_random_uuid(),
    l."user_id",
    'lease_pet'::VARCHAR(50),
    lp."id",
    lp."notes",
    lp."created_at",
    lp."updated_at"
FROM "lease_pets" lp
JOIN "leases" l ON lp."lease_id" = l."id"
WHERE lp."notes" IS NOT NULL AND lp."notes" != '';

-- Drop notes columns from original tables (after data is migrated)
ALTER TABLE "persons" DROP COLUMN IF EXISTS "notes";
ALTER TABLE "leases" DROP COLUMN IF EXISTS "notes";
ALTER TABLE "lease_pets" DROP COLUMN IF EXISTS "notes";
