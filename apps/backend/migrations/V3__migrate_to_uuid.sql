-- V3__migrate_to_uuid.sql
-- Migrate all ID columns from TEXT to native PostgreSQL UUID type
-- This requires dropping and recreating all tables to ensure schema consistency

-- Drop all tables in reverse dependency order (to handle foreign key constraints)
DROP TABLE IF EXISTS "profiles" CASCADE;
DROP TABLE IF EXISTS "lease_occupants" CASCADE;
DROP TABLE IF EXISTS "lease_lessees" CASCADE;
DROP TABLE IF EXISTS "leases" CASCADE;
DROP TABLE IF EXISTS "persons" CASCADE;
DROP TABLE IF EXISTS "properties" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Drop existing enums
DROP TYPE IF EXISTS "LeaseStatus";
DROP TYPE IF EXISTS "PersonType";

-- Recreate enums
CREATE TYPE "PersonType" AS ENUM ('OWNER', 'FAMILY_MEMBER', 'VENDOR', 'LESSEE', 'OCCUPANT');
CREATE TYPE "LeaseStatus" AS ENUM ('ACTIVE', 'MONTH_TO_MONTH', 'ENDED', 'VOIDED');

-- Recreate users table with UUID
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Recreate properties table with UUID
CREATE TABLE "properties" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "street" TEXT NOT NULL,
    "address2" TEXT,
    "city" TEXT NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "zip_code" TEXT NOT NULL,
    "nickname" TEXT,
    "purchase_date" TIMESTAMP(3),
    "purchase_price" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- Recreate persons table with UUID
CREATE TABLE "persons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "person_type" "PersonType" NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "middle_name" VARCHAR(50),
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- Recreate leases table with UUID
CREATE TABLE "leases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "monthly_rent" DECIMAL(10,2),
    "security_deposit" DECIMAL(10,2),
    "deposit_paid_date" TIMESTAMP(3),
    "notes" TEXT,
    "status" "LeaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "voided_reason" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leases_pkey" PRIMARY KEY ("id")
);

-- Recreate lease_lessees table with UUID
CREATE TABLE "lease_lessees" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lease_id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "signed_date" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lease_lessees_pkey" PRIMARY KEY ("id")
);

-- Recreate lease_occupants table with UUID
CREATE TABLE "lease_occupants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lease_id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "is_adult" BOOLEAN NOT NULL DEFAULT false,
    "move_in_date" TIMESTAMP(3),
    "move_out_date" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lease_occupants_pkey" PRIMARY KEY ("id")
);

-- Recreate profiles table with UUID
CREATE TABLE "profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL DEFAULT '',
    "last_name" VARCHAR(100) NOT NULL DEFAULT '',
    "phone" VARCHAR(20) NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");
CREATE UNIQUE INDEX "lease_lessees_lease_id_person_id_key" ON "lease_lessees"("lease_id", "person_id");

-- Create indexes for performance
CREATE INDEX "properties_user_id_idx" ON "properties"("user_id");
CREATE INDEX "persons_user_id_idx" ON "persons"("user_id");
CREATE INDEX "persons_person_type_idx" ON "persons"("person_type");
CREATE INDEX "leases_user_id_idx" ON "leases"("user_id");
CREATE INDEX "leases_property_id_idx" ON "leases"("property_id");
CREATE INDEX "leases_deleted_at_idx" ON "leases"("deleted_at");
CREATE INDEX "leases_status_idx" ON "leases"("status");
CREATE INDEX "lease_lessees_lease_id_idx" ON "lease_lessees"("lease_id");
CREATE INDEX "lease_lessees_person_id_idx" ON "lease_lessees"("person_id");
CREATE INDEX "lease_occupants_lease_id_idx" ON "lease_occupants"("lease_id");
CREATE INDEX "lease_occupants_person_id_idx" ON "lease_occupants"("person_id");
CREATE INDEX "profiles_user_id_idx" ON "profiles"("user_id");

-- Add foreign key constraints
ALTER TABLE "properties" ADD CONSTRAINT "properties_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "persons" ADD CONSTRAINT "persons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leases" ADD CONSTRAINT "leases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leases" ADD CONSTRAINT "leases_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lease_lessees" ADD CONSTRAINT "lease_lessees_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lease_lessees" ADD CONSTRAINT "lease_lessees_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lease_occupants" ADD CONSTRAINT "lease_occupants_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lease_occupants" ADD CONSTRAINT "lease_occupants_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
