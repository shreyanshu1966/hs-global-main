import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/server/api';
import Article from './Article';

/* ------------------------------------------------------------------ *
 * Standalone SEO blog page (NOT DB-seeded).
 * Lives as a static route segment so Next.js prefers it over the
 * dynamic /blog/[slug] route. Fully server-rendered for crawlability.
 * ------------------------------------------------------------------ */

const SLUG = 'leather-furniture-trends-2026-luxury-homes';
const CANONICAL = `${SITE_URL}/blog/${SLUG}`;

const TITLE = 'Leather Furniture Trends 2026 for Luxury Homes';
const DESCRIPTION =
  'The leather furniture trends shaping luxury homes in 2026 — cognac and earth tones, quiet-luxury silhouettes, hand-stitched craftsmanship, and lived-in comfort.';

const KEYWORDS = [
  'leather furniture trends 2026',
  'luxury leather furniture trends',
  'cognac leather sofa trend',
  'quiet luxury leather furniture',
  'leather furniture colors 2026',
  'handcrafted leather sofa trends',
];

// Static dates for this evergreen article.
const PUBLISHED_AT = '2026-07-22T10:00:00.000Z';
const MODIFIED_AT = '2026-07-22T10:00:00.000Z';

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
    images: [{ url: HERO_IMAGE, width: 1200, height: 630, alt: 'Cognac-toned premium leather sofa in a modern luxury living room' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: HERO_IMAGE, alt: 'Cognac-toned premium leather sofa in a modern luxury living room' }],
  },
};

// ── FAQ source of truth (drives both the visible section and FAQPage schema) ──
const FAQS: { q: string; a: string }[] = [
  {
    q: 'What is the biggest leather furniture color trend for 2026?',
    a: 'Warm, grounded tones — cognac, caramel, and deep brown — are the dominant leather colors for 2026, alongside earth-infused neutrals like chalk, champagne, and mist replacing cooler greys.',
  },
  {
    q: 'What does "quiet luxury" mean for leather furniture?',
    a: 'It means construction quality over logos or flashy details — curved silhouettes, honest materials, hand-stitched leather, and antiqued metal hardware. The luxury is in how a piece is built, not how loudly it announces itself.',
  },
  {
    q: 'Is distressed or "lived-in" leather still in style for 2026?',
    a: 'Yes — vintage-inspired, lived-in leather with generous, lounge-friendly silhouettes is trending over stiff, showroom-perfect pieces. It signals comfort and character rather than newness.',
  },
  {
    q: 'Can HS Global Export customize leather furniture to match these trends?',
    a: 'Yes. We offer custom leather tones, stitching patterns, frame dimensions, and finishes, so you can specify cognac or earth-tone leather, curved silhouettes, or antiqued hardware to match current interior trends.',
  },
  {
    q: 'Are these leather trends practical for daily family use?',
    a: 'Very. Top-grain leather in warmer tones hides everyday marks better than pale greys, and the quiet-luxury emphasis on durable construction (solid frames, reinforced stitching) is built for long-term daily use, not just appearance.',
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
    articleSection: 'Leather Furniture',
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
