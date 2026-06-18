import type { Metadata } from 'next';
import { getPageSeo, absoluteImage, SITE_NAME, SITE_URL } from '@/server/api';
import Client from './client';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('/');
  const title =
    seo?.title ?? 'Marble & Granite Furniture Manufacturer & Exporter | HS Global Export';
  const description =
    seo?.description ??
    'HS Global Export — premium granite & marble solutions. Handcrafted products with worldwide delivery to the USA, UK and beyond.';
  const canonical = seo?.canonical ?? SITE_URL;
  const image = seo?.image ? absoluteImage(seo.image) : `${SITE_URL}/og-image.jpg`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, images: [{ url: image, width: 1200, height: 630, alt: SITE_NAME }] },
    twitter: { card: 'summary_large_image', title, description, images: [{ url: image, alt: SITE_NAME }] },
  };
}

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.jpg`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-81071-15116',
    contactType: 'customer service',
    areaServed: ['US', 'GB', 'IN'],
    availableLanguage: 'English',
  },
  sameAs: [],
};

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/products?search={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export default function Page() {
  return (
    <>
      {/* Preload LCP hero image so the browser fetches it with high priority */}
      <link
        rel="preload"
        as="image"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore — React 18 types don't expose imageSrcSet/imageSizes yet
        imageSrcSet="/_next/image?url=%2Fbanner4.webp&w=640&q=75 640w, /_next/image?url=%2Fbanner4.webp&w=828&q=75 828w, /_next/image?url=%2Fbanner4.webp&w=1200&q=75 1200w, /_next/image?url=%2Fbanner4.webp&w=1920&q=75 1920w"
        imageSizes="100vw"
        fetchPriority="high"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      <Client />
    </>
  );
}
