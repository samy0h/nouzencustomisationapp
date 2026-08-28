-- CreateTable
CREATE TABLE "ProductType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductType_name_key" ON "ProductType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductType_slug_key" ON "ProductType"("slug");

-- AlterTable: Add typeId column to Product
ALTER TABLE "Product" ADD COLUMN "typeId" TEXT;

-- AlterTable: Change type column from enum to TEXT
ALTER TABLE "Product" ALTER COLUMN "type" TYPE TEXT;
ALTER TABLE "Product" ALTER COLUMN "type" SET DEFAULT 'OTHER';

-- CreateIndex
CREATE INDEX "Product_typeId_idx" ON "Product"("typeId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ProductType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
