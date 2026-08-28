import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration: Adding ProductType model and migrating data...');

  // Create default product types
  const defaultTypes = [
    { name: 'T-Shirt', slug: 't-shirt' },
    { name: 'Hoodie', slug: 'hoodie' },
    { name: 'Polo', slug: 'polo' },
    { name: 'Jogger', slug: 'jogger' },
    { name: 'Tote Bag', slug: 'tote-bag' },
    { name: 'Cap', slug: 'cap' },
    { name: 'Other', slug: 'other' },
  ];

  console.log('Creating default product types...');
  for (const type of defaultTypes) {
    try {
      await prisma.productType.upsert({
        where: { slug: type.slug },
        update: {},
        create: type,
      });
      console.log(`✓ Created/verified product type: ${type.name}`);
    } catch (error) {
      console.error(`✗ Error creating product type ${type.name}:`, error);
    }
  }

  // Map old enum values to new type names
  const typeMapping: Record<string, string> = {
    'TSHIRT': 'T-Shirt',
    'HOODIE': 'Hoodie',
    'POLO': 'Polo',
    'JOGGER': 'Jogger',
    'TOTE_BAG': 'Tote Bag',
    'CAP': 'Cap',
    'OTHER': 'Other',
  };

  // Get all products and update their typeId
  console.log('\nMigrating existing products...');
  const products = await prisma.product.findMany();

  for (const product of products) {
    const newTypeName = typeMapping[product.type] || 'Other';
    const productType = await prisma.productType.findFirst({
      where: { name: newTypeName },
    });

    if (productType) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          typeId: productType.id,
          type: newTypeName, // Update the string type field
        },
      });
      console.log(`✓ Migrated product: ${product.name} (${product.type} → ${newTypeName})`);
    }
  }

  console.log('\n✅ Migration completed successfully!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
