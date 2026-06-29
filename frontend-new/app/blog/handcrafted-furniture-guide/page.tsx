import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/server/api';
import Article from './Article';

/* ------------------------------------------------------------------ *
 * Standalone SEO blog page (NOT DB-seeded).
 * Lives as a static route segment so Next.js prefers it over the
 * dynamic /blog/[slug] route. Fully server-rendered for crawlability.
 * ------------------------------------------------------------------ */

const SLUG = 'handcrafted-furniture-guide';
const CANONICAL = `${SITE_URL}/blog/${SLUG}`;

const TITLE = 'Handcrafted Furniture Guide: Artisan & Custom Wood';
const DESCRIPTION =
  'Discover the beauty of handcrafted furniture. Learn how to choose, care for, and buy quality handmade wooden furniture for every room.';

const KEYWORDS = [
  'handcrafted furniture',
  'handmade wooden furniture',
  'artisan furniture',
  'custom wood furniture',
  'sustainable handcrafted furniture',
  'handcrafted furniture India',
  'solid wood furniture exporter',
  'custom teak dining table',
];

const PUBLISHED_AT = '2026-06-25T14:00:00.000Z';
const MODIFIED_AT = '2026-06-25T14:00:00.000Z';

const HERO_IMAGE = `${SITE_URL}/blog/handcrafted-furniture-guide/handcrafted-teak-dining-table.jpg`;

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
    images: [{ url: HERO_IMAGE, width: 1200, height: 630, alt: 'Handcrafted teak wood dining table in a luxury home' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: HERO_IMAGE, alt: 'Handcrafted teak wood dining table in a luxury home' }],
  },
};

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Why should I choose handcrafted wooden furniture over mass-produced items?',
    a: 'Handcrafted furniture offers superior durability (built to last generations using solid woods like teak and oak), unique designs where no two pieces are identical, traditional high-strength joinery, and custom sizing/finish choices.',
  },
  {
    q: 'How can I verify the quality of handmade furniture?',
    a: 'Check for solid wood throughout (including backs and drawer bottoms), inspect for traditional joints like dovetail and mortise-and-tenon, and look for smooth, hand-finished surfaces without rough patches.',
  },
  {
    q: 'Can HS Global Export customize wood furniture?',
    a: 'Yes. We offer customization of dimensions, wood types, finishes, and hardware options to meet specific requirements for residential or hospitality projects.',
  },
  {
    q: 'What is the environmental benefit of handcrafted furniture?',
    a: 'Artisan furniture is highly sustainable. It uses responsibly sourced or reclaimed wood, produces low waste, and its long lifespan significantly reduces the environmental impact compared to disposable furniture.',
  },
  {
    q: 'How do I care for my handcrafted wood furniture?',
    a: 'Dust with a soft dry cloth, avoid direct sunlight and extreme humidity changes, use coasters and placemats, and reapply high-quality wax or oil annually if recommended for the specific finish.',
  },
];

export default function Page() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'Handcrafted Furniture: The Complete Guide to Timeless Artisan Pieces for Your Home',
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
    articleSection: 'Handcrafted Furniture',
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
        name: 'Handcrafted Furniture Guide',
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
