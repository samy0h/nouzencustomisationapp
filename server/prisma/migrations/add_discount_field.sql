-- Add discount percentage field to Product table
ALTER TABLE "Product" ADD COLUMN "discountPercentage" INTEGER NOT NULL DEFAULT 0;
