# Custom Clothing Editor - Phase 1A: Catalog

A React-based custom clothing ordering platform frontend.

## What's Implemented (Phase 1A)

✅ Custom product catalog
✅ Product filtering by category (All, T-Shirts, Hoodies, Joggers)
✅ Responsive grid layout
✅ Product cards with thumbnail, name, description, and price
✅ Navigation to editor page (placeholder)
✅ Mock product data (products.json)

## Running Locally

The dev server is currently running at: **http://localhost:5173/custom**

### To start the dev server:
```bash
npm run dev
```

### To stop the dev server:
Press `Ctrl+C` in the terminal

## Project Structure

```
custom-editor/
├── public/mock-data/
│   └── products.json           # Mock product catalog
├── src/
│   ├── components/
│   │   ├── catalog/            # Catalog-specific components
│   │   ├── shared/             # Reusable UI components
│   │   └── layout/             # Layout components
│   ├── pages/
│   │   ├── CatalogPage.tsx     # ✅ Implemented
│   │   └── EditorPage.tsx      # Placeholder for Phase 1B
│   ├── hooks/
│   │   └── useProductData.ts   # Fetch products from JSON
│   └── types/
│       └── product.ts          # TypeScript types
└── README.md
```

## What's Next (Phase 1B)

After catalog approval, we'll implement:
- Fabric.js canvas with product mockup
- Text and image editing tools
- Front/Back view switching
- Color and size selectors
- Layer management panel

## Notes

- Products are completely independent from Shopify
- No backend, database, or authentication in Phase 1
- Product images currently use placeholder service
- Mock data structure matches future API contract
