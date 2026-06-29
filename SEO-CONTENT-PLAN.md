# SEO Content Plan — HS Global Export

_Based on the codebase (sitemap, metadata, categories, JSON-LD). The live site blocks crawlers (HTTP 403), so this plan is derived from source._

**Business:** Marble, granite, semi-precious stone, leather & handcrafted furniture — manufacturer & exporter to USA / UK / worldwide.

---

## 1. What you already have (audit)

The **technical SEO foundation is strong** — better than most stores this size. The gap is content, not plumbing.

| Area | Status | Source |
|---|---|---|
| Dynamic `sitemap.xml` (products, categories, blogs, gallery) | ✅ Solid | `frontend-new/app/sitemap.ts` |
| `robots.ts` blocking account/checkout pages | ✅ Correct | `frontend-new/app/robots.ts` |
| Per-page metadata + canonical + OG/Twitter | ✅ Home, category, product, blog | `app/page.tsx`, `app/layout.tsx` |
| JSON-LD: Organization, WebSite+SearchAction, Product, Breadcrumb, FAQPage | ✅ | `app/product/[id]/page.tsx` |
| GA4 installed (`G-LDEFWLFCYY`) | ✅ | `app/layout.tsx` |

**Content gap:** rich taxonomy (4 categories, ~40 subcategories) but only **4 blog articles** and thin top-of-funnel content.

---

## 2. Keyword / topic clusters

Build 4 clusters, each anchored by a pillar (category page) feeding supporting blog posts.

**Cluster A — Marble & Granite Furniture** (core money keyword)
- Pillar: `/products/furniture`
- Targets: "marble furniture manufacturer India", "marble dining table exporter", "granite table USA import", "marble coffee table luxury"

**Cluster B — Semi-Precious Stone**
- Pillar: `/products/semi-precious-stone`
- Targets: "agate table top", "amethyst console table", "semi-precious stone slab interiors", "petrified wood furniture"

**Cluster C — Leather Furniture**
- Pillar: `/products/leather`
- Targets: "handcrafted leather furniture", "leather console table exporter", "luxury leather bench"

**Cluster D — Handcrafted / Buyer-intent**
- Pillar: `/products/handcrafted`
- Targets: "handcrafted furniture import", "custom furniture wholesale India", "furniture exporter for interior designers"

---

## 3. Priority fixes (high impact, low effort — do first)

1. **Category pages need real copy, not just `sr-only` H1.** `products/[category]/page.tsx` renders only a screen-reader H1 above the grid. Add 150–300 words of indexable intro per category (materials, export/customization, who buys). Single biggest win.
2. **Add `ItemList` / `CollectionPage` schema** to category pages — currently none, while product pages have rich schema.
3. **Sub-category pages** (`/products/[category]/[subcategory]`) — ensure unique titles/descriptions + indexable landing copy. "Marble Dining Table", "Agate Bowl" are real long-tail terms.
4. **Add `sameAs` to Organization schema** — `app/page.tsx` has empty `[]`. Link Instagram/LinkedIn/Facebook so Google connects the brand entity.
5. **Static blogs hygiene:** `src/data/staticBlogs.ts` hardcodes `views: 0` and future dates (2026-06-22). Keep dates realistic/current.

---

## 4. Content calendar (12 posts, ~3 months)

Prioritized by commercial intent. Extends the 4 existing posts.

| # | Working title | Cluster | Intent |
|---|---|---|---|
| 1 | Importing Marble Furniture to the USA: Shipping, Duties & Lead Times | A | High (buyer) |
| 2 | Marble Dining Table Buying Guide: Sizes, Edges, Finishes | A | High |
| 3 | Granite vs Marble Furniture: Which Lasts Longer? | A | Mid |
| 4 | How to Care for Marble & Stone Furniture | A | Mid (long-tail) |
| 5 | Agate & Amethyst Table Tops: A Guide for Interior Designers | B | High |
| 6 | Petrified Wood & Semi-Precious Slabs in Luxury Interiors | B | Mid (expand existing) |
| 7 | Sourcing Furniture Wholesale from India: A Designer's Playbook | D | High (B2B) |
| 8 | Custom / Bespoke Stone Furniture: How the Process Works | D | High |
| 9 | Leather Furniture Trends 2026 for Luxury Homes | C | Mid |
| 10 | Console Tables: Marble vs Leather vs Handcrafted | C/D | Mid (cross-link) |
| 11 | Shipping Fragile Stone Furniture Internationally (crating, insurance) | A/D | Mid (trust) |
| 12 | HS Global Export Workshop: How Each Piece Is Made | brand | Low (E-E-A-T) |

Each post should: target one primary keyword, link to its pillar category + 2–3 product pages, and link laterally to 1–2 sibling posts.

---

## 5. On-page checklist (every new piece)

- One `<h1>` matching the primary keyword
- Meta title ≤ 60 chars, description ≤ 155
- `Article` / `BlogPosting` JSON-LD with author = HS Global Export, real dates
- Descriptive `alt` text on every image (visual catalog → Google Images traffic)
- Internal links: post → pillar → products
- Clear CTA (Request a Quote / Contact)

---

## 6. Recommended sequencing

1. **This week:** Section 3 — add indexable intro copy + `CollectionPage`/`ItemList` schema to the 4 category pages (lifts pages already rank-eligible).
2. **Ongoing:** Run the blog calendar at ~1 post/week.

---

_Category taxonomy reference (`src/server/categories.ts`):_
- **Furniture:** Bathtub, Bowl, Center Table, Chaise Chair, Clock, Coffee Table, Console Table, Dining Table, Mirror Frame, Pedestal Sink, Side Table, Sink, Vase
- **Semi-Precious Stone:** Agate, Amazonite, Amethyst, Gemstone, Jasper, Mother Of Pearl, Quartz, Semiprecious Stone, Tiger Eye, Petrified Wood
- **Leather:** Bed, Bench, Box, Cabinet, Chair, Coffee Table, Console Table, Dresser, Mirror, Mirror Frame, Side Table, Sofa, Stool
- **Handcrafted:** Coffee Table, Console Table, Dining Table, Side Table, Sofa
