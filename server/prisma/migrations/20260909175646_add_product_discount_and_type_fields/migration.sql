-- Drop the old ProductType enum if it exists (Product.type is now String)
DROP TYPE IF EXISTS "ProductType" CASCADE;

-- CreateTable Coupon
CREATE TABLE IF NOT EXISTS "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable ProductType
CREATE TABLE IF NOT EXISTS "ProductType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductType_pkey" PRIMARY KEY ("id")
);

-- Add missing Product columns
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "discountPercentage" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "typeId" TEXT;

-- Change Product.type from enum to String (if it's still an enum)
-- This handles the case where the column exists as enum or doesn't exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Product'
        AND column_name = 'type'
        AND data_type = 'USER-DEFINED'
    ) THEN
        -- Convert enum to text by creating new column, copying data, dropping old, renaming new
        ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "type_new" TEXT NOT NULL DEFAULT 'OTHER';
        UPDATE "Product" SET "type_new" = "type"::TEXT WHERE "type" IS NOT NULL;
        ALTER TABLE "Product" DROP COLUMN IF EXISTS "type";
        ALTER TABLE "Product" RENAME COLUMN "type_new" TO "type";
    END IF;
END $$;

-- Ensure type column exists as String
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'OTHER';

-- Drop old coverPhoto column if it exists (no longer in schema)
ALTER TABLE "Product" DROP COLUMN IF EXISTS "coverPhoto";

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ProductType_name_key" ON "ProductType"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ProductType_slug_key" ON "ProductType"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_typeId_idx" ON "Product"("typeId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'Product_typeId_fkey'
        AND table_name = 'Product'
    ) THEN
        ALTER TABLE "Product" ADD CONSTRAINT "Product_typeId_fkey"
        FOREIGN KEY ("typeId") REFERENCES "ProductType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
