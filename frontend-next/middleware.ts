import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api.hsglobalexport.com/api';

// In-memory redirect cache — refreshed every hour
let redirectMap: Map<string, string> | null = null;
let lastFetch = 0;
const CACHE_TTL = 3_600_000; // 1 hour

async function getRedirects(): Promise<Map<string, string>> {
  if (redirectMap && Date.now() - lastFetch < CACHE_TTL) return redirectMap;
  try {
    const res = await fetch(`${API_URL}/seo/redirects`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      redirectMap = new Map(
        (json.data || []).map((r: { from: string; to: string }) => [r.from, r.to])
      );
      lastFetch = Date.now();
    }
  } catch {
    // Keep the existing map if fetch fails (stale-while-revalidate)
    redirectMap = redirectMap ?? new Map();
  }
  return redirectMap!;
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (path.startsWith('/product/')) {
    const map = await getRedirects();
    const to = map.get(path);
    if (to) {
      const url = req.nextUrl.clone();
      url.pathname = to;
      return NextResponse.redirect(url, 301);
    }
  }
  return NextResponse.next();
}

// Only run on product URLs to keep the middleware lightweight
export const config = {
  matcher: ['/product/:path+'],
};
