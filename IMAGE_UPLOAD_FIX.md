# Brown & Grey Marble Pedestal Sink - Image Upload Fix

## Issue
The "Brown & Grey Marble Pedestal Sink" product images were not displaying on the website because they existed locally but had not been uploaded to Cloudinary.

## Root Cause
- Product images existed in: `frontend/src/assets/furnitures/Wash Basins/Pedestal/Brown & Grey Marble Pedestal Sink/`
- Product data existed in: `frontend/src/data/furnitureSpecs.ts` (lines 948-962)
- Images were **NOT** uploaded to Cloudinary
- Images were **NOT** mapped in `product-cloudinary-urls.json`

## Solution Implemented

### 1. Created Upload Script
Created `scripts/upload-single-product.js` to upload specific product images to Cloudinary.

**Key Features:**
- Uploads all images from a specific product directory
- Sanitizes paths by replacing `&` with `and` (Cloudinary requirement)
- Updates the `product-cloudinary-urls.json` mapping file
- Provides detailed upload statistics

### 2. Uploaded Images
Successfully uploaded 3 images:
- `1.webp` → https://res.cloudinary.com/dpztytsoz/image/upload/v1768888270/hs-global/products/furnitures/Wash%20Basins/Pedestal/Brown%20and%20Grey%20Marble%20Pedestal%20Sink/1.jpg
- `IMG-20250604-WA0004.webp` → https://res.cloudinary.com/dpztytsoz/image/upload/v1768888271/hs-global/products/furnitures/Wash%20Basins/Pedestal/Brown%20and%20Grey%20Marble%20Pedestal%20Sink/IMG-20250604-WA0004.jpg
- `IMG-20250604-WA0024.webp` → https://res.cloudinary.com/dpztytsoz/image/upload/v1768888273/hs-global/products/furnitures/Wash%20Basins/Pedestal/Brown%20and%20Grey%20Marble%20Pedestal%20Sink/IMG-20250604-WA0024.jpg

### 3. Updated Cloudinary Utility
Modified `frontend/src/utils/productCloudinary.ts` to:
- Handle path sanitization (`&` → `and`)
- Try both original and sanitized paths when looking up URLs
- Automatically construct correct Cloudinary URLs for fallback cases

## Files Modified
1. **Created:** `scripts/upload-single-product.js` - New upload script
2. **Modified:** `frontend/src/utils/productCloudinary.ts` - Added path sanitization logic
3. **Updated:** `product-cloudinary-urls.json` - Added 3 new image mappings

## How to Use the Upload Script

To upload images for any product in the future:

```bash
# Edit the script to change the PRODUCT_PATH variable
# Then run:
node scripts/upload-single-product.js
```

Or to upload ALL product images:

```bash
node scripts/upload-products-to-cloudinary.js
```

## Verification
The images are now:
- ✅ Uploaded to Cloudinary
- ✅ Mapped in `product-cloudinary-urls.json`
- ✅ Accessible via the website
- ✅ Properly handled by the `productCloudinary.ts` utility

## Next Steps
1. Refresh the website to see the images
2. Clear browser cache if needed
3. For future products with special characters in names, use the upload script to ensure proper sanitization

## Notes
- Cloudinary does not accept `&` in public_id paths
- The script automatically converts `&` to `and`
- The mapping file stores both the original path (with `&`) and the Cloudinary URL (with `and`)
- The utility function handles the conversion automatically
