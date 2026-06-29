/* Server-rendered article body — fully static & crawlable (no 'use client'). */

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

function ImagePlaceholder({
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
  const isPlaceholder =
    src.includes('/blog/') &&
    !src.includes('premium-leather-sofa.jpg') &&
    !src.includes('leather-sofa.jpg') &&
    !src.includes('leather-ottoman.jpg') &&
    !src.includes('leather-bed.jpg') &&
    !src.includes('leather-coffee-table.jpg') &&
    !src.includes('leather-dresser.jpg') &&
    !src.includes('leather-armchair.jpg');

  return (
    <figure className={className}>
      <div className={`relative ${ratio} w-full overflow-hidden bg-[#f4f3ec]`}>
        {isPlaceholder ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-8 text-center">
            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#9a9582]">Image</span>
            <span className="max-w-md text-[13px] font-light leading-relaxed text-[#8a8676]">{alt}</span>
            <code className="mt-1 text-[11px] tracking-wide text-[#b3ae9c]">{src}</code>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
          />
        )}
      </div>
      {caption && (
        <figcaption className="mt-3 text-[13px] font-light italic text-[#8a8676]">{caption}</figcaption>
      )}
    </figure>
  );
}

const STATS = [
  { value: '15-25+', label: 'Years typical lifespan' },
  { value: 'Premium', label: 'Top-grain leather selection' },
  { value: '100%', label: 'Artisan handcrafted' },
  { value: 'Global', label: 'Shipping and delivery networks' },
];

const ADVANTAGES: { title: string; text: string }[] = [
  { title: 'Exceptional durability', text: 'Resistant to wear, spills, and daily usage. Leather naturally strengthens and gains character with age.' },
  { title: 'Timeless aesthetic appeal', text: 'Classic and refined look that seamlessly blends into contemporary, minimalist, and traditional interiors.' },
  { title: 'Easy maintenance', text: 'Simple cleaning requirements. Easy to wipe down and dust compared to delicate fabrics.' },
  { title: 'Premium comfort', text: 'Cushions and leather adapt to body heat and shape, creating an incredibly comfortable seating experience.' },
  { title: 'Long-lasting investment', text: 'High resale and aesthetic value that remains relevant through changing interior design trends.' },
  { title: 'Versatile applications', text: 'Perfect for residential villas, luxury hotels, executive offices, and commercial spaces.' },
];

const SEATING_PRODUCTS: { img: string; alt: string; title: string; text: string; bestFor: string; href: string }[] = [
  { img: `${IMG_BASE}/leather-sofa.jpg`, alt: 'Luxury leather sofa in a premium living room', title: 'Luxury Leather Sofas', text: 'The centerpiece of any living room. Crafted with premium upholstery, superior cushioning, and elegant silhouettes that elevate modern interiors.', bestFor: 'Luxury homes · villas · hotel lounges', href: '/products/leather/sofa' },
  { img: `${IMG_BASE}/leather-armchair.jpg`, alt: 'Premium leather armchair with wooden frame', title: 'Premium Leather Armchairs', text: 'Ergonomic support meets sophisticated finish. Perfect for creating comfortable reading corners, lounge areas, and lobby spaces.', bestFor: 'Living rooms · study areas · office suites', href: '/products/leather/chair' },
  { img: `${IMG_BASE}/leather-ottoman.jpg`, alt: 'Luxury leather ottoman styled next to a coffee table', title: 'Leather Ottomans & Benches', text: 'Versatile additions that function as seating, footrests, or decorative entry table statements. Combining comfort with clean aesthetics.', bestFor: 'Entryways · bedrooms · dining areas', href: '/products/leather/bench' },
];

const BED_TABLES_PRODUCTS: { img: string; alt: string; title: string; text: string; bestFor: string; href: string }[] = [
  { img: `${IMG_BASE}/leather-bed.jpg`, alt: 'Luxury leather upholstered bed in a master suite', title: 'Luxury Leather Beds', text: 'Transform your bedroom into a luxurious retreat. Handcrafted leather beds featuring premium headboards, durable frames, and refined detailing.', bestFor: 'Master bedrooms · boutique hotel suites', href: '/products/leather/bed' },
  { img: `${IMG_BASE}/leather-coffee-table.jpg`, alt: 'Handcrafted leather coffee table in a modern loft', title: 'Leather Tables (Coffee, Side, Console)', text: 'Statement tables combining premium materials and expert craftsmanship. Bring a unique, tactile element to living rooms and entryways.', bestFor: 'Living rooms · hallways · entryways', href: '/products/leather/side-table' },
  { img: `${IMG_BASE}/leather-dresser.jpg`, alt: 'Leather clad dresser with brass details', title: 'Storage & Décor (Dressers, Mirrors)', text: 'Leather dressers and leather-framed mirrors offering sophisticated storage and texturing to reflect light and expand space.', bestFor: 'Primary bedrooms · dressing rooms · luxury retail', href: '/products/leather/dresser' },
];

const PROCESS: { step: string; title: string; text: string }[] = [
  { step: '01', title: 'Material Sourcing', text: 'We source premium top-grain leathers and high-density timber to build durable structural frames and luxurious touchpoints.' },
  { step: '02', title: 'Master Artisan Crafting', text: 'Skilled carpenters, upholsterers, and leather specialists hand-assemble, stitch, and finish each piece for flawless alignment.' },
  { step: '03', title: 'Quality Control', text: 'Every product undergoes a multi-point inspection — stitching alignment, cushion bounce, leather grain consistency, and frame strength.' },
  { step: '04', title: 'Export-Grade Packaging', text: 'Custom foam padding, protective corner guards, and heavy-duty humidity wrapping ensure safe transit across continents.' },
  { step: '05', title: 'Worldwide Delivery', text: 'Full door-to-door shipping assistance to the USA, UK, Europe, Middle East, and beyond, with customs documentation handled.' },
];

const TAGS = [
  'Leather Furniture',
  'Luxury Leather Sofa',
  'Leather Armchairs',
  'Premium Interiors',
  'Leather Beds',
  'HS Global Export',
];

const BODY = 'text-[17px] font-light leading-[1.8] text-[#444]';

export default function Article({
  faqs,
  publishedLabel,
  heroImage,
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
              <li aria-current="page" className="text-[#647167]">Premium Leather Furniture</li>
            </ol>
          </nav>

          <h1 className={`${SERIF} text-[clamp(28px,4.5vw,48px)] font-normal leading-[1.1] tracking-[-1px] text-[#222]`}>
            Premium Leather Furniture for Modern Luxury Interiors
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-[17px] font-light leading-[1.7] text-[#555]">
            Discover handcrafted luxury leather furniture including sofas, armchairs, beds, tables, dressers, mirrors, and storage solutions by HS Global Export.
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
        <ImagePlaceholder
          src={heroImage}
          alt="Premium handcrafted leather sofa styled in a bright modern penthouse living room"
          caption="Our handcrafted leather sofas represent the ultimate fusion of comfort, quality, and modern sophistication."
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
              <div className={`${SERIF} text-[40px] leading-none text-[#222]`}>{value}</div>
              <div className="mt-3 text-[11px] uppercase leading-relaxed tracking-[0.14em] text-[#9a9582]">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-3xl px-6 mt-16">
        <p className="text-[21px] font-light leading-[1.7] text-[#333]">
          Luxury leather furniture has long been associated with elegance, durability, and timeless design. 
          Whether furnishing a luxury residence, hospitality project, villa, penthouse, or commercial interior, 
          leather furniture offers unmatched comfort and sophistication.
        </p>
        <p className={`mt-6 ${BODY}`}>
          At HS Global Export, we create premium leather furniture that combines skilled craftsmanship, high-quality materials, 
          and contemporary aesthetics. Our collection includes seating, bedroom furniture, tables, storage units, and decorative 
          pieces designed for discerning customers across the USA, UK, Europe, the Middle East, and worldwide.
        </p>

        <h2 className={`${SERIF} mb-5 mt-14 text-[clamp(26px,3.4vw,38px)] font-normal leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          Why Choose Luxury Leather Furniture?
        </h2>
        <p className={BODY}>
          Leather furniture remains one of the most sought-after furniture categories because of its durability, comfort, 
          and premium appeal. Leather develops character over time, making each piece unique while maintaining its luxurious 
          appearance for years.
        </p>
      </section>

      {/* Advantages */}
      <section className="mx-auto mt-16 max-w-5xl px-6">
        <Eyebrow>Why it leads the world</Eyebrow>
        <h2 className={`${SERIF} mb-12 max-w-2xl text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          Key advantages of luxury leather furniture
        </h2>
        <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {ADVANTAGES.map(({ title, text }, i) => (
            <div key={title} className="border-t border-[#ece9dd] pt-5">
              <span className="text-[12px] tracking-[0.14em] text-[#647167]">{String(i + 1).padStart(2, '0')}</span>
              <h3 className={`${SERIF} mb-2 mt-2 text-[21px] text-[#222]`}>{title}</h3>
              <p className="text-[15px] font-light leading-[1.65] text-[#555]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Collection Seating */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
        <Eyebrow>The Seating Collection</Eyebrow>
        <h2 className={`${SERIF} mb-4 max-w-2xl text-[clamp(26px,3.4vw,40px)] leading-[1.12] tracking-[-0.5px] text-[#222]`}>
          Luxury sofas, armchairs, and benches
        </h2>
        <p className="mb-12 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
          Handcrafted seating built with durable internal timber frames and upholstered with hand-finished premium leathers.
        </p>
        <div className="grid gap-x-9 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {SEATING_PRODUCTS.map((p) => (
            <article key={p.title} className="group">
              <a href={p.href} aria-label={`Browse ${p.title}`} className="block">
                <ImagePlaceholder src={p.img} alt={p.alt} ratio="aspect-[4/3]" />
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

      {/* Collection Beds and Tables */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
        <Eyebrow>Bedroom, Tables &amp; Storage</Eyebrow>
        <h2 className={`${SERIF} mb-4 max-w-2xl text-[clamp(26px,3.4vw,40px)] leading-[1.12] tracking-[-0.5px] text-[#222]`}>
          Beds, coffee tables, and storage solutions
        </h2>
        <p className="mb-12 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
          Customizing your private sanctuary with the tactile feel of top-grade leather detailing.
        </p>
        <div className="grid gap-x-9 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {BED_TABLES_PRODUCTS.map((p) => (
            <article key={p.title} className="group">
              <a href={p.href} aria-label={`Browse ${p.title}`} className="block">
                <ImagePlaceholder src={p.img} alt={p.alt} ratio="aspect-[4/3]" />
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

      {/* Pull quote */}
      <section className="mx-auto mt-20 max-w-4xl px-6">
        <blockquote className="border-y border-[#ece9dd] py-14 text-center">
          <p className={`${SERIF} mx-auto max-w-3xl text-[clamp(24px,3.4vw,38px)] font-normal italic leading-[1.3] text-[#222]`}>
            “Luxury leather furniture represents the perfect balance of sophistication, comfort, and durability. Each piece tells a story of meticulous artisanship.”
          </p>
          <cite className="mt-7 block text-[12px] uppercase not-italic tracking-[0.18em] text-[#9a9582]">
            HS Global Export
          </cite>
        </blockquote>
      </section>

      {/* Process */}
      <section className="mx-auto mt-20 max-w-3xl px-6">
        <Eyebrow>Craftsmanship &amp; Shipping</Eyebrow>
        <h2 className={`${SERIF} mb-12 text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          How we manufacture &amp; ship worldwide
        </h2>
        <ol className="border-t border-[#ece9dd]">
          {PROCESS.map(({ step, title, text }) => (
            <li key={step} className="grid grid-cols-[3rem_1fr] gap-6 border-b border-[#ece9dd] py-7 sm:grid-cols-[4rem_1fr]">
              <span className={`${SERIF} text-[26px] leading-none text-[#647167]`}>{step}</span>
              <div>
                <h3 className={`${SERIF} mb-1.5 text-[21px] text-[#222]`}>{title}</h3>
                <p className="text-[15px] font-light leading-[1.7] text-[#555]">{text}</p>
              </div>
            </li>
          ))}
        </ol>
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
            Why buy from HS Global Export?
          </h2>
          <ul className="grid gap-x-12 gap-y-7 md:grid-cols-2">
            <li className="flex items-start gap-4 border-t border-white/15 pt-5">
              <span className={`${SERIF} text-[15px] text-[#b9c2b3]`}>01</span>
              <span className="text-[16px] font-light leading-[1.6] text-white/85">Premium leather materials carefully selected for quality</span>
            </li>
            <li className="flex items-start gap-4 border-t border-white/15 pt-5">
              <span className={`${SERIF} text-[15px] text-[#b9c2b3]`}>02</span>
              <span className="text-[16px] font-light leading-[1.6] text-white/85">Expert multi-generational craftsmanship in upholstery and framing</span>
            </li>
            <li className="flex items-start gap-4 border-t border-white/15 pt-5">
              <span className={`${SERIF} text-[15px] text-[#b9c2b3]`}>03</span>
              <span className="text-[16px] font-light leading-[1.6] text-white/85">Fully customizable dimensions, stitching patterns, leather type and finishes</span>
            </li>
            <li className="flex items-start gap-4 border-t border-white/15 pt-5">
              <span className={`${SERIF} text-[15px] text-[#b9c2b3]`}>04</span>
              <span className="text-[16px] font-light leading-[1.6] text-white/85">Experienced exporter serving USA, UK, Europe, Middle East and worldwide</span>
            </li>
            <li className="flex items-start gap-4 border-t border-white/15 pt-5">
              <span className={`${SERIF} text-[15px] text-[#b9c2b3]`}>05</span>
              <span className="text-[16px] font-light leading-[1.6] text-white/85">Export-grade heavy padding packaging ensures pristine arrival</span>
            </li>
            <li className="flex items-start gap-4 border-t border-white/15 pt-5">
              <span className={`${SERIF} text-[15px] text-[#b9c2b3]`}>06</span>
              <span className="text-[16px] font-light leading-[1.6] text-white/85">Direct manufacturing workflow for optimal competitive trade pricing</span>
            </li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#f4f2e3]">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <Eyebrow>Begin your project</Eyebrow>
          <h2 className={`${SERIF} mb-5 text-[clamp(28px,4vw,46px)] leading-[1.1] tracking-[-0.5px] text-[#222]`}>
            Ready to transform your interiors with luxury leather?
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
            Whether you are an architect sourcing for a commercial hospitality project, a homeowner designing your dream living room, or a
            furniture retailer looking for premium handcrafted collections — HS Global Export is your reliable partner.
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

      {/* Author + tags */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex flex-col gap-5 border-y border-[#ece9dd] py-8 sm:flex-row sm:items-center">
          <span className={`${SERIF} grid h-16 w-16 flex-shrink-0 place-items-center rounded-full bg-[#222] text-[18px] text-white`}>HS</span>
          <div>
            <p className={`${SERIF} text-[20px] text-[#222]`}>HS Global Export</p>
            <p className="mt-1 text-[14px] font-light leading-[1.6] text-[#555]">
              Premium leather &amp; natural-stone furniture manufacturer and worldwide exporter — serving the USA, UK, Europe and the
              Middle East with handcrafted bespoke luxury.
            </p>
          </div>
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
