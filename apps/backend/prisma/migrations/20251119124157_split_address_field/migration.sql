-- AlterTable
ALTER TABLE "properties" RENAME COLUMN "address" TO "street";

-- AlterTable
ALTER TABLE "properties" ADD COLUMN "address2" TEXT;
