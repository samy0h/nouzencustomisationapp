# Render Deployment Guide - Nouzen Clothes Backend

## ✅ Production Readiness Status

The backend has been prepared for production deployment on Render with the following changes:

### Files Modified
1. **server/package.json** - Updated build scripts and added postinstall hook
2. **server/src/index.ts** - Fixed PORT type and server binding to 0.0.0.0
3. **server/.env.example** - Updated with comprehensive production documentation

### Build Verification
✅ **Build Status:** SUCCESS (Zero TypeScript errors)
- Command: `npm run build`
- Output: Compiled to `dist/` directory
- Prisma Client: Auto-generated during build

---

## 🚀 Render Web Service Configuration

### Basic Settings
```
Service Name: nouzen-backend (or your preferred name)
Region: Choose closest to your users
Branch: main
Root Directory: server
```

### Build & Deploy Commands
```
Build Command: npm run build
Start Command: npm start
```

### Environment Configuration
```
Node Version: 20.x (or latest LTS)
```

---

## 🔐 Required Environment Variables

Set these in Render Dashboard → Environment:

### Database (CRITICAL)
```
DATABASE_URL=<Your Render PostgreSQL Internal Database URL>
```
**Note:** Use the **Internal Database URL** from your Render PostgreSQL service (not the external one)

### CORS Configuration
```
CORS_ORIGIN=https://your-frontend-domain.com,https://www.your-frontend-domain.com
```
**Important:** Add ALL production frontend URLs (comma-separated, no spaces around commas)

### Admin Authentication (CRITICAL - CHANGE THESE!)
```
ADMIN_AUTH_SECRET=<Generate a strong random secret>
ADMIN_SAMY_PASSWORD=<Strong password for Samy admin>
ADMIN_AKRAM_PASSWORD=<Strong password for Akram admin>
```
**Security:** Use strong, unique secrets in production. Never use the default values.

### Email Notifications
```
RESEND_API_KEY=re_<your_actual_api_key>
ORDER_NOTIFICATION_EMAIL=orders@yourdomain.com
RESEND_FROM_EMAIL=Nouzen Orders <noreply@yourdomain.com>
```
**Note:** 
- Get API key from https://resend.com/api-keys
- `RESEND_FROM_EMAIL` must use a domain verified in Resend
- During testing, you can omit `RESEND_FROM_EMAIL` (uses default)

### Optional Environment Variables
```
NODE_ENV=production
PORT=<auto-assigned by Render, usually 10000>
```
**Note:** Render automatically sets PORT - you don't need to configure it

---

## 🗄️ Database Setup

### 1. Create PostgreSQL Database on Render
1. Go to Render Dashboard → New → PostgreSQL
2. Choose a name (e.g., `nouzen-db`)
3. Select a region (same as your web service)
4. Create the database

### 2. Get the Internal Database URL
1. Open your PostgreSQL service in Render
2. Copy the **Internal Database URL** (NOT External)
3. Add it as `DATABASE_URL` in your Web Service environment variables

### 3. Run Prisma Migrations
After deploying your web service, run this command in the Render Shell:

```bash
npx prisma migrate deploy
```

**Alternative:** You can add this to a one-time job or deploy hook in Render.

**Migration Command for Reference:**
```
npx prisma migrate deploy
```

---

## 🏥 Health Check Configuration

### Health Check Endpoint
```
URL: https://your-backend.onrender.com/api/health
Method: GET
Expected Response: 200 OK
```

### Render Health Check Settings
```
Health Check Path: /api/health
```

The endpoint returns:
```json
{
  "status": "success",
  "message": "Nouzen Clothes API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 📁 File Upload Considerations

### ⚠️ CRITICAL: Local Filesystem Storage Issue

**Current Implementation:**
- The application saves order files (mockups, designs, customization JSON) to the local filesystem at `/uploads/orders/`
- Files are stored in: `server/src/utils/orderFiles.ts`

**Problem:**
- **Render's filesystem is NOT persistent** - files will be deleted on every deploy or service restart
- This means uploaded order files will be lost

**Production Solutions (Choose One):**

#### Option 1: Cloud Object Storage (RECOMMENDED)
Migrate to a persistent storage solution:
- **AWS S3** - Most popular, reliable
- **Cloudinary** - Image-focused, built-in transformations
- **Backblaze B2** - Cost-effective alternative to S3
- **Render Disks** - Persistent disks (paid feature)

**Required Changes:**
- Update `server/src/utils/orderFiles.ts` to upload to chosen service
- Add storage credentials to environment variables
- Install appropriate SDK (e.g., `@aws-sdk/client-s3`)

#### Option 2: Render Persistent Disks
1. Add a persistent disk to your Render service
2. Mount it at `/uploads`
3. Costs extra but simplest migration path

#### Option 3: Store as Base64 in Database (NOT RECOMMENDED)
- Store images directly in PostgreSQL as base64
- Will significantly increase database size
- Poor performance for large images

**Current Status:** 
🟡 **File uploads will work but data will be lost on redeploy** - Implement cloud storage before production launch.

---

## 🔒 CORS Configuration Details

### How It Works
The server accepts requests from:
1. **Local development origins** (localhost, 127.0.0.1 on any port)
2. **Configured production origins** from `CORS_ORIGIN` environment variable

### Production Setup
```
CORS_ORIGIN=https://nouzen-clothes.netlify.app,https://www.nouzen.com
```

### What's Configured
- ✅ Credentials enabled (required for authentication)
- ✅ Dynamic origin validation
- ✅ Supports multiple frontend domains

### Testing CORS
```bash
curl -H "Origin: https://your-frontend.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://your-backend.onrender.com/api/products
```

---

## 🔧 Deployment Checklist

### Pre-Deployment
- [ ] Create PostgreSQL database on Render
- [ ] Create Web Service on Render
- [ ] Set root directory to `server`
- [ ] Configure all environment variables
- [ ] Update `CORS_ORIGIN` with production frontend URL
- [ ] Generate strong secrets for `ADMIN_AUTH_SECRET` and passwords
- [ ] Set up Resend API key and verify sender domain

### First Deployment
- [ ] Deploy the service
- [ ] Wait for build to complete (watch logs)
- [ ] Open Render Shell and run: `npx prisma migrate deploy`
- [ ] Test health check: `https://your-backend.onrender.com/api/health`
- [ ] Test API endpoint: `https://your-backend.onrender.com/api/products`

### Post-Deployment
- [ ] Verify CORS by testing from frontend
- [ ] Test order creation flow
- [ ] Test admin authentication
- [ ] **Plan cloud storage migration for file uploads**
- [ ] Set up monitoring/alerts
- [ ] Document the backend URL for frontend configuration

---

## 🐛 Troubleshooting

### Build Fails
- Check Node version (should be 20.x or latest LTS)
- Verify `server` is set as root directory
- Check build logs for specific errors

### Database Connection Fails
- Verify you're using **Internal Database URL**, not External
- Check DATABASE_URL format includes `?schema=public`
- Ensure PostgreSQL service is in the same region

### CORS Errors
- Add your exact frontend URL to `CORS_ORIGIN`
- Include protocol (`https://`) in the URL
- No trailing slashes in URLs
- Separate multiple URLs with commas (no spaces)

### Health Check Fails
- Verify the service is actually running (check logs)
- Ensure health check path is `/api/health`
- Wait a few minutes after deployment

### Prisma Errors
- Run `npx prisma migrate deploy` in Render Shell
- Check that DATABASE_URL is set correctly
- Verify Prisma Client was generated during build

---

## 📊 Monitoring & Logs

### View Logs
Render Dashboard → Your Service → Logs

### Key Startup Messages
```
🚀 Server running on port 10000
📊 Health check: /api/health
🛍️  Products API: /api/products
🌍 Environment: production
```

### Common Log Patterns
- `[ORDER]` - Order processing logs
- `Prisma` - Database query logs (only errors in production)
- CORS rejection - Indicates frontend URL not in `CORS_ORIGIN`

---

## 🔗 Final Configuration Summary

### Render Web Service Settings
```yaml
Service Type: Web Service
Environment: Node
Root Directory: server
Build Command: npm run build
Start Command: npm start
Auto-Deploy: Yes (recommended)
```

### Required Environment Variables (Summary)
```
DATABASE_URL          # Render PostgreSQL Internal URL
CORS_ORIGIN          # Production frontend URLs
ADMIN_AUTH_SECRET    # Strong random secret
ADMIN_SAMY_PASSWORD  # Strong password
ADMIN_AKRAM_PASSWORD # Strong password
RESEND_API_KEY       # From Resend dashboard
ORDER_NOTIFICATION_EMAIL # Your orders email
RESEND_FROM_EMAIL    # Verified domain email (optional)
```

### Post-Deploy Command
```bash
npx prisma migrate deploy
```

### Health Check
```
Path: /api/health
Expected: 200 OK
```

---

## ⚠️ Production Issues to Address

### HIGH PRIORITY
1. **File Upload Storage** - Current implementation uses local filesystem which is NOT persistent on Render
   - Files will be deleted on every deploy/restart
   - **Action Required:** Implement cloud storage (S3, Cloudinary, etc.) before production launch

### MEDIUM PRIORITY
2. **Security Audit** - Review and strengthen:
   - Change all default passwords and secrets
   - Review admin authentication mechanism
   - Consider implementing JWT tokens instead of basic auth

### LOW PRIORITY
3. **Performance** - Consider adding:
   - Redis for caching
   - Database connection pooling configuration
   - Rate limiting for API endpoints

---

## 📞 Support

If you encounter issues:
1. Check Render logs first
2. Verify all environment variables are set correctly
3. Test health check endpoint
4. Review CORS configuration if frontend can't connect

---

**Deployment prepared on:** 2024
**Backend Status:** ✅ Ready for deployment (with file storage caveat)
**Build Status:** ✅ Zero TypeScript errors
**Migration Command:** `npx prisma migrate deploy`
