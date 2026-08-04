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
  { value: '30–60', label: 'Days production time' },
  { value: 'DDU', label: 'Duty-unpaid shipping terms' },
  { value: '8–16 Wks', label: 'Typical door-to-door' },
  { value: 'DHL/FedEx', label: 'Insured international carriers' },
];

const TIMELINE: { step: string; title: string; text: string }[] = [
  { step: '01', title: 'Order & specification', text: 'You confirm marble type, dimensions, base material, and finish. We share final drawings or photos for sign-off before production begins.' },
  { step: '02', title: 'Production (30–60 days)', text: 'Each piece is quarried, cut, hand-finished, and quality-checked. Larger or custom pieces sit toward the longer end of this window.' },
  { step: '03', title: 'Crating & insurance', text: 'Finished pieces are foam-wrapped, corner-guarded, and built into custom wooden crates sized to the product, then insured for transit.' },
  { step: '04', title: 'Dispatch & customs filing', text: 'We hand the shipment to DHL, FedEx, or India Post with full documentation. Ocean freight shipments require an Importer Security Filing (ISF) at least 24 hours before vessel departure — your customs broker typically files this on your behalf.' },
  { step: '05', title: 'International transit', text: 'Delivery after dispatch runs up to roughly 60 days for international orders, depending on destination and customs clearance. You receive tracking as soon as the shipment moves.' },
  { step: '06', title: 'Customs clearance & delivery', text: 'Shipments arrive on a Delivery Duty Unpaid (DDU) basis — you or your customs broker clear the shipment and pay any duties before final delivery.' },
];

const DUTY_TABLE: { factor: string; detail: string; highlight?: boolean }[] = [
  { factor: 'HTS classification', detail: 'Marble furniture is generally classified under HTS Chapter 68 (articles of stone) or a furniture heading depending on construction — confirm the exact code with your broker.' },
  { factor: 'Base duty rate', detail: 'Varies by HTS code and material composition. Your customs broker can provide an exact landed-cost estimate for your specific product.', highlight: true },
  { factor: 'Section 301 tariffs', detail: 'Additional tariffs of up to 25% target China-origin stone products. These generally do not apply to marble furniture manufactured in India — but trade policy can change, so confirm current rates.' },
  { factor: 'MPF & HMF fees', detail: 'The Merchandise Processing Fee and, for ocean freight, the Harbor Maintenance Fee are calculated on shipment value and apply on top of duty.' },
  { factor: 'Who pays', detail: 'Under our DDU terms, the buyer (or their broker) pays all duties, taxes, and clearance fees directly to customs — these are never included in our invoice.' },
];

const TAGS = [
  'Marble Furniture Import',
  'Furniture Exporter India',
  'Marble Furniture Shipping',
  'Import Duties USA',
  'HS Global Export',
];

const RELATED: { img: string; alt: string; title: string; text: string; bestFor: string; href: string }[] = [
  { img: 'https://res.cloudinary.com/dynd1aan0/image/upload/v1779286813/hs-global/furniture/etsy/HSMDTWH5/file_000000001c1c71fbbd46fd584b2887ca.webp', alt: 'Modern white marble dining table', title: 'Marble Dining Tables', text: 'Our most-imported category — full customization on size, base, and finish for USA and UK dining rooms.', bestFor: 'Dining rooms · formal entertaining', href: '/products/furniture/dining-table' },
  { img: 'https://res.cloudinary.com/dynd1aan0/image/upload/v1779285639/hs-global/furniture/etsy/HSMCETBE10/6.webp', alt: 'Round beige marble coffee table', title: 'Marble Coffee Tables', text: 'Compact, lighter shipments that are easier to crate and often ship faster than large dining sets.', bestFor: 'Living rooms · lounges', href: '/products/furniture/coffee-table' },
  { img: 'https://res.cloudinary.com/dynd1aan0/image/upload/v1779286658/hs-global/furniture/etsy/HSMCOBL23/file_00000000c200722f931f3ce294f68c71.webp', alt: 'Black marble console table in an entryway', title: 'Marble Console Tables', text: 'Slim, statement pieces for entryways and hallways — a popular trade order for interior designers.', bestFor: 'Entryways · hallways', href: '/products/furniture/console-table' },
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
              <li aria-current="page" className="text-[#647167]">Importing Marble Furniture to the USA</li>
            </ol>
          </nav>

          <h1 className={`${SERIF} text-[clamp(28px,4.5vw,48px)] font-normal leading-[1.1] tracking-[-1px] text-[#222]`}>
            Importing Marble Furniture to the USA: Shipping, Duties &amp; Lead Times
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-[17px] font-light leading-[1.7] text-[#555]">
            What actually happens between placing an order and unboxing a marble dining table in your home —
            production time, crating, customs, and who pays what.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] uppercase tracking-[0.14em] text-[#9a9582]">
            <span className="text-[#647167]">HS Global Export</span>
            <span aria-hidden="true">·</span>
            <span>{publishedLabel}</span>
            <span aria-hidden="true">·</span>
            <span>9 min read</span>
          </div>
        </div>
      </header>

      {/* Hero image */}
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <ArticleImage
          src={heroImage}
          alt="Handcrafted white marble dining table crated for export to the USA"
          caption="A custom marble dining table from our workshop, prepared for international shipping."
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
          Most guides to importing furniture are written by freight forwarders who have never touched a slab of
          marble. This one is written from the other side of the shipment — the workshop that quarries, cuts,
          crates, and exports the piece.
        </p>
        <p className={`mt-6 ${BODY}`}>
          As a manufacturer and exporter shipping marble furniture from India to the USA, UK, Europe, and worldwide,
          we get the same questions from almost every first-time buyer: how long will it really take, who pays the
          customs bill, and how does a stone dining table survive a container ship without cracking. Here's the
          honest answer to each.
        </p>

        <h2 className={`${SERIF} mb-5 mt-14 text-[clamp(26px,3.4vw,38px)] font-normal leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          It starts with production, not shipping
        </h2>
        <p className={BODY}>
          Because most marble furniture is made to order, the clock starts well before your piece ever reaches a
          port. Production typically takes <strong>30 to 60 days after payment</strong>, depending on the size,
          marble variety, and complexity of the base — a simple round side table sits toward the shorter end;
          a large custom dining table with a sculpted stone base sits toward the longer end.
        </p>
      </section>

      {/* Timeline */}
      <section className="mx-auto mt-20 max-w-3xl px-6">
        <Eyebrow>From order to doorstep</Eyebrow>
        <h2 className={`${SERIF} mb-12 text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          The six stages of an international marble furniture order
        </h2>
        <ol className="border-t border-[#ece9dd]">
          {TIMELINE.map(({ step, title, text }) => (
            <li key={step} className="grid grid-cols-[3rem_1fr] gap-6 border-b border-[#ece9dd] py-7 sm:grid-cols-[4rem_1fr]">
              <span className={`${SERIF} text-[26px] leading-none text-[#647167]`}>{step}</span>
              <div>
                <h3 className={`${SERIF} mb-1.5 text-[21px] text-[#222]`}>{title}</h3>
                <p className="text-[15px] font-light leading-[1.7] text-[#555]">{text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-[14px] font-light italic leading-[1.7] text-[#8a8676]">
          Adding production and transit together, most international orders land somewhere between 8 and 16 weeks
          door-to-door. Simpler pieces shipped by air can be faster; large, made-to-order sets shipped by sea sit
          toward the longer end.
        </p>
      </section>

      {/* Duties table */}
      <section className="mx-auto mt-20 max-w-5xl px-6">
        <Eyebrow>The part everyone gets wrong</Eyebrow>
        <h2 className={`${SERIF} mb-4 max-w-2xl text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          Customs duties &amp; who actually pays them
        </h2>
        <p className="mb-10 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
          We ship on Delivery Duty Unpaid (DDU) terms. Here's what that means in practice.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-y border-[#222]">
                {['Factor', 'What it means for your shipment'].map((h) => (
                  <th key={h} className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#222]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DUTY_TABLE.map((row) => (
                <tr key={row.factor} className={`border-b border-[#ece9dd] ${row.highlight ? 'bg-[#f4f2e3]' : ''}`}>
                  <td className={`${SERIF} px-4 py-4 text-[17px] text-[#222]`}>{row.factor}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 max-w-2xl text-[13px] font-light leading-[1.7] text-[#8a8676]">
          This section is general guidance, not customs advice. Duty rates and trade policy change — always confirm
          the exact HTS code and current rate for your shipment with a licensed customs broker before ordering.
        </p>
      </section>

      {/* Pull quote */}
      <section className="mx-auto mt-20 max-w-4xl px-6">
        <blockquote className="border-y border-[#ece9dd] py-14 text-center">
          <p className={`${SERIF} mx-auto max-w-3xl text-[clamp(24px,3.4vw,38px)] font-normal italic leading-[1.3] text-[#222]`}>
            "The pieces that arrive intact aren't the ones that got lucky in transit — they're the ones that were
            crated properly before the truck ever left the workshop."
          </p>
          <cite className="mt-7 block text-[12px] uppercase not-italic tracking-[0.18em] text-[#9a9582]">
            HS Global Export
          </cite>
        </blockquote>
      </section>

      {/* Crating & insurance */}
      <section className="mx-auto mt-4 max-w-3xl px-6">
        <h2 className={`${SERIF} mb-5 text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          How fragile stone survives an ocean crossing
        </h2>
        <p className={BODY}>
          Marble is heavy, brittle at the edges, and unforgiving of rough handling — so packaging is treated as
          part of manufacturing, not an afterthought. Every piece is wrapped in protective foam, fitted with corner
          guards at every vulnerable edge, and built into a custom wooden crate sized specifically to that product.
        </p>
        <p className={`mt-4 ${BODY}`}>
          High-value and fragile shipments are insured for transit, and you receive tracking details the moment
          your order is dispatched, so you can follow it until delivery.
        </p>

        <h2 className={`${SERIF} mb-5 mt-14 text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          If something does go wrong
        </h2>
        <p className={BODY}>
          If an item arrives damaged, share a clear unboxing video and photos and we'll arrange a replacement or
          refund once verified. Returns for eligible items are accepted within 15 days of delivery in original
          packaging — though custom-made and personalized pieces, which make up most marble furniture orders, are
          generally not eligible for return once produced.
        </p>
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
            Why import through HS Global Export?
          </h2>
          <ul className="grid gap-x-12 gap-y-7 md:grid-cols-2">
            {[
              'Direct manufacturer — no middlemen, transparent pricing',
              'Custom wooden crating and insured shipping on every order',
              'Full tracking and customs documentation provided',
              'Experienced exporter serving USA, UK, Europe, and worldwide',
              'Trade-friendly pricing and MOQs for designers and retailers',
              'Real photos and videos available before you commit to bulk orders',
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
          <Eyebrow>Plan your import</Eyebrow>
          <h2 className={`${SERIF} mb-5 text-[clamp(28px,4vw,46px)] leading-[1.1] tracking-[-0.5px] text-[#222]`}>
            Get a real lead time and landed-cost estimate
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
            Tell us what you're sourcing and where it's going, and our team will give you a realistic production
            and shipping timeline, plus FOB/CIF pricing to share with your customs broker.
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
              Request a Quote
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
          title="Importing Marble Furniture to the USA: Shipping, Duties & Lead Times"
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
