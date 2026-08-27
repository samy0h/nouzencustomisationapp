import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'tshirt' },
      update: {},
      create: {
        name: 'T-Shirt',
        slug: 'tshirt',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'hoodie' },
      update: {},
      create: {
        name: 'Hoodie',
        slug: 'hoodie',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'polo' },
      update: {},
      create: {
        name: 'Polo',
        slug: 'polo',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'tote-bag' },
      update: {},
      create: {
        name: 'Tote Bag',
        slug: 'tote-bag',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'oversize' },
      update: {},
      create: {
        name: 'T-Shirt Oversize',
        slug: 'oversize',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'cap' },
      update: {},
      create: {
        name: 'Cap',
        slug: 'cap',
      },
    }),
  ]);

  console.log('✅ Categories created');

  // Create products with variants
  const tshirtStandard = await prisma.product.upsert({
    where: { slug: 'tshirt-standard' },
    update: {},
    create: {
      name: 'T-shirt standard',
      slug: 'tshirt-standard',
      description: 'Classic comfortable t-shirt perfect for customization',
      price: 2200,
      images: ['https://placehold.co/400x500/ffffff/cccccc?text=T-shirt'],
      active: true,
      featured: true,
      categoryId: categories[0].id,
      variants: {
        create: [
          { color: 'Black', colorHex: '#000000', size: 'S', stock: 50, available: true },
          { color: 'Black', colorHex: '#000000', size: 'M', stock: 100, available: true },
          { color: 'Black', colorHex: '#000000', size: 'L', stock: 80, available: true },
          { color: 'White', colorHex: '#FFFFFF', size: 'S', stock: 60, available: true },
          { color: 'White', colorHex: '#FFFFFF', size: 'M', stock: 120, available: true },
          { color: 'White', colorHex: '#FFFFFF', size: 'L', stock: 90, available: true },
          { color: 'Gray', colorHex: '#6B7280', size: 'S', stock: 40, available: true },
          { color: 'Gray', colorHex: '#6B7280', size: 'M', stock: 70, available: true },
          { color: 'Gray', colorHex: '#6B7280', size: 'L', stock: 60, available: true },
          { color: 'Burgundy', colorHex: '#A00223', size: 'S', stock: 30, available: true },
          { color: 'Burgundy', colorHex: '#A00223', size: 'M', stock: 50, available: true },
          { color: 'Burgundy', colorHex: '#A00223', size: 'L', stock: 40, available: true },
        ],
      },
    },
  });

  const hoodie = await prisma.product.upsert({
    where: { slug: 'hoodie' },
    update: {},
    create: {
      name: 'Hoodie',
      slug: 'hoodie',
      description: 'Warm and cozy hoodie with customizable front and back',
      price: 3100,
      images: ['https://placehold.co/400x500/ffffff/cccccc?text=Hoodie'],
      active: true,
      featured: true,
      categoryId: categories[1].id,
      variants: {
        create: [
          { color: 'Black', colorHex: '#000000', size: 'S', stock: 30, available: true },
          { color: 'Black', colorHex: '#000000', size: 'M', stock: 50, available: true },
          { color: 'Black', colorHex: '#000000', size: 'L', stock: 40, available: true },
          { color: 'Black', colorHex: '#000000', size: 'XL', stock: 35, available: true },
        ],
      },
    },
  });

  const polo = await prisma.product.upsert({
    where: { slug: 'polo' },
    update: {},
    create: {
      name: 'Polo',
      slug: 'polo',
      description: 'Classic polo shirt for a smart casual look',
      price: 3000,
      images: ['https://placehold.co/400x500/ffffff/cccccc?text=Polo'],
      active: true,
      featured: false,
      categoryId: categories[2].id,
      variants: {
        create: [
          { color: 'White', colorHex: '#FFFFFF', size: 'S', stock: 40, available: true },
          { color: 'White', colorHex: '#FFFFFF', size: 'M', stock: 60, available: true },
          { color: 'White', colorHex: '#FFFFFF', size: 'L', stock: 50, available: true },
        ],
      },
    },
  });

  const toteBag = await prisma.product.upsert({
    where: { slug: 'tote-bag' },
    update: {},
    create: {
      name: 'Tote bag',
      slug: 'tote-bag',
      description: 'Durable canvas tote bag perfect for custom prints',
      price: 1200,
      images: ['https://placehold.co/400x500/f5f3f0/999999?text=Tote+bag'],
      active: true,
      featured: false,
      categoryId: categories[3].id,
      variants: {
        create: [
          { color: 'Natural', colorHex: '#F5F3F0', size: 'One Size', stock: 100, available: true },
        ],
      },
    },
  });

  const tshirtOversize = await prisma.product.upsert({
    where: { slug: 'tshirt-oversize' },
    update: {},
    create: {
      name: 'T-shirt oversize',
      slug: 'tshirt-oversize',
      description: 'Trendy oversized t-shirt with maximum print area',
      price: 2700,
      images: ['https://placehold.co/400x500/ffffff/cccccc?text=Oversize'],
      active: true,
      featured: true,
      categoryId: categories[4].id,
      variants: {
        create: [
          { color: 'White', colorHex: '#FFFFFF', size: 'S', stock: 35, available: true },
          { color: 'White', colorHex: '#FFFFFF', size: 'M', stock: 60, available: true },
          { color: 'White', colorHex: '#FFFFFF', size: 'L', stock: 50, available: true },
          { color: 'White', colorHex: '#FFFFFF', size: 'XL', stock: 40, available: true },
        ],
      },
    },
  });

  const cap = await prisma.product.upsert({
    where: { slug: 'cap' },
    update: {},
    create: {
      name: 'Cap',
      slug: 'cap',
      description: 'Baseball cap with embroidery options',
      price: 1200,
      images: ['https://placehold.co/400x500/f5f3f0/999999?text=Cap'],
      active: true,
      featured: false,
      categoryId: categories[5].id,
      variants: {
        create: [
          { color: 'White', colorHex: '#FFFFFF', size: 'Adjustable', stock: 80, available: true },
          { color: 'Black', colorHex: '#000000', size: 'Adjustable', stock: 70, available: true },
        ],
      },
    },
  });

  console.log('✅ Products created with variants');
  console.log('🎉 Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
