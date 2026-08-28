# Cover Photo Feature Added

## Overview
Added cover photo upload functionality to both the "Create Product" and "Edit Product" pages.

## Changes Made

### 1. Backend Updates

#### [server/src/controllers/productController.ts](server/src/controllers/productController.ts)

**createAdminProduct** - Now accepts `images` array in request body:
```typescript
const { ..., images = [] } = req.body as {
  ...
  images?: string[];
};

// Saves images to product
images: images || [],
```

**updateAdminProduct** - Now accepts and updates `images` field:
```typescript
const { ..., images } = req.body as {
  ...
  images?: string[];
};

// Conditionally updates images if provided
...(images !== undefined && { images }),
```

### 2. Frontend Updates

#### [src/pages/AdminProductEditor.tsx](src/pages/AdminProductEditor.tsx)

**New State Variable**:
```typescript
const [coverPhoto, setCoverPhoto] = useState("");
```

**Create Product Flow**:
- Added cover photo input with file upload
- Preview shows uploaded image
- Sends cover photo as first item in `images` array when creating product

**Edit Product Flow**:
- Loads existing cover photo from `product.images[0]`
- Added cover photo input with file upload
- Preview shows uploaded image
- Updates cover photo when saving changes

**UI Components Added** (in both create and edit forms):
```tsx
<label className="admin-description-field">
  Cover photo (catalog thumbnail)
  <input
    type="file"
    accept="image/*"
    onChange={(event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setCoverPhoto(String(reader.result));
      reader.readAsDataURL(file);
    }}
  />
  {coverPhoto && <img className="admin-size-chart-preview" src={coverPhoto} alt="Cover photo preview" />}
</label>
```

## Features

### Create New Product Page
- **Cover photo upload**: Upload a catalog thumbnail during product creation
- **Live preview**: See the uploaded image immediately
- **Persistent**: Saved with the product when clicking "Create product"

### Edit Product Page
- **Load existing**: Displays current cover photo if one exists
- **Update**: Upload a new cover photo to replace the existing one
- **Live preview**: See changes before saving

## Database Schema

The cover photo is stored in the `Product.images` field:
- Type: `String[]` (array of strings)
- Location: `prisma/schema.prisma` line 29
- Usage: First item in array (`images[0]`) is the main catalog thumbnail

## Usage

1. **Creating a product**:
   - Fill in product details
   - Click "Cover photo (catalog thumbnail)" field
   - Select an image file
   - Preview appears below the input
   - Click "Create product" to save

2. **Editing a product**:
   - Open existing product in editor
   - Current cover photo displays (if exists)
   - Click "Cover photo (catalog thumbnail)" to change
   - Select new image file
   - Preview updates immediately
   - Click "Save changes" to update

## Technical Notes

- Images are converted to base64 data URLs using `FileReader`
- Cover photo is always stored as first element in `images` array
- Preview uses the same CSS class as size chart preview (`.admin-size-chart-preview`)
- File input accepts all image types (`image/*`)
