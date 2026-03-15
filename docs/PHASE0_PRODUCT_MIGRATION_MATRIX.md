# Phase 0: Product Migration Matrix

## Legend
- Decision: KEEP | KEEP_ADAPTER | MIGRATE | DELETE_POST_CUTOVER | REVIEW
- Target Module: Centralized module destination

## Frontend Matrix

| Area | File | Current Role | Decision | Target Module | Notes |
|---|---|---|---|---|---|
| Service | frontend/src/services/productService.ts | Public product API client | MIGRATE | src/modules/product/api/publicProductApi.ts | Replace with centralized API client and DTO |
| Service | frontend/src/services/categoryService.ts | Category service | KEEP_ADAPTER | src/modules/product/api/taxonomyApi.ts | Temporary wrapper during migration |
| Service | frontend/src/services/adminProductService.ts | Admin product CRUD and media upload | MIGRATE | src/modules/product/api/adminProductApi.ts | Merge with unified admin product API |
| Service | frontend/src/services/adminDiscountAnalyticsService.ts | Discount/admin analytics APIs | MIGRATE | src/modules/product/api/adminPricingApi.ts | Keep discounts under pricing domain |
| Hook | frontend/src/hooks/useProducts.ts | Product listing/detail fetch hooks | MIGRATE | src/modules/product/store/useProductQueries.ts | Remove direct branch logic from page-level |
| Hook | frontend/src/hooks/useProductSEO.ts | Product SEO metadata assembly | KEEP_ADAPTER | src/modules/product/selectors/seoSelectors.ts | Move to selector layer later |
| Context | frontend/src/contexts/CurrencyContext.tsx | Display currency rates and conversion | MIGRATE | src/modules/product/pricing/currencyContext.tsx | Keep display conversion only |
| Context | frontend/src/contexts/CartContext.tsx | Cart state and totals | MIGRATE | src/modules/product/cart/cartStore.ts | Keep INR base, centralize selectors |
| Context | frontend/src/contexts/ProductsNavigationContext.tsx | Product navigation context | REVIEW | src/modules/product/navigation/* | Verify still needed after routing cleanup |
| Page | frontend/src/pages/Products.tsx | Product listing page | MIGRATE | src/modules/product/pages/ProductsPage.tsx | Use centralized queries/selectors |
| Page | frontend/src/pages/ProductDetails.tsx | Product detail page | MIGRATE | src/modules/product/pages/ProductDetailsPage.tsx | Remove local pricing/media transformations |
| Page | frontend/src/pages/Checkout.tsx | Checkout UI and order initiation | MIGRATE | src/modules/product/checkout/CheckoutPage.tsx | Use backend authoritative line totals only |
| Page | frontend/src/pages/CheckoutSuccess.tsx | Checkout success | KEEP | same | Minor integration adjustments only |
| Page | frontend/src/pages/Admin.tsx | Admin mixed page | MIGRATE | src/modules/product/admin/AdminProductPage.tsx | Split product admin concerns |
| Page | frontend/src/pages/DiscountManagement.tsx | Discount admin page | MIGRATE | src/modules/product/admin/DiscountManagementPage.tsx | Connect to centralized pricing admin API |
| Component | frontend/src/components/cards/ProductCard.tsx | Primary card rendering, price/media logic | MIGRATE | src/modules/product/components/ProductCard.tsx | Remove inline discount/media heuristics |
| Component | frontend/src/components/ProductCard.tsx | Alternate product card | DELETE_POST_CUTOVER | replaced by unified card | Consolidate card variants |
| Component | frontend/src/components/PremiumProductCard.tsx | Premium card variant | KEEP_ADAPTER | src/modules/product/components/ProductCard.tsx | Keep as skin variant only |
| Component | frontend/src/components/LazyProductCard.tsx | Lazy card wrapper | KEEP | same | Keep if performance still needed |
| Component | frontend/src/components/product/ProductGallery.tsx | Detail media gallery | MIGRATE | src/modules/product/components/ProductGallery.tsx | Use centralized media selectors |
| Component | frontend/src/components/product/ProductInfo.tsx | Detail price/info rendering | MIGRATE | src/modules/product/components/ProductInfo.tsx | Consume centralized pricing selectors |
| Component | frontend/src/components/product/ProductOverview.tsx | Detail section | KEEP | same | Data source update only |
| Component | frontend/src/components/product/ProductSpecifications.tsx | Detail specs | MIGRATE | src/modules/product/components/ProductSpecifications.tsx | Map canonical specs model |
| Component | frontend/src/components/product/ProductStory.tsx | Detail narrative | KEEP | same | Keep presentational |
| Component | frontend/src/components/product/RelatedProducts.tsx | Related products UI | MIGRATE | src/modules/product/components/RelatedProducts.tsx | Consume centralized related DTO |
| Component | frontend/src/components/product/ProductReviews.tsx | Reviews in detail page | REVIEW | same + review module | Product scope adjacent; keep boundary clean |
| Component | frontend/src/components/AddToCartButton.tsx | Add-to-cart action + tracking | MIGRATE | src/modules/product/cart/AddToCartButton.tsx | Remove ad-hoc price reads |
| Component | frontend/src/components/AddedToCartNotification.tsx | cart feedback | KEEP | same | Presentation only |
| Component | frontend/src/components/CartDrawer.tsx | Cart drawer UI | MIGRATE | src/modules/product/cart/CartDrawer.tsx | Consume centralized cart selectors |
| Component | frontend/src/components/CartIcon.tsx | Cart icon counter | KEEP | same | Wire to new cart store |
| Component | frontend/src/components/FloatingCartButton.tsx | Mobile cart button | KEEP | same | Wire to new cart store |
| Component | frontend/src/components/ProductImageManager.tsx | Admin media image manager | MIGRATE | src/modules/product/admin/media/ImageManager.tsx | Align with media schema |
| Component | frontend/src/components/ProductVideoManager.tsx | Admin video manager | MIGRATE | src/modules/product/admin/media/VideoManager.tsx | Use stored videoUrl/source |
| Component | frontend/src/components/ProductSpecsEditor.tsx | Admin specs editor | MIGRATE | src/modules/product/admin/specs/SpecsEditor.tsx | Align with canonical spec schema |
| Component | frontend/src/components/EnhancedProductForm.tsx | Admin product form | MIGRATE | src/modules/product/admin/forms/ProductForm.tsx | Use unified DTO contract |
| Component | frontend/src/components/ProductDetailsSkeleton.tsx | Skeleton UI | KEEP | same | Presentation only |
| Component | frontend/src/components/cards/ProductCardSkeleton.tsx | Card skeleton | KEEP | same | Presentation only |
| Data | frontend/src/data/products.ts | Legacy static product/taxonomy data | DELETE_POST_CUTOVER | none | Replace runtime usage with API facets |
| Data | frontend/src/components/itsbits/productData.ts | Legacy itsbits product source | DELETE_POST_CUTOVER | none | Migrate to centralized SDK |
| Legacy | frontend/src/components/legacy/ProductsModernVariant.tsx | Legacy listing variant | MIGRATE | src/modules/product/pages/ProductsModernVariantPage.tsx | Rebuild with centralized store |
| Utility | frontend/src/utils/productCloudinary.ts | Product media URL helper | KEEP_ADAPTER | src/modules/product/media/mediaUrl.ts | Keep as adapter during transition |
| Utility | frontend/src/utils/currency.ts | Currency helper | REVIEW | pricing utils | Check overlap with CurrencyContext |

## Backend Matrix

| Area | File | Current Role | Decision | Target Module | Notes |
|---|---|---|---|---|---|
| Model | backend/models/Product.js | Canonical product model + discount helpers | MIGRATE | backend/domain/product/model/productModel.js | Keep schema, move business logic to service layer |
| Model | backend/models/Category.js | Category model | MIGRATE | backend/domain/product/model/categoryModel.js | Expand taxonomy support for tags/subcategories |
| Model | backend/models/Currency.js | Currency rates model | KEEP | same | May move under pricing domain namespace later |
| Model | backend/models/Order.js | Order model for checkout | KEEP | same | Integrate pricing line contract only |
| Route | backend/routes/productRoutes.js | Public product APIs | MIGRATE | backend/domain/product/routes/publicRoutes.js | Keep current route paths via adapter |
| Route | backend/routes/categoryRoutes.js | Category APIs | MIGRATE | backend/domain/product/routes/taxonomyRoutes.js | Include tags/facets endpoint |
| Route | backend/routes/adminProductRoutes.js | Admin product APIs | MIGRATE | backend/domain/product/routes/adminRoutes.js | Consolidate admin operations |
| Route | backend/routes/currencyRoutes.js | Currency rates endpoint | KEEP | same | Keep stable endpoint contract |
| Route | backend/routes/paymentRoutes.js | Cart total and create-order | MIGRATE | backend/domain/product/routes/pricingRoutes.js + payment routes | Extract product pricing validation core |
| Controller | backend/controllers/productController.js | Listing/detail/search/categories | MIGRATE | backend/domain/product/controllers/publicController.js | Move to services/repository split |
| Controller | backend/controllers/categoryController.js | Category CRUD/listing | MIGRATE | backend/domain/product/controllers/taxonomyController.js | Add tags and hierarchy management |
| Controller | backend/controllers/adminProductController.js | Admin CRUD, media, discounts | MIGRATE | backend/domain/product/controllers/adminController.js | Split admin CRUD/media/discount concerns |
| Controller | backend/controllers/paymentController.js | Checkout pricing and PayPal order logic | MIGRATE | backend/domain/product/pricing/pricingService.js + payment controller | Retain payment orchestration; centralize product pricing calc |
| Controller | backend/controllers/currencyController.js | Currency API cache/fallback | KEEP | same | Stable and already centralized |
| Middleware | backend/middleware/discountValidation.js | Discount validation | MIGRATE | backend/domain/product/pricing/discountValidation.js | Integrate with unified pricing service |
| Utility | backend/utils/discountExpirationHandler.js | Discount expiry operations | MIGRATE | backend/domain/product/pricing/discountLifecycle.js | Move under pricing lifecycle |
| Service | backend/services/paymentValidation.js | Payment security validation | KEEP | same | Product-pricing inputs to be centralized |
| Service | backend/services/paymentMonitoring.js | Payment observability | KEEP | same | Keep separate from product domain |
| Script | backend/migrate-products.js | Legacy migration seed script | DELETE_POST_CUTOVER | replace with new migration scripts | Keep until centralized schema migration done |
| Script | backend/migrate-full.js | Full migration script | DELETE_POST_CUTOVER | replace with domain migration scripts | Keep until data backfill final |
| Script | backend/check-products.js | Product diagnostics | KEEP_ADAPTER | backend/domain/product/scripts/checkProducts.js | Move namespace later |
| Script | backend/check-discount-indexes.js | Discount index diagnostics | KEEP_ADAPTER | backend/domain/product/scripts/checkPricingIndexes.js | Rename after migration |
| Script | backend/ensure-discount-indexes.js | Ensure discount indexes | KEEP_ADAPTER | backend/domain/product/scripts/ensurePricingIndexes.js | Keep for production safety |
| Script | backend/fix-expired-discounts.js | Cleanup expired discounts | KEEP_ADAPTER | backend/domain/product/scripts/fixExpiredDiscounts.js | Keep until lifecycle job in place |
| Script | backend/test-product-crud.js | Product CRUD test script | REVIEW | tests/product/* | Convert to automated test suite |
| Script | backend/test-discount-system.js | Discount behavior test | REVIEW | tests/pricing/* | Convert to automated tests |
| Script | backend/test-discount-query.js | Discount query test | REVIEW | tests/pricing/* | Convert to automated tests |
| Script | backend/delete-invalid-product.js | Data cleanup script | REVIEW | maintenance scripts | Keep if still used operationally |
| Batch | backend/run-product-crud-test.bat | test runner batch | REVIEW | maintenance | Remove if JS test scripts replaced |
| Batch | backend/run-test-discount.bat | test runner batch | REVIEW | maintenance | Remove if JS test scripts replaced |
| Batch | backend/run-discount-cleanup.bat | cleanup batch | KEEP_ADAPTER | maintenance | Keep until scheduled lifecycle automation |

## Immediate No-Change Freeze List (Do Not Add Features Here)
- frontend/src/data/products.ts
- frontend/src/components/itsbits/productData.ts
- frontend/src/components/legacy/ProductsModernVariant.tsx
- frontend/src/components/ProductCard.tsx
- backend/migrate-products.js
- backend/migrate-full.js

## Phase 1 Input Artifacts
Use this matrix to open implementation tickets in this order:
1. Backend product domain scaffolding and adapters.
2. Frontend Product SDK scaffolding and adapters.
3. Pricing centralization hooks/selectors and backend service extraction.
4. Media centralization with canonical DTO.
5. Taxonomy + tags centralization.
6. Legacy deletions after parity.
