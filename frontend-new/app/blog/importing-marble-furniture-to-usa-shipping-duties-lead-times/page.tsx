import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/server/api';
import Article from './Article';

/* ------------------------------------------------------------------ *
 * Standalone SEO blog page (NOT DB-seeded).
 * Lives as a static route segment so Next.js prefers it over the
 * dynamic /blog/[slug] route. Fully server-rendered for crawlability.
 * ------------------------------------------------------------------ */

const SLUG = 'importing-marble-furniture-to-usa-shipping-duties-lead-times';
const CANONICAL = `${SITE_URL}/blog/${SLUG}`;

const TITLE = 'Importing Marble Furniture to the USA: Shipping, Duties & Lead Times';
const DESCRIPTION =
  'A manufacturer\'s guide to importing marble furniture into the USA — real production lead times, DDU shipping terms, customs duties, and crating for fragile stone.';

const KEYWORDS = [
  'importing marble furniture to USA',
  'marble furniture import duties',
  'marble furniture shipping time',
  'marble furniture customs USA',
  'marble furniture exporter India to USA',
  'HTS code marble furniture',
  'DDU marble furniture shipping',
];

// Static dates for this evergreen article.
const PUBLISHED_AT = '2026-07-22T09:00:00.000Z';
const MODIFIED_AT = '2026-07-22T09:00:00.000Z';

const HERO_IMAGE = 'https://res.cloudinary.com/dynd1aan0/image/upload/v1779286813/hs-global/furniture/etsy/HSMDTWH5/file_000000001c1c71fbbd46fd584b2887ca.webp';

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
    images: [{ url: HERO_IMAGE, width: 1200, height: 630, alt: 'Handcrafted white marble dining table ready for export' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: HERO_IMAGE, alt: 'Handcrafted white marble dining table ready for export' }],
  },
};

// ── FAQ source of truth (drives both the visible section and FAQPage schema) ──
const FAQS: { q: string; a: string }[] = [
  {
    q: 'How long does it take to import marble furniture from India to the USA?',
    a: 'Most made-to-order marble pieces take 30–60 days to produce, depending on size and complexity. After dispatch, international delivery typically takes up to 60 days via DHL, FedEx or India Post — so plan for roughly 8–16 weeks door-to-door, including production.',
  },
  {
    q: 'Who pays customs duty and import taxes on marble furniture?',
    a: 'HS Global Export ships internationally on a Delivery Duty Unpaid (DDU) basis. This means the buyer is responsible for any customs duties, import taxes, or clearance fees charged by their country — these are not included in the product or shipping price.',
  },
  {
    q: 'What HTS code applies to marble furniture imports?',
    a: 'Furniture made of marble or other natural stone is generally classified under HTS Chapter 68 (articles of stone, plaster, cement) or under furniture headings depending on construction. Classification affects your duty rate, so we recommend confirming the exact code with a licensed customs broker before your shipment leaves India.',
  },
  {
    q: 'Are there extra tariffs on marble furniture imported from India?',
    a: 'Section 301 tariffs that add up to 25% on certain stone products are targeted at China-origin goods and generally do not apply to marble furniture manufactured in India. Trade policy can change, so always confirm current rates with your customs broker before ordering.',
  },
  {
    q: 'How is marble furniture packed for international shipping?',
    a: 'Every piece is wrapped in protective foam, corner-guarded, and crated in custom-built wooden crates sized to the product. Fragile and high-value shipments are insured in transit, and we provide tracking once your order is dispatched.',
  },
  {
    q: 'Can I get a sample or photos before placing a full order?',
    a: 'Yes — for bulk, trade, or first-time orders we can share detailed photos, videos, and material swatches before you commit. Contact our team with your requirements to arrange this.',
  },
];

export default function Page() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: TITLE,
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
      { '@type': 'ListItem', position: 3, name: TITLE, item: CANONICAL },
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
      <Article faqs={FAQS} publishedLabel="July 22, 2026" heroImage={HERO_IMAGE} canonical={CANONICAL} />
    </>
  );
}
