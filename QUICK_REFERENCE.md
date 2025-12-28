# 🚀 Quick Reference: Adding Images & Products

**Quick commands and folder locations for adding content to HS Global website**

---

## 📸 Gallery Images

### Add New Gallery Image
```bash
# 1. Add image to category folder
cp your-image.webp "frontend/public/gallery/Your Category/"

# 2. Upload to Cloudinary
node scripts/optimize-images.js
node scripts/upload-to-cloudinary.js

# 3. Test
npm run dev
# Visit: http://localhost:5173/gallery
```

**Folder:** `frontend/public/gallery/[Category Name]/`

---

## 🪨 Slab Products (Marble, Granite, etc.)

### Add New Granite Product
```bash
# 1. Create product folder
mkdir -p "frontend/src/assets/Collection/Granite/Alaska/Product Name"

# 2. Add images
cp image1.webp "frontend/src/assets/Collection/Granite/Alaska/Product Name/"
cp image2.webp "frontend/src/assets/Collection/Granite/Alaska/Product Name/"

# 3. Add stand image (optional)
mkdir "frontend/src/assets/Collection/Granite/Alaska/Product Name/stand"
cp stand.webp "frontend/src/assets/Collection/Granite/Alaska/Product Name/stand/"

# 4. Upload to Cloudinary
node scripts/upload-products-to-cloudinary.js

# 5. Test
npm run dev
# Visit: http://localhost:5173/products → Slabs → Granite
```

### Add New Marble Product
```bash
# 1. Create product folder
mkdir -p "frontend/src/assets/Collection/Marble/Product Name"

# 2. Add images
cp *.webp "frontend/src/assets/Collection/Marble/Product Name/"

# 3. Upload to Cloudinary
node scripts/upload-products-to-cloudinary.js
```

**Folders:**
- Granite: `frontend/src/assets/Collection/Granite/[Subcategory]/[Product]/`
- Marble: `frontend/src/assets/Collection/Marble/[Product]/`
- Onyx: `frontend/src/assets/Collection/Onyx/[Product]/`
- Sandstone: `frontend/src/assets/Collection/Sandstone/[Product]/`
- Travertine: `frontend/src/assets/Collection/Travertine/[Product]/`

---

## 🪑 Furniture Products

### Add New Coffee Table
```bash
# 1. Create product folder
mkdir -p "frontend/src/assets/furnitures/Tables/Coffee Table/Product Name"

# 2. Add images (numbered for order)
cp main-image.webp "frontend/src/assets/furnitures/Tables/Coffee Table/Product Name/1.webp"
cp side-image.webp "frontend/src/assets/furnitures/Tables/Coffee Table/Product Name/2.webp"
cp detail-image.webp "frontend/src/assets/furnitures/Tables/Coffee Table/Product Name/3.webp"

# 3. Upload to Cloudinary
node scripts/upload-products-to-cloudinary.js

# 4. Test
npm run dev
# Visit: http://localhost:5173/products → Furniture → Tables → Coffee Table
```

### Add Pricing (Optional)
Edit: `frontend/src/data/furnitureSpecs.ts`
```typescript
{
  product: "Table",
  name: "Product Name",
  priceINR: 45000,
  dimensions: "120cm x 60cm x 45cm",
  weight: "80 kg",
  material: "Marble",
  finish: "Polished"
}
```

**Folders:**
- Tables: `frontend/src/assets/furnitures/Tables/[Subcategory]/[Product]/`
- Wash Basins: `frontend/src/assets/furnitures/Wash Basins/[Subcategory]/[Product]/`
- Sculptures: `frontend/src/assets/furnitures/Sculptures/[Product]/`
- Others: `frontend/src/assets/furnitures/[Category]/[Product]/`

---

## 🔄 Common Commands

### Upload to Cloudinary
```bash
# Gallery images
node scripts/optimize-images.js
node scripts/upload-to-cloudinary.js

# Product images
node scripts/upload-products-to-cloudinary.js
```

### Test Locally
```bash
cd frontend
npm run dev
# Visit: http://localhost:5173
```

### Build for Production
```bash
cd frontend
npm run build
```

### Deploy to VPS
```bash
# Upload dist folder to VPS
scp -r frontend/dist/* user@vps-ip:/var/www/hs-global/

# Or use Git
ssh user@vps-ip
cd /var/www/hs-global
git pull
cd frontend && npm run build
```

---

## 📁 Folder Structure Quick Reference

```
frontend/
├── public/
│   └── gallery/                    # Gallery images
│       ├── Antiques/
│       ├── Bowls/
│       ├── Coffee Table/
│       └── [Your Category]/
│
└── src/
    ├── assets/
    │   ├── Collection/             # Slab products
    │   │   ├── Granite/
    │   │   │   ├── Alaska/
    │   │   │   │   └── [Product]/
    │   │   │   │       ├── image1.webp
    │   │   │   │       └── stand/
    │   │   │   │           └── stand.webp
    │   │   │   ├── Exclusive Indian/
    │   │   │   ├── Imported Colours/
    │   │   │   └── North Granite/
    │   │   ├── Marble/
    │   │   │   └── [Product]/
    │   │   ├── Onyx/
    │   │   ├── Sandstone/
    │   │   └── Travertine/
    │   │
    │   └── furnitures/             # Furniture products
    │       ├── Tables/
    │       │   ├── Coffee Table/
    │       │   │   └── [Product]/
    │       │   │       ├── 1.webp
    │       │   │       ├── 2.webp
    │       │   │       └── 3.webp
    │       │   ├── Console Table/
    │       │   ├── Dining Table/
    │       │   ├── Side Table/
    │       │   └── Center Table/
    │       ├── Wash Basins/
    │       │   ├── Pedestal/
    │       │   └── Countertop/
    │       ├── Sculptures/
    │       ├── Benches/
    │       ├── Bowls/
    │       └── Others/
    │
    └── data/
        └── furnitureSpecs.ts       # Furniture pricing
```

---

## ⚡ Workflow Cheat Sheet

### Adding Gallery Image
1. Add to `frontend/public/gallery/[Category]/`
2. Run: `node scripts/upload-to-cloudinary.js`
3. Test: `npm run dev`
4. Deploy: `npm run build` → Upload to VPS

### Adding Slab Product
1. Add to `frontend/src/assets/Collection/[Category]/[Product]/`
2. Run: `node scripts/upload-products-to-cloudinary.js`
3. Test: `npm run dev`
4. Deploy: `npm run build` → Upload to VPS

### Adding Furniture Product
1. Add to `frontend/src/assets/furnitures/[Category]/[Product]/`
2. (Optional) Add pricing to `furnitureSpecs.ts`
3. Run: `node scripts/upload-products-to-cloudinary.js`
4. Test: `npm run dev`
5. Deploy: `npm run build` → Upload to VPS

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Images not showing | Re-upload: `node scripts/upload-to-cloudinary.js` |
| Product not appearing | Check folder structure, restart dev server |
| Wrong image order | Rename to `1.webp`, `2.webp`, `3.webp` |
| Pricing not showing | Add to `furnitureSpecs.ts`, rebuild |
| Cloudinary error | Check `backend/.env` credentials |

---

## 📚 Full Documentation

- **Complete Guide:** `ADDING_PRODUCTS_GUIDE.md`
- **Cloudinary Setup:** `CLOUDINARY_CLOUDFLARE_SETUP.md`
- **Migration Guide:** `PRODUCT_CLOUDINARY_MIGRATION.md`
- **Quick Start:** `QUICK_START.md`

---

**💡 Tip:** Bookmark this file for quick reference when adding products!
