# Quick Start Guide - React Catalog

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
Opens on: http://localhost:5173 (or 5174 if 5173 is in use)

### Production Build
```bash
npm run build
```
Output: `dist/` directory

### Preview Production Build
```bash
npm run preview
```

### Lint Code
```bash
npm run lint
```

---

## 📁 Key Files

### Entry Points
- `index.html` - Vite entry point
- `src/main.tsx` - React entry point
- `src/App.tsx` - Main app with providers

### Main Page
- `src/pages/Catalog.tsx` - Catalog page with all logic

### Data Files
- `src/data/products.ts` - Mock products (6 items)
- `src/data/translations.ts` - All translations (FR/AR/EN)

### Styling
- `src/styles/catalog.css` - All catalog styles
- `src/index.css` - Minimal reset

---

## 🔧 Modifying the Catalog

### Add a New Product
Edit `src/data/products.ts`:
```typescript
{
  id: "new-product",
  name: "Product Name",
  category: "Category",
  price: 2500,
  oldPrice: null, // or a number for discount
  badge: null, // or "NEW" or "-10%"
  image: "https://placehold.co/400x500/ffffff/cccccc?text=Product",
  colors: ["#000000", "#FFFFFF"],
  featured: false
}
```

### Add a Translation
Edit `src/data/translations.ts` - add keys to fr, ar, and en objects.

### Change Theme Colors
Edit `src/styles/catalog.css` - modify CSS custom properties in `:root` and `[data-theme="dark"]`.

### Add a New Component
1. Create file in `src/components/`
2. Export component
3. Import in parent component

---

## 🌐 Testing Features

### Test Language Switching
1. Click FR/AR/EN buttons in header
2. Verify all text changes
3. Verify Arabic sets RTL layout
4. Verify language persists on reload

### Test Theme Switching
1. Click moon icon in header
2. Verify colors change
3. Verify theme persists on reload

### Test Filtering
1. Type in search bar - filters by product name
2. Click category buttons - filters by category
3. Click "All" - shows all products

### Test Sorting
1. Select "Price: Low to High" - sorts ascending
2. Select "Price: High to Low" - sorts descending
3. Select "Featured" - shows featured first

### Test Responsive
1. Resize browser window
2. Verify grid adjusts (4 → 3 → 2 → 1 columns)
3. Verify header images change at breakpoints

---

## 🐛 Troubleshooting

### Port Already in Use
Vite will automatically try the next port (5174, 5175, etc.)

### Assets Not Loading
Ensure `/assets` folder is copied to `/public/assets`

### Build Fails
```bash
npm run build
```
Check error messages - all TypeScript errors must be fixed.

### Styles Not Applying
Verify `import './styles/catalog.css'` is in `App.tsx`

---

## 📦 Structure

```
src/
├── components/      ← UI components
├── contexts/        ← Theme & Language providers
├── data/            ← Mock data & translations
├── pages/           ← Main page component
├── styles/          ← CSS files
├── types/           ← TypeScript types
├── App.tsx          ← Root component
└── main.tsx         ← Entry point
```

---

## ✅ What Works

- ✅ French/Arabic/English switching
- ✅ Dark/light theme switching
- ✅ Search by product name
- ✅ Filter by category
- ✅ Sort by featured/price
- ✅ Responsive design
- ✅ RTL support for Arabic
- ✅ Loading modal on customize click
- ✅ LocalStorage persistence

---

## 🔜 Next Steps

### Connect to Backend API
Replace mock data in `src/pages/Catalog.tsx`:

```typescript
// Remove this:
import { mockProducts } from '../data/products';

// Add this:
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('http://localhost:3001/api/products')
    .then(res => res.json())
    .then(data => {
      setProducts(data.data.products);
      setLoading(false);
    });
}, []);
```

---

**Quick Start:** `npm run dev`  
**View at:** http://localhost:5173  
**Happy coding!** 🎉
