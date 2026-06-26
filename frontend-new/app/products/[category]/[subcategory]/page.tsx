import type { Metadata } from 'next';
import { categoryLabel } from '@/server/categories';
import { SITE_NAME, SITE_URL } from '@/server/api';
import ProductsClient from '../../_ProductsClient';

type Params = { params: Promise<{ category: string; subcategory: string }> };

const titleCase = (s = '') => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category, subcategory } = await params;
  const cat = categoryLabel(category);
  const sub = titleCase(subcategory);
  return {
    title: `${sub} ${cat} — Export to USA, UK & Worldwide`,
    description: `Premium ${sub.toLowerCase()} ${cat.toLowerCase()} from ${SITE_NAME}, exported worldwide. Custom orders welcome.`,
    // Filtered view → canonical points to the base category to avoid duplicates.
    alternates: { canonical: `${SITE_URL}/products/${category}` },
  };
}

export default async function Page({ params }: Params) {
  const { category, subcategory } = await params;
  const cat = categoryLabel(category);
  const sub = titleCase(subcategory);
  
  return (
    <>
      <h1 className="sr-only">{sub} {cat} Collection</h1>
      <ProductsClient />
    </>
  );
}
