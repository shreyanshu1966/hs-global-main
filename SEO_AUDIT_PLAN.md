# SEO Audit & Organic-Traffic Plan — HS Global Export

**Date:** 2026-06-15
**Site:** https://hsglobalexport.com
**Goal:** Grow organic (Google) traffic for a marble/granite furniture export catalog (304 products), targeting USA / UK / worldwide B2B + B2C buyers.

---

## Architecture (confirmed)

```
Browser ──> Cloudflare (Worker injects <title>/meta) ──> GoDaddy (Apache, static React build + .htaccess SPA fallback)
                                                     └──> api.hsglobalexport.com (VPS) — product/blog data
```

- **Frontend:** Vite + React **client-side rendered SPA**, deployed as static files to GoDaddy. Raw HTML body is empty until JS runs.
- **Backend:** Node API on VPS at `https://api.hsglobalexport.com/api` (304 products, returns SEO-friendly slugs).
- **Edge:** Cloudflare Worker ([cloudflare/worker.js](cloudflare/worker.js)) rewrites `<title>`/meta per route. Worker latency measured at ~421 ms/request.
- **Config drift:** repo contains `vercel.json` + Netlify `_redirects` + Apache `.htaccess`. Only `.htaccess` is live (GoDaddy). The other two are noise and should be deleted to avoid confusion.

---

## Critical findings (verified against the live site)

### 🔴 1. Every page's canonical points to the homepage
Live raw HTML on `/products` and `/product/<slug>` both return:
`<link rel="canonical" href="https://www.hsglobalexport.com/">`
The Worker rewrites `og:url` but **never rewrites `<link rel="canonical">`** ([worker.js:119-134](cloudflare/worker.js#L119-L134)). Google reads "every page = duplicate of homepage" → refuses to index product/category/blog pages. **This is the #1 traffic blocker.**

### 🔴 2. Worker product route is wrong — product SEO never fires
Real route is `/product/:id` (singular) — [App.tsx:105](frontend/src/App.tsx#L105), [ProductCard.tsx:169](frontend/src/components/cards/ProductCard.tsx#L169).
Worker only matches `/products/<id>` (plural) — [worker.js:159](cloudflare/worker.js#L159).
**Verified live:** a real product page shows the generic default title, homepage canonical, broken OG image. All 304 products are invisible to search/social.

### 🔴 3. OG/social image is broken sitewide
`https://hsglobalexport.com/og-image.jpg` returns `Content-Type: text/html` (SPA fallback, file doesn't exist). Referenced everywhere ([worker.js:12](cloudflare/worker.js#L12), [useProductSEO.ts:89](frontend/src/hooks/useProductSEO.ts#L89)). No social share shows a preview image.

### 🔴 4. www vs non-www both serve 200 — no redirect
Canonicals/sitemap use `www`, but `hsglobalexport.com` (non-www) also serves 200. Duplicate content across two hostnames, no 301 to consolidate authority.

### 🔴 5. Sitemap covers 83 of 304 products
Sitemap has 89 URLs total (83 product, 1 blog), `lastmod` frozen at 2026-02-16. ~73% of the catalog is never submitted to Google.

### 🟠 6. Blog posts get no crawler meta
Worker explicitly skips blog injection ([worker.js:165-168](cloudflare/worker.js#L165-L168)). Blog posts show the generic homepage title to Google — the main organic lever is wasted.

### 🟠 7. No structured data (JSON-LD)
No Organization, Product, or BreadcrumbList schema in raw HTML → ineligible for rich results, star ratings, price snippets.

### 🟠 8. Performance / Core Web Vitals
- HTML served `Cache-Control: no-cache, no-store, must-revalidate` ([index.html:11-14](frontend/index.html#L11-L14)) → nothing cached, Worker re-runs every request (~421 ms TTFB penalty).
- Single **9.5 MB `vendor` JS chunk** — [vite.config.ts:41-45](frontend/vite.config.ts#L41-L45) lumps all of node_modules into one chunk.
- Hero images 3–4 MB each (`services-hero.webp` 3.7 MB, `about-hero.webp` 3.4 MB, etc.). Poor mobile LCP = ranking penalty.

### 🟡 9. On-page quality
- Keyword-stuffed `<title>` + 20-term `meta keywords` tag ([index.html:20-21](frontend/index.html#L20-L21)) — keywords tag ignored by Google, signals low quality.
- No `hreflang` despite USA/UK/worldwide targeting.
- No category landing-page copy; thin internal linking.

### ✅ What's already good
- Product IDs are clean SEO slugs (`beige-stone-bathtub-freestanding-marble-tub-...`).
- robots.txt + sitemap reference present; GA4 + GTM + Google Search Console verification installed.
- Per-route static meta map exists in the Worker (just needs fixing/extending).

---

## The plan

### Phase 1 — Unblock indexing (this week, low effort, highest impact)

**1.1 Fix the Cloudflare Worker** — the single most valuable change.
- Rewrite `<link rel="canonical">` per route (add a `LinkRewriter` for `link[rel="canonical"]`).
- Fix product matching: handle `/product/:id` (singular). Keep `/products` and add `/products/:category` + `/products/:category/:subcategory` category meta.
- Add blog detail injection: fetch `/api/blogs/:slug` and inject title/desc/canonical/OG.
- Inject `og:image:secure_url` and ensure absolute image URLs.
- Redeploy and **diff repo `worker.js` against the live Worker first** (suspected drift).

**1.2 Create a real `og-image.jpg`** (1200×630, branded) and upload to the GoDaddy web root so `/og-image.jpg` returns a real image. Per-product OG should use the product image (already wired in the Worker once 1.1 lands).

**1.3 301 redirect non-www → www** (canonicals already use www) via a Cloudflare Bulk Redirect / Rule. Update `.htaccess` as backup.

**1.4 Regenerate the sitemap** to include **all 304 products** + all blog posts + category pages, with real `lastmod`. Pull the list from the VPS API in [generate-sitemap.js](frontend/generate-sitemap.js); automate it to run on each deploy. Resubmit in Search Console.

**1.5 Remove `no-cache` meta tags** from [index.html](frontend/index.html#L11-L14) and let Cloudflare cache HTML (short TTL, e.g. 5 min) so the Worker output is cached and TTFB drops.

**Deliverable:** Google can index every product, category, and blog page with unique titles, descriptions, canonicals, and working social previews.

### Phase 2 — Indexability depth & speed (1–2 weeks)

**2.1 Add structured data (JSON-LD)** via the Worker (so crawlers get it without JS):
- `Organization` + `WebSite` (with SearchAction) on `/`.
- `Product` (name, image, description, brand, offers, aggregateRating) on `/product/:id`.
- `BreadcrumbList` on category + product pages.

**2.2 Performance / Core Web Vitals:**
- Split the 9.5 MB vendor chunk (granular `manualChunks`: react, router, gsap/animation, charts, paypal, etc.).
- Compress all `/public` hero images to <200 KB and serve responsive `srcset` sizes.
- Lazy-load below-the-fold images and heavy libs.

**2.3 Prerendering / SSG for key routes** so crawlers get a real HTML body (not just meta). Options: a prerender step at build (puppeteer/`prerender` of home, category, top products), or migrate to `vite-react-ssg`. Even prerendering the top ~50 pages materially improves indexing reliability.

**2.4 Search Console hygiene:** submit sitemap, request indexing for key pages, fix any Coverage/Core Web Vitals errors, set up the URL Inspection workflow.

### Phase 3 — Earn rankings (ongoing)

**3.1 Category landing pages** with 300–500 words of keyword-targeted copy per category (e.g. "Marble Coffee Tables — Wholesale Export to USA & UK"), internal links to products.

**3.2 B2B/B2C blog** with buyer-intent topics: "Italian vs Indian marble for export", "How to import marble furniture to the USA (duties, shipping)", "Caring for a marble bathtub". 2–4 posts/month.

**3.3 Reviews/ratings** on products → eligible for star snippets (ties into Product schema).

**3.4 Off-page / backlinks:** B2B marketplaces (IndiaMART, ExportersIndia, Alibaba), supplier directories, trade associations, local business listings, supplier profiles.

**3.5 `hreflang`** for en-US / en-GB if/when region-specific content diverges.

---

## Suggested execution order (first 2 weeks)
1. Diff & fix Worker (canonical + `/product` + categories + blogs) — **Day 1**
2. Create + upload `og-image.jpg` — Day 1
3. 301 non-www → www on Cloudflare — Day 1
4. Regenerate full sitemap (304 products) + resubmit — Day 2
5. Remove `no-cache`, enable Cloudflare HTML caching — Day 2
6. JSON-LD via Worker — Day 3–4
7. Vendor chunk split + image compression — Day 5–7
8. Prerender top routes — Week 2

## Tracking metrics
- Search Console: indexed pages (target: 304 products indexed), impressions, clicks, avg position.
- Core Web Vitals (LCP/CLS/INP) — mobile.
- Organic sessions (GA4).
- Indexed product count (should climb from ~handful → 300+).

---

## ✅ Implementation status (2026-06-15)

**Phase 1 — DONE in repo (needs deploy):**
- Worker rewritten: per-page canonical, `/product/:id` fix, category + blog meta, `noindex` for unavailable products, JSON-LD (Product/Organization/WebSite). → `cloudflare/worker.js`
- Sitemap rebuilt from API: **315 URLs** (304 products + categories + static), real `lastmod`. → `frontend/generate-sitemap.js`, wired into `npm run build`.
- `index.html`: removed `no-cache` meta, dropped keyword stuffing, shortened title.
- `.htaccess`: 301 non-www→www, cacheable HTML (`s-maxage=300`), removed `SetEnv no-gzip`.
- Real `og-image.jpg` created (1200×630).

**Phase 2 — DONE in repo (needs deploy):**
- Images compressed in place: **25.6MB → 3.9MB (saved 21.7MB)**; heroes resized to ≤2560px.
- Vendor bundle split: **9.5MB single chunk → ~390KB vendor + small logical chunks**; the 8.4MB `country-state-city` data isolated to a `geo` chunk that loads only at checkout.

**Phase 2.3 — DONE in repo (hybrid: build-time landing + edge product injection):**
Product pages are handled at the **edge** (not at build) to keep the build fast and content always-fresh:
- **Cloudflare Worker** (`cloudflare/worker.js`) injects a crawlable SEO body block into `#root` for every `/product/<id>` — breadcrumb, `<h1>`, image+alt, description, price, and up to 8 related-product internal links — built from the live API data it already fetches for meta. React clears/re-renders `#root` on boot so real users get the live SPA. **Zero build cost, always fresh, runs on the free Cloudflare plan** (HTMLRewriter). Verified body builder against live API (~3KB/page).
- **Build-time prerender** (`frontend/prerender.js`) now covers **only landing + category pages** (~10–14 pages, ~40s): `/`, `/about`, `/products`, `/gallery`, `/shipping`, `/contact` + `/products/<category>`. Headless Chrome launched with `--disable-web-security` (build-time only) to call the API from localhost; `waitForFunction` waits for data before capture. Wired into `npm run build`; fails safe if Chrome can't launch.
- `.htaccess` serves prerendered `folder/index.html` without trailing-slash redirects; product URLs fall through to the SPA shell, which the Worker fills.
- Earlier full-Puppeteer-all-products approach was dropped (10–15 min builds) in favor of this.

**Still pending:**
- **Deploy:** rebuild frontend → upload `dist/` to GoDaddy; paste new Worker into Cloudflare (diff against live first); resubmit sitemap in Search Console.
- Phase 3 content/off-page work.

## Cleanup (low risk, do anytime)
- Delete stale deploy configs not used by GoDaddy: `frontend/vercel.json`, `frontend/public/_redirects` (keep `.htaccess`).
- Drop the `meta keywords` tag.
- Shorten the homepage `<title>` to ~55–60 chars.
