# Phase 5 Implementation Log - Legacy Cleanup (Incremental)

## Status
In progress (safe deletions completed)

## Objective
Remove legacy product code paths that are no longer referenced, without breaking remaining active consumers.

## Completed in this iteration

### 1. Deleted unused legacy product UI files
- `frontend/src/components/ProductCard.tsx`
- `frontend/src/components/legacy/ProductsModernVariant.tsx`

Rationale:
- Both files had zero active imports in the current workspace.
- Their responsibilities are already covered by centralized/product-card implementations.

### 2. Centralized Admin product CRUD paths
- Updated `frontend/src/pages/Admin.tsx` to use centralized module APIs/types:
  - `adminProductApi` from `frontend/src/modules/product/api`
  - `AdminProduct` and `AdminProductFormData` from `frontend/src/modules/product/types`
- Replaced all legacy admin product calls:
  - `getAdminProducts`, `createProduct`, `updateProduct`, `previewProduct`, `deleteProduct`

### 3. Centralized Discount Management paths
- Updated `frontend/src/pages/DiscountManagement.tsx` to use centralized module APIs/types:
  - `adminPricingApi` from `frontend/src/modules/product/api`
  - `DiscountAnalytics` and `DiscountedProduct` from `frontend/src/modules/product/types`
- Replaced all legacy discount operations:
  - analytics fetch, discounted products fetch, expired cleanup
  - apply/remove all discounts
  - apply/remove bulk discounts
  - remove single product discount

### 4. Removed legacy admin services
- Deleted `frontend/src/services/adminProductService.ts`
- Deleted `frontend/src/services/adminDiscountAnalyticsService.ts`

Rationale:
- Admin product and discount management are now routed through centralized module APIs.
- Legacy wrappers were fully unreferenced after page migration and safe to remove.

## Validation checks run
- Static reference search across `frontend/src/**` confirmed no import dependencies on deleted files.
- Type diagnostics on updated files:
  - `frontend/src/pages/Admin.tsx`
  - `frontend/src/pages/DiscountManagement.tsx`
  - `frontend/src/modules/product/api/adminProductApi.ts`
  - `frontend/src/modules/product/api/adminPricingApi.ts`
  - `frontend/src/modules/product/types/admin.ts`
- Result: no errors found.

## Important findings (cleanup blockers)
The following legacy/static product paths are still actively referenced and cannot be removed yet without migration work:
- `frontend/src/data/products.ts`
- `frontend/src/utils/dynamicCategories.ts`
- Consumers in:
  - `frontend/src/components/ChooseStone.tsx`
  - `frontend/src/components/CategoriesSlider.tsx`
  - `frontend/src/components/SearchModal.tsx`
  - `frontend/src/components/Navigation/TopTabsNav.tsx`
  - `frontend/src/components/LazyProductCard.tsx`
  - `frontend/src/contexts/PhoneVerificationContext.tsx`

## Next cleanup slice
1. Migrate static category consumers (`data/products.ts` + `dynamicCategories.ts`) to API/taxonomy-backed module selectors.
2. Replace remaining legacy `Product` type imports from `data/products.ts` with module/service contracts.
3. Re-run reference scan and delete `data/products.ts` only after zero usage.
