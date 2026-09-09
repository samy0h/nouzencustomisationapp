# 🚀 Render Deployment - Quick Reference

## Changes Made

### Modified Files
1. **server/package.json**
   - Added `postinstall: "prisma generate"` for automatic Prisma Client generation
   - Updated `build: "prisma generate && tsc"` to ensure Prisma Client is available
   - Changed `db:migrate: "prisma migrate deploy"` for production migrations

2. **server/src/index.ts**
   - Fixed PORT type: `parseInt(process.env.PORT || '3001', 10)`
   - Changed server binding: `app.listen(PORT, '0.0.0.0', ...)` (was localhost only)
   - Updated console logs to remove hardcoded URLs

3. **server/.env.example**
   - Enhanced documentation for all environment variables
   - Added production security warnings
   - Documented all required variables

### Build Result
✅ **SUCCESS** - Zero TypeScript errors
- Build command: `npm run build`
- Output directory: `dist/`
- Entry point: `dist/index.js`
- Start command verified: `npm start` ✓

---

## Render Configuration

### Web Service Settings
```
Name: nouzen-backend
Root Directory: server
Build Command: npm run build
Start Command: npm start
Environment: Node (20.x)
```

### Required Environment Variables
```bash
# Database (use Internal URL from Render PostgreSQL)
DATABASE_URL="postgresql://..."

# CORS (your production frontend URLs, comma-separated)
CORS_ORIGIN="https://your-frontend.com"

# Admin Auth (CHANGE THESE IN PRODUCTION!)
ADMIN_AUTH_SECRET="generate-strong-secret-here"
ADMIN_SAMY_PASSWORD="strong-password"
ADMIN_AKRAM_PASSWORD="strong-password"

# Email Notifications
RESEND_API_KEY="re_..."
ORDER_NOTIFICATION_EMAIL="orders@yourdomain.com"
RESEND_FROM_EMAIL="Nouzen Orders <noreply@yourdomain.com>"
```

### Database Migration
After first deployment, run in Render Shell:
```bash
npx prisma migrate deploy
```

### Health Check
```
Path: /api/health
Expected: HTTP 200
```

---

## ⚠️ CRITICAL: File Upload Issue

**Current Status:** Files are saved to local filesystem (`/uploads/orders/`)

**Problem:** Render's filesystem is NOT persistent
- Files will be deleted on every deploy or service restart
- Order mockups, designs, and customization data will be lost

**Solution Required Before Production:**
Migrate to cloud storage:
- **AWS S3** (recommended)
- **Cloudinary** (image-focused)
- **Backblaze B2** (cost-effective)
- **Render Persistent Disks** (paid add-on)

**Code to Update:** `server/src/utils/orderFiles.ts`

---

## Deployment Checklist

- [ ] Create Render PostgreSQL database
- [ ] Create Render Web Service
- [ ] Set root directory: `server`
- [ ] Add all environment variables
- [ ] Deploy service
- [ ] Run migration: `npx prisma migrate deploy`
- [ ] Test health check
- [ ] Update frontend with backend URL
- [ ] **Plan file storage migration**

---

## API Endpoints

```
Health:      GET  /api/health
Products:    GET  /api/products
Categories:  GET  /api/categories
Orders:      POST /api/orders
Auth:        POST /api/auth/login
Coupons:     GET  /api/coupons
```

---

## Testing After Deployment

```bash
# Health check
curl https://your-backend.onrender.com/api/health

# Products (should return array)
curl https://your-backend.onrender.com/api/products

# CORS test from frontend
# Should work if CORS_ORIGIN is set correctly
```

---

## Quick Troubleshooting

**Build fails?**
- Check root directory is set to `server`
- Verify Node version is 20.x

**Database connection fails?**
- Use Internal Database URL (not External)
- Run `npx prisma migrate deploy`

**CORS errors?**
- Add exact frontend URL to `CORS_ORIGIN`
- Include `https://` protocol
- No trailing slashes

**Health check fails?**
- Wait 2-3 minutes after deployment
- Check service logs for errors

---

**Status:** ✅ Ready to deploy (address file storage before production)
**Build:** ✅ Zero errors
**Start:** ✅ Verified working
