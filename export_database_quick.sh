#!/bin/bash
# Quick Database Export Script
# Exports ONLY the database to a single SQL file

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="nouzen_database_${TIMESTAMP}.sql"

echo "🚀 Exporting database to SQL file..."

# Load DATABASE_URL
if [ -f "server/.env" ]; then
    export $(cat server/.env | grep DATABASE_URL | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL not set"
    exit 1
fi

# Export database
pg_dump "$DATABASE_URL" \
    --format=plain \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    --file="$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo "✅ Database exported successfully!"
    echo "📦 File: $OUTPUT_FILE"
    echo "📊 Size: $SIZE"
    echo ""
    echo "To restore:"
    echo "  psql -d nouzen_db -f $OUTPUT_FILE"
else
    echo "❌ Export failed"
    exit 1
fi
