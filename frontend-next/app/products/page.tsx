import type { Metadata } from 'next';
import { getAllProducts, getPageSeo, absoluteImage, SITE_NAME, SITE_URL } from '@/server/api';
import Client from './client';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('/products');
  const title =
    seo?.title ?? 'Best Marble & Granite Company at USA, UK and Across Worldwide';
  const description =
    seo?.description ??
    'Explore premium granite, marble, semi-precious stone, leather and handcrafted furniture from HS Global Export. Custom orders welcome.';
  const canonical = seo?.canonical ?? `${SITE_URL}/products`;
  const image = seo?.image ? absoluteImage(seo.image) : `${SITE_URL}/og-image.jpg`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, images: [{ url: image, width: 1200, height: 630, alt: SITE_NAME }] },
    twitter: { card: 'summary_large_image', title, description, images: [{ url: image, alt: SITE_NAME }] },
  };
}

export default async function Page() {
  const products = await getAllProducts();
  // Seed a representative first page for SSR (internal links + content); the
  // client loads the rest. Full catalog discovery is covered by the sitemap.
  const visible = products
    .filter((p) => p.available !== false && p.status !== 'draft')
    .slice(0, 48);
  return <Client initialProducts={visible} />;
}
