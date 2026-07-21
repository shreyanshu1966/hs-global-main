/* Server-rendered article body — fully static & crawlable (no 'use client'). */

import { AuthorBio, SocialShare, RelatedProducts } from '../_components/ArticleFooter';

type Faq = { q: string; a: string };

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
  { value: '6–7', label: 'Granite Mohs hardness' },
  { value: '3–4', label: 'Marble Mohs hardness' },
  { value: '6–12 mo', label: 'Recommended marble resealing' },
  { value: '100+ Yrs', label: 'Granite lifespan, well sealed' },
];

const COMPARE_TABLE: { factor: string; granite: string; marble: string; highlight?: boolean }[] = [
  { factor: 'Hardness (Mohs scale)', granite: '6–7 — very hard', marble: '3–4 — moderate, softer' },
  { factor: 'Porosity & staining', granite: 'Low porosity, resists most stains', marble: 'More porous, needs regular sealing', highlight: true },
  { factor: 'Heat resistance', granite: 'Very high — shrugs off hot pans', marble: 'Good, but sustained heat can dull polish' },
  { factor: 'Scratch resistance', granite: 'Excellent for daily wear', marble: 'Moderate — softer surface marks more easily' },
  { factor: 'Visual character', granite: 'Speckled, uniform granular pattern', marble: 'Soft flowing veining, translucent depth' },
  { factor: 'Typical lifespan', granite: '50–100+ years with basic sealing', marble: '20–50+ years, longer with diligent care' },
];

const CARE_TIPS: { n: string; title: string; text: string }[] = [
  { n: '01', title: 'Seal on schedule', text: 'Reseal marble furniture every 6–12 months; granite can often go 1–2 years between sealing depending on use.' },
  { n: '02', title: 'Wipe acid spills fast', text: 'Wine, citrus, and vinegar etch marble on contact. Blot immediately — granite is far more forgiving here.' },
  { n: '03', title: 'Use coasters & trivets', text: 'Protects both stones from ring marks and heat, but matters more for marble\'s softer, more porous surface.' },
  { n: '04', title: 'Clean with pH-neutral products', text: 'Avoid acidic or abrasive cleaners on either stone — they dull the polish and, on marble, can etch it.' },
];

const TAGS = [
  'Marble vs Granite',
  'Marble Furniture Durability',
  'Stone Furniture',
  'Marble Care',
  'HS Global Export',
];

const RELATED: { img: string; alt: string; title: string; text: string; bestFor: string; href: string }[] = [
  { img: 'https://res.cloudinary.com/dynd1aan0/image/upload/v1779286813/hs-global/furniture/etsy/HSMDTWH5/file_000000001c1c71fbbd46fd584b2887ca.webp', alt: 'Modern white marble dining table', title: 'Marble Dining Tables', text: 'Statement pieces where marble\'s veining does the talking — light daily wear, high visual impact.', bestFor: 'Dining rooms · formal entertaining', href: '/products/furniture/dining-table' },
  { img: 'https://res.cloudinary.com/dynd1aan0/image/upload/v1779285643/hs-global/furniture/etsy/HSMCETBLWH11/2.webp', alt: 'Black and white marble round coffee table', title: 'Marble Coffee Tables', text: 'Low-touch surfaces that showcase marble\'s pattern without the daily wear of a kitchen counter.', bestFor: 'Living rooms · lounges', href: '/products/furniture/coffee-table' },
  { img: 'https://res.cloudinary.com/dynd1aan0/image/upload/v1779285557/hs-global/furniture/etsy/HSMBTBL6/4.webp', alt: 'Black marble freestanding soaking bathtub', title: 'Marble Bathtubs', text: 'A genuinely demanding, wet-area use case — sealed and finished to handle daily bathing.', bestFor: 'Master bathrooms · spa interiors', href: '/products/furniture/bathtub' },
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
              <li aria-current="page" className="text-[#647167]">Granite vs Marble Furniture</li>
            </ol>
          </nav>

          <h1 className={`${SERIF} text-[clamp(28px,4.5vw,48px)] font-normal leading-[1.1] tracking-[-1px] text-[#222]`}>
            Granite vs Marble Furniture: Which Lasts Longer?
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-[17px] font-light leading-[1.7] text-[#555]">
            Almost every granite-vs-marble comparison online is about kitchen countertops. Here's what the
            durability trade-off actually means for dining tables, consoles, and bathtubs.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] uppercase tracking-[0.14em] text-[#9a9582]">
            <span className="text-[#647167]">HS Global Export</span>
            <span aria-hidden="true">·</span>
            <span>{publishedLabel}</span>
            <span aria-hidden="true">·</span>
            <span>8 min read</span>
          </div>
        </div>
      </header>

      {/* Hero image */}
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <ArticleImage
          src={heroImage}
          alt="Black marble freestanding bathtub — a wet-area use case that tests stone durability"
          caption="Wet-area furniture like bathtubs is where the granite-vs-marble durability question actually gets tested."
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
          Search "granite vs marble" and nearly every result is a kitchen-countertop comparison. Furniture is a
          different conversation — a dining table doesn't see hot pans or knife cuts, but it does sit in a room
          for twenty years as the centerpiece everyone looks at.
        </p>
        <p className={`mt-6 ${BODY}`}>
          As a manufacturer working with both stones, here is the honest, furniture-specific version of this
          comparison — including why we've built our own collection around marble rather than granite.
        </p>

        <h2 className={`${SERIF} mb-5 mt-14 text-[clamp(26px,3.4vw,38px)] font-normal leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          The short answer
        </h2>
        <p className={BODY}>
          On raw durability, granite wins. It's harder, less porous, and more forgiving of daily abuse. On the
          reason people actually buy statement furniture — how a piece looks and feels in a room — marble wins for
          most buyers, which is why it dominates luxury dining tables, consoles, and coffee tables despite being
          the "less durable" stone.
        </p>
      </section>

      {/* Comparison table */}
      <section className="mx-auto mt-20 max-w-5xl px-6">
        <Eyebrow>Side by side</Eyebrow>
        <h2 className={`${SERIF} mb-4 max-w-2xl text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          Granite vs marble, factor by factor
        </h2>
        <p className="mb-10 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
          Both are natural stone; both are durable by ordinary furniture standards. The differences show up at the
          extremes.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-y border-[#222]">
                {['Factor', 'Granite', 'Marble'].map((h) => (
                  <th key={h} className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#222]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_TABLE.map((row) => (
                <tr key={row.factor} className={`border-b border-[#ece9dd] ${row.highlight ? 'bg-[#f4f2e3]' : ''}`}>
                  <td className={`${SERIF} px-4 py-4 text-[17px] text-[#222]`}>{row.factor}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.granite}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.marble}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pull quote */}
      <section className="mx-auto mt-20 max-w-4xl px-6">
        <blockquote className="border-y border-[#ece9dd] py-14 text-center">
          <p className={`${SERIF} mx-auto max-w-3xl text-[clamp(24px,3.4vw,38px)] font-normal italic leading-[1.3] text-[#222]`}>
            "Granite is the stone you choose when you never want to think about your countertop again. Marble is
            the stone you choose when you want people to stop and look at your table."
          </p>
          <cite className="mt-7 block text-[12px] uppercase not-italic tracking-[0.18em] text-[#9a9582]">
            HS Global Export
          </cite>
        </blockquote>
      </section>

      {/* Where each wins */}
      <section className="mx-auto mt-4 max-w-3xl px-6">
        <h2 className={`${SERIF} mb-5 text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          Where each stone actually makes sense
        </h2>
        <p className={BODY}>
          <strong>Choose granite</strong> for surfaces under constant daily abuse where the material itself needs
          to disappear into the background — kitchen countertops, high-traffic commercial counters, and outdoor
          installations exposed to weather.
        </p>
        <p className={`mt-4 ${BODY}`}>
          <strong>Choose marble</strong> for furniture that's meant to be looked at as much as used — dining
          tables, console tables, coffee tables, bathtubs, and sinks, where the veining and light-catching finish
          are the entire point of the piece. This is why our own collection is built around marble: it's the
          stone that does what furniture is actually for.
        </p>

        <h2 className={`${SERIF} mb-4 mt-14 text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          Closing the durability gap with care
        </h2>
        <p className={BODY}>
          Marble's durability disadvantage is almost entirely manageable with routine care. A well-sealed, well-maintained
          marble dining table can realistically outlast the room it's in.
        </p>
      </section>

      {/* Care tips */}
      <section className="mx-auto mt-16 max-w-5xl px-6">
        <Eyebrow>Care guide</Eyebrow>
        <h2 className={`${SERIF} mb-4 text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          Four habits that keep marble furniture looking new
        </h2>
        <p className="mb-12 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
          For a deeper walkthrough, see our full{' '}
          <a href="/blog/how-to-care-for-your-marble-surfaces" className="underline decoration-[#647167] underline-offset-2 hover:text-[#647167]">
            marble care and maintenance guide
          </a>.
        </p>
        <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
          {CARE_TIPS.map(({ n, title, text }) => (
            <div key={n} className="border-t border-[#ece9dd] pt-5">
              <span className="text-[12px] tracking-[0.14em] text-[#647167]">{n}</span>
              <h3 className={`${SERIF} mb-2 mt-2 text-[19px] text-[#222]`}>{title}</h3>
              <p className="text-[14px] font-light leading-[1.6] text-[#555]">{text}</p>
            </div>
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

      {/* CTA */}
      <section className="bg-[#f4f2e3] mt-24">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <Eyebrow>Ready to choose?</Eyebrow>
          <h2 className={`${SERIF} mb-5 text-[clamp(28px,4vw,46px)] leading-[1.1] tracking-[-0.5px] text-[#222]`}>
            Explore handcrafted marble furniture, built to last
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
            Every piece is sealed, finished, and export-packed to handle real daily use — with the veining and
            depth granite simply can't offer.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/products/furniture"
              className="inline-block bg-[#222] px-9 py-4 text-[13px] font-light uppercase tracking-[1.5px] text-white transition-colors hover:bg-black"
            >
              Browse the Marble Collection
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
      <RelatedProducts products={RELATED} />

      {/* Share · Author · tags */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <SocialShare
          url={canonical}
          title="Granite vs Marble Furniture: Which Lasts Longer?"
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
