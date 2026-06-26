import type { Metadata } from 'next';
import { getPageSeo, absoluteImage, SITE_NAME, SITE_URL } from '@/server/api';
import Client from './client';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('/shipping');
  const title =
    seo?.title || `Worldwide Shipping & Export Logistics | ${SITE_NAME}`;
  const description =
    seo?.description ||
    'Worldwide shipping for granite and marble: export logistics, secure packaging, customs support and reliable delivery to the USA, UK and beyond.';
  const canonical = seo?.canonical || `${SITE_URL}/shipping`;
  const image = seo?.image ? absoluteImage(seo.image) : `${SITE_URL}/og-image.jpg`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { type: 'website', siteName: SITE_NAME, title, description, url: canonical, images: [{ url: image, width: 1200, height: 630, alt: SITE_NAME }] },
    twitter: { card: 'summary_large_image', title, description, images: [{ url: image, alt: SITE_NAME }] },
  };
}

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'International Shipping and Export Logistics',
  provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  areaServed: { '@type': 'Place', name: 'Worldwide' },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Shipping Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Export Packaging', description: 'Secure crating and packaging for international transit' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Freight Coordination', description: 'Sea and air freight coordination with trusted partners' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Customs Support', description: 'Documentation and clearance assistance for exports' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Delivery Assurance', description: 'Tracking, insurance, and delivery updates' } },
    ],
  },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
      <h1 className="sr-only">Global Shipping &amp; Export Logistics — HS Global Export</h1>
      <Client />
    </>
  );
}
