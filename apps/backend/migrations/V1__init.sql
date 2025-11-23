-- CreateEnum
CREATE TYPE "PersonType" AS ENUM ('OWNER', 'FAMILY_MEMBER', 'VENDOR', 'LESSEE', 'OCCUPANT');

-- CreateEnum
CREATE TYPE "LeaseStatus" AS ENUM ('ACTIVE', 'MONTH_TO_MONTH', 'ENDED', 'VOIDED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "persons" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "leases" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "lease_lessees" (
    "id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "signed_date" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lease_lessees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lease_occupants" (
    "id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "is_adult" BOOLEAN NOT NULL DEFAULT false,
    "move_in_date" TIMESTAMP(3),
    "move_out_date" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lease_occupants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "properties_user_id_idx" ON "properties"("user_id");

-- CreateIndex
CREATE INDEX "persons_user_id_idx" ON "persons"("user_id");

-- CreateIndex
CREATE INDEX "persons_person_type_idx" ON "persons"("person_type");

-- CreateIndex
CREATE INDEX "leases_user_id_idx" ON "leases"("user_id");

-- CreateIndex
CREATE INDEX "leases_property_id_idx" ON "leases"("property_id");

-- CreateIndex
CREATE INDEX "leases_deleted_at_idx" ON "leases"("deleted_at");

-- CreateIndex
CREATE INDEX "leases_status_idx" ON "leases"("status");

-- CreateIndex
CREATE INDEX "lease_lessees_lease_id_idx" ON "lease_lessees"("lease_id");

-- CreateIndex
CREATE INDEX "lease_lessees_person_id_idx" ON "lease_lessees"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "lease_lessees_lease_id_person_id_key" ON "lease_lessees"("lease_id", "person_id");

-- CreateIndex
CREATE INDEX "lease_occupants_lease_id_idx" ON "lease_occupants"("lease_id");

-- CreateIndex
CREATE INDEX "lease_occupants_person_id_idx" ON "lease_occupants"("person_id");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_lessees" ADD CONSTRAINT "lease_lessees_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_lessees" ADD CONSTRAINT "lease_lessees_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_occupants" ADD CONSTRAINT "lease_occupants_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_occupants" ADD CONSTRAINT "lease_occupants_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
