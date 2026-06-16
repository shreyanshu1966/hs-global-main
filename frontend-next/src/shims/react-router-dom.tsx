'use client';
/**
 * react-router-dom → Next.js compatibility shim.
 *
 * Aliased to `react-router-dom` (see next.config.mjs + tsconfig paths) so the
 * copied Vite components keep importing from 'react-router-dom' unchanged.
 * Implements only the surface the app actually uses:
 *   Link, Navigate, useLocation, useNavigate, useParams, useSearchParams
 */
import NextLink from 'next/link';
import {
  useRouter,
  usePathname,
  useParams as useNextParams,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';
import React, { useEffect, useMemo } from 'react';

type To = string | { pathname?: string; search?: string; hash?: string };

function toHref(to: To): string {
  if (typeof to === 'string') return to;
  return `${to.pathname || ''}${to.search || ''}${to.hash || ''}`;
}

interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: To;
  replace?: boolean;
  state?: unknown;
  end?: boolean;
}

export function Link({ to, replace, state, end, ...rest }: LinkProps) {
  // `replace`/`state`/`end` are react-router-only; drop them for next/link.
  void replace;
  void state;
  void end;
  return <NextLink href={toHref(to)} {...rest} />;
}

// NavLink behaves like Link for our purposes (active styling handled in app code).
export const NavLink = Link;

export function useNavigate() {
  const router = useRouter();
  return (to: To | number, options?: { replace?: boolean }) => {
    if (typeof to === 'number') {
      if (to < 0) router.back();
      else router.forward();
      return;
    }
    const href = toHref(to);
    if (options?.replace) router.replace(href);
    else router.push(href);
  };
}

export function useLocation() {
  // IMPORTANT: do NOT call Next's useSearchParams() here — it forces the whole
  // subtree to bail out of SSR to client rendering. Most callers only need
  // pathname; `search` is read from the browser URL (empty on the server).
  const pathname = usePathname() || '/';
  const search = typeof window !== 'undefined' ? window.location.search : '';
  return useMemo(
    () => ({ pathname, search, hash: '', state: null, key: 'default' }),
    [pathname, search]
  );
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>(): T {
  const p = { ...(useNextParams() || {}) } as Record<string, string | undefined>;
  // Legacy routes used `/products/all/:subcategory` where "all" was a literal
  // sentinel (no `category` param). Replicate that: drop category when it's "all".
  if (p.category === 'all') delete p.category;
  return p as T;
}

export function useSearchParams(): [URLSearchParams, (next: URLSearchParams | Record<string, string>) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useNextSearchParams();
  const current = useMemo(() => new URLSearchParams(sp?.toString() || ''), [sp]);
  const setSearchParams = (next: URLSearchParams | Record<string, string>) => {
    const params = next instanceof URLSearchParams ? next : new URLSearchParams(next);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname || '/');
  };
  return [current, setSearchParams];
}

export function Navigate({ to, replace }: { to: To; replace?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    const href = toHref(to);
    if (replace) router.replace(href);
    else router.push(href);
  }, [to, replace, router]);
  return null;
}

// Some components import these as no-op wrappers; provide passthroughs.
export function BrowserRouter({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
export const MemoryRouter = BrowserRouter;
export function Outlet() {
  return null;
}
