# Database Export Guide - Complete Backup

## 🎯 EXPORT ENTIRE DATABASE TO SQL FILE

### Method 1: Using pg_dump (Recommended)

#### From Local Development Database:
```bash
# Navigate to project root
cd /path/to/custom-editor

# Export entire database to SQL file
pg_dump -h localhost -p 5432 -U your_username -d nouzen_db -F p -f database_backup.sql

# With password prompt
pg_dump -h localhost -p 5432 -U your_username -W -d nouzen_db -F p -f database_backup.sql

# Include DROP statements (clean backup)
pg_dump -h localhost -p 5432 -U your_username -d nouzen_db -F p -c -f database_backup_clean.sql

# Include CREATE DATABASE statement
pg_dump -h localhost -p 5432 -U your_username -d nouzen_db -F p -C -f database_backup_with_create.sql
```

#### From Render PostgreSQL Database:
```bash
# Get your DATABASE_URL from Render Dashboard
# Format: postgresql://user:password@hostname:5432/database_name

# Export from Render database
pg_dump "postgresql://user:password@hostname.oregon-postgres.render.com:5432/nouzen_db" -F p -f render_database_backup.sql

# Or using environment variable
export DATABASE_URL="postgresql://user:password@hostname:5432/database_name"
pg_dump $DATABASE_URL -F p -f render_database_backup.sql
```

---

### Method 2: Using Prisma (Data Only)

```bash
cd server

# Export all data as JSON
npx prisma db execute --stdin < export_script.sql > database_export.json
```

---

### Method 3: Full Backup with Schema + Data + Images

Create this comprehensive backup script:

```bash
#!/bin/bash
# save as: backup_database.sh

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="database_backups/${BACKUP_DATE}"
mkdir -p "${BACKUP_DIR}"

echo "🚀 Starting complete database backup..."

# 1. Export PostgreSQL database
echo "📦 Exporting database schema and data..."
pg_dump $DATABASE_URL -F p -f "${BACKUP_DIR}/database_full.sql"

echo "✅ Database exported to: ${BACKUP_DIR}/database_full.sql"

# 2. Export uploads directory (images)
if [ -d "server/uploads" ]; then
    echo "📦 Backing up uploaded files..."
    cp -r server/uploads "${BACKUP_DIR}/uploads"
    echo "✅ Files backed up to: ${BACKUP_DIR}/uploads"
fi

# 3. Create archive
echo "📦 Creating compressed archive..."
tar -czf "database_backup_${BACKUP_DATE}.tar.gz" -C database_backups "${BACKUP_DATE}"

echo "✅ Complete backup created: database_backup_${BACKUP_DATE}.tar.gz"
echo "📊 Backup includes:"
echo "   - Database schema (tables, indexes, constraints)"
echo "   - All data (products, orders, users, etc.)"
echo "   - Uploaded files (images, mockups, designs)"
```

**Run:**
```bash
chmod +x backup_database.sh
./backup_database.sh
```

---

## 📋 WHAT'S INCLUDED IN SQL EXPORT

The SQL dump file will contain:

### Schema Objects
```sql
-- Enums
CREATE TYPE "ImageSide" AS ENUM ('FRONT', 'BACK');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', ...);
CREATE TYPE "DeliveryType" AS ENUM ('A_DOMICILE', 'STOP_DESK');

-- Tables (with CREATE TABLE statements)
- Coupon
- Category
- ProductType
- Product
- ProductVariant
- ProductImage
- VariantImage
- PrintArea
- Order
- OrderItem
- Design
- Admin

-- Indexes
- All unique indexes
- All performance indexes

-- Constraints
- Primary keys
- Foreign keys
- Unique constraints
- Check constraints

-- Triggers (if any)
```

### Data
```sql
-- All INSERT statements with actual data
INSERT INTO "Category" (id, name, slug, ...) VALUES (...);
INSERT INTO "Product" (id, name, slug, price, ...) VALUES (...);
INSERT INTO "Order" (id, orderNumber, customerName, ...) VALUES (...);
-- etc.
```

---

## 🔄 RESTORE DATABASE FROM SQL FILE

### Restore to Local Database:
```bash
# Create new empty database
createdb nouzen_db_restored

# Restore from SQL file
psql -h localhost -p 5432 -U your_username -d nouzen_db_restored -f database_backup.sql

# Or with password
psql -h localhost -p 5432 -U your_username -W -d nouzen_db_restored -f database_backup.sql
```

### Restore to Render Database:
```bash
# ⚠️ WARNING: This will overwrite production data!
psql "postgresql://user:password@hostname.render.com:5432/database_name" -f database_backup.sql
```

---

## 📦 EXPORT SPECIFIC TABLES ONLY

### Export only Product-related tables:
```bash
pg_dump $DATABASE_URL \
  -t Product \
  -t ProductVariant \
  -t ProductImage \
  -t ProductType \
  -t Category \
  -F p -f products_only.sql
```

### Export only Order-related tables:
```bash
pg_dump $DATABASE_URL \
  -t Order \
  -t OrderItem \
  -F p -f orders_only.sql
```

### Export schema only (no data):
```bash
pg_dump $DATABASE_URL -s -F p -f schema_only.sql
```

### Export data only (no schema):
```bash
pg_dump $DATABASE_URL -a -F p -f data_only.sql
```

---

## 🖼️ HANDLING IMAGES/UPLOADS

### Important: Images are NOT in the database!

Images are stored as **files** in:
```
server/uploads/orders/{orderNumber}/
```

**Database contains only:**
- Image URLs (e.g., `/uploads/orders/NZ-000001/item-1-front-mockup.jpg`)
- Not the actual image files

### To backup images:
```bash
# Backup uploads directory
tar -czf uploads_backup.tar.gz server/uploads/

# Or copy to backup location
cp -r server/uploads/ /backup/location/uploads/
```

### Complete backup (database + images):
```bash
# 1. Export database
pg_dump $DATABASE_URL -F p -f database.sql

# 2. Archive everything
tar -czf complete_backup.tar.gz \
  database.sql \
  server/uploads/

# This creates one file with:
# - Database schema and data
# - All uploaded images
```

---

## 🔧 EXPORT DATABASE USING RENDER DASHBOARD

### Via Render Console:

1. **Go to Render Dashboard**
2. **Open your PostgreSQL service**
3. **Click "Connect" → "External Connection"**
4. **Copy the connection string**
5. **Run locally:**
```bash
pg_dump "YOUR_EXTERNAL_CONNECTION_STRING" -F p -f render_backup.sql
```

---

## 📊 EXPORT DATABASE USING PRISMA

### Export as SQL (requires Prisma):
```bash
cd server

# Generate SQL dump using Prisma
npx prisma db pull
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma_export.sql
```

### Export data as JSON:
```bash
# This requires a custom script
node export_data.js
```

**Create `server/export_data.js`:**
```javascript
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function exportData() {
  const data = {
    categories: await prisma.category.findMany(),
    productTypes: await prisma.productType.findMany(),
    products: await prisma.product.findMany({
      include: {
        variants: true,
        productImages: true,
        printAreas: true,
      },
    }),
    orders: await prisma.order.findMany({
      include: {
        items: true,
      },
    }),
    coupons: await prisma.coupon.findMany(),
    admins: await prisma.admin.findMany(),
  };

  fs.writeFileSync(
    'database_export.json',
    JSON.stringify(data, null, 2)
  );

  console.log('✅ Database exported to database_export.json');
}

exportData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Run:**
```bash
node server/export_data.js
```

---

## ⚠️ IMPORTANT NOTES

### What SQL Export Includes:
✅ All table schemas
✅ All data (products, orders, users)
✅ All indexes
✅ All constraints
✅ All enums
✅ All foreign keys

### What SQL Export Does NOT Include:
❌ Uploaded images/files (stored in filesystem)
❌ Environment variables (.env)
❌ Server configuration
❌ Application code

### For Complete Backup:
1. **Export database** → SQL file
2. **Backup uploads/** → tar.gz file
3. **Save .env.example** → for reference
4. **Backup code** → Git repository

---

## 🚀 QUICK COMMANDS

### Full Backup (Local):
```bash
pg_dump -h localhost -p 5432 -U postgres -d nouzen_db \
  -F p -c -O -f backup_$(date +%Y%m%d_%H%M%S).sql
```

### Full Backup (Render):
```bash
pg_dump "postgresql://user:pass@host:5432/db" \
  -F p -c -O -f render_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Backup with Compression:
```bash
pg_dump $DATABASE_URL -F c -f database_backup.dump
```

### Restore Compressed Backup:
```bash
pg_restore -d nouzen_db database_backup.dump
```

---

## 📁 RECOMMENDED BACKUP STRATEGY

### Daily Automated Backup:
```bash
# Add to crontab
0 2 * * * /path/to/backup_database.sh
```

### Keep Multiple Versions:
```bash
# Keep last 7 days
find database_backups/ -name "*.sql" -mtime +7 -delete
```

### Backup Before Migrations:
```bash
# Always backup before running migrations
pg_dump $DATABASE_URL -F p -f pre_migration_backup.sql
npx prisma migrate deploy
```

---

## 🎯 READY-TO-RUN BACKUP SCRIPT

Save as `backup_now.sh`:
```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="nouzen_backup_${TIMESTAMP}.sql"

echo "🚀 Creating database backup..."

# Load DATABASE_URL from .env
source server/.env

# Export database
pg_dump "$DATABASE_URL" -F p -c -O -f "$BACKUP_FILE"

# Compress
gzip "$BACKUP_FILE"

echo "✅ Backup complete: ${BACKUP_FILE}.gz"
echo "📊 Size: $(du -h ${BACKUP_FILE}.gz | cut -f1)"
```

**Run:**
```bash
chmod +x backup_now.sh
./backup_now.sh
```

---

**Ready to export?** Let me know if you need help with any specific command!
