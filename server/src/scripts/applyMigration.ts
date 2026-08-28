import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  console.log('Applying database migration...');

  try {
    // Drop the old ProductType enum if it exists
    await prisma.$executeRawUnsafe(`
      DROP TYPE IF EXISTS "ProductType" CASCADE;
    `);
    console.log('✓ Dropped old ProductType enum');

    // Add type column if it doesn't exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "type" TEXT DEFAULT 'OTHER';
    `);
    console.log('✓ Ensured type column exists');

    // Create ProductType table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ProductType" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ProductType_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✓ Created ProductType table');

    // Create unique indexes
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ProductType_name_key" ON "ProductType"("name");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ProductType_slug_key" ON "ProductType"("slug");
    `);
    console.log('✓ Created indexes on ProductType');

    // Add typeId column to Product
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "typeId" TEXT;
    `);
    console.log('✓ Added typeId column to Product');

    // Create index on typeId
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Product_typeId_idx" ON "Product"("typeId");
    `);
    console.log('✓ Created index on Product.typeId');

    // Add foreign key constraint
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'Product_typeId_fkey'
        ) THEN
          ALTER TABLE "Product" ADD CONSTRAINT "Product_typeId_fkey"
            FOREIGN KEY ("typeId") REFERENCES "ProductType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
      END $$;
    `);
    console.log('✓ Added foreign key constraint');

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

migrate()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
