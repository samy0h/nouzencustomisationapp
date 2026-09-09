# Render Dashboard - Copy/Paste Settings

## Web Service Configuration

```
Service Name: nouzen-backend
Environment: Node
Region: [Choose your region]
Branch: main
Root Directory: server
Build Command: npm run build
Start Command: npm start
```

## Environment Variables (Copy and modify values)

```
DATABASE_URL=postgresql://user:pass@hostname.oregon-postgres.render.com:5432/dbname?schema=public

CORS_ORIGIN=https://your-frontend-domain.com

ADMIN_AUTH_SECRET=CHANGE-THIS-TO-RANDOM-SECRET-32-CHARS-OR-MORE

ADMIN_SAMY_PASSWORD=CHANGE-THIS-PASSWORD

ADMIN_AKRAM_PASSWORD=CHANGE-THIS-PASSWORD

RESEND_API_KEY=re_YourActualAPIKey

ORDER_NOTIFICATION_EMAIL=orders@yourdomain.com

RESEND_FROM_EMAIL=Nouzen Orders <noreply@yourdomain.com>
```

## Health Check

```
Health Check Path: /api/health
```

## After First Deploy - Run in Render Shell

```bash
npx prisma migrate deploy
```

---

## Quick Test Commands

```bash
# Health check
curl https://your-backend.onrender.com/api/health

# Products
curl https://your-backend.onrender.com/api/products

# Categories
curl https://your-backend.onrender.com/api/categories
```

---

## Important Notes

1. **DATABASE_URL**: Use the INTERNAL url from your PostgreSQL service (not External)
2. **CORS_ORIGIN**: Must match your frontend URL exactly (include https://, no trailing slash)
3. **Secrets**: Generate strong random values for production
4. **File Uploads**: Current implementation uses local storage - files will be lost on redeploy. Implement S3/Cloudinary before production.

---

## Frontend Configuration

Add this to your frontend environment:

```
VITE_API_URL=https://your-backend.onrender.com
```

Make sure to update any hardcoded localhost:3001 URLs in your frontend code.
