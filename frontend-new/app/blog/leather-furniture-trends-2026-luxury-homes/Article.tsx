/* Server-rendered article body — fully static & crawlable (no 'use client'). */

import { AuthorBio, SocialShare, RelatedProducts } from '../_components/ArticleFooter';

type Faq = { q: string; a: string };

const IMG_BASE = '/blog/premium-leather-furniture-luxury-interiors';

// Cardinal Classic Short, forced past the global Inter !important rule.
const SERIF = "![font-family:var(--dibs-font-serif)]";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-5 block text-[11px] font-medium uppercase tracking-[0.24em] text-[#647167]">
      {children}
    </span>
  );
}

function ArticleImage({
  src,
  alt,
  caption,
  ratio = 'aspect-[16/9]',
  className = '',
  priority = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  ratio?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <figure className={className}>
      <div className={`relative ${ratio} w-full overflow-hidden bg-[#f4f3ec]`}>
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-[13px] font-light italic text-[#8a8676]">{caption}</figcaption>
      )}
    </figure>
  );
}

const STATS = [
  { value: '5', label: 'Trends defining 2026' },
  { value: 'Cognac', label: 'Leading leather tone' },
  { value: 'Quiet', label: 'The dominant aesthetic' },
  { value: 'Top-Grain', label: 'Our leather selection' },
];

const TRENDS: { n: string; title: string; text: string }[] = [
  {
    n: '01',
    title: 'Warm, grounded color palettes',
    text: 'Cognac, caramel, and deep brown have overtaken cooler greys as the default leather tone for 2026. Where neutrals are still used, they\'ve shifted toward earth-infused shades — chalk, champagne, and mist — rather than stark cool grey.',
  },
  {
    n: '02',
    title: 'Quiet luxury over branding',
    text: 'The defining aesthetic of 2026 drops big logos and flashy hardware for construction quality you can actually feel — curved silhouettes, honest materials, and antiqued metal detailing that reads as considered rather than decorative.',
  },
  {
    n: '03',
    title: 'Hand-stitching as the visible signature',
    text: 'With rising material costs and a backlash against fast, disposable furniture, buyers are gravitating toward pieces where the craftsmanship is visible — hand-stitched seams, single-piece leather panels, and joinery built to be refinished, not replaced.',
  },
  {
    n: '04',
    title: 'Lived-in comfort over showroom stiffness',
    text: 'Generous, lounge-friendly silhouettes are replacing rigid, formal seating. The distressed, vintage-inspired look continues to rise — leather that looks like it has already lived a little, rather than leather that looks untouched.',
  },
  {
    n: '05',
    title: 'Sustainability as a genuine buying factor',
    text: 'Clients are increasingly asking where materials come from and how long a piece will realistically last, not just how it looks on day one — pushing demand toward durable, repairable furniture over disposable pieces.',
  },
];

const SEATING_PRODUCTS: { img: string; alt: string; title: string; text: string; bestFor: string; href: string }[] = [
  { img: `${IMG_BASE}/leather-sofa.jpg`, alt: 'Luxury leather sofa in a premium living room', title: 'Luxury Leather Sofas', text: 'Available in the 2026 cognac and earth-tone palette, with curved or classic Chesterfield-inspired silhouettes.', bestFor: 'Luxury homes · villas · hotel lounges', href: '/products/leather/sofa' },
  { img: `${IMG_BASE}/leather-armchair.jpg`, alt: 'Premium leather armchair with wooden frame', title: 'Premium Leather Armchairs', text: 'Generous, lounge-friendly proportions built for the "lived-in comfort" look that\'s defining 2026 interiors.', bestFor: 'Living rooms · reading corners', href: '/products/leather/chair' },
  { img: `${IMG_BASE}/leather-ottoman.jpg`, alt: 'Luxury leather ottoman styled next to a coffee table', title: 'Leather Ottomans & Benches', text: 'Quiet-luxury accent pieces that pair antiqued hardware with hand-finished top-grain leather.', bestFor: 'Entryways · bedrooms · dining areas', href: '/products/leather/bench' },
];

const BED_TABLES_PRODUCTS: { img: string; alt: string; title: string; text: string; bestFor: string; href: string }[] = [
  { img: `${IMG_BASE}/leather-bed.jpg`, alt: 'Luxury leather upholstered bed in a master suite', title: 'Luxury Leather Beds', text: 'Curved headboard silhouettes and warm leather tones bring the 2026 quiet-luxury look into the bedroom.', bestFor: 'Master bedrooms · boutique hotel suites', href: '/products/leather/bed' },
  { img: `${IMG_BASE}/leather-coffee-table.jpg`, alt: 'Handcrafted leather coffee table in a modern loft', title: 'Leather Tables (Coffee, Side, Console)', text: 'Mixed-material pairing — leather with wood or stone — is part of the honest-materials trend defining the year.', bestFor: 'Living rooms · hallways · entryways', href: '/products/leather/side-table' },
  { img: `${IMG_BASE}/leather-dresser.jpg`, alt: 'Leather clad dresser with brass details', title: 'Storage & Décor (Dressers, Mirrors)', text: 'Antiqued brass detailing on leather-clad storage pieces — the hardware trend seen across 2026 collections.', bestFor: 'Primary bedrooms · dressing rooms', href: '/products/leather/dresser' },
];

const TAGS = [
  'Leather Furniture Trends',
  'Leather Furniture 2026',
  'Quiet Luxury Interiors',
  'Cognac Leather Sofa',
  'HS Global Export',
];

const BODY = 'text-[17px] font-light leading-[1.8] text-[#444]';

export default function Article({
  faqs,
  publishedLabel,
  heroImage,
  canonical,
}: {
  faqs: Faq[];
  publishedLabel: string;
  heroImage: string;
  canonical: string;
}) {
  return (
    <div className="itsbits-home bg-white text-[#222]">
      {/* ───────────────────────── MASTHEAD ───────────────────────── */}
      <header className="border-b border-[#ece9dd]">
        <div className="mx-auto max-w-3xl px-6 pb-14 pt-32 text-center">
          <nav aria-label="Breadcrumb" className="mb-10 text-[12px] uppercase tracking-[0.16em] text-[#9a9582]">
            <ol className="flex flex-wrap items-center justify-center gap-2">
              <li><a href="/" className="hover:text-[#647167]">Home</a></li>
              <li aria-hidden="true" className="text-[#ece9dd]">/</li>
              <li><a href="/blog" className="hover:text-[#647167]">Blog</a></li>
              <li aria-hidden="true" className="text-[#ece9dd]">/</li>
              <li aria-current="page" className="text-[#647167]">Leather Furniture Trends 2026</li>
            </ol>
          </nav>

          <h1 className={`${SERIF} text-[clamp(28px,4.5vw,48px)] font-normal leading-[1.1] tracking-[-1px] text-[#222]`}>
            Leather Furniture Trends 2026 for Luxury Homes
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-[17px] font-light leading-[1.7] text-[#555]">
            Warmer tones, quieter luxury, and craftsmanship you can actually see — the five leather trends
            shaping high-end interiors this year.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] uppercase tracking-[0.14em] text-[#9a9582]">
            <span className="text-[#647167]">HS Global Export</span>
            <span aria-hidden="true">·</span>
            <span>{publishedLabel}</span>
            <span aria-hidden="true">·</span>
            <span>7 min read</span>
          </div>
        </div>
      </header>

      {/* Hero image */}
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <ArticleImage
          src={heroImage}
          alt="Cognac-toned premium leather sofa styled in a bright modern luxury living room"
          caption="Warm cognac and caramel tones are the defining leather color trend of 2026."
          ratio="aspect-[2/1]"
          priority
        />
      </div>

      {/* Stats */}
      <section className="mx-auto mt-16 max-w-5xl px-6">
        <div className="grid grid-cols-2 border-y border-[#ece9dd] md:grid-cols-4">
          {STATS.map(({ value, label }, i) => (
            <div
              key={label}
              className={`px-6 py-9 text-center ${i % 2 === 1 ? 'border-l border-[#ece9dd]' : ''} ${i >= 2 ? 'border-t border-[#ece9dd] md:border-t-0' : ''} ${i > 0 ? 'md:border-l md:border-[#ece9dd]' : ''}`}
            >
              <div className={`${SERIF} text-[36px] leading-none text-[#222]`}>{value}</div>
              <div className="mt-3 text-[11px] uppercase leading-relaxed tracking-[0.14em] text-[#9a9582]">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-3xl px-6 mt-16">
        <p className="text-[21px] font-light leading-[1.7] text-[#333]">
          Leather furniture doesn't reinvent itself every year — but 2026 marks a genuine shift in what "luxury"
          leather is expected to look and feel like, moving away from cool, formal showroom pieces toward
          something warmer and more lived-in.
        </p>
        <p className={`mt-6 ${BODY}`}>
          We build leather sofas, armchairs, beds, and tables for clients across the USA, UK, and Europe, and these
          are the five shifts we're seeing most consistently in what's being specified for new luxury interiors
          this year.
        </p>
      </section>

      {/* Trends */}
      <section className="mx-auto mt-16 max-w-3xl px-6">
        <Eyebrow>The 2026 shift</Eyebrow>
        <h2 className={`${SERIF} mb-12 text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          Five leather furniture trends defining luxury homes
        </h2>
        <ol className="border-t border-[#ece9dd]">
          {TRENDS.map(({ n, title, text }) => (
            <li key={n} className="grid grid-cols-[3rem_1fr] gap-6 border-b border-[#ece9dd] py-7 sm:grid-cols-[4rem_1fr]">
              <span className={`${SERIF} text-[26px] leading-none text-[#647167]`}>{n}</span>
              <div>
                <h3 className={`${SERIF} mb-1.5 text-[21px] text-[#222]`}>{title}</h3>
                <p className="text-[15px] font-light leading-[1.7] text-[#555]">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Pull quote */}
      <section className="mx-auto mt-20 max-w-4xl px-6">
        <blockquote className="border-y border-[#ece9dd] py-14 text-center">
          <p className={`${SERIF} mx-auto max-w-3xl text-[clamp(24px,3.4vw,38px)] font-normal italic leading-[1.3] text-[#222]`}>
            "2026 leather isn't about looking new — it's about looking like it was built to be lived in for
            twenty years, and getting better the whole time."
          </p>
          <cite className="mt-7 block text-[12px] uppercase not-italic tracking-[0.18em] text-[#9a9582]">
            HS Global Export
          </cite>
        </blockquote>
      </section>

      {/* Seating collection */}
      <section className="mx-auto mt-4 max-w-6xl px-6">
        <Eyebrow>Shop the trend</Eyebrow>
        <h2 className={`${SERIF} mb-4 max-w-2xl text-[clamp(26px,3.4vw,40px)] leading-[1.12] tracking-[-0.5px] text-[#222]`}>
          Seating built for the quiet-luxury look
        </h2>
        <p className="mb-12 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
          Every piece can be customized in tone, stitching, and hardware to match your specific interior.
        </p>
        <div className="grid gap-x-9 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {SEATING_PRODUCTS.map((p) => (
            <article key={p.title} className="group">
              <a href={p.href} aria-label={`Browse ${p.title}`} className="block">
                <ArticleImage src={p.img} alt={p.alt} ratio="aspect-[4/3]" />
                <h3 className={`${SERIF} mt-5 text-[22px] text-[#222] transition-colors group-hover:text-[#647167]`}>{p.title}</h3>
              </a>
              <p className="mt-2 text-[15px] font-light leading-[1.65] text-[#555]">{p.text}</p>
              <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-[#9a9582]">
                <span className="text-[#647167]">Best for</span> — {p.bestFor}
              </p>
              <a href={p.href} className="mt-4 inline-block text-[12px] uppercase tracking-[0.14em] text-[#647167] transition-colors hover:text-[#222]">
                View collection →
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* Beds & tables collection */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
        <Eyebrow>Beyond seating</Eyebrow>
        <h2 className={`${SERIF} mb-4 max-w-2xl text-[clamp(26px,3.4vw,40px)] leading-[1.12] tracking-[-0.5px] text-[#222]`}>
          Beds, tables, and storage in the 2026 palette
        </h2>
        <p className="mb-12 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
          Warm leather tones and antiqued hardware, extended across the bedroom and living room.
        </p>
        <div className="grid gap-x-9 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {BED_TABLES_PRODUCTS.map((p) => (
            <article key={p.title} className="group">
              <a href={p.href} aria-label={`Browse ${p.title}`} className="block">
                <ArticleImage src={p.img} alt={p.alt} ratio="aspect-[4/3]" />
                <h3 className={`${SERIF} mt-5 text-[22px] text-[#222] transition-colors group-hover:text-[#647167]`}>{p.title}</h3>
              </a>
              <p className="mt-2 text-[15px] font-light leading-[1.65] text-[#555]">{p.text}</p>
              <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-[#9a9582]">
                <span className="text-[#647167]">Best for</span> — {p.bestFor}
              </p>
              <a href={p.href} className="mt-4 inline-block text-[12px] uppercase tracking-[0.14em] text-[#647167] transition-colors hover:text-[#222]">
                View collection →
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="mx-auto mt-20 max-w-3xl px-6">
        <Eyebrow>Good to know</Eyebrow>
        <h2 id="faq-heading" className={`${SERIF} mb-8 text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          Frequently asked questions
        </h2>
        <div className="border-t border-[#ece9dd]">
          {faqs.map((f) => (
            <details key={f.q} className="group border-b border-[#ece9dd] py-6">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 marker:hidden">
                <span className={`${SERIF} text-[20px] leading-snug text-[#222]`}>{f.q}</span>
                <span className="mt-1 text-2xl font-light leading-none text-[#647167] transition-transform duration-300 group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-4 max-w-2xl text-[15px] font-light leading-[1.75] text-[#555]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Why us — noir panel */}
      <section aria-labelledby="why-us-heading" className="mt-24 bg-[#222] text-white">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <span className="mb-5 block text-[11px] font-medium uppercase tracking-[0.24em] text-[#b9c2b3]">
            The HS Global difference
          </span>
          <h2 id="why-us-heading" className={`${SERIF} mb-12 max-w-2xl text-[clamp(28px,3.6vw,42px)] leading-[1.12] tracking-[-0.5px] text-white`}>
            Why order your 2026 leather pieces from HS Global Export?
          </h2>
          <ul className="grid gap-x-12 gap-y-7 md:grid-cols-2">
            {[
              'Custom leather tone matching, including cognac and earth-tone palettes',
              'Hand-stitched, top-grain leather with reinforced timber frames',
              'Curved and Chesterfield-inspired silhouettes available on request',
              'Antiqued hardware and mixed-material (leather + wood/stone) options',
              'Export-grade padded packaging for safe worldwide delivery',
              'Direct manufacturer pricing for designers, retailers, and homeowners',
            ].map((item, i) => (
              <li key={item} className="flex items-start gap-4 border-t border-white/15 pt-5">
                <span className={`${SERIF} text-[15px] text-[#b9c2b3]`}>{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[16px] font-light leading-[1.6] text-white/85">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#f4f2e3]">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <Eyebrow>Begin your project</Eyebrow>
          <h2 className={`${SERIF} mb-5 text-[clamp(28px,4vw,46px)] leading-[1.1] tracking-[-0.5px] text-[#222]`}>
            Bring the 2026 leather look into your home
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
            Whether you're specifying for a single room or a full hospitality project, our team can match tone,
            stitching, and hardware to the look you're after.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/products/leather"
              className="inline-block bg-[#222] px-9 py-4 text-[13px] font-light uppercase tracking-[1.5px] text-white transition-colors hover:bg-black"
            >
              Browse the Leather Collection
            </a>
            <a
              href="/contact"
              className="inline-block border border-[#222] px-9 py-4 text-[13px] font-light uppercase tracking-[1.5px] text-[#222] transition-colors hover:bg-[#222] hover:text-white"
            >
              Custom Orders &amp; Trade Pricing
            </a>
          </div>
        </div>
      </section>

      {/* You might also like */}
      <RelatedProducts products={[...SEATING_PRODUCTS, ...BED_TABLES_PRODUCTS]} />

      {/* Share · Author · tags */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <SocialShare
          url={canonical}
          title="Leather Furniture Trends 2026 for Luxury Homes"
        />

        <div className="mt-10">
          <AuthorBio />
        </div>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[12px] uppercase tracking-[0.14em] text-[#9a9582]">
          {TAGS.map((tag) => (
            <span key={tag} className="transition-colors hover:text-[#647167]">{tag}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
