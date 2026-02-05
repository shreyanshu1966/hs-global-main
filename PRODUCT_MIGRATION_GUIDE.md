# Product Database Migration Guide

This guide explains how to migrate products from local files to MongoDB database and use the new API-based product system.

## 🚀 Migration Overview

The migration moves all products data from local TypeScript files to a MongoDB database, providing:

- **Centralized Data Management**: All products stored in MongoDB
- **RESTful API**: Full CRUD operations via REST endpoints
- **Better Performance**: Database queries instead of in-memory processing
- **Scalability**: Easy to add/edit products via API or admin panel
- **Analytics**: Track product views and add-to-cart events

## 📁 New Files Created

### Backend
- `backend/models/Product.js` - Product database model
- `backend/controllers/productController.js` - Product API controllers
- `backend/routes/productRoutes.js` - Product API routes

### Frontend
- `frontend/src/services/productService.ts` - Product API service
- `frontend/src/hooks/useProducts.ts` - React hooks for product data
- `frontend/src/config/index.ts` - API configuration
- `frontend/src/components/ProductsModernVariantNew.tsx` - Updated products page
- `frontend/src/pages/ProductDetailsNew.tsx` - Updated product details page

### Migration
- `scripts/migrate-products.js` - Database migration script

## 🗃️ Database Schema

```javascript
{
  productId: String,           // Unique product identifier
  name: String,                // Product name
  category: String,            // 'furniture' or 'slabs'
  subcategory: String,         // Product subcategory
  description: String,         // Product description
  image: String,              // Primary image URL
  images: [String],           // Array of image URLs
  sortedImages: [String],     // Pre-sorted images for performance
  priceINR: Number,           // Price in Indian Rupees
  available: Boolean,         // Availability status
  hasVideo: Boolean,          // Video availability
  
  // Furniture specific
  furnitureSpecs: {
    product: String,
    type: String,
    shape: String,
    material: String,
    size: String,
    surfaceFinish: String,
    delivery: String,
    height: String,
    colorName: String,
    packagingDetails: String,
    location: String,
    etsyUrl: String
  },
  
  // Slab specific
  slabSpecs: {
    finish: String,
    thickness: String,
    origin: String,
    material: String,
    application: String
  },
  
  // SEO & Metadata
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  
  // Analytics
  viewCount: Number,
  addToCartCount: Number,
  
  // Status
  status: String,             // 'active', 'inactive', 'draft'
  featured: Boolean,
  tags: [String],
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Migration Steps

### 1. Run the Migration Script

```bash
# Navigate to backend directory
cd backend

# Run migration
npm run migrate-products
```

This will:
- Connect to MongoDB
- Create sample furniture and slab products
- Populate all required fields including specs and pricing
- Skip duplicates if products already exist

### 2. Start the Backend Server

```bash
# In backend directory
npm start
```

The server now includes the new product routes at `/api/products/*`

### 3. Update Frontend Environment

Create/update `.env` in the frontend directory:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Start Frontend Development Server

```bash
# In frontend directory
npm run dev
```

The frontend now uses the new API-based product system.

## 📚 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products with pagination/filters |
| GET | `/api/products/search` | Search products |
| GET | `/api/products/featured` | Get featured products |
| GET | `/api/products/categories` | Get categories and subcategories |
| GET | `/api/products/category/:category` | Get products by category |
| GET | `/api/products/:id` | Get single product with related products |
| POST | `/api/products/track/add-to-cart` | Track add to cart for analytics |

### Admin Endpoints (Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Soft delete product |

## 🎯 Usage Examples

### Fetch Products in React

```typescript
import { useProducts } from '../hooks/useProducts';

const ProductList = () => {
  const { products, loading, error } = useProducts({
    category: 'furniture',
    limit: 20,
    page: 1
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.productId}>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <img src={product.image} alt={product.name} />
        </div>
      ))}
    </div>
  );
};
```

### Search Products

```typescript
const { products } = useProducts({
  search: 'granite table',
  category: 'furniture'
});
```

### Get Single Product

```typescript
import { useProduct } from '../hooks/useProducts';

const ProductDetails = ({ productId }) => {
  const { product, relatedProducts, loading } = useProduct(productId);
  
  // Handle loading and display product
};
```

## 🔍 Key Features

### Automatic Analytics
- Product view counts are automatically incremented
- Add-to-cart events are tracked
- No additional code needed in components

### Smart Caching
- React hooks handle caching and state management
- Prevents unnecessary API calls
- Optimistic updates for better UX

### Error Handling
- Comprehensive error states
- Fallback UI for failed requests
- Retry mechanisms

### SEO Optimization
- Automatic meta tags generation
- Structured data for products
- Optimized page titles and descriptions

## 🚨 Breaking Changes

### Component Updates Required

1. **ProductCard**: Now expects `productId` instead of `id`
2. **AddToCartButton**: Includes automatic analytics tracking
3. **Product Pages**: Use new hooks instead of static data imports

### Data Structure Changes

- Product ID is now `productId` instead of `id`
- All products have consistent pricing in `priceINR`
- Specs are structured in `furnitureSpecs`/`slabSpecs` objects
- Images are always arrays for consistency

## 🔧 Admin Features

### Adding New Products

Products can be added via API or directly in the database:

```javascript
// POST /api/products
{
  "productId": "unique-product-id",
  "name": "New Product Name",
  "category": "furniture",
  "subcategory": "Tables",
  "description": "Product description",
  "image": "https://cloudinary.../image.jpg",
  "images": ["https://cloudinary.../image1.jpg", "..."],
  "priceINR": 50000,
  "furnitureSpecs": {
    "material": "Granite",
    "size": "36x36x18 inch"
  }
}
```

### Updating Products

```javascript
// PUT /api/products/:productId
{
  "priceINR": 55000,
  "available": true,
  "featured": true
}
```

### Analytics Dashboard

View product performance:
- Most viewed products
- Most added to cart
- Category performance
- Featured vs non-featured performance

## 🔄 Migration Validation

After migration, verify:

1. **Products Load**: Visit `/products` page
2. **Search Works**: Use search functionality
3. **Product Details**: Click on individual products
4. **Add to Cart**: Test cart functionality
5. **Analytics**: Check database for view/cart counts

## 📝 Sample Data

The migration script includes sample data for:

### Furniture Products
- Coffee Tables (Black Galaxy, Statuario)
- Console Tables
- Dining Tables
- Wash Basins (Pedestal, Countertop)
- Sculptures
- Benches

### Slab Products
- Granite Slabs (Black Galaxy, Alaska Pink)
- Marble Slabs (Statuario, Carrara, Calacatta)

## 🚀 Next Steps

1. **Run Migration**: Execute the migration script
2. **Test System**: Verify all functionality works
3. **Add Real Data**: Replace sample data with actual products
4. **Configure Admin**: Set up admin interface for product management
5. **Monitor Performance**: Watch analytics and optimize as needed

## ⚠️ Troubleshooting

### Migration Issues
- Ensure MongoDB is running
- Check database connection string in `.env`
- Verify all dependencies are installed

### API Issues
- Check backend server is running
- Verify `VITE_API_URL` in frontend `.env`
- Check browser console for errors

### Performance Issues
- Add database indexes for better query performance
- Implement Redis caching for frequently accessed data
- Use CDN for image delivery

---

**Migration Complete!** 🎉 Your products are now managed via database with full API support.