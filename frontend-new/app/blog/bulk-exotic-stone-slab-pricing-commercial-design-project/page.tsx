import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/server/api';
import Article from './Article';

/* ------------------------------------------------------------------ *
 * Standalone SEO blog page (NOT DB-seeded).
 * Lives as a static route segment under /app/blog/<slug>/
 * ------------------------------------------------------------------ */

const SLUG = 'bulk-exotic-stone-slab-pricing-commercial-design-project';
const CANONICAL = `${SITE_URL}/blog/${SLUG}`;

const TITLE = "Bulk Exotic Stone Slab Pricing: Commercial Buyer's Guide | HS Global";
const DESCRIPTION =
  'How to secure best pricing on bulk exotic stone slab orders for commercial projects — supply chain tiers, negotiation tactics, and exporter insights from HS Global Export.';

const KEYWORDS = [
  'bulk order exotic stone slab commercial project best pricing',
  'wholesale exotic stone slabs',
  'rare stone slab bulk pricing',
  'commercial stone sourcing',
  'direct quarry stone import',
  'book matched stone slab commercial',
];

const PUBLISHED_AT = '2026-08-01T10:00:00.000Z';
const MODIFIED_AT = '2026-08-01T10:00:00.000Z';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

export const metadata: Metadata = {
  title: { absolute: `${TITLE}` },
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
    images: [{ url: HERO_IMAGE, width: 1200, height: 630, alt: 'Bulk Exotic Stone Slab Pricing Commercial Guide' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: HERO_IMAGE, alt: 'Bulk Exotic Stone Slab Pricing Commercial Guide' }],
  },
};

const FAQS: { q: string; a: string }[] = [
  {
    q: 'What is the minimum order for wholesale exotic stone slab pricing?',
    a: 'At the importer or specialty distributor tier, the typical minimum is a full bundle of 8–12 slabs, or a specific lot. At the exporter/processing facility tier, the minimum is typically a full container (20–25 metric tons). Some exporters, including HS Global Export, work with commercial buyers on partial container arrangements for projects that require multiple stone types.',
  },
  {
    q: 'How much cheaper is buying direct from an exporter vs a regional distributor?',
    a: 'Based on market pricing data, accessing the processing facility or exporter tier directly reduces exotic stone material cost by 30–50% compared to regional distributor pricing. On a 500 sq ft commercial project in premium quartzite at $60/sq ft distributor pricing vs $35/sq ft exporter pricing, the material saving is $12,500 before fabrication and installation.',
  },
  {
    q: 'Can I specify a particular vein pattern or slab for a book-matched feature wall?',
    a: 'Yes — this is called lot reservation and sequential slab selection. At HS Global Export, for commercial book-matching projects, we send slab photos and videos of the specific quarry lot before any cutting begins, and confirm your selection before processing. Sequential slabs are kept together and crated in order to preserve the book-matching sequence.',
  },
  {
    q: 'How do I avoid receiving stone that doesn\'t match my specification?',
    a: 'Three protections: first, specify the quarry lot number in the purchase order, not just the stone name. Second, require slab photos or video from the specific lot before approving the order. Third, order a 15–20% material buffer for rare varieties so you are not exposed to mid-project shortfalls that force substitution.',
  },
];

export default function Page() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'How to Secure the Best Pricing on Bulk Orders of Rare Exotic Stone Slabs for Commercial Design Projects',
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
    articleSection: 'Exotic Stone Slabs',
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
        name: 'Bulk Exotic Stone Slab Pricing Guide',
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
      <Article faqs={FAQS} publishedLabel="August 1, 2026" heroImage={HERO_IMAGE} canonical={CANONICAL} />
    </>
  );
}
