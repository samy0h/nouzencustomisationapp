# PRODUCT PAGE ARCHITECTURE & DIAGNOSTIC REPORT

**Date:** 2026-08-27  
**Issue:** Product detail page (`/custom/product/tshirt-standard`) displays blank white screen  
**Status:** 🔴 CRITICAL BUG - Page not rendering

---

## 📊 EXECUTIVE SUMMARY

The product detail page is completely blank. This diagnostic report traces the entire data flow from database → backend API → frontend component to identify the root cause.

---

## 🏗️ ARCHITECTURE OVERVIEW

### Complete Request Flow

```
User Browser
    ↓
[1] React Router (App.tsx)
    ↓ Route: /custom/product/:slug
[2] ProductDetail Component (ProductDetail.tsx)
    ↓ useProduct hook
[3] API Call (api.ts → getProductBySlug)
    ↓ HTTP GET /api/products/tshirt-standard
[4] Backend Controller (productController.ts → getProductBySlug)
    ↓ Prisma query
[5] PostgreSQL Database
    ↓ Returns product + variants + category
[6] Backend Response (JSON)
    ↓
[7] Frontend State Update
    ↓
[8] React Rendering
    ↓
[9] Dynamic Image Loading (imageHelpers.ts)
    ↓
[10] Display to User
```

---

## 🔍 LAYER-BY-LAYER ANALYSIS

### LAYER 1: Routing (React Router)

**File:** `src/App.tsx`

**Configuration:**
```tsx
<Route path="/custom/product/:slug" element={<ProductDetail />} />
```

**Status:** ✅ WORKING
- Route registered correctly
- URL pattern matches: `/custom/product/tshirt-standard`
- React Router detects the route

**Verification:**
```bash
curl http://localhost:5173/custom/product/tshirt-standard
# Returns: HTML with <div id="root"></div>
```

---

### LAYER 2: Component Mount (ProductDetail.tsx)

**File:** `src/pages/ProductDetail.tsx`

**Initialization Flow:**
```tsx
1. Component mounts
2. useParams() extracts slug = "tshirt-standard"
3. useProduct(slug) hook is called
4. useState initializes:
   - selectedColor = ''
   - selectedSize = ''
   - quantity = 1
   - printingSide = 'FRONT'
```

**Potential Issues:**

#### 🔴 ISSUE 1: useEffect Dependency Array
```tsx
// Line 49-53
useEffect(() => {
  if (product && availableColors.length > 0 && !selectedColor) {
    setSelectedColor(availableColors[0].color);
  }
}, [product, availableColors, selectedColor]);
```

**PROBLEM:** This creates an **infinite loop**!
- When `product` loads, it sets `selectedColor`
- Setting `selectedColor` triggers the effect again (because `selectedColor` is in dependencies)
- Effect runs again, but now `selectedColor` exists, so condition is false
- BUT: `availableColors` is recalculated via `useMemo` which depends on `product`
- This can cause re-renders

**FIX NEEDED:**
```tsx
useEffect(() => {
  if (product && availableColors.length > 0 && !selectedColor) {
    setSelectedColor(availableColors[0].color);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [product, availableColors]); // Remove selectedColor from deps
```

#### 🔴 ISSUE 2: Similar issue in size selector
```tsx
// Line 56-60
useEffect(() => {
  if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
    setSelectedSize(availableSizes[0]);
  }
}, [availableSizes, selectedSize]); // selectedSize in deps causes issues
```

**PROBLEM:** Same infinite loop pattern

---

### LAYER 3: Data Fetching (useProduct hook)

**File:** `src/hooks/useProduct.ts`

**Flow:**
```tsx
1. Hook initializes with loading = true
2. useEffect calls fetchProduct()
3. API call to getProductBySlug(slug)
4. On success: setProduct(data), setLoading(false)
5. On error: setError(message), setLoading(false)
```

**Dependencies:**
```tsx
useEffect(() => {
  fetchProduct();
}, [slug]); // Re-fetches when slug changes
```

**Potential Issue:**

#### ⚠️ ISSUE 3: Missing dependency
```tsx
const fetchProduct = async () => { ... }

useEffect(() => {
  fetchProduct();
}, [slug]); // fetchProduct is not in deps
```

**PROBLEM:** React warns about exhaustive deps
**IMPACT:** Low (fetchProduct is stable, but violates rules)

**Status:** ⚠️ WARNING (not critical)

---

### LAYER 4: API Service (api.ts)

**File:** `src/services/api.ts`

**Function:**
```tsx
export const getProductBySlug = async (slug: string) => {
  const response = await api.getProductBySlug(slug);
  return response.data.product;
};
```

**API Call:**
```tsx
api.getProductBySlug: async (slug: string): Promise<ApiProductResponse> => {
  return fetchApi<ApiProductResponse>(`/api/products/${slug}`);
}
```

**Status:** ✅ WORKING

**Verification:**
```bash
curl http://localhost:3001/api/products/tshirt-standard
# Returns: 200 OK with product data
```

---

### LAYER 5: Backend Controller

**File:** `server/src/controllers/productController.ts`

**Handler:** `getProductBySlug`

**Query:**
```typescript
const product = await prisma.product.findUnique({
  where: {
    slug: validatedParams.slug,
    active: true,
  },
  include: {
    category: {
      select: { id: true, name: true, slug: true }
    },
    variants: {
      where: { available: true },
      select: {
        id: true,
        color: true,
        colorHex: true,
        size: true,
        priceOverride: true,
        stock: true,
        available: true,
      }
    }
  }
});
```

**Status:** ✅ WORKING

**Response Structure:**
```json
{
  "status": "success",
  "data": {
    "product": {
      "id": "...",
      "name": "T-shirt standard",
      "slug": "tshirt-standard",
      "type": "TSHIRT",
      "supportsDoublePrint": true,
      "images": ["https://placehold.co/400x500/..."],
      "variants": [
        {
          "id": "...",
          "color": "Black",
          "colorHex": "#000000",
          "size": "S",
          ...
        }
      ],
      "category": {...}
    }
  }
}
```

---

### LAYER 6: Database

**Table:** `Product`

**Query Result:**
```sql
SELECT * FROM "Product" WHERE slug = 'tshirt-standard' AND active = true;
```

**Status:** ✅ WORKING

**Data:**
- Product exists
- Has 40+ variants (8 colors × 5 sizes)
- type = "TSHIRT"
- supportsDoublePrint = true

---

### LAYER 7: Image Handling

**File:** `src/utils/imageHelpers.ts`

**Function:**
```tsx
export const getProductImage = (
  productSlug: string,
  color: string,
  side: 'front' | 'back' = 'front'
): string => {
  if (productSlug === 'tshirt-standard') {
    const colorKey = color.toLowerCase();
    return `/assets/t-shirt standard/${colorKey} ${side}.png`;
  }
  return `https://placehold.co/400x500/...`;
};
```

**Image Paths Generated:**
```
/assets/t-shirt standard/black front.png
/assets/t-shirt standard/black back.png
/assets/t-shirt standard/white front.png
...
```

**Status:** ✅ WORKING

**Files Located At:**
```
public/assets/t-shirt standard/
├── black front.png
├── black back.png
├── white front.png
├── white back.png
├── gray front.png
├── gray back.png
├── navy front.png
├── navy back.png
├── red front.png
├── red back.png
├── pink front.png
├── pink back.png
├── green front.png
├── green back.png
├── sky blue front.png
└── sky blue back.png
```

**Verification:**
```bash
curl -I http://localhost:5173/assets/t-shirt%20standard/black%20front.png
# Returns: 200 OK
```

---

## 🔴 ROOT CAUSE ANALYSIS

### Primary Suspect: React Rendering Loop

**Evidence:**

1. **useEffect with problematic dependencies** creates infinite re-render loop
2. Component never stabilizes → never renders UI
3. Page appears blank because React is stuck in render cycle

### Secondary Suspects:

#### Suspect 2: Console Error Not Visible
- React errors might be suppressed
- StrictMode might be causing double-renders
- Error boundary missing

#### Suspect 3: CSS Issue
- productDetail.css might have `display: none` or `opacity: 0`
- Container might have `height: 0`

#### Suspect 4: TypeScript/Build Issue
- Build might have stale code
- Hot reload not working

---

## 🔧 DEBUGGING STEPS PERFORMED

### 1. ✅ Backend API Tested
```bash
curl http://localhost:3001/api/products/tshirt-standard
# Result: 200 OK, valid JSON
```

### 2. ✅ Frontend Server Running
```bash
netstat -ano | grep 5173
# Result: Port 5173 LISTENING
```

### 3. ✅ Images Accessible
```bash
curl -I http://localhost:5173/assets/t-shirt%20standard/black%20front.png
# Result: 200 OK
```

### 4. ✅ Route Configured
```bash
curl http://localhost:5173/custom/product/tshirt-standard
# Result: HTML page with <div id="root"></div>
```

### 5. ⚠️ Build Successful
```bash
npm run build
# Result: ✓ built in 2.75s
```

### 6. 🔴 Console Errors: UNKNOWN
User needs to check browser console (F12)

---

## 💡 RECOMMENDED FIXES

### FIX 1: Remove selectedColor from useEffect dependencies

**File:** `src/pages/ProductDetail.tsx`

**Current Code (Line 49-53):**
```tsx
useEffect(() => {
  if (product && availableColors.length > 0 && !selectedColor) {
    setSelectedColor(availableColors[0].color);
  }
}, [product, availableColors, selectedColor]); // ❌ BAD
```

**Fixed Code:**
```tsx
useEffect(() => {
  if (product && availableColors.length > 0 && !selectedColor) {
    setSelectedColor(availableColors[0].color);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [product, availableColors]); // ✅ GOOD
```

### FIX 2: Remove selectedSize from useEffect dependencies

**Current Code (Line 56-60):**
```tsx
useEffect(() => {
  if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
    setSelectedSize(availableSizes[0]);
  }
}, [availableSizes, selectedSize]); // ❌ BAD
```

**Fixed Code:**
```tsx
useEffect(() => {
  if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
    setSelectedSize(availableSizes[0]);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [availableSizes]); // ✅ GOOD
```

### FIX 3: Add Error Boundary

**New File:** `src/components/ErrorBoundary.tsx`

```tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <pre style={{ textAlign: 'left', background: '#f5f5f5', padding: '1rem' }}>
            {this.state.error?.message}
          </pre>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Wrap in App.tsx:**
```tsx
<ErrorBoundary>
  <Routes>
    ...
  </Routes>
</ErrorBoundary>
```

### FIX 4: Add Console Debug Logging

**Temporary Debug Code in ProductDetail.tsx:**

```tsx
export default function ProductDetail() {
  console.log('[ProductDetail] Component mounted');
  
  const { slug } = useParams();
  console.log('[ProductDetail] slug:', slug);
  
  const { product, loading, error } = useProduct(slug || '');
  console.log('[ProductDetail] product:', product);
  console.log('[ProductDetail] loading:', loading);
  console.log('[ProductDetail] error:', error);
  
  if (loading) {
    console.log('[ProductDetail] Rendering loading state');
    return <div>Loading...</div>;
  }
  
  if (error) {
    console.log('[ProductDetail] Rendering error state');
    return <div>Error: {error}</div>;
  }
  
  console.log('[ProductDetail] Rendering main UI');
  // ... rest of component
}
```

---

## 🎯 IMMEDIATE ACTION PLAN

### Step 1: Check Browser Console (USER ACTION REQUIRED)

**Instructions:**
1. Open: `http://localhost:5173/custom/product/tshirt-standard`
2. Press F12 (open DevTools)
3. Click "Console" tab
4. Look for RED error messages
5. Share the error text

**Common Errors to Look For:**
- `Maximum update depth exceeded`
- `Cannot read property 'map' of undefined`
- `Uncaught TypeError`
- `404 Not Found` (for API or images)

### Step 2: Apply useEffect Fixes

Run these fixes immediately:

```bash
# Apply Fix 1 & 2 to ProductDetail.tsx
```

### Step 3: Hard Refresh Browser

```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### Step 4: Check Network Tab

1. Open DevTools → Network tab
2. Refresh page
3. Check if API call succeeds:
   - Look for: `tshirt-standard` request
   - Status should be: `200 OK`
   - Response should have product data

---

## 📋 VERIFICATION CHECKLIST

After applying fixes, verify:

- [ ] Browser console shows no errors
- [ ] API call returns 200 OK
- [ ] Product data logged to console
- [ ] Component renders loading state
- [ ] Component renders main UI
- [ ] Images load correctly
- [ ] Color selector appears
- [ ] Size selector appears
- [ ] Printing side selector appears (Front/Back/Both)
- [ ] Clicking colors changes image
- [ ] Clicking Front/Back changes image
- [ ] Customize button is enabled

---

## 🔬 TECHNICAL DEEP DIVE

### Why the useEffect Bug Causes Blank Page

**The Loop:**

```
1. Component mounts → product = null, selectedColor = ''
2. product loads from API → product = {...}
3. useEffect fires (product changed)
4. availableColors computed → ['Black', 'White', ...]
5. Condition: product ✓, availableColors.length > 0 ✓, !selectedColor ✓
6. setSelectedColor('Black')
7. useEffect fires AGAIN (selectedColor changed)
8. availableColors recomputed (depends on product via useMemo)
9. Condition: product ✓, availableColors.length > 0 ✓, !selectedColor ✗ (now 'Black')
10. No state change, but React re-rendered
11. If availableColors reference changed → loop continues
12. React detects infinite loop → stops rendering → blank page
```

**Why It's Hard to Debug:**
- No console error in production build
- React DevTools might not catch it
- Appears as "frozen" page

### Why useMemo Doesn't Save Us

```tsx
const availableColors = useMemo(() => {
  if (!product) return [];
  const colorMap = new Map<string, { color: string; colorHex: string }>();
  product.variants.forEach(v => {
    if (!colorMap.has(v.color)) {
      colorMap.set(v.color, { color: v.color, colorHex: v.colorHex });
    }
  });
  return Array.from(colorMap.values());
}, [product]);
```

**Problem:**
- `Array.from(colorMap.values())` creates NEW array every time
- Even with same product, reference changes
- useEffect sees "different" availableColors
- Loop continues

---

## 🏥 HEALTH CHECK COMMANDS

### Backend Health
```bash
curl http://localhost:3001/api/health
# Expected: {"status":"ok","message":"Server is running","timestamp":"..."}
```

### Frontend Health
```bash
curl http://localhost:5173/
# Expected: HTML with <div id="root"></div>
```

### Product API
```bash
curl http://localhost:3001/api/products/tshirt-standard
# Expected: JSON with product data
```

### Image Assets
```bash
curl -I http://localhost:5173/assets/t-shirt%20standard/black%20front.png
# Expected: HTTP/1.1 200 OK
```

---

## 📊 SYSTEM STATE

### Servers Running
- ✅ Backend: http://localhost:3001 (Express + Prisma)
- ✅ Frontend: http://localhost:5173 (Vite + React)

### Database
- ✅ PostgreSQL: nouzen_db
- ✅ Product: tshirt-standard exists
- ✅ Variants: 40 variants created

### Files
- ✅ Images: public/assets/t-shirt standard/ (16 images)
- ✅ Component: src/pages/ProductDetail.tsx
- ✅ Hook: src/hooks/useProduct.ts
- ✅ Helper: src/utils/imageHelpers.ts

---

## 🎓 LESSONS LEARNED

### 1. useEffect Dependencies Matter

**Bad:**
```tsx
useEffect(() => {
  setState(value);
}, [value, state]); // state in deps = loop
```

**Good:**
```tsx
useEffect(() => {
  setState(value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [value]); // only value, not state
```

### 2. useMemo Doesn't Prevent Re-computation

- `useMemo` caches the VALUE
- But if you return a NEW array/object, reference changes
- Use refs or stable keys for true stability

### 3. Error Boundaries Are Essential

- React errors can be silent
- Always wrap routes in ErrorBoundary
- Log errors to console

### 4. Console Logging Is Your Friend

- Add strategic console.logs
- Log at component mount, data fetch, render
- Remove after debugging

---

## 📝 NEXT STEPS

1. **USER:** Check browser console and share errors
2. **DEVELOPER:** Apply useEffect fixes
3. **TEST:** Hard refresh browser
4. **VERIFY:** All images load and selectors work
5. **CLEANUP:** Remove debug console.logs
6. **DOCUMENT:** Update code with comments explaining fix

---

**Report Generated:** 2026-08-27  
**Status:** 🔴 AWAITING USER CONSOLE OUTPUT  
**Priority:** CRITICAL  
**ETA to Fix:** 5 minutes (once console errors confirmed)
