import type { Metadata } from 'next';
import { getPageSeo, absoluteImage, SITE_NAME, SITE_URL } from '@/server/api';
import Client from './client';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('/about');
  const title =
    seo?.title || `About Us | Furniture & Semi-Precious Stone Exporter — ${SITE_NAME}`;
  const description =
    seo?.description ||
    `${SITE_NAME} is a manufacturer and exporter of wooden, marble and leather furniture and semi-precious stone products, handcrafted in Ahmedabad, India and shipped worldwide.`;
  const canonical = seo?.canonical || `${SITE_URL}/about`;
  const image = seo?.image ? absoluteImage(seo.image) : `${SITE_URL}/og-image.jpg`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { type: 'website', siteName: SITE_NAME, title, description, url: canonical, images: [{ url: image, width: 1200, height: 630, alt: SITE_NAME }] },
    twitter: { card: 'summary_large_image', title, description, images: [{ url: image, alt: SITE_NAME }] },
  };
}

const aboutLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: `About ${SITE_NAME}`,
  description: `Learn about ${SITE_NAME}'s craftsmanship in handcrafted wooden, marble and leather furniture and semi-precious stone products.`,
  url: `${SITE_URL}/about`,
  mainEntity: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    foundingDate: '2024',
    foundingLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Ahmedabad',
        addressRegion: 'Gujarat',
        addressCountry: 'IN',
      },
    },
    description:
      'Manufacturer and exporter of wooden, marble and leather furniture and semi-precious stone products, shipping worldwide.',
  },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutLd) }} />
      <h1 className="sr-only">About HS Global Export — Our Story, Vision &amp; Heritage</h1>
      <Client />
    </>
  );
}
