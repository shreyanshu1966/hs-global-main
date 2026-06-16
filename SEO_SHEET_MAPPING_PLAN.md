# Plan: Map the SEO Sheet → Backend/DB → Pages

**Sheet:** `All in One HSGlobal & Etsy Data Update - Live Website HS Global Export.csv`
**Date:** 2026-06-16

## What the sheet contains
Columns: `url | New Url | H1 Tag | Title | Desc | Keyword | IMg URL | Canonical Tag`
322 data rows (72 blank-url rows ignored):
- **229 product** rows (`/product/<slug>`) — **61 have a different "New Url"** (a shorter, cleaner slug)
- **15 category/listing** rows (`/products`, `/products/<category>`)
- **6 static** rows (`/`, `/about`, `/gallery`, `/services`→`/shipping`, `/contact`, `/blog`)
- 208 rows carry a curated Title

**The sheet does two jobs:**
1. **Curated SEO copy** per page (H1, Title, meta Desc, Keywords, OG image, Canonical).
2. **Slug cleanup** — "New Url" shortens 61 product URLs (e.g. `…white-marble-bathtub-freestanding-luxury-stone-tub-calacatta-viola…` → `/product/white-marble-bathtub`). Each is a URL change that needs a **301 old→new**.

## Mapping: sheet column → destination

| Sheet column | Product (DB `Product.seo`) | Category | Static page |
|---|---|---|---|
| Title | `metaTitle` | `seo.metaTitle` (new) | `PageSeo.title` (new) |
| Desc | `metaDescription` | `seo.metaDescription` | `PageSeo.description` |
| H1 Tag | `h1Tag` | `seo.h1` | `PageSeo.h1` |
| Keyword | `keywords[]` | `seo.keywords[]` | `PageSeo.keywords[]` |
| IMg URL | `ogImage` | `seo.ogImage` | `PageSeo.image` |
| Canonical | `canonicalUrl` (= New Url) | `seo.canonicalUrl` | `PageSeo.canonical` |
| New Url (≠url) | rename `productId`/`seo.slug` + add Redirect old→new | — | — |

- **Products** already have a rich `seo` subdoc in `backend/models/Product.js` (metaTitle, metaDescription, keywords, h1Tag, ogImage, canonicalUrl, …). **Next already reads it** (`getProduct` → `generateMetadata` uses `seo.metaTitle` etc.) — so importing into the DB makes product pages use the curated copy automatically. ✅
- **Category** (`backend/models/Category.js`) has **no SEO fields** → add a `seo` subdoc.
- **Static pages** have no DB model → add a small **`PageSeo`** collection keyed by path.
- **Slug changes** → add a **`Redirect`** collection (`from`, `to`, 301) consumed by Next middleware.

## Phased plan

### Phase A — Parse + dry-run report (no writes)
- `backend/scripts/import-seo-sheet.js` using a real CSV parser (`csv-parse`) — the file has commas/newlines inside quoted fields, so naive split fails.
- Classify each row by `url` (product / category / static); match products by slug = last path segment → `productId`.
- **Report:** matched products, **unmatched slugs** (in sheet, not in DB), slug-change count, rows missing Title/Desc, category & static rows, any New Url collisions.
- Output a CSV/JSON diff for review before any write.

### Phase B — Schema additions (backend)
- `Category.js`: add `seo { metaTitle, metaDescription, h1, keywords[], ogImage, canonicalUrl }`.
- New `PageSeo` model: `{ path (unique), h1, title, description, keywords[], image, canonical }`.
- New `Redirect` model: `{ from (unique), to, code:301 }`.
- API read endpoints: `GET /api/page-seo/:path`, `GET /api/categories/:slug` (incl. seo), `GET /api/redirects`.

### Phase C — Import (idempotent, after `mongodump` backup)
- Products: set `seo.{metaTitle, metaDescription, h1Tag, keywords, ogImage, canonicalUrl}` from the row. Canonical = New Url (or current url if unchanged).
- **Slug change (61):** only if approved — set new `productId`/`seo.slug`, and insert `Redirect(oldSlug → newSlug)`. Keep old slug resolvable via redirect.
- Categories → upsert `seo`. Static → upsert `PageSeo`.
- Run dry-run → apply; re-runnable without duplicating.

### Phase D — Wire Next.js to the data
- **Products:** already wired — verify `ProductDetails` renders `seo.h1Tag` as the `<h1>`.
- **Categories:** `getCategory(slug)` server fetch → `generateMetadata` + `<h1>` from `seo` (replaces today's hardcoded category meta).
- **Static pages:** `getPageSeo(path)` server fetch → `generateMetadata` + `<h1>` (replaces hardcoded). Home/about/etc.
- **Redirects:** `middleware.ts` looks up the `Redirect` map (cached) → 301 old→new. Sitemap emits **new** URLs only; internal links use new slugs.

### Phase E — Validate
- Crawl staging: every page's Title/Desc/H1/canonical == sheet; all 61 old product URLs return **301 → new**; no orphan/duplicate canonicals.
- Search Console: submit updated sitemap; watch for the slug changes to re-index.

## Risks & decisions
- **Changing 61 product slugs is a real SEO event** — must 301 every old→new or lose any existing equity, and update all internal links + sitemap. *Safer alternative: import only the SEO copy now and keep current slugs; do the slug cleanup as a separate, deliberate step.*
- CSV must be parsed with a proper parser (quoted commas/newlines).
- Canonical must point to the **new self URL**, never the old.
- Unmatched sheet slugs (not in DB) → skip + report, don't guess.

## ❓ Decision needed before building
1. **Slug cleanup?** Import SEO copy **only** (keep current slugs) — low risk — OR also apply the 61 New-Url slug changes with 301s — higher value, higher risk.
2. **Where do category/static SEO live** — DB (editable later via admin) per this plan, or hardcoded in the Next routes (simpler, but not editable)?
