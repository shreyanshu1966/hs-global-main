# Public Root Images - Cloudinary Upload

## Overview

This script uploads images from the `frontend/public` **root directory only** (not subdirectories) to Cloudinary.

## Images Uploaded

The following 13 images from `frontend/public/` root:

### Hero/Banner Images
- `about-hero.webp` - About page hero
- `banner.webp` - Main banner
- `banner4.webp` - Alternative banner
- `export.webp` - Export section image
- `gallery-hero.webp` - Gallery page hero
- `granite-solutions.webp` - Granite solutions image
- `marble-solutions.webp` - Marble solutions image
- `products-hero.webp` - Products page hero
- `service.webp` - Service image
- `services-hero.webp` - Services page hero

### Logos
- `logo.webp` - Main logo
- `logo_transparent.webp` - Transparent logo
- `etsy_logo.webp` - Etsy logo

## Cloudinary Organization

All images are uploaded to:
```
hs-global/public/
├── about-hero
├── banner
├── banner4
├── etsy_logo
├── export
├── gallery-hero
├── granite-solutions
├── logo
├── logo_transparent
├── marble-solutions
├── products-hero
├── service
└── services-hero
```

## Usage

### Run the Script

```bash
npm run images:public-root
```

### What It Does

1. ✅ Scans `frontend/public/` root directory only
2. ✅ Optimizes images (hero: 80%, logos: 90% quality)
3. ✅ Uploads to `hs-global/public/` on Cloudinary
4. ✅ Generates `public-root-cloudinary-urls.json` mapping file

## Results

### Size Optimization

- **Original Size**: 19.37 MB
- **Optimized Size**: 1.78 MB
- **Savings**: 17.59 MB (90.8% reduction!)
- **Uploaded to Cloudinary**: 2.04 MB

### Mapping File

Location: `public-root-cloudinary-urls.json`

Example entry:
```json
{
  "logo.webp": {
    "original": "logo.webp",
    "cloudinary": "https://res.cloudinary.com/dpztytsoz/image/upload/v.../hs-global/public/logo.png",
    "publicId": "hs-global/public/logo",
    "format": "png",
    "width": 800,
    "height": 800,
    "bytes": 18580
  }
}
```

## How to Use in Code

### Example: Update Logo

**Before:**
```javascript
<img src="/logo.webp" alt="Logo" />
```

**After:**
```javascript
import publicUrls from '../../../public-root-cloudinary-urls.json';

const logoUrl = publicUrls.urls['logo.webp'].cloudinary;

<img src={logoUrl} alt="Logo" />
```

### Example: Create Utility Function

```javascript
// utils/publicImages.ts
import publicUrls from '../../public-root-cloudinary-urls.json';

export function getPublicImageUrl(filename: string): string {
  const mapping = publicUrls.urls[filename];
  return mapping?.cloudinary || `/${filename}`;
}

// Usage
import { getPublicImageUrl } from './utils/publicImages';

<img src={getPublicImageUrl('logo.webp')} alt="Logo" />
```

## Why Separate Script?

The main `images:all` script processes:
- `frontend/public/gallery/` - Gallery images
- `frontend/src/assets/Collection/` - Product collections
- `frontend/src/assets/furnitures/` - Furniture products

This script specifically handles:
- `frontend/public/*.webp` - Root-level public images only

## Optimization Settings

| Image Type | Quality | Max Size | Pattern |
|------------|---------|----------|---------|
| Hero/Banner | 80% | 1920×1080 | hero, banner, export, solutions |
| Logos | 90% | 800×800 | logo |
| Default | 80% | 1600×1600 | others |

## Files

- **Script**: `scripts/upload-public-root-images.js`
- **Mapping**: `public-root-cloudinary-urls.json`
- **Cloudinary Folder**: `hs-global/public/`

## Next Steps

1. ✅ Images uploaded to Cloudinary
2. ✅ Mapping file generated
3. 📝 Update your code to use Cloudinary URLs
4. 🧪 Test locally: `cd frontend && npm run dev`

---

**Status**: ✅ Complete  
**Date**: 2025-12-28  
**Images**: 13 uploaded  
**Savings**: 90.8% size reduction
