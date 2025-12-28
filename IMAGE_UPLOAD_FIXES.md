# Image Upload Script Fixes

## Issues Fixed

### 1. **Duplicate Folder Structure** ❌ → ✅
**Before:**
```
hs-global/products/hs-global/products/Collection/Granite/...
```

**After:**
```
hs-global/products/Collection/Granite/Alaska/Alaska Pink/...
```

**Fix:** Updated `getCloudinaryFolder()` function to properly extract the subfolder path starting from `Collection` or `furnitures` (inclusive) without duplication.

### 2. **Wrong Original Path Format** ❌ → ✅
**Before:**
```json
"original": "C:\\Users\\rames\\Downloads\\hs-global-main\\hs-global-main\\frontend\\src\\assets\\Collection\\Granite\\Alaska\\Alaska Pink\\alaska-pink1.webp"
```

**After:**
```json
"original": "Collection/Granite/Alaska/Alaska Pink/alaska-pink1.webp"
```

**Fix:** Created `getRelativeOriginalPath()` function that:
- Finds the `Collection`, `furnitures`, or `gallery` folder in the path
- Returns the path starting from that folder
- Uses forward slashes for consistency

### 3. **Collection vs furnitures Handling** ❌ → ✅
**Before:** Both were treated the same way, causing confusion

**After:** 
- `Collection` images → `Collection/...`
- `furnitures` images → `furnitures/...`
- Both upload to `hs-global/products/...` on Cloudinary

## Expected Output Format

### For Collection Images
```json
{
  "Collection/Granite/Alaska/Alaska Pink/alaska-pink1.webp": {
    "original": "Collection/Granite/Alaska/Alaska Pink/alaska-pink1.webp",
    "cloudinary": "https://res.cloudinary.com/dpztytsoz/image/upload/v1766859704/hs-global/products/Collection/Granite/Alaska/Alaska%20Pink/alaska-pink1.jpg",
    "publicId": "hs-global/products/Collection/Granite/Alaska/Alaska Pink/alaska-pink1",
    "format": "jpg",
    "width": 1280,
    "height": 960,
    "bytes": 232935
  }
}
```

### For Furnitures Images
```json
{
  "furnitures/Wash Basins/Pedestal/test.webp": {
    "original": "furnitures/Wash Basins/Pedestal/test.webp",
    "cloudinary": "https://res.cloudinary.com/dpztytsoz/image/upload/v1766859704/hs-global/products/furnitures/Wash%20Basins/Pedestal/test.jpg",
    "publicId": "hs-global/products/furnitures/Wash Basins/Pedestal/test",
    "format": "jpg",
    "width": 800,
    "height": 600,
    "bytes": 45678
  }
}
```

### For Gallery Images
```json
{
  "gallery/Wash Basins/IMG-001.webp": {
    "original": "gallery/Wash Basins/IMG-001.webp",
    "cloudinary": "https://res.cloudinary.com/dpztytsoz/image/upload/v1766859704/hs-global/gallery/Wash%20Basins/IMG-001.jpg",
    "publicId": "hs-global/gallery/Wash Basins/IMG-001",
    "format": "jpg",
    "width": 1200,
    "height": 800,
    "bytes": 89012
  }
}
```

## Code Changes

### New Function: `getRelativeOriginalPath()`
```javascript
function getRelativeOriginalPath(filePath) {
    const parts = filePath.split(path.sep);
    
    // Find Collection or furnitures index
    const collectionIndex = parts.findIndex(p => p === 'Collection');
    const furnituresIndex = parts.findIndex(p => p === 'furnitures');
    const galleryIndex = parts.findIndex(p => p.toLowerCase() === 'gallery');
    
    if (collectionIndex >= 0) {
        return parts.slice(collectionIndex).join('/');
    } else if (furnituresIndex >= 0) {
        return parts.slice(furnituresIndex).join('/');
    } else if (galleryIndex >= 0) {
        return 'gallery/' + parts.slice(galleryIndex + 1).join('/');
    }
    
    return path.basename(filePath);
}
```

### Updated Function: `getCloudinaryFolder()`
```javascript
function getCloudinaryFolder(filePath) {
    const pathLower = filePath.toLowerCase();
    const parts = filePath.split(path.sep);
    
    // Handle Collection images - INCLUDE "Collection" in the path
    if (pathLower.includes('collection')) {
        const collectionIndex = parts.findIndex(p => p === 'Collection');
        if (collectionIndex >= 0 && collectionIndex < parts.length - 1) {
            // Include "Collection" in the Cloudinary path
            const subPath = parts.slice(collectionIndex, -1).join('/');
            return `${CONFIG.cloudinary.folder_prefix}/products/${subPath}`;
        }
        return `${CONFIG.cloudinary.folder_prefix}/products/Collection`;
    }
    
    // Handle furnitures images - INCLUDE "furnitures" in the path
    if (pathLower.includes('furniture')) {
        const furnituresIndex = parts.findIndex(p => p === 'furnitures');
        if (furnituresIndex >= 0 && furnituresIndex < parts.length - 1) {
            // Include "furnitures" in the Cloudinary path
            const subPath = parts.slice(furnituresIndex, -1).join('/');
            return `${CONFIG.cloudinary.folder_prefix}/products/${subPath}`;
        }
        return `${CONFIG.cloudinary.folder_prefix}/products/furnitures`;
    }
    
    // ... gallery and other handlers
}
```

### Updated Mapping Storage
```javascript
// Get relative path for mapping key
const relativeOriginal = getRelativeOriginalPath(originalPath);

// Store in appropriate mapping
const mapping = {
    original: relativeOriginal,  // ✅ Now uses relative path
    cloudinary: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes
};

// Use relative path as key
urlMappings.products[relativeOriginal] = mapping;
```

## How to Re-run Upload

To upload all images with the corrected format:

```bash
# Run the fixed script
npm run images:all
```

This will:
1. ✅ Find all images in `frontend/public` and `frontend/src/assets`
2. ✅ Optimize them (60-80% size reduction)
3. ✅ Upload to Cloudinary with correct folder structure
4. ✅ Generate mapping files with correct path format

## Verification

After running, check `product-cloudinary-urls.json`:

```json
{
  "generated": "2025-12-28T...",
  "cloudName": "dpztytsoz",
  "stats": { ... },
  "urls": {
    "Collection/Granite/Alaska/Alaska Pink/alaska-pink1.webp": {
      "original": "Collection/Granite/Alaska/Alaska Pink/alaska-pink1.webp",
      "cloudinary": "https://res.cloudinary.com/.../hs-global/products/Collection/Granite/Alaska/Alaska%20Pink/alaska-pink1.jpg",
      "publicId": "hs-global/products/Collection/Granite/Alaska/Alaska Pink/alaska-pink1",
      ...
    }
  }
}
```

✅ **All paths now include Collection/furnitures in the Cloudinary URL!**

---

**Status:** Fixed and ready to use  
**Date:** 2025-12-28  
**Script:** `scripts/optimize-and-upload-all.js`
