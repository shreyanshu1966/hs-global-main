import type { Metadata } from 'next';
import { SITE_URL } from '@/server/api';
import ProductsClient from '../../../_ProductsClient';

type Params = { params: Promise<{ category: string; subcategory: string }> };

// Deep cross-category filter view — canonical to the base category, no index of
// the filtered permutation to avoid duplicate content.
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  return {
    alternates: { canonical: `${SITE_URL}/products/${category}` },
    robots: { index: false, follow: true },
  };
}

export default function Page() {
  return <ProductsClient />;
}
