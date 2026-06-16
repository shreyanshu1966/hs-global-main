/**
 * Cloudflare Worker — HS Global Export
 *
 * Canonical-host redirect ONLY (non-www → www).
 *
 * The site is now served by the Next.js app (frontend-next/), which renders all
 * SEO output — <title>, meta description, <link rel="canonical">, Open Graph /
 * Twitter tags, JSON-LD, and the full page body — on the server. The old Worker
 * that injected those tags / body content has been removed: doing that in front
 * of Next would duplicate JSON-LD, overwrite correct canonicals/titles, and
 * clobber the server-rendered body. So this Worker no longer touches HTML; it
 * only enforces the canonical host and otherwise passes requests through.
 *
 * (You can alternatively do this with a Cloudflare Redirect Rule and drop the
 * Worker entirely — either is fine.)
 *
 * Deploy: Cloudflare Dashboard → Workers → paste this file
 * Route:  hsglobalexport.com/*  and  www.hsglobalexport.com/*
 */

const CANONICAL_HOST = 'www.hsglobalexport.com';

async function handleRequest(request) {
  const url = new URL(request.url);

  // Force the canonical host: non-www → www (301), preserving path + query.
  if (url.hostname !== CANONICAL_HOST) {
    url.hostname = CANONICAL_HOST;
    return Response.redirect(url.toString(), 301);
  }

  // Everything else: pass straight through to origin (Next.js). No HTML rewriting.
  return fetch(request);
}

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});
