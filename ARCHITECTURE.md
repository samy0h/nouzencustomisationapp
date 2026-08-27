# Architecture Documentation

## Project Overview

This is a **frontend-only** React application for a custom clothing ordering platform. It allows customers to select blank products and customize them with designs before previewing their creations.

## Technology Stack

- **React 18+** with TypeScript
- **Vite** - build tool and dev server
- **Tailwind CSS** - utility-first styling
- **Fabric.js** - canvas-based design editor
- **Zustand** - lightweight state management
- **React Router** - client-side routing

## Folder Structure

```
custom-editor/
├── public/
│   └── mock-data/
│       ├── products.json
│       └── product-images/
│           ├── tshirt-standard/
│           ├── tshirt-oversized/
│           ├── hoodie/
│           └── jogger/
├── src/
│   ├── components/
│   │   ├── catalog/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   └── CategoryFilter.tsx
│   │   ├── editor/
│   │   │   ├── Canvas.tsx
│   │   │   ├── Toolbar.tsx
│   │   │   ├── TextTools.tsx
│   │   │   ├── ImageTools.tsx
│   │   │   ├── ColorPicker.tsx
│   │   │   ├── LayerPanel.tsx
│   │   │   └── ViewToggle.tsx
│   │   ├── shared/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Select.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Container.tsx
│   ├── pages/
│   │   ├── CatalogPage.tsx
│   │   └── EditorPage.tsx
│   ├── store/
│   │   └── useDesignStore.ts
│   ├── types/
│   │   ├── product.ts
│   │   ├── design.ts
│   │   └── editor.ts
│   ├── utils/
│   │   ├── fabricHelpers.ts
│   │   └── validation.ts
│   ├── hooks/
│   │   ├── useFabricCanvas.ts
│   │   └── useProductData.ts
│   ├── constants/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── ARCHITECTURE.md
├── DESIGN_SYSTEM.md
└── TODO.md
```

## Component Architecture

### Page Components

**CatalogPage** (`/custom`)
- Displays available blank products
- Grid layout with filtering
- Navigate to editor on product selection

**EditorPage** (`/custom/editor/:productId`)
- Main customization interface
- Left: Toolbar with design tools (text, image upload)
- Center: Fabric.js canvas showing product mockup
- Right: Layer panel and object properties
- Bottom: Front/Back view toggle, color selector, size selector
- Top: Back to catalog button

### Reusable Components

All components follow atomic design principles:
- Atoms: Button, Input, Select, ColorPicker
- Molecules: ProductCard, ToolbarButton, LayerItem
- Organisms: ProductGrid, Toolbar, Canvas, LayerPanel
- Templates: Page layouts
- Pages: CatalogPage, EditorPage, PreviewPage

## Routing Strategy

```typescript
/custom                           → CatalogPage
/custom/editor/:productId         → EditorPage
```

Using React Router v6:
- Route params for product selection
- State passing for design data between routes
- Programmatic navigation after actions

## Mock Data Structure

### Products (`public/mock-data/products.json`)

```typescript
{
  "products": [
    {
      "id": "tshirt-standard",
      "name": "T-Shirt Standard",
      "category": "tshirt",
      "basePrice": 25.00,
      "description": "Classic fit, crew neck t-shirt",
      "colors": [
        { 
          "name": "White", 
          "hex": "#FFFFFF", 
          "frontMockup": "/mock-data/product-images/tshirt-standard/white-front.png",
          "backMockup": "/mock-data/product-images/tshirt-standard/white-back.png"
        },
        { 
          "name": "Black", 
          "hex": "#000000", 
          "frontMockup": "/mock-data/product-images/tshirt-standard/black-front.png",
          "backMockup": "/mock-data/product-images/tshirt-standard/black-back.png"
        },
        { 
          "name": "Navy", 
          "hex": "#1E3A8A", 
          "frontMockup": "/mock-data/product-images/tshirt-standard/navy-front.png",
          "backMockup": "/mock-data/product-images/tshirt-standard/navy-back.png"
        }
      ],
      "sizes": ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
      "printArea": {
        "front": { "width": 12, "height": 16, "unit": "inches" },
        "back": { "width": 12, "height": 16, "unit": "inches" }
      },
      "thumbnail": "/mock-data/product-images/tshirt-standard/thumbnail.png"
    }
    // ... other products
  ]
}
```

## Editor State Structure

Using Zustand for global state management:

### Design Store

```typescript
interface DesignState {
  // Product selection
  selectedProduct: Product | null;
  selectedColor: ProductColor | null;
  selectedSize: string | null;
  
  // Design data
  frontDesign: FabricCanvasState | null;
  backDesign: FabricCanvasState | null;
  currentView: 'front' | 'back';
  
  // Actions
  setProduct: (product: Product) => void;
  setColor: (color: ProductColor) => void;
  setSize: (size: string) => void;
  setFrontDesign: (design: FabricCanvasState) => void;
  setBackDesign: (design: FabricCanvasState) => void;
  toggleView: () => void;
  clearDesign: () => void;
  exportDesign: () => DesignExport;
}
```

### Fabric Canvas State

Fabric.js maintains its own canvas state, but we serialize/deserialize for persistence:

```typescript
interface FabricCanvasState {
  version: string;
  objects: FabricObject[]; // Serialized from canvas.toJSON()
  background: string;
}

interface FabricObject {
  type: 'text' | 'image' | 'rect' | 'circle' | 'path';
  // Standard Fabric.js properties
  left: number;
  top: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  fill?: string;
  stroke?: string;
  // Type-specific properties
  [key: string]: any;
}
```

## Front and Back Design Storage

Each design surface (front/back) is stored independently:

1. **Separate Canvas Instances**: The editor maintains two Fabric.js canvas states
2. **View Toggle**: User switches between front/back views
3. **Independent Serialization**: Each view serializes to JSON separately
4. **State Persistence**: Both designs stored in Zustand store
5. **Preview Generation**: Both views rendered for final preview

```typescript
// Example state
{
  frontDesign: {
    version: "5.3.0",
    objects: [
      { type: "text", text: "FRONT TEXT", ... },
      { type: "image", src: "data:image/png;base64...", ... }
    ]
  },
  backDesign: {
    version: "5.3.0",
    objects: [
      { type: "text", text: "BACK TEXT", ... }
    ]
  },
  currentView: "front"
}
```

## Product/Color/Size Representation

### Type Definitions

```typescript
interface Product {
  id: string;
  name: string;
  category: 'tshirt' | 'hoodie' | 'jogger';
  basePrice: number;
  description: string;
  colors: ProductColor[];
  sizes: string[];
  printArea: {
    front: PrintArea;
    back: PrintArea;
  };
  thumbnail: string;
}

interface ProductColor {
  name: string;
  hex: string;
  frontMockup: string; // Path to front mockup in this color
  backMockup: string;  // Path to back mockup in this color
}

interface PrintArea {
  width: number;
  height: number;
  unit: 'inches' | 'cm';
}
```

### Selection Flow

1. User selects product from catalog → stores `selectedProduct`
2. Editor page loads → displays color selector
3. User selects color → stores `selectedColor`, updates mockup background
4. User selects size → stores `selectedSize`
5. User designs → stores canvas state
6. Preview page → combines all selections with design data

## Future Backend Connection

This frontend is designed to be **completely independent** from Shopify and any backend. When a backend is eventually built, the integration points will be:

### API Integration Points

```typescript
// Product catalog
GET /api/products → Replace mock products.json

// Design submission (future - not in Phase 1)
POST /api/orders {
  productId: string;
  color: string;
  size: string;
  frontDesign: FabricCanvasState;
  backDesign: FabricCanvasState;
  customerInfo: CustomerInfo;
  pricing: PricingBreakdown;
}

// Image upload (for custom images in designs)
POST /api/uploads → Upload user images for design
```

### Migration Strategy

1. **Create API Service Layer** (`src/services/api.ts`)
   - Abstract all data fetching
   - Currently returns mock data
   - Later replaced with real API calls

2. **Environment Configuration**
   - `VITE_API_BASE_URL` for backend endpoint
   - `VITE_USE_MOCK_DATA` flag for development

3. **Data Validation**
   - Type guards ensure API responses match TypeScript types
   - Validation layer for user input

4. **Image Handling**
   - Currently: base64 encoding in canvas state
   - Future: Upload images to backend, store URLs
   - Canvas will reference hosted image URLs

The frontend works standalone with mock data and requires no Shopify, backend, database, or authentication for Phase 1.

## Build and Deployment

### Development
```bash
npm run dev  # Vite dev server on http://localhost:5173
```

### Production Build
```bash
npm run build  # Outputs to /dist
```

### Future Deployment
The built static files from `/dist` will be:
- Served under `/custom` route on main domain
- Integrated with main Shopify store navigation
- Products completely independent from Shopify catalog
- Backend API separately deployed (when built)

## Phase 1 Scope

This phase focuses on building and visually testing the frontend locally:

**Included:**
- ✅ Custom Catalog with product grid
- ✅ Product selection and navigation
- ✅ Product Editor with Fabric.js canvas
- ✅ Front/Back view switching
- ✅ Color and size selectors
- ✅ Upload image tool
- ✅ Add/edit text tool
- ✅ Move/resize/rotate/delete objects
- ✅ Printable area guides
- ✅ Live product mockup preview
- ✅ Local mock product data (products.json)
- ✅ Layer panel

**Not Included (Future Phases):**
- ❌ Cart functionality
- ❌ Preview/confirmation page
- ❌ Shape tools
- ❌ Backend API
- ❌ Database
- ❌ Order submission
- ❌ Authentication
- ❌ Payment processing
- ❌ Deployment
- ❌ Shopify integration
- ❌ Google Forms/Sheets

## Implementation Approach

**Phase 1A: Catalog Only**
- Build and test the catalog page in isolation
- Verify product display, filtering, and navigation
- Stop for visual inspection before continuing

**Phase 1B: Editor (After Catalog Approval)**
- Build the editor page with all design tools
- Integrate Fabric.js canvas
- Implement front/back switching
- Complete all editing functionality

## Performance Considerations

- **Code Splitting**: React.lazy() for route-based splitting
- **Image Optimization**: Product mockups served as optimized WebP/AVIF
- **Canvas Performance**: Fabric.js object caching, RAF-based rendering
- **State Updates**: Zustand's selective subscription prevents unnecessary re-renders
- **Bundle Size**: Tree-shaking, minification via Vite

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

Fabric.js requires HTML5 Canvas support.
