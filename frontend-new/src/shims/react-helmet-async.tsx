'use client';
/**
 * react-helmet-async → no-op shim.
 *
 * SEO <head> is handled natively by Next's Metadata API (generateMetadata /
 * `metadata` exports), so the copied components' <Helmet> usage becomes a
 * harmless no-op. Aliased to 'react-helmet-async' (next.config + tsconfig).
 */
import React from 'react';

export function HelmetProvider({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function Helmet(_: { children?: React.ReactNode }) {
  return null;
}

export default { Helmet, HelmetProvider };
