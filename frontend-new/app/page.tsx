import type { Metadata } from 'next';
import { getPageSeo, absoluteImage, SITE_NAME, SITE_URL } from '@/server/api';
import { HOME_FAQ_ITEMS } from '@/data/homeFaq';
import { TESTIMONIALS, TESTIMONIALS_AVG_RATING } from '@/data/testimonials';
import Client from './client';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('/');
  const title =
    seo?.title || 'Marble & Granite Furniture Manufacturer & Exporter | HS Global Export';
  const description =
    seo?.description ||
    'HS Global Export — premium granite & marble solutions. Handcrafted products with worldwide delivery to the USA, UK and beyond.';
  const canonical = seo?.canonical || SITE_URL;
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
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: TESTIMONIALS_AVG_RATING,
    reviewCount: TESTIMONIALS.length,
    bestRating: 5,
    worstRating: 1,
  },
  review: TESTIMONIALS.map((t) => ({
    '@type': 'Review',
    reviewRating: { '@type': 'Rating', ratingValue: t.rating, bestRating: 5, worstRating: 1 },
    author: { '@type': 'Person', name: t.name },
    reviewBody: t.quote,
  })),
};

// FAQPage structured data for the home-page FAQ accordion — shares its source
// data with the HomeFAQ component so the markup and visible copy stay in sync.
const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: HOME_FAQ_ITEMS.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
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
      {/* Preload LCP hero image — href is required for fetchpriority to apply.
          imageSrcSet is React 19-only and silently dropped in React 18, so we
          use a single representative width (828 px covers most mobile viewports)
          with fetchPriority="high" which React 18 maps to the fetchpriority attr. */}
      <link
        rel="preload"
        as="image"
        href="/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdynd1aan0%2Fimage%2Fupload%2Ff_auto%2Cq_auto%2Fhs-global%2Fpublic%2Fbanner1&w=828&q=65"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore — React 18 types don't include fetchPriority on <link>
        fetchPriority="high"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Client />
    </>
  );
}
