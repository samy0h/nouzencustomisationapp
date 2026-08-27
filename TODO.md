# Implementation Checklist

## Phase 1A: Catalog Page (Implement First)

### Project Setup

- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS
- [ ] Install dependencies:
  - [ ] react-router-dom
  - [ ] heroicons or lucide-react
- [ ] Configure path aliases (@/ → src/)
- [ ] Set up ESLint and Prettier
- [ ] Create basic folder structure
- [ ] Create `.env` file for configuration

### Type Definitions (Catalog Only)

- [ ] Create `src/types/product.ts`
  - [ ] Product interface
  - [ ] ProductColor interface
  - [ ] PrintArea interface
  - [ ] Category type

### Mock Data

- [ ] Create `public/mock-data/products.json`
  - [ ] T-Shirt Standard product
  - [ ] T-Shirt Oversized product
  - [ ] Hoodie product
  - [ ] Jogger product
  - [ ] Each with: id, name, category, price, description, colors, sizes, printArea, thumbnail
  - [ ] Colors must have: name, hex, frontMockup, backMockup
- [ ] Create placeholder product images
  - [ ] Thumbnail images for catalog (can use placeholder service initially)

### Shared Components (Minimal)

- [ ] Create `src/components/shared/Button.tsx`
  - [ ] Primary variant
  - [ ] Secondary variant
- [ ] Create `src/components/shared/Card.tsx`

### Layout Components (Minimal)

- [ ] Create `src/components/layout/Header.tsx`
  - [ ] Simple header with "CUSTOM" branding
- [ ] Create `src/components/layout/Container.tsx`
  - [ ] Max-width wrapper

### Catalog Page Components

- [ ] Create `src/hooks/useProductData.ts`
  - [ ] Fetch products from mock JSON
  - [ ] Loading state
  - [ ] Error handling
- [ ] Create `src/components/catalog/ProductCard.tsx`
  - [ ] Display product thumbnail
  - [ ] Display product name
  - [ ] Display starting price
  - [ ] "Customize" button
  - [ ] Hover effects
- [ ] Create `src/components/catalog/ProductGrid.tsx`
  - [ ] Responsive grid layout (1-4 columns)
  - [ ] Map products to ProductCards
- [ ] Create `src/components/catalog/CategoryFilter.tsx`
  - [ ] Filter buttons: All, T-Shirts, Hoodies, Joggers
  - [ ] Active state styling
  - [ ] Filter logic
- [ ] Create `src/pages/CatalogPage.tsx`
  - [ ] Integrate Header
  - [ ] Hero section with title and subtitle
  - [ ] Category filter
  - [ ] Product grid
  - [ ] Navigation to editor on product select (link only, no editor yet)

### Basic Routing Setup

- [ ] Create `src/App.tsx` with React Router
  - [ ] Route: `/custom` → CatalogPage
  - [ ] Route: `/custom/editor/:productId` → Placeholder page for now
- [ ] Test navigation from catalog to editor route

### Testing & Polish (Catalog Only)

- [ ] Manual testing: Catalog page
  - [ ] All products display correctly
  - [ ] Filters work
  - [ ] Product cards look good on mobile/tablet/desktop
  - [ ] Clicking "Customize" navigates to editor route
- [ ] Responsive testing
  - [ ] Mobile viewport (< 640px)
  - [ ] Tablet viewport (640-1024px)
  - [ ] Desktop viewport (> 1024px)

### STOP HERE - Visual Inspection Checkpoint
✋ **Do not proceed until catalog is approved**

---

## Phase 1B: Editor Page (Implement After Catalog Approval)

### Additional Dependencies

- [ ] Install Fabric.js
  - [ ] fabric
  - [ ] @types/fabric (if available)
- [ ] Install Zustand
  - [ ] zustand

### Type Definitions (Editor)

- [ ] Create `src/types/design.ts`
  - [ ] FabricCanvasState interface
  - [ ] FabricObject interface
- [ ] Create `src/types/editor.ts`
  - [ ] EditorTool enum
  - [ ] ViewMode type ('front' | 'back')
  - [ ] LayerItem interface

### State Management

- [ ] Create `src/store/useDesignStore.ts`
  - [ ] Product selection state
  - [ ] Color/size selection state
  - [ ] Front/back design state
  - [ ] Current view toggle
  - [ ] Actions: setProduct, setColor, setSize, etc.
  - [ ] clearDesign function

### Additional Shared Components

- [ ] Create `src/components/shared/Select.tsx`

### Editor - Canvas Setup

- [ ] Create `src/hooks/useFabricCanvas.ts`
  - [ ] Initialize Fabric.js canvas
  - [ ] Set canvas dimensions based on print area
  - [ ] Set background image (product mockup)
  - [ ] Return canvas instance and utility functions
  - [ ] Cleanup on unmount
- [ ] Create `src/utils/fabricHelpers.ts`
  - [ ] Helper: Add text to canvas
  - [ ] Helper: Add image to canvas
  - [ ] Helper: Serialization (toJSON/fromJSON)
  - [ ] Helper: Object manipulation (move/resize/rotate/delete)
- [ ] Create `src/components/editor/Canvas.tsx`
  - [ ] Render canvas element
  - [ ] Use useFabricCanvas hook
  - [ ] Display product mockup as background
  - [ ] Show print area guides (dashed border)
  - [ ] Handle object selection
  - [ ] Save canvas state to Zustand on changes

### Editor - Toolbar

- [ ] Create `src/components/editor/TextTools.tsx`
  - [ ] "Add Text" button
  - [ ] Font size input
  - [ ] Bold/Italic toggles
  - [ ] Text color picker (basic)
- [ ] Create `src/components/editor/ImageTools.tsx`
  - [ ] "Upload Image" button
  - [ ] File input handler
  - [ ] Convert to base64 for canvas
  - [ ] Add to canvas
- [ ] Create `src/components/editor/Toolbar.tsx`
  - [ ] Vertical sidebar layout
  - [ ] Integrate TextTools
  - [ ] Integrate ImageTools
  - [ ] Section dividers

### Editor - Layer Panel

- [ ] Create `src/components/editor/LayerPanel.tsx`
  - [ ] List all canvas objects as layers
  - [ ] Show layer type (text/image)
  - [ ] Visibility toggle per layer
  - [ ] Delete button per layer
  - [ ] Click layer to select on canvas
  - [ ] Display object properties when selected:
    - [ ] Position (X, Y)
    - [ ] Size (W, H)
    - [ ] Rotation
    - [ ] Opacity

### Editor - View Toggle

- [ ] Create `src/components/editor/ViewToggle.tsx`
  - [ ] "Front" button
  - [ ] "Back" button
  - [ ] Active state styling
  - [ ] Toggle between front/back designs
  - [ ] Save current view before switching
  - [ ] Load saved view after switching
  - [ ] Update mockup image on switch

### Editor - Product Options

- [ ] Create color selector component
  - [ ] Display available colors for selected product
  - [ ] Color swatches with hex colors
  - [ ] Update mockup image when color changes
  - [ ] Save selection to store
- [ ] Create size selector component
  - [ ] Dropdown with available sizes
  - [ ] Save selection to store

### Editor Page Assembly

- [ ] Create `src/pages/EditorPage.tsx`
  - [ ] Get productId from route params
  - [ ] Load product data from products.json
  - [ ] Layout: Toolbar (left) + Canvas (center) + LayerPanel (right)
  - [ ] Top bar with:
    - [ ] Back button → navigate to catalog
    - [ ] Product name display
  - [ ] Bottom bar with:
    - [ ] View toggle (Front/Back)
    - [ ] Color selector
    - [ ] Size selector
  - [ ] Handle canvas state persistence
  - [ ] Responsive layout for mobile (stacked)

### Utility Functions

- [ ] Create `src/utils/validation.ts`
  - [ ] Validate objects within print area
  - [ ] Validate required selections (color, size)
- [ ] Create `src/constants/index.ts`
  - [ ] Canvas dimensions
  - [ ] Print area margins
  - [ ] Default text properties

### Editor Polish & UX

- [ ] Add loading states
  - [ ] Canvas initialization loading
  - [ ] Image upload loading
- [ ] Add error handling
  - [ ] Product not found
  - [ ] Invalid route params
  - [ ] Image upload errors
  - [ ] Canvas errors
- [ ] Add keyboard shortcuts
  - [ ] Delete selected object (Delete/Backspace)
  - [ ] Deselect (Escape)
- [ ] Add canvas zoom controls
  - [ ] Zoom in/out buttons
  - [ ] Fit to view button

### Testing (Editor)

- [ ] Manual testing: Editor page
  - [ ] Product loads correctly from catalog
  - [ ] Add text to canvas
  - [ ] Edit text properties
  - [ ] Upload and add image
  - [ ] Move objects with mouse
  - [ ] Resize objects with handles
  - [ ] Rotate objects
  - [ ] Delete objects
  - [ ] Toggle front/back views
  - [ ] Layer panel shows objects correctly
  - [ ] Select different colors (mockup updates)
  - [ ] Select different sizes
  - [ ] Navigate back to catalog
- [ ] Responsive testing
  - [ ] Mobile layout works
  - [ ] Tablet layout works
  - [ ] Desktop layout works

---

## NOT IN PHASE 1 (Future)

These items are explicitly postponed:

- ❌ Cart functionality (useCartStore.ts)
- ❌ Shape tools (ShapeTools.tsx)
- ❌ Preview/confirmation page (PreviewPage.tsx)
- ❌ Backend integration
- ❌ API service layer
- ❌ Order submission
- ❌ Design save/load to backend
- ❌ Authentication
- ❌ Payment processing
- ❌ Deployment configuration
- ❌ Advanced features (templates, clipart, filters)
- ❌ Undo/redo history
- ❌ Export functionality

---

## Notes

**Implementation Order:**
1. ✅ Setup → Types → Mock Data → Catalog Components → Catalog Page
2. ⏸️ **STOP for visual inspection**
3. ⏭️ Editor Dependencies → State → Canvas → Tools → Editor Page

**Phase 1A Focus:**
- Get the catalog working and looking good
- Verify product display
- Test responsive layout
- Show to user before continuing

**Phase 1B Focus:**
- Fabric.js canvas with product mockup background
- Text and image tools only (no shapes)
- Front/back switching
- Color/size selection
- Basic layer management
- Move/resize/rotate/delete functionality

**Key Principles:**
- Frontend only - no backend calls
- Products.json is single source of truth
- Products completely independent from Shopify
- Keep it simple and functional
- Test each piece thoroughly

**Estimated Timeline:**
- Phase 1A (Catalog): 1-2 hours
- Phase 1B (Editor): 4-6 hours
- Total Phase 1: ~1 day

