import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateProducts() {
  console.log('🔄 Updating products with type and double-print support...');

  try {
    // Map of product slugs to their types and double-print support
    const productUpdates = [
      { slug: 'tshirt-standard', type: 'TSHIRT', supportsDoublePrint: true },
      { slug: 'tshirt-oversize', type: 'TSHIRT', supportsDoublePrint: true },
      { slug: 'hoodie', type: 'HOODIE', supportsDoublePrint: true },
      { slug: 'polo', type: 'POLO', supportsDoublePrint: true },
      { slug: 'tote-bag', type: 'TOTE_BAG', supportsDoublePrint: false },
      { slug: 'cap', type: 'CAP', supportsDoublePrint: false },
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
