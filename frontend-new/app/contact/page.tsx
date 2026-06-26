import type { Metadata } from 'next';
import { getPageSeo, absoluteImage, SITE_NAME, SITE_URL } from '@/server/api';
import Client from './client';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('/contact');
  const title = seo?.title || `Contact Us | ${SITE_NAME}`;
  const description =
    seo?.description ||
    'Contact HS Global Export for premium granite and marble solutions. Call +91 81071 15116 or email inquiry@hsglobalexport.com. Worldwide shipping available.';
  const canonical = seo?.canonical || `${SITE_URL}/contact`;
  const image = seo?.image ? absoluteImage(seo.image) : `${SITE_URL}/og-image.jpg`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { type: 'website', siteName: SITE_NAME, title, description, url: canonical, images: [{ url: image, width: 1200, height: 630, alt: SITE_NAME }] },
    twitter: { card: 'summary_large_image', title, description, images: [{ url: image, alt: SITE_NAME }] },
  };
}

const localBusinessLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: SITE_NAME,
  url: SITE_URL,
  telephone: '+91-81071-15116',
  email: 'inquiry@hsglobalexport.com',
  image: `${SITE_URL}/og-image.jpg`,
  priceRange: '$$',
  description:
    'Contact HS Global Export for premium granite and marble solutions. Call +91 81071 15116 or email inquiry@hsglobalexport.com. Worldwide shipping available.',
  areaServed: ['US', 'GB', 'IN', 'Worldwide'],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'C-108, Titanium Business Park, Makarba',
    addressLocality: 'Ahmedabad',
    postalCode: '380051',
    addressRegion: 'Gujarat',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '23.0225',
    longitude: '72.5714',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '09:00',
    closes: '18:00',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-81071-15116',
    email: 'inquiry@hsglobalexport.com',
    contactType: 'customer service',
  },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }} />
      <h1 className="sr-only">Contact HS Global Export — Get in Touch</h1>
      <Client />
    </>
  );
}
