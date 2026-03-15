# Centralized Product System Plan

## 1. Objective
Build a single, centralized product system across backend and frontend that covers:
- Product fetching and product details
- Category and tag management
- Price model, discount model, and currency conversion
- Product media (images, videos, ordering, metadata)
- Admin product CRUD
- Product cards, modern variants, listings, details, cart, and checkout
- Checkout-safe pricing and discount validation
- Removal of legacy/duplicate product code paths

This plan is written as a migration roadmap with controlled cutover and cleanup.

## 2. Current Pain Points (Why Refactor)
- Pricing logic duplicated across cards, details, checkout, and backend payment paths.
- Media logic inconsistent (DB supports media fields, UI derives fallback video paths in components).
- Product DTO shape and fallback mappings vary by page/component.
- Category/subcategory handling split between static/legacy data and API data.
- Discounts validated in multiple places with different rules.
- Checkout has both client-computed and backend-computed totals.

## 3. Target Principles
- One source of truth for product data: backend Product domain + normalized API contracts.
- One source of truth for money calculations: backend pricing engine (frontend display only).
- One source of truth for currency rates: backend currency service + frontend presentation context.
- One source of truth for media ordering and fallback: Product Media service.
- One source of truth for tags/category taxonomy: taxonomy service (DB-driven).
- Frontend reads centralized product store/services only; no local/legacy product data modules.

## 4. Target Architecture

### 4.1 Backend (Domain-Centric)
Create a Product Domain module with clear boundaries:
- `product.repository` (DB access)
- `product.service` (domain orchestration)
- `product.pricing.service` (discount status, effective price, currency-neutral base)
- `product.media.service` (primary image, gallery order, video, CDN URL policy)
- `product.taxonomy.service` (categories, subcategories, tags)
- `product.admin.service` (CRUD + validation + media mutations)

Expose through cohesive route groups:
- Public:
  - `GET /api/products`
  - `GET /api/products/:idOrSlug`
  - `GET /api/products/facets`
- Admin:
  - `GET /api/admin/products`
  - `POST /api/admin/products`
  - `PUT /api/admin/products/:id`
  - `DELETE /api/admin/products/:id`
  - `PUT /api/admin/products/:id/media/order`
  - `PUT /api/admin/products/:id/status`

### 4.2 Frontend (Single Product Data Layer)
Create one frontend Product SDK layer used by all pages/components:
- `src/modules/product/api/*` (query/mutation calls)
- `src/modules/product/types/*` (single Product DTO)
- `src/modules/product/mapper/*` (if needed for backward compatibility)
- `src/modules/product/store/*` (cache/state management)
- `src/modules/product/selectors/*` (effectivePrice, badge state, media pick)

All product UI modules consume selectors from one place:
- Product list and modern variant pages
- Product card variants
- Product detail
- Cart
- Checkout

No component should calculate discount rules directly.

## 5. Target Database Model

### 5.1 Product Collection (Canonical)
Keep one `products` collection with normalized fields:
- Identity:
  - `_id`, `productId`, `slug`, `name`
- Taxonomy:
  - `categoryId`, `subcategoryId`, `tagIds[]`
- Pricing:
  - `basePriceINR`
  - `pricing` object:
    - `discount` object (`enabled`, `percentage`, `startAt`, `endAt`, `label`)
    - `effectivePriceINR` (computed at read-time or persisted via hook/job)
- Availability:
  - `status` (`active|inactive|draft`), `available`
- Media:
  - `media[]` entries (`type`, `url`, `alt`, `sortOrder`, `meta`)
  - `primaryMediaId`
- Specs:
  - `specSchema` (`furniture|slab|custom`)
  - `specs` object
- SEO:
  - canonical SEO fields
- Analytics:
  - view/addToCart counters
- Audit:
  - `createdAt`, `updatedAt`, `createdBy`, `updatedBy`

### 5.2 Taxonomy Collections
Add/normalize:
- `categories`
- `subcategories` (linked to category)
- `tags` (tag registry, slug, displayName, color/icon metadata)

### 5.3 Suggested Indexes
- `products.slug` unique
- `products.productId` unique
- `products.status + products.available`
- `products.categoryId + products.subcategoryId`
- `products.tagIds`
- `products.basePriceINR`
- `products.pricing.discount.enabled + pricing.discount.endAt`
- text/Atlas index on searchable fields

## 6. Centralized Functional Design

### 6.1 Category and Tag Management
- Category/subcategory/tag are DB-managed (no hardcoded frontend taxonomy for runtime).
- Facets endpoint returns category tree + tags + counts.
- Product filtering supports:
  - category
  - subcategory
  - tags (multi-select)
  - price range
  - sort and pagination

### 6.2 Price and Discount
- Backend computes effective price based on discount window.
- Frontend receives:
  - `basePriceINR`
  - `effectivePriceINR`
  - `discountStatus` (`none|scheduled|active|expired`)
  - `discountMeta` (percentage, label, validity)
- Checkout and order creation re-validate all prices from DB and ignore client-submitted prices.

### 6.3 Currency Conversion
- Backend currency service remains source of exchange rates.
- Frontend currency context is display-only and consumes backend rates.
- Payment currency strategy (USD-only for PayPal) remains centralized in payment service.
- UI clearly distinguishes display currency vs settlement currency.

### 6.4 Media
- Product media uses ordered media array (single system for image/video).
- Primary media selection is backend-defined, not component-defined.
- Frontend cards/details consume `primaryMedia` + `galleryMedia` from DTO.
- Remove heuristic video-path generation from components.

### 6.5 Cart and Checkout
- Cart stores only IDs/qty + minimal render cache.
- Checkout always calls backend pricing endpoint for authoritative totals.
- Discount application in checkout UI should use backend-provided computed lines.

## 7. Frontend Scope to Refactor
Must be migrated to centralized Product SDK:
- Product listing (all variants, including modern variant)
- Product cards
- Product details
- Cart
- Checkout
- Admin product screens

## 8. Migration Strategy (Phased)

### Phase 0: Audit and Freeze
- Inventory all product-related files/routes/services.
- Mark files as:
  - Keep
  - Migrate then delete
  - Legacy dead code
- Add a migration checklist doc with file-by-file status.

### Phase 1: Backend Domain Foundation
- Introduce centralized Product domain services.
- Introduce new DTO contract and validation schemas.
- Add taxonomy/tag endpoints.
- Keep existing routes running via adapter wrappers.

### Phase 2: Frontend Product SDK
- Build `src/modules/product/*` data layer.
- Move all pricing/media/tag/category selectors there.
- Add compatibility adapters for old components.

### Phase 3: UI Migration
- Migrate in order:
  1. Product cards
  2. Product listings (modern variant included)
  3. Product detail
  4. Cart
  5. Checkout
  6. Admin CRUD
- After each migration, remove old imports and fallback paths.

### Phase 4: Payment and Pricing Hardening
- Ensure checkout uses only backend-calculated line totals.
- Remove any duplicate frontend pricing calculations except display formatting.
- Add mismatch telemetry logs and monitoring.

### Phase 5: Legacy Removal
- Delete old product data files/services/routes/components after parity checks.
- Remove dead fields and old helper functions no longer used.
- Remove obsolete docs/scripts tied to old flow.

### Phase 6: Verification and Stabilization
- E2E regression tests:
  - list, filters, tags, detail, add-to-cart, discount, checkout
- Admin CRUD tests:
  - create/edit/delete, media reorder, tag assignment
- Data integrity checks and index verification.

## 9. Code and File Cleanup Policy
- Do not bulk-delete blindly.
- For each removed file:
  - confirm no imports/usages
  - confirm replacement path exists
  - record deletion in migration log
- Keep temporary adapters until all consumers are migrated.
- Final cleanup only after full regression pass.

## 10. Deliverables
- Centralized backend Product domain services
- Unified Product DTO contract
- Unified frontend Product SDK
- Taxonomy + tags management
- Unified media model usage
- Server-authoritative checkout pricing path
- Removal of legacy product code/files
- Updated technical docs and migration changelog

## 11. Acceptance Criteria
- One pricing calculation path for business logic (backend).
- One product data contract consumed by all frontend product experiences.
- One media path for cards/details/admin.
- Category/subcategory/tag filtering from DB facets only.
- Cart/checkout totals match backend authoritative totals.
- No old product fetch/price/media utilities remain referenced.

## 12. Implementation Order for This Repo
1. Create migration inventory and map old/new files.
2. Build backend centralized Product domain and DTO v2.
3. Build frontend Product SDK and selectors.
4. Migrate product card + listing (including modern variant).
5. Migrate product detail.
6. Migrate cart + checkout to backend line totals only.
7. Migrate admin CRUD + media + tags.
8. Delete legacy files and adapters.
9. Run full regression and fix residual issues.

## 13. Risks and Mitigation
- Risk: Breaking checkout totals.
  - Mitigation: backend totals as source, staged rollout, fallback guard.
- Risk: Hidden legacy imports.
  - Mitigation: static search and CI fail on legacy module imports.
- Risk: Media regressions.
  - Mitigation: unified media selectors and snapshot checks on key pages.

## 14. Next Step After This Plan
Start Phase 0 immediately:
- Generate file inventory (`product`, `pricing`, `currency`, `media`, `cart`, `checkout`, `admin product`).
- Produce a migration matrix (`old file -> new module -> deletion status`).
- Then begin Phase 1 implementation.
