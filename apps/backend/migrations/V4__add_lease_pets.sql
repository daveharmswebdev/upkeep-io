-- V4__add_lease_pets.sql
-- Add lease pets table and pet deposit field to leases

-- Add pet deposit field to leases table (nullable)
ALTER TABLE "leases" ADD COLUMN "pet_deposit" DECIMAL(10,2);

-- Create lease_pets table
CREATE TABLE "lease_pets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lease_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "species" VARCHAR(20) NOT NULL CHECK (species IN ('cat', 'dog')),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lease_pets_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX "lease_pets_lease_id_idx" ON "lease_pets"("lease_id");

-- Add foreign key constraint
ALTER TABLE "lease_pets" ADD CONSTRAINT "lease_pets_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
