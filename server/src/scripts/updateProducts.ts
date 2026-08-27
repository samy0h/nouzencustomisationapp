import { PrismaClient, ProductType } from '@prisma/client';

const prisma = new PrismaClient();

async function updateProducts() {
  console.log('🔄 Updating products with type and double-print support...');

  try {
    // Map of product slugs to their types and double-print support
    const productUpdates = [
      { slug: 'tshirt-standard', type: ProductType.TSHIRT, supportsDoublePrint: true },
      { slug: 'tshirt-oversize', type: ProductType.TSHIRT, supportsDoublePrint: true },
      { slug: 'hoodie', type: ProductType.HOODIE, supportsDoublePrint: true },
      { slug: 'polo', type: ProductType.POLO, supportsDoublePrint: true },
      { slug: 'tote-bag', type: ProductType.TOTE_BAG, supportsDoublePrint: false },
      { slug: 'cap', type: ProductType.CAP, supportsDoublePrint: false },
    ];

    for (const update of productUpdates) {
      const product = await prisma.product.findUnique({
        where: { slug: update.slug },
      });

      if (product) {
        await prisma.product.update({
          where: { slug: update.slug },
          data: {
            type: update.type,
            supportsDoublePrint: update.supportsDoublePrint,
          },
        });
        console.log(`✅ Updated ${update.slug}: ${update.type}, double-print: ${update.supportsDoublePrint}`);
      } else {
        console.log(`⚠️  Product not found: ${update.slug}`);
      }
    }

    console.log('✅ All products updated successfully!');
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Update failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

updateProducts();
