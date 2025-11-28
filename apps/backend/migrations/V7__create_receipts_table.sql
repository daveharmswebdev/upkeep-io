-- Create receipts table for tracking material purchases and expenses
CREATE TABLE "receipts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" DECIMAL(10, 2) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "store_name" VARCHAR(255) NOT NULL,
    "purchase_date" DATE NOT NULL,
    "description" TEXT,
    "receipt_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "receipts_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "receipts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create index for property-based queries (filter receipts by property)
CREATE INDEX "receipts_property_id_idx" ON "receipts"("property_id");

-- Create index for user-based queries (filter receipts by user)
CREATE INDEX "receipts_user_id_idx" ON "receipts"("user_id");

-- Create index for date-based queries (filter/sort by purchase date for tax reporting)
CREATE INDEX "receipts_purchase_date_idx" ON "receipts"("purchase_date");

-- Create composite index for efficient property + date range queries (common use case)
CREATE INDEX "receipts_property_purchase_date_idx" ON "receipts"("property_id", "purchase_date");
