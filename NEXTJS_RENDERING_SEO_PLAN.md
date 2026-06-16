# Next.js Rendering Strategy, SEO & VPS Deployment Plan

**Date:** 2026-06-15
**App:** `frontend-next/` (Next.js 15 App Router) — migrated from the Vite SPA.
**Target:** Self-hosted on the VPS (alongside the API), behind Cloudflare.
**Goal:** Every indexable page served as real server-rendered HTML, with the correct rendering mode per route, following SEO best practices.

---

## Where we are (done & proven)
- Full app migrated to Next: all components/pages copied unchanged; router/helmet shims; Vite-isms removed; **builds green; runs**.
- Native per-page SEO `<head>`: title, description, **canonical**, OG/Twitter, sitemap, robots.
- **SSR body proven on `/product/[id]`**: server fetches the product and seeds `useProduct`, so the server HTML contains the full product content + Product/Breadcrumb JSON-LD. Pattern = *server component fetches → passes `initialData` → client component renders (SSR + hydrate)*.

## What to fix (why this plan exists)
- The root layout currently forces `dynamic = 'force-dynamic'` on **everything** → no caching, no SSG/ISR. That was a stop-gap. We must choose the right mode **per route**.
- Most pages are still `dynamic(ssr:false)` (client-only) → no SSR body yet. Convert the **indexable** ones using the proven `initialData` pattern; leave private/interactive ones client-only.

---

## 1) Rendering strategy per route

Legend: **SSG+ISR** = pre-rendered static HTML, revalidated on a timer / on-demand. **CSR** = client-only (`ssr:false`), `noindex`.

| Route | Mode | revalidate | Indexed | Notes |
|-------|------|-----------|---------|-------|
| `/` | SSG + ISR | 1h | ✅ | Home: server-fetch featured products → `initialData` |
| `/products` | SSG + ISR | 1h | ✅ | Listing: server-fetch list → `initialData`; ItemList JSON-LD |
| `/products/[category]` | SSG + ISR | 1h | ✅ | `generateStaticParams` (4 categories) + Breadcrumb JSON-LD |
| `/products/[category]/[subcategory]` | ISR (dynamic) | 1h | ✅ | canonical = base category |
| `/products/.../[categoryFilter]` | ISR (dynamic) | 1h | 🚫 noindex | filter permutation, canonical → base |
| `/product/[id]` | **SSG + ISR** | 6–24h | ✅ | `generateStaticParams` for all 304 (or top N) + `dynamicParams:true`; Product + Breadcrumb JSON-LD **(done)** |
| `/gallery` | SSG + ISR | 1d | ✅ | from gallery manifest/API |
| `/gallery/[id]` | ISR (dynamic) | 1d | ✅ | |
| `/about`, `/shipping`, `/contact` | SSG (static) | — | ✅ | mostly static; Contact = LocalBusiness JSON-LD |
| `/blog` | SSG + ISR | 1h | ✅ | ItemList/Blog JSON-LD |
| `/blog/[slug]` | ISR (dynamic) | 1h | ✅ | Article JSON-LD; dynamic metadata |
| `/wishlist`, `/cart`, `/checkout`, `/checkout-success` | CSR | — | 🚫 | client-only, `noindex` |
| `/login`, `/signup`, `/login-otp`, `/forgot-password`, `/reset-password/[token]`, `/verify-email/[token]` | CSR | — | 🚫 | client-only, `noindex` |
| `/profile`, `/orders/[orderId]` | CSR | — | 🚫 | auth-gated, `noindex` |
| `/admin/**` | CSR | — | 🚫 | auth-gated, `noindex` |

**Actions:**
1. Remove global `force-dynamic` from `app/layout.tsx`.
2. For each ✅ route: server component fetches data → passes `initialData` to the existing client view (the `/product/[id]` pattern). **No UI change** to the components.
3. For ISR: add `export const revalidate = <seconds>` per route; `generateStaticParams` where bounded.
4. For 🚫 routes: keep `ssr:false`, add `robots: { index:false }`, ensure they're in `robots.ts` disallow.

## 2) Data-fetching pattern (consistent everywhere)
- Server component (`page.tsx`) calls a typed helper in `@/server/api` (server-side fetch to the VPS API, with `next: { revalidate }`).
- Passes the result as `initialData` to the client view; the view's hook seeds state from it (already done for `useProduct`; replicate for `useProducts`/home/gallery/blog).
- Client `useEffect` still refetches to stay fresh (keeps interactivity, avoids stale UI).
- API base: server uses internal `API_URL` (can be `http://localhost:<api-port>` on the VPS — faster, no public round-trip); browser uses `NEXT_PUBLIC_API_URL`.

## 3) SEO best-practices checklist
- ✅ Unique `<title>` + meta description per page (generateMetadata).
- ✅ Self-referencing **canonical** on indexable pages; filtered/duplicate views canonical → base + `noindex`.
- ✅ JSON-LD: Organization + WebSite (home), Product (product), BreadcrumbList (product/category), ItemList (listings), Article (blog), LocalBusiness (contact).
- ✅ `sitemap.xml` (dynamic, all products + categories + blog) and `robots.txt` (disallow private).
- ✅ OG/Twitter tags + real `og-image.jpg` (already created).
- ✅ `next/image` for responsive AVIF/WebP (CWV); `next/font` (no layout shift).
- ✅ `noindex` on cart/checkout/account/admin/auth.
- ✅ One canonical host: 301 non-www → www (Cloudflare rule).
- ◻️ Optional `hreflang` (en-US/en-GB) if regional content diverges.
- ◻️ 301 map for any old URLs that change at cutover (URL structure is preserved, so minimal).

## 4) VPS deployment architecture
```
Cloudflare ──> Nginx (443, TLS) ──> Next standalone (node, :3000)
                                        └─ server-fetches API at http://127.0.0.1:<api-port>
```
- Build: `next build` with `output: 'standalone'` (already set) → produces `.next/standalone/`.
- Run: `node .next/standalone/server.js` under **PM2** (or systemd), `PORT=3000`.
- Copy alongside standalone at deploy: `.next/static` → `.next/standalone/.next/static`, and `public/` → `.next/standalone/public`.
- **ISR cache**: persists in `.next/cache` on disk — keep a single instance, or share the cache dir, or use a cache handler if scaling out.
- Nginx: reverse-proxy to `:3000`; let Next handle `/_next/*`; gzip/brotli on.
- Cloudflare: cache `/_next/static/*` and images aggressively; bypass cache for HTML (Next/ISR already caches) or set short edge TTL. **Retire the meta-injection Worker** — Next now emits correct head + body.
- Env on VPS: `API_URL` (internal), `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, Cloudinary name.
- PM2 ecosystem entry + zero-downtime reload on deploy.

## 5) Cutover sequence
1. Finish per-route rendering (section 1) + verify each indexable route returns real HTML (curl) and correct canonical.
2. Build on VPS; run under PM2 behind Nginx on a staging subdomain.
3. Crawl staging (Screaming Frog): check titles, canonicals, status codes, no `noindex` leaks on public pages.
4. Update Google OAuth redirect URIs to the new origin.
5. Point Cloudflare origin from GoDaddy → VPS Next; keep GoDaddy as instant rollback.
6. Retire the Cloudflare meta Worker; keep the non-www→www redirect.
7. Resubmit sitemap in Search Console; monitor Coverage + Core Web Vitals 2–4 weeks.

## 6) Open decisions (need your call)
- **`/product/[id]` build strategy:** pre-render all 304 at build (`generateStaticParams` → slower build, fastest TTFB) vs on-demand ISR (`dynamicParams:true`, empty params → fast build, first hit renders then caches). *Recommend on-demand ISR* (fast builds, still cached).
- **revalidate intervals:** products 6–24h, listings/home 1h, static pages none. OK?
- **Process manager:** PM2 (simplest) vs systemd. *Recommend PM2.*
- **Run the API server-fetch over `127.0.0.1`** (internal, faster) — confirm the API port on the VPS.

---

### Next step
On approval, implement section 1 route-by-route (indexable pages first: product ✅ done, then products/category, home, gallery, blog, static), remove `force-dynamic`, then do the VPS/PM2/Nginx setup in section 4.

---

## ✅ IMPLEMENTED & VERIFIED (2026-06-16) — production `next start`

| Route | Mode | Indexed | SSR body verified |
|-------|------|---------|-------------------|
| `/product/[id]` | ISR (revalidate 6h, on-demand) | ✅ | full product body + Product/Breadcrumb JSON-LD, correct canonical |
| `/products` | Static/ISR | ✅ | **48 product links** in HTML, canonical `/products` |
| `/products/[category]` | ISR | ✅ | **48 (furniture) / 27 (leather) product links**, correct canonical |
| `/products/.../[sub]`, `/[filter]` | ISR | ✅ / noindex | canonical → base category |
| `/about` `/gallery` `/contact` `/shipping` `/blog` | Static (SSG) | ✅ | real content (gallery: full grid), correct canonicals |
| `/` (home) | Static | ✅ | **full SSR** — hero h1, 7 section headings, 25 images, 63 links (fixed: client.tsx ssr:false + scroll-reveal gating) |
| `/wishlist` `/checkout*` `/profile` `/orders` `/login*` `/signup` `/admin/**` | force-dynamic | 🚫 noindex | client-only |

**Key fixes that made SSR work:** renamed `src/pages`→`src/views` (Next was treating it as the Pages Router); i18n `LanguageDetector` guarded to client-only; router-shim `useLocation` no longer calls `useSearchParams` (was forcing a full CSR bailout → empty HTML); `RegionContext` lazy-init `localStorage` guarded; removed global `force-dynamic`; seeded `useProduct`/`useProducts`/`visibleProducts` from server-fetched `initialData`.

**Config:** removed `output: 'standalone'` (broke `next start` + Windows trace quirk) → deploy with PM2 running `next start`.

**Known follow-ups (non-blocking):**
- Home (`/`) now fully SSRs (hero h1 + sections + images + links). Carousel *data* (featured products) still hydrates client-side; seed it later if desired.
- Blog detail SSR pending real blog data (0 blogs currently).
- ProductDetails related-product links use a non-`/product/` href pattern in some spots — verify internal-link hrefs during QA.

### Deploy (PM2 on VPS)
```
cd frontend-next && npm ci && npm run build
pm2 start npm --name hs-frontend -- start        # runs `next start` on PORT (default 3000)
```
Nginx reverse-proxy → :3000; Cloudflare in front; set `API_URL`/`NEXT_PUBLIC_*` env; update Google OAuth redirect URIs; point Cloudflare origin GoDaddy→VPS; retire the meta Worker; resubmit sitemap.
