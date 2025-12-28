# Image Optimization & Cloudinary Upload Guide

This guide explains how to optimize and upload all your images to Cloudinary using the automated script.

## 📋 Overview

The `optimize-and-upload-all.js` script performs the following tasks:

1. **Scans** all directories for images (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`)
2. **Optimizes** images using Sharp with smart quality settings
3. **Uploads** optimized images to Cloudinary
4. **Generates** URL mapping files for easy integration

## 🎯 Features

### Smart Optimization

The script automatically applies different optimization settings based on image type:

| Image Type | Quality | Max Width | Max Height | Pattern |
|------------|---------|-----------|------------|---------|
| **Hero/Banner** | 80% | 1920px | 1080px | hero, banner, export, solutions |
| **Gallery** | 75% | 1400px | 1400px | gallery |
| **Products** | 80% | 1600px | 1600px | collection, furniture, slab |
| **Logos** | 90% | 800px | 800px | logo, icon |
| **Default** | 75% | 1600px | 1600px | all others |

### Key Benefits

- ✅ **Reduces file sizes** by 60-80% while maintaining quality
- ✅ **Converts to WebP** for optimal compression
- ✅ **Maintains aspect ratios** automatically
- ✅ **Parallel uploads** for faster processing
- ✅ **Automatic retries** on upload failures
- ✅ **Organized folder structure** on Cloudinary
- ✅ **Detailed progress reporting**

## 🚀 Quick Start

### Prerequisites

1. **Cloudinary Account**: Sign up at [cloudinary.com](https://cloudinary.com)
2. **Environment Variables**: Add to `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Get these from: [Cloudinary Console](https://cloudinary.com/console)

### Installation

Ensure dependencies are installed:

```bash
npm install
```

Required packages:
- `sharp` - Image optimization
- `cloudinary` - Cloudinary SDK
- `dotenv` - Environment variables

## 📝 Usage

### Option 1: Run Complete Process (Recommended)

This runs optimization and upload in one command:

```bash
npm run images:all
```

### Option 2: Run Steps Separately

**Step 1: Optimize Images Only**
```bash
npm run images:optimize
```

**Step 2: Upload Optimized Images**
```bash
npm run images:upload
```

### Option 3: Direct Script Execution

```bash
node scripts/optimize-and-upload-all.js
```

## 📂 Directory Structure

### Source Directories (Scanned)

```
frontend/
├── public/
│   ├── gallery/
│   │   ├── Wash Basins/
│   │   ├── Antiques/
│   │   ├── Bowls/
│   │   └── ...
│   ├── logo.webp
│   ├── gallery-hero.webp
│   └── ...
└── src/
    └── assets/
        ├── Collection/
        └── furnitures/
```

### Cloudinary Folder Structure

Images are organized on Cloudinary as:

```
hs-global/
├── gallery/
│   ├── Wash Basins/
│   ├── Antiques/
│   └── ...
├── products/
│   ├── Collection/
│   └── furnitures/
└── misc/
    ├── logo
    └── ...
```

## 📊 Output Files

The script generates three mapping files:

### 1. `cloudinary-urls.json`
Gallery images mapping
```json
{
  "generated": "2025-12-28T12:00:00.000Z",
  "cloudName": "your_cloud_name",
  "stats": { ... },
  "urls": {
    "frontend/public/gallery/image.webp": {
      "original": "frontend/public/gallery/image.webp",
      "cloudinary": "https://res.cloudinary.com/...",
      "publicId": "hs-global/gallery/image",
      "format": "webp",
      "width": 1200,
      "height": 800,
      "bytes": 45678
    }
  }
}
```

### 2. `product-cloudinary-urls.json`
Product/collection images mapping (same format as above)

### 3. `all-cloudinary-urls.json`
Complete mapping of all images

## 🔧 Configuration

Edit `scripts/optimize-and-upload-all.js` to customize:

### Source Directories

```javascript
sourceDirs: [
    path.join(__dirname, '../frontend/public'),
    path.join(__dirname, '../frontend/src/assets'),
    // Add more directories here
],
```

### Optimization Settings

```javascript
optimization: {
    hero: {
        quality: 80,        // 1-100
        maxWidth: 1920,     // pixels
        maxHeight: 1080,    // pixels
        effort: 6           // 0-6 (higher = better compression)
    },
    // ... other settings
}
```

### Upload Settings

```javascript
upload: {
    concurrency: 5,     // Parallel uploads
    retries: 3,         // Retry attempts
    retryDelay: 2000,   // ms between retries
}
```

## 📈 Progress Monitoring

The script provides real-time feedback:

```
🔍 Validating configuration...
✓ Connected to Cloudinary: your_cloud_name
✓ Temporary directory: temp-optimized

🔎 Scanning for images...
  Scanning: frontend/public
  Scanning: frontend/src/assets
✓ Found 150 images

🎨 Optimizing images...
  ✓ hero-banner.jpg [hero]
    3.5 MB → 200 KB (94.3% reduction)
  ✓ gallery-image.png [gallery]
    500 KB → 80 KB (84.0% reduction)
  ...

☁️  Uploading to Cloudinary...
  ✓ hero-banner.webp
    → https://res.cloudinary.com/...
  ...

💾 Saving URL mappings...
  ✓ Gallery mappings: cloudinary-urls.json
  ✓ Product mappings: product-cloudinary-urls.json
  ✓ All mappings: all-cloudinary-urls.json

🧹 Cleaning up temporary files...
  ✓ Removed: temp-optimized

📊 FINAL REPORT
Image Processing:
  Found: 150
  Optimized: 148
  Uploaded: 148
  Errors: 2

Size Optimization:
  Original size: 62.84 MB
  Optimized size: 18.5 MB
  Savings: 44.34 MB (70.6%)

Cloudinary Upload:
  Total uploaded: 18.5 MB
  Gallery images: 85
  Product images: 63

Duration: 125.3s
```

## 🎨 Using Cloudinary URLs in Your Code

### Example: Gallery Component

```javascript
import galleryMappings from '../../../cloudinary-urls.json';

function Gallery() {
  const getCloudinaryUrl = (localPath) => {
    const mapping = galleryMappings.urls[localPath];
    return mapping?.cloudinary || localPath;
  };

  return (
    <img 
      src={getCloudinaryUrl('frontend/public/gallery/image.webp')}
      alt="Gallery item"
    />
  );
}
```

### Example: Product Component

```javascript
import productMappings from '../../../product-cloudinary-urls.json';

function Product({ imagePath }) {
  const mapping = productMappings.urls[imagePath];
  
  return (
    <img 
      src={mapping?.cloudinary || imagePath}
      width={mapping?.width}
      height={mapping?.height}
      alt="Product"
    />
  );
}
```

## 🔍 Troubleshooting

### Issue: "Cloudinary credentials not found"

**Solution**: Ensure `backend/.env` contains:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Issue: "No images found to process"

**Solution**: 
- Check that images exist in `frontend/public` or `frontend/src/assets`
- Verify file extensions are supported (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`)

### Issue: Upload failures

**Solution**:
- Check internet connection
- Verify Cloudinary credentials are correct
- Check Cloudinary account quota
- The script will automatically retry failed uploads 3 times

### Issue: Out of memory errors

**Solution**:
- Reduce `upload.concurrency` in config (default: 5)
- Process images in batches by temporarily limiting source directories

## 📦 Cloudinary Free Tier Limits

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25 credits/month

The script reports your usage after completion.

## 🎯 Best Practices

1. **Backup First**: Keep original images in a backup folder
2. **Test Locally**: Review optimized images before uploading
3. **Monitor Usage**: Check Cloudinary console regularly
4. **Update Code**: Use generated mapping files for easy integration
5. **Version Control**: Add `temp-optimized/` to `.gitignore`

## 📚 Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [WebP Format Guide](https://developers.google.com/speed/webp)

## 🆘 Support

If you encounter issues:

1. Check the error messages in the console
2. Review the generated mapping files
3. Verify Cloudinary console for uploaded images
4. Check the script logs for detailed information

## 📝 Next Steps After Upload

1. ✅ Review uploaded images: [Cloudinary Media Library](https://cloudinary.com/console/media_library)
2. ✅ Check URL mappings in generated JSON files
3. ✅ Update your code to use Cloudinary URLs
4. ✅ Test locally: `cd frontend && npm run dev`
5. ✅ Set up Cloudflare CDN (see `CLOUDINARY_CLOUDFLARE_SETUP.md`)
6. ✅ Deploy to production

---

**Created**: 2025-12-28  
**Version**: 1.0.0  
**Author**: HS Global Development Team
