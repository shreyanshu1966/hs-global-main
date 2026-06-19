'use client';
import { useEffect } from 'react';

/**
 * Loads the below-fold itsbits section styles after hydration.
 * The CSS is served from /public as a plain static file so webpack never
 * bundles it — it does NOT appear in the server-rendered <head> and does
 * not contribute to the render-blocking CSS budget.
 */
export default function DeferredStylesheet() {
  useEffect(() => {
    if (document.querySelector('link[data-itsbits-sections]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/styles/itsbits-home-sections.css';
    link.dataset.itsbitsections = '1';
    document.head.appendChild(link);
  }, []);
  return null;
}
