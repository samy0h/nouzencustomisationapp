#!/bin/bash
# Complete Database Backup Script for Nouzen Clothes
# Backs up PostgreSQL database + uploads directory

set -e  # Exit on error

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/${TIMESTAMP}"
BACKUP_NAME="nouzen_complete_backup_${TIMESTAMP}"

echo "🚀 Starting complete backup at ${TIMESTAMP}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Load DATABASE_URL from environment or .env
if [ -f "server/.env" ]; then
    export $(cat server/.env | grep DATABASE_URL | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL not set"
    echo "Please set DATABASE_URL environment variable or create server/.env"
    exit 1
fi

# 1. Export PostgreSQL database
echo ""
echo "📦 Exporting PostgreSQL database..."
pg_dump "$DATABASE_URL" \
    -F p \
    -c \
    -O \
    -f "${BACKUP_DIR}/database.sql"

if [ $? -eq 0 ]; then
    SIZE=$(du -h "${BACKUP_DIR}/database.sql" | cut -f1)
    echo "✅ Database exported: ${SIZE}"
else
    echo "❌ Database export failed"
    exit 1
fi

# 2. Backup uploads directory (if exists)
if [ -d "server/uploads" ]; then
    echo ""
    echo "📦 Backing up uploaded files..."
    cp -r server/uploads "${BACKUP_DIR}/uploads"
    COUNT=$(find "${BACKUP_DIR}/uploads" -type f | wc -l)
    echo "✅ Files backed up: ${COUNT} files"
else
    echo "⚠️  No uploads directory found (skipping)"
fi

# 3. Backup Prisma schema
if [ -f "server/prisma/schema.prisma" ]; then
    echo ""
    echo "📦 Backing up Prisma schema..."
    cp server/prisma/schema.prisma "${BACKUP_DIR}/schema.prisma"
    echo "✅ Prisma schema backed up"
fi

# 4. Create README for backup
cat > "${BACKUP_DIR}/README.txt" << EOF
Nouzen Clothes Database Backup
==============================

Backup Date: $(date)
Backup Type: Complete (Database + Files)

Contents:
---------
- database.sql       : PostgreSQL database dump (schema + data)
- uploads/          : All uploaded files (images, mockups, designs)
- schema.prisma     : Prisma schema file

Restore Instructions:
--------------------

1. Restore Database:
   psql -h localhost -U postgres -d nouzen_db -f database.sql

2. Restore Files:
   cp -r uploads/ /path/to/server/uploads/

3. Run Prisma:
   cd server
   npx prisma generate
   npx prisma migrate deploy

Database URL: ${DATABASE_URL%%\?*}
EOF

echo ""
echo "📦 Creating compressed archive..."
tar -czf "${BACKUP_NAME}.tar.gz" -C backups "${TIMESTAMP}"

if [ $? -eq 0 ]; then
    ARCHIVE_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
    echo "✅ Archive created: ${ARCHIVE_SIZE}"

    # Remove uncompressed backup directory
    rm -rf "${BACKUP_DIR}"
else
    echo "❌ Archive creation failed"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ BACKUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 Backup file: ${BACKUP_NAME}.tar.gz"
echo "📊 Size: $(du -h ${BACKUP_NAME}.tar.gz | cut -f1)"
echo ""
echo "To restore this backup:"
echo "  tar -xzf ${BACKUP_NAME}.tar.gz"
echo "  cd backups/${TIMESTAMP}"
echo "  psql -d nouzen_db -f database.sql"
echo ""
