import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/server/api';
import Article from './Article';

/* ------------------------------------------------------------------ *
 * Standalone SEO blog page (NOT DB-seeded).
 * Lives as a static route segment so Next.js prefers it over the
 * dynamic /blog/[slug] route. Fully server-rendered for crawlability.
 * ------------------------------------------------------------------ */

const SLUG = 'indian-marble-furniture-luxury-homes';
const CANONICAL = `${SITE_URL}/blog/${SLUG}`;

const TITLE = 'Indian Marble Furniture – Luxury Handcrafted Pieces';
const DESCRIPTION =
  'Discover why handcrafted Indian marble furniture is dominating luxury homes in the USA & UK. Explore custom pieces from HS Global Export — worldwide delivery.';

const KEYWORDS = [
  'marble furniture manufacturer India',
  'luxury marble furniture',
  'handcrafted marble furniture exporter',
  'Indian marble furniture export USA',
  'custom marble furniture manufacturer',
  'marble dining table manufacturer India',
  'natural stone furniture wholesale',
  'marble coffee table exporter',
  'Makrana marble furniture',
];

// Static dates for this evergreen article.
const PUBLISHED_AT = '2026-06-22T08:00:00.000Z';
const MODIFIED_AT = '2026-06-22T08:00:00.000Z';

// Hero/OG image — swap the placeholder file in /public when ready.
const HERO_IMAGE = `${SITE_URL}/blog/indian-marble-furniture/hero-marble-dining-table.jpg`;

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
    images: [{ url: HERO_IMAGE, width: 1200, height: 630, alt: 'Handcrafted Indian white marble dining table in a luxury home' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: HERO_IMAGE, alt: 'Handcrafted Indian white marble dining table in a luxury home' }],
  },
};

// ── FAQ source of truth (drives both the visible section and FAQPage schema) ──
const FAQS: { q: string; a: string }[] = [
  {
    q: 'Is marble furniture suitable for everyday use?',
    a: 'Yes — with the right sealing and basic care, marble furniture handles daily use beautifully. We recommend sealing marble surfaces annually and wiping spills promptly, especially acidic liquids like lemon juice or wine.',
  },
  {
    q: 'Can I order custom sizes and designs?',
    a: 'Absolutely. Custom sizing, stone selection, base material (metal, wood, solid stone), and finish type are all available at HS Global Export. Contact our team with your dimensions and requirements.',
  },
  {
    q: 'How long does worldwide shipping take?',
    a: 'Shipping timelines depend on destination. USA and UK typically see delivery in 4–8 weeks for custom orders. We provide full shipment tracking and customs documentation.',
  },
  {
    q: 'Do you supply wholesale to interior designers and retailers?',
    a: 'Yes. We actively work with interior designers, furniture retailers, hotel chains, and real estate developers worldwide. Wholesale pricing and minimum order quantities are available — contact us for a trade inquiry.',
  },
  {
    q: 'What is the warranty on your marble furniture?',
    a: 'All HS Global Export marble furniture pieces carry a manufacturing defect warranty. Because marble is a natural material, color and vein variations are inherent features, not defects.',
  },
];

export default function Page() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'Why Indian Marble Furniture Is the World’s Best Choice for Luxury Homes in 2026',
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
    articleSection: 'Marble Furniture',
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
        name: 'Indian Marble Furniture for Luxury Homes',
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
      <Article faqs={FAQS} publishedLabel="June 22, 2026" heroImage={HERO_IMAGE} canonical={CANONICAL} />
    </>
  );
}
