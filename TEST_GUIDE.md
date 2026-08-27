# Quick Test Guide - API Integration

## Prerequisites

1. **Backend Server Running**
   ```bash
   cd server
   npm run dev
   ```
   Should see: `✅ Server running on port 3001`

2. **Database Seeded**
   ```bash
   cd server
   npm run db:seed
   ```
   Should see: `✅ Seeded 6 products with 29 variants`

3. **Frontend Environment Configured**
   - Check `.env` file exists with `VITE_API_URL=http://localhost:3001`

---

## Test 1: Normal Operation (Backend Running)

**Steps:**
1. Start frontend: `npm run dev`
2. Open: `http://localhost:5173`
3. Watch browser console for API calls

**Expected Results:**
- ✅ Brief loading spinner appears
- ✅ 6 products display in grid
- ✅ Product names: "T-shirt standard", "Hoodie", "Polo", "Tote bag", "T-shirt oversize", "Cap"
- ✅ Prices: 2200, 3100, 3000, 1200, 2700, 1200
- ✅ Categories show correctly
- ✅ Color dots appear (varies by product)
- ✅ Console shows: `GET http://localhost:3001/api/products → 200 OK`

**Test Filtering:**
- ✅ Type "hoodie" in search → shows only Hoodie
- ✅ Click "T-Shirt" filter → shows T-shirt products
- ✅ Click "All" → shows all 6 products
- ✅ Select "Price: Low to High" → products sort by price ascending

---

## Test 2: Backend Not Running

**Steps:**
1. Stop backend server (Ctrl+C)
2. Refresh frontend page

**Expected Results:**
- ✅ Loading spinner appears
- ✅ Error icon displays (red warning triangle)
- ✅ Error message: "Unable to connect to the server. Please check your connection."
- ✅ "Retry" button appears
- ✅ Header and footer remain visible
- ✅ Console shows: `GET http://localhost:3001/api/products → Failed to fetch`

**Test Retry:**
1. Start backend: `cd server && npm run dev`
2. Click "Retry" button
3. ✅ Products load successfully

---

## Test 3: Backend Error Response

**Steps:**
1. Backend running but returns error (would need to simulate)
2. Example: Invalid database connection

**Expected Results:**
- ✅ Error message shows backend error text
- ✅ Retry button available

---

## Test 4: Empty Products

**Steps:**
1. Clear all products from database
2. Refresh frontend

**Expected Results:**
- ✅ No loading error
- ✅ "No products found" message displays
- ✅ Empty grid (no products)

---

## Test 5: Language & Theme

**Steps:**
1. Products loaded successfully
2. Click FR/AR/EN buttons
3. Click theme toggle

**Expected Results:**
- ✅ Language changes → loading/error messages translate
- ✅ Arabic → layout flips to RTL
- ✅ Theme toggle → colors change
- ✅ Products remain loaded (no re-fetch)

---

## Test 6: API Response Check

**Open Browser DevTools → Network Tab:**

**Request:**
```
GET http://localhost:3001/api/products
```

**Response Headers:**
```
Status: 200 OK
Content-Type: application/json
```

**Response Body:**
```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "id": "...",
        "name": "T-shirt standard",
        "slug": "tshirt-standard",
        "price": 2200,
        "category": {
          "name": "T-Shirt",
          "slug": "tshirt"
        },
        "variants": [...]
      }
    ],
    "pagination": {
      "total": 6,
      "limit": 100,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

---

## Troubleshooting

### Products Don't Load

**Check 1: Backend Running?**
```bash
curl http://localhost:3001/api/health
```
Should return: `{"status":"success","message":"Nouzen Clothes API is running",...}`

**Check 2: Database Seeded?**
```bash
cd server
npm run db:seed
```

**Check 3: CORS Issue?**
- Check backend console for CORS errors
- Verify `server/.env` has `CORS_ORIGIN=http://localhost:5173`

**Check 4: Frontend Environment?**
- Check `.env` has `VITE_API_URL=http://localhost:3001`
- Restart frontend dev server after changing .env

### Wrong Port

Frontend on 5174 instead of 5173?
- Update `server/.env`: `CORS_ORIGIN=http://localhost:5174`
- Restart backend server

### TypeScript Errors

```bash
npm run build
```
Should succeed with no errors.

---

## Success Indicators

✅ **API Call Successful:**
- Network tab shows `GET /api/products → 200 OK`
- Response contains `"status": "success"`
- Products array has 6 items

✅ **UI Updates:**
- Products appear in grid
- Product data matches API response
- Filters work on API data
- No console errors

✅ **State Management:**
- Loading → Success transition works
- Error → Retry → Success works
- Search/filter/sort work on loaded data

---

## Quick Debug Commands

```bash
# Check backend health
curl http://localhost:3001/api/health

# Check products endpoint
curl http://localhost:3001/api/products

# Check specific product
curl http://localhost:3001/api/products/tshirt-standard

# Restart backend
cd server && npm run dev

# Restart frontend
npm run dev

# Rebuild frontend
npm run build

# Check environment
cat .env
cat server/.env
```

---

**All tests passing?** API integration is working! ✅
