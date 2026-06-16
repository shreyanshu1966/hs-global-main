'use client';
import ProductDetails from '@/views/ProductDetails';

// Rendered server-side (SSR) seeded with initialData, then hydrated on the
// client — crawlers get the full product body, users get the interactive page.
export default function Client({ initialData }: { initialData?: any }) {
  return <ProductDetails initialData={initialData} />;
}
