import type { Metadata } from 'next';
import { getProduct, absoluteImage, SITE_NAME, SITE_URL } from '@/server/api';
import Client from './client';

type Params = { params: Promise<{ id: string }> };

// On-demand ISR: nothing pre-rendered at build; first request renders + caches,
// revalidated every 6h. dynamicParams allows any product id on demand.
export const revalidate = 21600;
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

// Server-rendered SEO head (title/canonical/OG/JSON-LD) even though the body
// is the real client ProductDetails component.
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const data = await getProduct(id);
  if (!data) return { title: 'Product Not Found', robots: { index: false, follow: true } };

  const { product } = data;
  const seo = product.seo ?? {};

  // Meta title/description (used for <title> and <meta name="description">)
  const rawTitle = seo.metaTitle || product.seoTitle || product.name;
  const title = rawTitle.includes(SITE_NAME) ? rawTitle : `${rawTitle} | ${SITE_NAME}`;
  const description =
    seo.metaDescription ||
    product.seoDescription ||
    `Buy ${product.name} — premium ${product.category || 'marble'} product from ${SITE_NAME}. Global shipping to the USA, UK and worldwide.`;

  // OG-specific (fall back to meta values)
  const ogTitle       = seo.ogTitle       || title;
  const ogDescription = seo.ogDescription || description;
  const ogImage       = absoluteImage(seo.ogImage || product.image);

  // Twitter-specific (fall back to OG values)
  const twitterTitle       = seo.twitterTitle       || ogTitle;
  const twitterDescription = seo.twitterDescription || ogDescription;
  const twitterImage       = absoluteImage(seo.twitterImage || seo.ogImage || product.image);

  const canonical = seo.canonicalUrl || `${SITE_URL}/product/${id}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: { index: product.available !== false, follow: true },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      type: 'website',
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: twitterTitle,
      description: twitterDescription,
      images: [{ url: twitterImage, alt: product.name }],
    },
  };
}

// Server-rendered structured data (invisible to users, no UI change) — gives
// crawlers Product + Breadcrumb data even though the visible body is client UI.
export default async function Page({ params }: Params) {
  const { id } = await params;
  const data = await getProduct(id);
  if (!data) return <Client />;

  const { product } = data;
  const url = `${SITE_URL}/product/${id}`;
  const image = absoluteImage(product.seo?.ogImage || product.image);

  const productLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [image],
    description: (product.seoDescription || product.description || '').slice(0, 300),
    brand: { '@type': 'Brand', name: SITE_NAME },
    category: product.category,
    sku: product.productId,
    url,
  };
  if (typeof product.priceUSD === 'number' && product.priceUSD > 0) {
    productLd.offers = {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.priceUSD,
      availability:
        product.available === false
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      url,
    };
  }
  if (product.totalReviews && product.averageRating) {
    productLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.totalReviews,
    };
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` },
      ...(product.category
        ? [{ '@type': 'ListItem', position: 3, name: product.category, item: `${SITE_URL}/products/${product.category}` }]
        : []),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Client initialData={data} />
    </>
  );
}
