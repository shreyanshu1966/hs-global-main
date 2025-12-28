# Quick Reference: Image Optimization & Upload

## 🚀 Quick Commands

```bash
# Run complete optimization and upload (RECOMMENDED)
npm run images:all

# Or run steps separately:
npm run images:optimize    # Step 1: Optimize only
npm run images:upload      # Step 2: Upload only
```

## ✅ What the Script Does

1. **Finds** all images in `frontend/public` and `frontend/src/assets`
2. **Optimizes** them (reduces size by 60-80%)
3. **Converts** to WebP format
4. **Uploads** to Cloudinary
5. **Generates** URL mapping files

## 📊 Image Quality Settings

| Type | Quality | Max Size | Pattern |
|------|---------|----------|---------|
| Hero/Banner | 80% | 1920×1080 | hero, banner |
| Gallery | 75% | 1400×1400 | gallery |
| Products | 80% | 1600×1600 | collection, furniture |
| Logos | 90% | 800×800 | logo, icon |

## 📁 Output Files

After running, you'll get:

- `cloudinary-urls.json` - Gallery images
- `product-cloudinary-urls.json` - Product images
- `all-cloudinary-urls.json` - All images

## 🔧 Setup (One-time)

Add to `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Get from: https://cloudinary.com/console

## 📝 Expected Results

- **Original Size**: ~60-100 MB
- **Optimized Size**: ~15-30 MB
- **Savings**: 60-80%
- **Processing Time**: 2-5 minutes (depending on image count)

## 🎯 Next Steps After Upload

1. Check Cloudinary console: https://cloudinary.com/console/media_library
2. Review generated JSON files
3. Update code to use Cloudinary URLs
4. Test locally: `cd frontend && npm run dev`

## 🆘 Troubleshooting

**Error: "Cloudinary credentials not found"**
→ Check `backend/.env` has correct credentials

**Error: "No images found"**
→ Ensure images exist in `frontend/public` or `frontend/src/assets`

**Upload failures**
→ Check internet connection and Cloudinary quota

## 📚 Full Documentation

See `IMAGE_OPTIMIZATION_GUIDE.md` for complete details.

---

**Status**: ✅ Script is currently running...
**Started**: 2025-12-28
