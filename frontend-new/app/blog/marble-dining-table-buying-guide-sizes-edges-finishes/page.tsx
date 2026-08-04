import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/server/api';
import Article from './Article';

/* ------------------------------------------------------------------ *
 * Standalone SEO blog page (NOT DB-seeded).
 * Lives as a static route segment so Next.js prefers it over the
 * dynamic /blog/[slug] route. Fully server-rendered for crawlability.
 * ------------------------------------------------------------------ */

const SLUG = 'marble-dining-table-buying-guide-sizes-edges-finishes';
const CANONICAL = `${SITE_URL}/blog/${SLUG}`;

const TITLE = 'Marble Dining Table Buying Guide: Sizes, Edges & Finishes';
const DESCRIPTION =
  'Choose the right marble dining table with confidence. Sizes by seating, edge profiles explained, finish types compared — plus real exporter insights on shipping to USA & UK.';

const KEYWORDS = [
  'marble dining table buying guide',
  'marble dining table sizes',
  'marble table edge profiles',
  'honed vs polished marble table',
  'marble table finish types',
];

// Static dates for this evergreen article.
const PUBLISHED_AT = '2026-06-30T10:00:00.000Z';
const MODIFIED_AT = '2026-06-30T10:00:00.000Z';

// Hero/OG image
const HERO_IMAGE = `${SITE_URL}/blog/marble-dining-table-buying-guide/hero.png`;

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
    images: [{ url: HERO_IMAGE, width: 1200, height: 630, alt: 'Marble dining table buying guide' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: HERO_IMAGE, alt: 'Marble dining table buying guide' }],
  },
};

// ── FAQ source of truth (drives both the visible section and FAQPage schema) ──
const FAQS: { q: string; a: string }[] = [
  { q: 'What is the best marble finish for a dining table used every day?', a: 'Honed is the best finish for everyday dining. It conceals etch marks and water rings far better than polished, while still showcasing the marble’s natural veining and depth.' },
  { q: 'How thick should a marble dining table top be?', a: 'A minimum of 2 cm (¾ inch) for residential dining tables. For tables over 200 cm in length, 3 cm (1¼ inch) is recommended for structural stability and a more substantial visual presence.' },
  { q: 'Which marble edge profile is safest for homes with children?', a: 'Full bullnose is the safest option — the fully rounded profile eliminates all sharp corners. Half bullnose or beveled edges are also acceptable alternatives.' },
  { q: 'How much does a marble dining table cost when imported from an exporter?', a: 'Pricing depends heavily on the marble variety and size. Reach out to our team at HS Global for FOB and CIF pricing tailored to your exact specifications.' },
  { q: 'What is the shipping time for a marble dining table from India to the USA or UK?', a: 'Shipping typically takes 18-24 days port-to-port for the UK, and custom orders usually arrive within 4-8 weeks to the USA or UK inclusive of production time.' },
  { q: 'Can marble dining tables be used outdoors?', a: 'Natural marble is not recommended for outdoor use. Freeze-thaw cycles cause spalling and cracking; UV exposure fades and yellows lighter marbles over time. For outdoor applications, sintered stone or granite are more appropriate alternatives.' },
  { q: 'What is the difference between Carrara and Calacatta marble?', a: 'Carrara has a greyer base with finer, subtler veining — more understated and widely available. Calacatta is rarer, whiter, with bold gold or brown veining — more dramatic and commanding a higher price. For everyday dining, Carrara is the more practical choice. For a formal dining room centrepiece, Calacatta makes the stronger statement.' },
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
      {
        '@type': 'ListItem',
        position: 3,
        name: TITLE,
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
      <Article faqs={FAQS} publishedLabel="June 30, 2026" heroImage={HERO_IMAGE} canonical={CANONICAL} />
    </>
  );
}
