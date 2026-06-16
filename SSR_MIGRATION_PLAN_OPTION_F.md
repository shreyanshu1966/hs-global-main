# Option F — SSR/ISR Migration Plan (Next.js)

**Date:** 2026-06-15
**Goal:** Move from a client-rendered Vite SPA to true server-side rendering with ISR, so every page (especially all 304 products) is delivered as complete, fresh HTML — the gold standard for SEO.

> ⚠️ This is a **2–4 week** migration (1 developer), not a quick change. Ship Phases 1–2.3 (already done) + Phase 3 content first; do this only when SEO is core to revenue and the simpler approach has plateaued.

---

## Decisions (resolve before starting)

| Decision | Options | Recommendation |
|----------|---------|----------------|
| **Framework** | Next.js (App Router) · Remix · Astro | **Next.js App Router** — best ISR, incremental adoption, ecosystem. Astro/Remix are weaker fits given the app's deep React state (10 contexts, cart, auth). |
| **Hosting** | Vercel · Self-host on VPS | **Self-host on the existing VPS** (already runs Node for the API) behind Cloudflare — no new monthly cost. *Vercel* is less ops effort but ~$20/mo Pro for commercial use. |
| **Rendering scope** | All routes SSR · Public routes only | **Public/SEO routes SSR+ISR; admin/auth/checkout stay client-rendered.** |
| **Migration style** | Big-bang rewrite · Incremental | **Incremental** — lift the app into Next as client components first (behavior parity, no SEO yet), then convert public routes to server components route-by-route. De-risks the whole thing. |

---

## Grounding: current state

- **27 pages**, **84 components**, **10 contexts** (Auth, Cart, Currency, Localization, PhoneVerification, ProductsNavigation, Region, SlabCustomization, StoneQuotation, Wishlist).
- `react-router-dom` v6, lazy routes; **axios** client-side fetch to `VITE_API_URL` (VPS API).
- Browser-coupled: **gsap (28 files), framer-motion (12), lenis (5), `window` (38), `localStorage` (29), `document` (24)**.
- Google OAuth + JWT in localStorage; Tailwind; i18next; Cloudinary images.
- Hosted as static files on GoDaddy + Cloudflare Worker for meta. (Next.js makes the Worker meta injection redundant for migrated routes.)

---

## Route rendering targets

**SSR + ISR (server components, `revalidate`):**
`/` · `/products` · `/product/[id]` · `/products/[category]` · `/products/[category]/[sub]` · `/gallery` · `/gallery/[id]` · `/about` · `/shipping` · `/blog` · `/blog/[slug]` · `/contact`

**Client-only (no SEO value — render with `ssr:false` / client components):**
`/admin/**` · `/login` · `/signup` · `/login-otp` · `/forgot-password` · `/reset-password` · `/verify-email` · `/checkout` · `/checkout-success` · `/profile` · `/wishlist` · `/order/[id]`

> URLs MUST stay byte-identical to today (e.g. `/product/<id>` singular) to preserve indexing. Any change needs a 301.

---

## Phased plan

### Phase 0 — Decisions & setup (0.5 day)
- Pick host (VPS vs Vercel). Provision Node 20+, set env (`API_URL`, OAuth client IDs, Cloudinary).
- Create the Next.js app skeleton in a new folder (e.g. `frontend-next/`) so the current site keeps running untouched.

### Phase 1 — Parity on Next as CSR (3–5 days)
- Scaffold Next.js App Router + Tailwind + `@fontsource`/`next/font`.
- Build a root `app/layout.tsx` and a single **`<ClientProviders>`** (`'use client'`) wrapping all 10 contexts.
- Move shared shell (Header/Footer) into the layout.
- Port pages as **client components** first (`'use client'` at top) so everything renders identically to today — no SEO gain yet, but it runs on Next. This proves the app works before adding SSR.
- Replace `react-router` primitives: `<Link>` → `next/link`, `useNavigate`/`useParams`/`useLocation` → `next/navigation`. (~mechanical across 84 components.)

### Phase 2 — File-based routing (2–3 days)
- Recreate every route as an App Router folder, preserving exact URLs and dynamic segments (`app/product/[id]/page.tsx`, `app/products/[category]/page.tsx`, etc.).
- Wire client-only routes with no server fetching.
- Verify navigation, deep links, and 404 behavior.

### Phase 3 — Convert public routes to SSR + ISR (4–6 days) ← the SEO payoff
- For each public route, make `page.tsx` a **server component** that fetches from the API server-side and renders real HTML.
  - `/product/[id]`: `generateMetadata()` (title/desc/canonical/OG) + `revalidate = 3600` (ISR) + optional `generateStaticParams()` for top products.
  - `/products`, `/products/[category]`: server fetch list, render product grid as SSR; client component only for filters/interactivity.
- **Isolate browser-only code**: animations (gsap/lenis/framer-motion), anything touching `window`/`localStorage`/`document` → small `'use client'` components, loaded via `dynamic(() => import(...), { ssr: false })` where needed.
- Guard the 10 contexts: read `localStorage` inside `useEffect` (not render) to avoid hydration mismatches.

### Phase 4 — Native SEO (2 days)
- `app/sitemap.ts` (replaces `generate-sitemap.js`) + `app/robots.ts`.
- JSON-LD as server-rendered `<script>` in each route (Product/Org/Breadcrumb) — replaces the Worker's injection.
- `next/image` with Cloudinary `remotePatterns` for automatic responsive/AVIF images (big CWV win).
- Per-route canonical via `generateMetadata`.

### Phase 5 — Auth, cart & state SSR-safety (2–3 days)
- Ensure localStorage/JWT logic is client-only; consider moving the session to an httpOnly cookie so the server can personalize if ever needed.
- Update Google OAuth redirect URIs to the new origin.
- Verify cart/wishlist/region/currency persistence across SSR navigation.

### Phase 6 — Performance pass (1–2 days)
- `next/font`, route-level code splitting (replaces the manual `manualChunks`), lazy client components.
- Keep the `country-state-city` (8MB) lib isolated to the checkout client chunk.
- Verify Core Web Vitals (Lighthouse mobile).

### Phase 7 — Deploy & cutover (2–3 days)
- **VPS path:** `next build` with `output: 'standalone'`, run via PM2/systemd behind Nginx; point Cloudflare origin at it. ISR cache on persistent disk.
- **Vercel path:** connect repo, set env, deploy; ISR is automatic.
- Stand up on a preview domain, QA all routes, run a crawl (Screaming Frog) to confirm titles/canonicals/status codes.
- Cut Cloudflare/DNS over from GoDaddy to the Next origin. Keep GoDaddy as instant rollback.

### Phase 8 — Decommission (0.5 day)
- Retire the Worker's meta + body injection for migrated routes (Next now emits real HTML+meta). Keep only the non-www→www redirect (or move it to Cloudflare rules).
- Remove the build-time `prerender.js` and GoDaddy static deploy.
- Resubmit sitemap; monitor Search Console Coverage/CWV for 2–4 weeks.

---

## Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| Hydration mismatches (localStorage/`window` read during render) | Move all such reads into `useEffect`; client components for interactive bits |
| gsap/lenis/framer-motion break SSR | `dynamic(..., { ssr:false })`; render-after-mount |
| URL drift hurting rankings | Preserve exact paths; 301 any change; crawl-diff before cutover |
| 10 contexts initializing from storage | Lazy/effect init; SSR-safe defaults |
| OAuth redirect/callback on new origin | Update Google console redirect URIs |
| ISR cache on self-host | Use standalone output + persistent cache dir, or Vercel |
| Big-bang regression | Incremental (Phase 1 parity first), preview env, rollback to GoDaddy |

---

## Effort & cost

- **Effort:** ~2–4 weeks, 1 developer. (P1–2 ≈ 1 wk · P3–4 ≈ 1–1.5 wk · P5–8 ≈ 0.5–1 wk.)
- **Cost:** VPS self-host = no new monthly cost (uses existing VPS) + ops time. Vercel = ~$20/mo Pro (commercial) but least ops effort.

## ✅ Implementation progress (2026-06-15)

**Phase 0–1 foundation — DONE & verified** (in `frontend-next/`, separate from the live Vite app):
- Next.js 15 App Router scaffold: `package.json`, `next.config.mjs` (standalone output, Cloudinary images), `tsconfig`, Tailwind (ported colors/fonts), `app/layout.tsx` (Metadata API + `next/font`), `app/globals.css`.
- Server-side API layer `lib/api.ts` (uses `API_URL`, ISR via `next.revalidate`).
- **Flagship SSR+ISR route `app/product/[id]/page.tsx`** — server-fetched, `generateMetadata` (title/desc/**canonical**/OG), Product JSON-LD, related-product internal links, `next/image`.
- `app/sitemap.ts` + `app/robots.ts` (native, replaces `generate-sitemap.js`), placeholder server-rendered home, `not-found`.
- **Build passes.** First Load JS **~114 kB** (vs old 9.5 MB). Verified `next start` on a real product: HTTP 200, real `<h1>`, **correct per-page canonical**, Product JSON-LD, 27 internal links, full content — all server-rendered. The catastrophic SPA canonical bug is gone natively.

**Remaining (the bulk of the 2–4 wk estimate) — iterative:**
- Port the 10 contexts into a `'use client'` providers wrapper; port Header/Footer shell.
- Port remaining 27 pages + 84 components (mechanical: add `'use client'`, swap `react-router`→`next/navigation`, `import.meta.env`→`process.env.NEXT_PUBLIC_*`).
- Isolate gsap/lenis/framer-motion as client components (`dynamic(..., {ssr:false})`); guard `window`/`localStorage` reads into `useEffect`.
- Phases 4–8 (native SEO polish already partly done, auth/cart SSR-safety, perf, deploy/cutover, decommission).

## When it's worth it
Do this when: organic search is a primary revenue channel, the catalog grows well beyond a few hundred SKUs, or you want best-in-class Core Web Vitals + instant indexing. Until then, **Option B (edge injection, already shipped) + Phase 3 content/backlinks delivers ~90% of the SEO benefit for ~5% of the effort.**
