import type { Metadata } from 'next';
import { getAllProducts, getPageSeo, absoluteImage, productUrl, SITE_NAME, SITE_URL } from '@/server/api';
import Client from './client';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('/products');
  const title =
    seo?.title || 'Best Marble & Granite Company at USA, UK & Worldwide | HS Global Export';
  const description =
    seo?.description ||
    'Explore premium granite, marble, semi-precious stone, leather and wooden furniture from HS Global Export. Custom orders welcome.';
  const canonical = seo?.canonical || `${SITE_URL}/products`;
  const image = seo?.image ? absoluteImage(seo.image) : `${SITE_URL}/og-image.jpg`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { type: 'website', siteName: SITE_NAME, title, description, url: canonical, images: [{ url: image, width: 1200, height: 630, alt: SITE_NAME }] },
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

  // CollectionPage + ItemList structured data for the SSR'd first page of the
  // catalog — gives crawlers an itemized list of products with names/images/URLs.
  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Marble & Granite Furniture — Full Collection',
    url: `${SITE_URL}/products`,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: visible.length,
      itemListElement: visible.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}${productUrl(p)}`,
        name: p.name,
        image: absoluteImage(p.image),
      })),
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <h1 className="sr-only">Marble &amp; Granite Furniture — Full Collection</h1>
      <Client initialProducts={visible} />
    </>
  );
}
