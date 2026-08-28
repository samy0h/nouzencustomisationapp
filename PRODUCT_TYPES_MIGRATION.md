# Product Types Management - Migration Guide

## Overview
Product types are now fully manageable like categories - you can create, view, and delete custom product types through the admin settings panel.

## Database Changes

### New Model: ProductType
```prisma
model ProductType {
  id        String    @id @default(uuid())
  name      String    @unique
  slug      String    @unique
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  products  Product[]
}
```

### Updated Product Model
- Removed: `ProductType` enum
- Added: `typeId` field (optional relation to ProductType)
- Changed: `type` field from enum to String (for backward compatibility)

## Migration Steps

### 1. Apply Prisma Schema Changes
```bash
cd server
npx prisma migrate dev --name add_product_type_model
```

This will:
- Create the new `ProductType` table
- Add `typeId` field to `Product` table
- Change `type` from enum to string

### 2. Run Data Migration Script
```bash
cd server
npx tsx src/scripts/migrateProductTypes.ts
```

This script will:
- Create default product types (T-Shirt, Hoodie, Polo, Jogger, Tote Bag, Cap, Other)
- Migrate existing products to use the new ProductType relationships
- Map old enum values (TSHIRT, HOODIE, etc.) to new type names

### 3. Regenerate Prisma Client
```bash
cd server
npx prisma generate
```

### 4. Restart the Server
```bash
cd server
npm run dev
```

## New Features

### Admin Settings Page (`/admin/settings`)

**Manage Product Types:**
- ✅ View all product types
- ✅ Create new custom types
- ✅ Delete unused types (protected if products exist)
- ✅ Auto-generated slugs from type names

### Product Editor
- Type dropdown now shows custom types from database
- No more hardcoded enum values
- Types sync automatically with admin settings

## API Endpoints

### Get All Product Types
```
GET /api/product-types
```

Response:
```json
{
  "status": "success",
  "data": {
    "productTypes": [
      { "id": "...", "name": "T-Shirt", "slug": "t-shirt" },
      { "id": "...", "name": "Hoodie", "slug": "hoodie" }
    ]
  }
}
```

### Create Product Type
```
POST /api/product-types
Content-Type: application/json

{
  "name": "Sweatshirt",
  "slug": "sweatshirt"
}
```

### Delete Product Type
```
DELETE /api/product-types/:id
```

Note: Returns error if products are using this type.

## Usage

### Creating Custom Product Types

1. Go to `/admin/settings`
2. Scroll to "Product Types" section
3. Enter type name (e.g., "Sweatshirt")
4. Click "Add Type"
5. Slug is auto-generated (e.g., "sweatshirt")

### Using Custom Types

1. Create/edit a product
2. Select from "Type" dropdown
3. Your custom types appear alongside default types
4. Save the product

### Deleting Product Types

1. Go to `/admin/settings`
2. Click "Delete" next to the type
3. Confirm deletion
4. **Note:** Cannot delete if products are using it

## Default Types (Seeded)

After migration, these types are available:
- T-Shirt
- Hoodie  
- Polo
- Jogger
- Tote Bag
- Cap
- Other

## Files Modified

### Backend
1. `server/prisma/schema.prisma` - Added ProductType model, updated Product
2. `server/src/routes/productTypeRoutes.ts` - New routes for type management
3. `server/src/index.ts` - Registered product type routes
4. `server/src/scripts/migrateProductTypes.ts` - Migration script

### Frontend
1. `src/pages/AdminSettings.tsx` - Added product type management UI
2. `src/pages/AdminProductEditor.tsx` - Dynamic type dropdown
3. `src/types/index.ts` - May need to update ProductType type definition

## Troubleshooting

### Migration Script Fails
- Ensure Prisma schema is applied first: `npx prisma migrate dev`
- Check database connection in `.env`
- Verify Prisma client is generated: `npx prisma generate`

### Cannot Delete Type
- Check if products are using this type
- Reassign products to another type first
- Then delete the unused type

### Types Not Showing in Dropdown
- Restart the server after migration
- Check browser console for API errors
- Verify `/api/product-types` endpoint returns data

## Rollback (If Needed)

If you need to rollback:

1. Revert schema changes:
```bash
cd server
git checkout HEAD -- prisma/schema.prisma
npx prisma migrate dev
```

2. Restore old enum approach in code
3. Remove product type routes and UI

## Testing Checklist

- [ ] Run migration successfully
- [ ] View default types in admin settings
- [ ] Create a new custom type
- [ ] Create product using custom type
- [ ] Edit product and change type
- [ ] Try to delete type with products (should fail)
- [ ] Delete product, then delete type (should succeed)
- [ ] Verify old products still display correctly
- [ ] Test catalog filtering by product type

## Summary

Product types are now fully dynamic and manageable through the admin panel, just like categories. The old hardcoded enum approach has been replaced with a flexible database-driven system that allows you to create any product types you need for your store.
