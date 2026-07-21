import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/server/api';
import Article from './Article';

/* ------------------------------------------------------------------ *
 * Standalone SEO blog page (NOT DB-seeded).
 * Lives as a static route segment so Next.js prefers it over the
 * dynamic /blog/[slug] route. Fully server-rendered for crawlability.
 * ------------------------------------------------------------------ */

const SLUG = 'granite-vs-marble-furniture-which-lasts-longer';
const CANONICAL = `${SITE_URL}/blog/${SLUG}`;

const TITLE = 'Granite vs Marble Furniture: Which Lasts Longer?';
const DESCRIPTION =
  'Granite vs marble for furniture, not just countertops — hardness, porosity, and lifespan compared, plus which stone suits dining tables, consoles and bathtubs.';

const KEYWORDS = [
  'granite vs marble furniture',
  'marble furniture durability',
  'granite furniture vs marble furniture',
  'which lasts longer granite or marble',
  'marble dining table durability',
  'marble furniture maintenance',
];

// Static dates for this evergreen article.
const PUBLISHED_AT = '2026-07-22T09:30:00.000Z';
const MODIFIED_AT = '2026-07-22T09:30:00.000Z';

const HERO_IMAGE = 'https://res.cloudinary.com/dynd1aan0/image/upload/v1779285557/hs-global/furniture/etsy/HSMBTBL6/4.webp';

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
    images: [{ url: HERO_IMAGE, width: 1200, height: 630, alt: 'Black marble freestanding bathtub, a durability-testing use case for stone furniture' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: HERO_IMAGE, alt: 'Black marble freestanding bathtub, a durability-testing use case for stone furniture' }],
  },
};

// ── FAQ source of truth (drives both the visible section and FAQPage schema) ──
const FAQS: { q: string; a: string }[] = [
  {
    q: 'Is granite harder than marble?',
    a: 'Yes. Granite typically rates 6–7 on the Mohs hardness scale, while marble rates 3–4. Granite resists scratching and etching far better, which is why it dominates high-wear kitchen countertops.',
  },
  {
    q: 'So why do designers still choose marble furniture over granite?',
    a: 'Furniture is chosen on presence, not just wear resistance. Marble\'s soft veining and light-catching translucence read as timeless and luxurious in a way granite\'s speckled, uniform pattern rarely matches — which is why it remains the default for statement dining tables, consoles and coffee tables.',
  },
  {
    q: 'How often does marble furniture need sealing?',
    a: 'Every 6–12 months for pieces in regular use, more often in humid climates or for surfaces that see frequent spills. A quality seal is what keeps marble\'s durability gap with granite manageable.',
  },
  {
    q: 'Is marble furniture too fragile for daily use?',
    a: 'No — with sealing and basic care (wiping acidic spills promptly, using coasters and trivets), marble furniture handles daily residential use well. It requires more attentiveness than granite, not fragility avoidance.',
  },
  {
    q: 'Does HS Global Export make granite furniture?',
    a: 'We specialize in marble and natural stone furniture — dining tables, coffee tables, console tables, bathtubs, sinks and decor pieces — chosen specifically for marble\'s aesthetic qualities. If your project genuinely needs granite\'s hardness, we can advise on the trade-off before you order.',
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
