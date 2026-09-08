import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Color mapping with hex codes
const colorMapping = {
  'black': { name: 'Black', hex: '#000000' },
  'white': { name: 'White', hex: '#FFFFFF' },
  'gray': { name: 'Gray', hex: '#6B7280' },
  'navy': { name: 'Navy', hex: '#1E3A8A' },
  'red': { name: 'Red', hex: '#DC2626' },
  'pink': { name: 'Pink', hex: '#EC4899' },
  'green': { name: 'Green', hex: '#059669' },
  'sky blue': { name: 'Sky Blue', hex: '#0EA5E9' },
};

// Image structure for t-shirt standard
const tshirtImages = {
  black: {
    front: '/assets/t-shirt standard/black front.png',
    back: '/assets/t-shirt standard/black back.png',
  },
  white: {
    front: '/assets/t-shirt standard/white front.png',
    back: '/assets/t-shirt standard/white back.png',
  },
  gray: {
    front: '/assets/t-shirt standard/gray front.png',
    back: '/assets/t-shirt standard/gray back.png',
  },
  navy: {
    front: '/assets/t-shirt standard/navy front.png',
    back: '/assets/t-shirt standard/navy back.png',
  },
  red: {
    front: '/assets/t-shirt standard/red front.png',
    back: '/assets/t-shirt standard/red back.png',
  },
  pink: {
    front: '/assets/t-shirt standard/pink front.png',
    back: '/assets/t-shirt standard/pink back.png',
  },
  green: {
    front: '/assets/t-shirt standard/green front.png',
    back: '/assets/t-shirt standard/green back.png',
  },
  'sky blue': {
    front: '/assets/t-shirt standard/sky blue front.png',
    back: '/assets/t-shirt standard/sky blue back.png',
  },
};

// Standard sizes
const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

async function updateTshirtStandard() {
  console.log('🔄 Updating T-shirt standard with real images and variants...');

  try {
    // Find the product
    const product = await prisma.product.findUnique({
      where: { slug: 'tshirt-standard' },
      include: { variants: true },
    });

    if (!product) {
      console.error('❌ T-shirt standard not found');
      return;
    }

    console.log(`📦 Found product: ${product.name}`);
    console.log(`🗑️  Deleting ${product.variants.length} old variants...`);

    // Delete existing variants
    await prisma.productVariant.deleteMany({
      where: { productId: product.id },
    });

    console.log('✅ Old variants deleted');

    // Create new variants for each color and size
    let createdCount = 0;

    for (const [colorKey, colorInfo] of Object.entries(colorMapping)) {
      const images = tshirtImages[colorKey as keyof typeof tshirtImages];

      if (!images) {
        console.warn(`⚠️  No images found for color: ${colorKey}`);
        continue;
      }

      for (const size of sizes) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            color: colorInfo.name,
            colorHex: colorInfo.hex,
            size,
            stock: 50, // Default stock
            available: true,
            priceOverride: null,
          },
        });

        createdCount++;
        console.log(`  ✓ Created variant: ${colorInfo.name} - ${size}`);
      }
    }

    // Update product with all color image paths (use front as default)
    const allImages = Object.values(tshirtImages).map(img => img.front);

    await prisma.product.update({
      where: { id: product.id },
      data: {
        images: allImages,
      },
    });

    console.log(`✅ Updated product images (${allImages.length} colors)`);
    console.log(`✅ Created ${createdCount} variants`);
    console.log(`📊 Summary: ${Object.keys(colorMapping).length} colors × ${sizes.length} sizes = ${createdCount} variants`);

    // Display color breakdown
    console.log('\n📋 Color breakdown:');
    for (const [colorKey, colorInfo] of Object.entries(colorMapping)) {
      const images = tshirtImages[colorKey as keyof typeof tshirtImages];
      console.log(`  • ${colorInfo.name} (${colorInfo.hex})`);
      console.log(`    - Front: ${images.front}`);
      console.log(`    - Back: ${images.back}`);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Update failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

updateTshirtStandard();
