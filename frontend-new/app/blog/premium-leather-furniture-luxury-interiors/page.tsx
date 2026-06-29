import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/server/api';
import Article from './Article';

/* ------------------------------------------------------------------ *
 * Standalone SEO blog page (NOT DB-seeded).
 * Lives as a static route segment so Next.js prefers it over the
 * dynamic /blog/[slug] route. Fully server-rendered for crawlability.
 * ------------------------------------------------------------------ */

const SLUG = 'premium-leather-furniture-luxury-interiors';
const CANONICAL = `${SITE_URL}/blog/${SLUG}`;

const TITLE = 'Premium Leather Furniture for Luxury Interiors';
const DESCRIPTION =
  'Discover handcrafted luxury leather furniture including sofas, armchairs, beds, coffee tables, dressers, mirrors, and storage solutions by HS Global Export.';

const KEYWORDS = [
  'premium leather furniture',
  'luxury leather sofas',
  'handcrafted leather bed',
  'leather furniture manufacturer',
  'leather side table',
  'leather console table',
  'luxury leather armchairs',
  'leather furniture exporter',
];

const PUBLISHED_AT = '2026-06-25T15:00:00.000Z';
const MODIFIED_AT = '2026-06-25T15:00:00.000Z';

const HERO_IMAGE = `${SITE_URL}/blog/premium-leather-furniture-luxury-interiors/premium-leather-sofa.jpg`;

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | ${SITE_NAME}` },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  authors: [{ name: SITE_NAME }],
  alternates: { canonical: CANONICAL },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: 'article',
    siteName: SITE_NAME,
    publishedTime: PUBLISHED_AT,
    modifiedTime: MODIFIED_AT,
    authors: [SITE_NAME],
    images: [{ url: HERO_IMAGE, width: 1200, height: 630, alt: 'Premium handcrafted leather sofa in a luxury modern interior' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: HERO_IMAGE, alt: 'Premium handcrafted leather sofa in a luxury modern interior' }],
  },
};

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Why is leather furniture considered a luxury choice?',
    a: 'Leather furniture is considered luxurious because of its premium appearance, exceptional durability, and timeless appeal. High-quality leather develops a rich patina over time, making each piece unique while maintaining its elegance for years.',
  },
  {
    q: 'How long does quality leather furniture last?',
    a: 'Premium leather furniture can last 15–25 years or even longer with proper care. Its durability makes it a valuable long-term investment for homes, hotels, offices, and luxury interior projects.',
  },
  {
    q: 'Is leather furniture easy to maintain?',
    a: 'Yes. Leather furniture is relatively easy to maintain compared to many fabric alternatives. Regular dusting, occasional cleaning with a leather-safe product, and keeping it away from direct sunlight can help preserve its beauty and longevity.',
  },
  {
    q: 'What types of rooms are best suited for leather furniture?',
    a: 'Leather furniture works beautifully in living rooms, bedrooms, offices, hotel suites, lounges, and luxury commercial spaces. Its versatility allows it to complement both modern and classic interior designs.',
  },
  {
    q: 'Why choose handcrafted leather furniture from HS Global Export?',
    a: 'HS Global Export combines skilled craftsmanship, premium materials, and international quality standards to create luxury leather furniture. Our collection includes sofas, armchairs, beds, tables, storage solutions, and décor pieces designed for customers worldwide.',
  },
];

export default function Page() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'Premium Leather Furniture for Modern Luxury Interiors',
    description: DESCRIPTION,
    image: [HERO_IMAGE],
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/og-image.jpg` },
    },
    datePublished: PUBLISHED_AT,
    dateModified: MODIFIED_AT,
    mainEntityOfPage: { '@type': 'WebPage', '@id': CANONICAL },
    keywords: KEYWORDS.join(', '),
    articleSection: 'Leather Furniture',
    inLanguage: 'en',
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Premium Leather Furniture',
        item: CANONICAL,
      },
    ],
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Article faqs={FAQS} publishedLabel="June 25, 2026" heroImage={HERO_IMAGE} canonical={CANONICAL} />
    </>
  );
}
