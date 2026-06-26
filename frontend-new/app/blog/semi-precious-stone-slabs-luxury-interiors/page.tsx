import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/server/api';
import Article from './Article';

/* ------------------------------------------------------------------ *
 * Standalone SEO blog page (NOT DB-seeded).
 * Lives as a static route segment so Next.js prefers it over the
 * dynamic /blog/[slug] route. Fully server-rendered for crawlability.
 * ------------------------------------------------------------------ */

const SLUG = 'semi-precious-stone-slabs-luxury-interiors';
const CANONICAL = `${SITE_URL}/blog/${SLUG}`;

const TITLE = 'Luxury Semi Precious Stone Slabs for Premium Interior Applications';
const DESCRIPTION =
  'Discover HS Global Export\'s premium semi precious stone slabs including Agate, Amethyst, Quartz, Amazonite, Jasper, Tiger Eye, Mother of Pearl, and Petrified Wood.';

const KEYWORDS = [
  'Semi Precious Stone Slabs',
  'agate slabs',
  'amethyst slabs',
  'gemstone slabs manufacturer',
  'tiger eye slabs',
  'mother of pearl slabs',
  'petrified wood slabs',
  'backlit stone slabs',
];

const PUBLISHED_AT = '2026-06-25T16:00:00.000Z';
const MODIFIED_AT = '2026-06-25T16:00:00.000Z';

const HERO_IMAGE = `${SITE_URL}/blog/semi-precious-stone-slabs-luxury-interiors/semi-precious-stone-slabs.png`;

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
    images: [{ url: HERO_IMAGE, width: 1200, height: 630, alt: 'Luxury semi precious stone slabs backlit in a premium interior' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: HERO_IMAGE, alt: 'Luxury semi precious stone slabs backlit in a premium interior' }],
  },
};

const FAQS: { q: string; a: string }[] = [
  {
    q: 'What are semi precious stone slabs?',
    a: 'Semi precious stone slabs are natural stone surfaces created from gemstones such as Agate, Amethyst, Quartz, Amazonite, Jasper, Tiger Eye, Mother of Pearl, and Petrified Wood. They are widely used in luxury interior and architectural applications.',
  },
  {
    q: 'Where are semi precious stone slabs commonly used?',
    a: 'These slabs are commonly used for feature walls, reception counters, luxury hotel interiors, wall cladding, decorative panels, bar counters, and premium residential projects.',
  },
  {
    q: 'Are semi precious stone slabs durable?',
    a: 'Yes. Most semi precious stone slabs offer excellent durability and can last for decades when properly installed and maintained.',
  },
  {
    q: 'Can semi precious stone slabs be backlit?',
    a: 'Yes. Stones such as Agate and some Quartz varieties have translucent properties that allow stunning backlit applications.',
  },
  {
    q: 'Why choose HS Global Export for semi precious stone slabs?',
    a: 'HS Global Export provides premium-quality semi precious stone slabs, expert craftsmanship, custom solutions, and worldwide export services for luxury architectural and interior design projects.',
  },
];

export default function Page() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'Luxury Semi Precious Stone Slabs for Premium Interior Applications',
    description: DESCRIPTION,
    image: [HERO_IMAGE],
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    datePublished: PUBLISHED_AT,
    dateModified: MODIFIED_AT,
    mainEntityOfPage: { '@type': 'WebPage', '@id': CANONICAL },
    keywords: KEYWORDS.join(', '),
    articleSection: 'Semi Precious Stone',
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
        name: 'Semi Precious Stone Slabs',
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
