'use client';
import '../styles/itsbits-home-sections.css';

/**
 * Imports the below-fold CSS for the itsbits layout.
 * Loaded via next/dynamic with ssr:false in Layout.tsx so this stylesheet
 * is not included in the server-rendered <head> and does not block the
 * initial render. The styles arrive after hydration, before the user can
 * interact with below-fold sections.
 */
export default function DeferredStylesheet() {
  return null;
}
