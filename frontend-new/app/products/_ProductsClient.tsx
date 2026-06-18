'use client';
import Products from '@/views/Products';
// Shared client wrapper for /products/* routes — SSR-rendered, optionally
// seeded with server-fetched products for the category grid.
export default function ProductsClient({ initialProducts }: { initialProducts?: any[] }) {
  return <Products initialProducts={initialProducts} />;
}
