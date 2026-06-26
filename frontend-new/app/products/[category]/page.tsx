import type { Metadata } from 'next';
import { categoryLabel } from '@/server/categories';
import { getAllProducts, getCategorySeo, absoluteImage, SITE_NAME, SITE_URL } from '@/server/api';
import ProductsClient from '../_ProductsClient';

export const revalidate = 3600;

type Params = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategorySeo(category);
  const label = categoryLabel(category);

  const title =
    cat?.seo?.metaTitle || `${label} — Marble & Granite Export to USA, UK & Worldwide`;
  const description =
    cat?.seo?.metaDescription ||
    `Shop premium ${label.toLowerCase()} from ${SITE_NAME}. Handcrafted marble & granite ${label.toLowerCase()} with worldwide export to the USA, UK and beyond. Custom orders welcome.`;
  const canonical =
    cat?.seo?.canonicalUrl || `${SITE_URL}/products/${category}`;
  const image = cat?.seo?.ogImage
    ? absoluteImage(cat.seo.ogImage)
    : `${SITE_URL}/og-image.jpg`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { type: 'website', siteName: SITE_NAME, title, description, url: canonical, images: [{ url: image, width: 1200, height: 630, alt: label }] },
    twitter: { card: 'summary_large_image', title, description, images: [{ url: image, alt: label }] },
  };
}

export default async function Page({ params }: Params) {
  const { category } = await params;
  const label = categoryLabel(category);
  const all = await getAllProducts();
  const products = all
    .filter((p) => p.category === category && p.available !== false && p.status !== 'draft')
    .slice(0, 48);
  return (
    <>
      <h1 className="sr-only">{label} — Marble &amp; Granite Collection by HS Global Export</h1>
      <ProductsClient initialProducts={products} />
    </>
  );
}
