import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function backupDatabase() {
  try {
    console.log('Starting database backup...');

    const backup = {
      timestamp: new Date().toISOString(),
      data: {
        categories: await prisma.category.findMany(),
        products: await prisma.product.findMany(),
        productVariants: await prisma.productVariant.findMany(),
        productImages: await prisma.productImage.findMany(),
        printAreas: await prisma.printArea.findMany(),
        designs: await prisma.design.findMany(),
        orders: await prisma.order.findMany(),
        orderItems: await prisma.orderItem.findMany(),
        admins: await prisma.admin.findMany(),
      },
    };

    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(backupDir, `backup_${timestamp}.json`);

    fs.writeFileSync(filename, JSON.stringify(backup, null, 2));

    console.log(`✓ Backup completed successfully!`);
    console.log(`  File: ${filename}`);
    console.log(`  Categories: ${backup.data.categories.length}`);
    console.log(`  Products: ${backup.data.products.length}`);
    console.log(`  Variants: ${backup.data.productVariants.length}`);
    console.log(`  Orders: ${backup.data.orders.length}`);

    return filename;
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

backupDatabase()
  .then((filename) => {
    console.log(`\nBackup saved to: ${filename}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
