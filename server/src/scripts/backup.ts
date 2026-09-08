import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function backup() {
  console.log('🔄 Creating database backup...');

  try {
    // Fetch all data
    const categories = await prisma.category.findMany();
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        category: true,
      },
    });

    const backup = {
      timestamp: new Date().toISOString(),
      categories,
      products,
    };

    // Create backups directory
    const backupsDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // Write backup file
    const filename = `backup_${Date.now()}.json`;
    const filepath = path.join(backupsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));

    console.log(`✅ Backup created: ${filepath}`);
    console.log(`📊 Backed up ${categories.length} categories and ${products.length} products`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Backup failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

backup();
