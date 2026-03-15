# Phase 0: Product Audit and Freeze

## Status
- Phase: 0 (Audit and Freeze)
- Date: 2026-03-15
- Scope: Product domain centralization groundwork
- Result: Inventory completed, migration matrix created, freeze rules defined

## Goals Completed
- Built product-related file inventory for frontend and backend.
- Defined migration decision categories for each file.
- Defined freeze rules to prevent more divergence during migration.
- Mapped initial target module structure for centralized system.

## Decision Labels
- KEEP: Keep as-is for now (already aligns or low risk).
- KEEP_ADAPTER: Keep temporarily but only as compatibility wrapper.
- MIGRATE: Actively refactor into centralized module.
- DELETE_POST_CUTOVER: Remove after replacement is live and validated.
- REVIEW: Needs deeper review before decision (security/business logic coupling).

## Freeze Rules (Effective Immediately)
1. No new product logic in page/component files unless routed through centralized Product SDK target.
2. No new price/discount calculations in UI components.
3. No direct media URL heuristics in UI components for new code.
4. No hardcoded runtime category/subcategory/tag lists for product pages.
5. Any product API change must include DTO update and matrix note.
6. Legacy files marked DELETE_POST_CUTOVER must not receive feature work.

## Centralized Target Modules (Reference)
- Frontend target root: src/modules/product/
- Backend target root: backend/domain/product/

### Frontend Target Buckets
- api
- types
- selectors (pricing/media/badges)
- store/hooks
- adapters (temporary)

### Backend Target Buckets
- repository
- service
- pricing.service
- media.service
- taxonomy.service
- admin.service
- dto/validators

## Inventory Summary

### Frontend Product Scope (Primary)
- Services: product, category, admin product, admin discount analytics
- Hooks: useProducts, useProductSEO
- Pages: Products, ProductDetails, Checkout, Admin, DiscountManagement
- Components: product cards, product detail modules, cart/checkout-related product display, add-to-cart
- Contexts: CurrencyContext, CartContext, ProductsNavigationContext
- Legacy/static: data/products.ts, legacy/ProductsModernVariant.tsx, itsbits/productData.ts

### Backend Product Scope (Primary)
- Models: Product, Category, Currency, Order
- Routes: productRoutes, categoryRoutes, currencyRoutes, paymentRoutes, adminProductRoutes
- Controllers: product, category, currency, payment, adminProduct
- Validation/helpers/scripts: discountValidation, discountExpirationHandler, migrate/check scripts

## High-Risk Duplication Areas to Resolve in Phase 1+
1. Price and discount logic duplicated in cards/details/checkout/backend.
2. Media strategy inconsistent between DB fields and UI heuristics.
3. Product DTO shape and fallback mapping differs by page/component.
4. Currency display vs settlement rules are split across layers.

## Deliverables Created in Phase 0
- This file: docs/PHASE0_PRODUCT_AUDIT_AND_FREEZE.md
- Migration matrix: docs/PHASE0_PRODUCT_MIGRATION_MATRIX.md

## Exit Criteria for Phase 0 (Met)
- Inventory exists.
- Freeze rules documented.
- File-level migration matrix documented.
- Next implementation phase is unblocked.

## Next Step
Start Phase 1 implementation:
- Build backend centralized product domain scaffolding.
- Introduce unified product DTO response contract.
- Add temporary adapters for existing routes.
