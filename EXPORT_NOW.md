# ⚡ QUICK START - Export Database RIGHT NOW

## 🎯 Simplest Method (Choose One)

### Option 1: Windows (Double-click)
```
1. Double-click: export_database.bat
2. Wait for completion
3. Done! You'll have: nouzen_database_YYYYMMDD_HHMM.sql
```

### Option 2: Command Line (Any OS)

#### Get your DATABASE_URL from server/.env:
```bash
cat server/.env | grep DATABASE_URL
```

#### Copy that URL and run:
```bash
# Replace YOUR_DATABASE_URL with the actual URL from above
pg_dump "YOUR_DATABASE_URL" -F p -c -O -f nouzen_database_backup.sql
```

#### Example:
```bash
pg_dump "postgresql://postgres:password@localhost:5432/nouzen_db" -F p -c -O -f nouzen_database_backup.sql
```

---

## 🚀 FROM RENDER PRODUCTION DATABASE

### Step 1: Get External Connection URL
1. Go to Render Dashboard
2. Click your PostgreSQL service
3. Click "Connect" → Copy **External Database URL**

### Step 2: Export
```bash
# Replace with YOUR external URL from Render
pg_dump "postgresql://nouzen_db_user:abc123...@dpg-xyz.oregon-postgres.render.com/nouzen_db" -F p -c -O -f render_production_backup.sql
```

---

## 📦 What You'll Get

A single `.sql` file containing:
- ✅ All table schemas (CREATE TABLE statements)
- ✅ All data (INSERT statements)
- ✅ All indexes
- ✅ All constraints
- ✅ All enums
- ✅ DROP statements (for clean restore)

**File size:** Usually 1-10 MB depending on data

---

## 🔧 If pg_dump is not found

### Windows:
```cmd
set PATH=%PATH%;C:\Program Files\PostgreSQL\16\bin
```

### Mac (Homebrew):
```bash
brew install postgresql
```

### Linux:
```bash
sudo apt-get install postgresql-client
```

---

## ⚡ ONE-LINE EXPORT COMMANDS

### Local Database:
```bash
pg_dump -h localhost -p 5432 -U postgres -d nouzen_db -F p -c -O -f backup.sql
```

### Render Database (External URL):
```bash
pg_dump "postgresql://user:pass@host.render.com:5432/db" -F p -c -O -f render_backup.sql
```

### Using .env file:
```bash
export $(cat server/.env | grep DATABASE_URL | xargs)
pg_dump "$DATABASE_URL" -F p -c -O -f backup.sql
```

---

## 📋 Command Flags Explained

- `-F p` = Plain SQL format (human-readable)
- `-c` = Include DROP statements before CREATE
- `-O` = No owner (portable across databases)
- `-f` = Output file name
- `--if-exists` = Use IF EXISTS in DROP statements (safer)
- `-x` = No privileges (portable across databases)

---

## ✅ Verify Export Worked

```bash
# Check file exists and has content
ls -lh nouzen_database_backup.sql

# Preview first few lines
head -n 50 nouzen_database_backup.sql

# Should see something like:
# --
# -- PostgreSQL database dump
# --
# SET statement_timeout = 0;
# ...
# CREATE TYPE "ImageSide" AS ENUM ('FRONT', 'BACK');
# ...
```

---

## 🔄 Restore the Backup

```bash
# Create new database
createdb nouzen_db_restored

# Restore from SQL file
psql -d nouzen_db_restored -f nouzen_database_backup.sql
```

---

## 📁 Don't Forget the Images!

Database export does NOT include images. Also backup:

```bash
# Windows
xcopy /E /I server\uploads uploads_backup

# Mac/Linux
cp -r server/uploads uploads_backup

# Or create archive
tar -czf uploads_backup.tar.gz server/uploads
```

---

## 🎯 COMPLETE BACKUP (Database + Images)

Run the provided script:

```bash
# Make executable (Mac/Linux)
chmod +x backup_database.sh

# Run
./backup_database.sh
```

This creates:
- `nouzen_complete_backup_YYYYMMDD_HHMMSS.tar.gz`

Contains:
- ✅ database.sql (full database dump)
- ✅ uploads/ (all images)
- ✅ schema.prisma (schema file)
- ✅ README.txt (restore instructions)

---

**Ready?** Choose one command and run it now! 🚀
