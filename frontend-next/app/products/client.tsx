'use client';
import Products from '@/views/Products';
// SSR: seeded with server-fetched products so the grid (and its internal
// product links) render in the server HTML; hydrated/refetched on the client.
export default function Client({ initialProducts }: { initialProducts?: any[] }) {
  return <Products initialProducts={initialProducts} />;
}
