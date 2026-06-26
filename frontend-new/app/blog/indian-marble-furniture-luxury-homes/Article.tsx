/* Server-rendered article body — fully static & crawlable (no 'use client').
 *
 * Visual language matches the homepage editorial system (1stDibs-inspired):
 *   · Cardinal Classic Short serif for display headings (loaded globally via
 *     Layout's critical CSS; exposed through the `itsbits-home` token scope).
 *   · Warm cream / noir palette — #f4f3ec, #f4f2e3, #222 — sage accent #647167.
 *   · Light-weight sans body, hairline rules, black square uppercase CTAs.
 *
 * index.css forces `* { font-family: Inter !important }`, so the serif is
 * applied via Tailwind's important arbitrary utility (SERIF) to win the cascade.
 *
 * Image placeholders: drop the real files into /public/blog/indian-marble-furniture/
 * using the `src` path shown to replace each one. */

type Faq = { q: string; a: string };

const IMG_BASE = '/blog/indian-marble-furniture';

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
}: {
  src: string;
  alt: string;
  caption?: string;
  ratio?: string;
  className?: string;
}) {
  const isPlaceholder = src.startsWith('/blog/') && !src.includes('hero-marble-dining-table.jpg') && !src.includes('dining-table.png');

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
            loading="lazy"
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
  { value: '#2', label: 'Largest marble producer worldwide' },
  { value: '1631', label: 'Makrana marble built the Taj Mahal' },
  { value: '50+', label: 'Countries served by export' },
  { value: '100%', label: 'Authentic natural stone' },
];

const ADVANTAGES: { title: string; text: string }[] = [
  { title: 'Superior stone varieties', text: 'Makrana White, Rainforest Green, Indian Black, Onyx and Beige Marble — sourced from certified quarries.' },
  { title: 'Handcrafted excellence', text: 'Artisan carving, Pietra Dura inlay and stone engraving refined across generations.' },
  { title: 'Competitive pricing', text: 'World-class quality at a fraction of the cost of Italian or European alternatives.' },
  { title: 'Export-ready manufacturing', text: 'Purpose-built for global shipping to the USA, UK, Europe, Australia and the Middle East.' },
  { title: 'Fully customizable', text: 'Dimensions, finishes, stone varieties and base materials tailored to your specification.' },
  { title: 'Naturally sustainable', text: 'A single quarried slab outlasts generations of fast furniture — the original sustainable material.' },
];

const PRODUCTS: { img: string; alt: string; title: string; text: string; bestFor: string }[] = [
  { img: `${IMG_BASE}/dining-table.png`, alt: 'Makrana white marble dining table seating eight in a luxury dining room', title: 'Marble Dining Tables', text: 'The crown jewel of any luxury home — from intimate four-seaters to grand twelve-seat banquet tables on stone or metal bases.', bestFor: 'Luxury homes · fine dining · hotel lobbies' },
  { img: `${IMG_BASE}/coffee-table.jpg`, alt: 'Round white marble coffee table with brushed brass base in a quiet-luxury living room', title: 'Marble Coffee Tables', text: 'The most sought-after accent in “quiet luxury” interiors — round, oval, hexagonal or slab-top, with brass or pedestal bases.', bestFor: 'Living rooms · hotel suites · apartments' },
  { img: `${IMG_BASE}/side-table.jpg`, alt: 'Pair of sculptural marble side tables flanking a bed', title: 'Side & End Tables', text: 'Versatile sculptural pieces that signal refined taste without a full room overhaul — a fast-growing décor segment.', bestFor: 'Bedrooms · living rooms · entryways' },
  { img: `${IMG_BASE}/console-table.jpg`, alt: 'Carved marble console table in a grand entryway hall', title: 'Console Tables', text: 'A statement of architecture, not just furniture — carved detailing and ornate legs anchor entryways and hallways.', bestFor: 'Entryways · hallways · behind-sofa styling' },
  { img: `${IMG_BASE}/vanity.jpg`, alt: 'Hand-carved marble bathroom vanity with matching basin in a spa-style bathroom', title: 'Bathroom Vanities & Sinks', text: 'Hand-carved vanity tops and basins driving the spa-style renovation and floor-to-ceiling “stone drenching” trend of 2026.', bestFor: 'Primary baths · powder rooms · spas' },
  { img: `${IMG_BASE}/accents.jpg`, alt: 'Collection of decorative marble accents — bowls, candle holders and coasters', title: 'Decorative Accents', text: 'Bookends, fruit bowls, candle holders, coasters and tabletop sculptures to layer natural stone throughout a space.', bestFor: 'Designers layering material & texture' },
];

const VS_TABLE: { material: string; lifespan: string; weakness: string; verdict: string; highlight?: boolean }[] = [
  { material: 'Natural Marble', lifespan: 'Generations (centuries)', weakness: 'Needs occasional sealing', verdict: 'Timeless investment piece', highlight: true },
  { material: 'Hardwood', lifespan: '15–40 years', weakness: 'Swells, cracks, fades, warps', verdict: 'Warm but high-maintenance' },
  { material: 'Glass', lifespan: '5–15 years', weakness: 'Chips, scratches, shatters', verdict: 'Fragile, dates quickly' },
  { material: 'Engineered / MDF', lifespan: '3–8 years', weakness: 'Delaminates, no resale value', verdict: 'Disposable “fast furniture”' },
];

const INVESTMENT = [
  { t: 'Durability for centuries', d: 'Marble’s structural integrity outlasts wood and glass — often by generations.' },
  { t: 'Timeless aesthetic', d: 'The pinnacle of luxury from Ancient Rome to 2026. It never goes out of style.' },
  { t: 'One-of-a-kind pieces', d: 'Every vein and tonal variation is unique — impossible to replicate.' },
  { t: 'Rising property value', d: 'Interiors with authentic natural stone command higher valuations in the UK & USA.' },
];

const PROCESS: { step: string; title: string; text: string }[] = [
  { step: '01', title: 'Stone Sourcing', text: 'Sourced directly from certified quarries across Rajasthan, Gujarat and Andhra Pradesh. Every slab is inspected for structural integrity, colour consistency and finish.' },
  { step: '02', title: 'Master Artisan Crafting', text: 'Skilled artisans cut, carve, polish and finish each piece by hand. CNC machinery handles precision cuts; human expertise delivers the artistic finish.' },
  { step: '03', title: 'Quality Control', text: 'A multi-point inspection before packing — surface finish, edge quality, structural strength and dimensional accuracy.' },
  { step: '04', title: 'Export-Grade Packaging', text: 'Custom foam-lined wooden crates, corner protection and humidity-resistant wrapping ensure your piece arrives in perfect condition.' },
  { step: '05', title: 'Worldwide Delivery', text: 'Shipping to the USA, UK, Europe, Australia, the Middle East and across Asia, with full customs documentation support.' },
];

const STONE_TABLE: { type: string; color: string; use: string; mood: string; swatch: string }[] = [
  { type: 'Makrana White', color: 'Pure white, subtle grey veins', use: 'Dining tables, vanities', mood: 'Clean, classic luxury', swatch: '#f4f3ef' },
  { type: 'Carrara White', color: 'White, feathery grey veins', use: 'Coffee tables, accents', mood: 'Timeless elegance', swatch: '#e7e8e6' },
  { type: 'Crema Marfil', color: 'Warm beige, cream tones', use: 'Living-room furniture', mood: 'Cosy, warm luxury', swatch: '#e6dcc6' },
  { type: 'Nero Marquina', color: 'Black with white veins', use: 'Statement & side pieces', mood: 'Bold, dramatic', swatch: '#1c1c1c' },
  { type: 'Rainforest Green', color: 'Green with brown veins', use: 'Accent furniture, decor', mood: 'Earthy, unique', swatch: '#4a5d43' },
  { type: 'Italian Onyx', color: 'Translucent amber / honey', use: 'Decorative, lighting', mood: 'Opulent, exotic', swatch: '#d9a566' },
  { type: 'Indian Black Granite', color: 'Deep charcoal, speckled', use: 'Outdoor, dining, commercial', mood: 'Strong, modern', swatch: '#2b2b2e' },
];

const CARE_TIPS: { n: string; title: string; text: string }[] = [
  { n: '01', title: 'Seal annually', text: 'Re-seal surfaces once a year to maintain stain resistance and protect the polish.' },
  { n: '02', title: 'Wipe spills fast', text: 'Blot acidic liquids — wine, citrus, coffee — immediately to prevent etching.' },
  { n: '03', title: 'pH-neutral cleaning', text: 'Use warm water with a soft cloth or stone-safe soap. Avoid vinegar and harsh chemicals.' },
  { n: '04', title: 'Coasters & trivets', text: 'Protect against heat rings and marks with coasters, trivets and felt pads under décor.' },
];

const REGIONS: { title: string; text: string }[] = [
  { title: 'United States', text: 'US importers and designers favour warm-neutral dining tables and spa-style marble vanities. We ship to all 50 states with full customs documentation; custom orders typically arrive in four to eight weeks.' },
  { title: 'United Kingdom', text: 'UK demand centres on sculptural coffee tables and bookmatched slab pieces for period and new-build homes. Full duty paperwork and tracked freight are included on every shipment.' },
];

const TRENDS = [
  { title: 'Warm neutrals over stark whites', text: 'Crema Marfil, Diana Royal and ivory-toned marble are outpacing cool grey and bright white.' },
  { title: 'Sculptural forms', text: 'Coffee tables, consoles and side tables are becoming more expressive and architectural.' },
  { title: 'Bookmatched slab tables', text: 'Consecutive slabs opened symmetrically to create mirror-image veining patterns.' },
  { title: 'Stone drenching in bathrooms', text: 'Floor-to-ceiling matched marble creating immersive, spa-like experiences.' },
  { title: 'Quiet luxury aesthetic', text: 'Understated, material-led interiors where quality speaks louder than branding.' },
];

const WHY_US = [
  'Direct manufacturer — no middlemen, better pricing',
  'Premium stone sourced directly from certified Indian quarries',
  'Fully customizable dimensions, stone, finish and base',
  'Experienced exporter serving the USA, UK, Europe & Middle East',
  'Export-grade packaging — marble arrives safe and intact',
  'Trade-friendly wholesale pricing for designers & developers',
  'Handcrafted by artisans with generations of stone expertise',
];

const TAGS = [
  'Marble Furniture',
  'Marble Dining Table',
  'Marble Coffee Table',
  'Luxury Interiors',
  'Indian Marble',
  'Natural Stone',
  'Marble Exporter',
];

// Shared body-paragraph style (the Tailwind Typography plugin is not installed,
// so we style copy explicitly rather than relying on `prose`).
const BODY = 'text-[17px] font-light leading-[1.8] text-[#444]';

export default function Article({
  faqs,
  publishedLabel,
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
              <li><a href="/" className="transition-colors hover:text-[#222]">Home</a></li>
              <li aria-hidden="true">·</li>
              <li><a href="/blog" className="transition-colors hover:text-[#222]">Journal</a></li>
              <li aria-hidden="true">·</li>
              <li className="text-[#647167]">Marble Furniture</li>
            </ol>
          </nav>

          <Eyebrow>Marble Furniture · Buyer’s Guide</Eyebrow>

          <h1 className={`${SERIF} mx-auto max-w-3xl text-[clamp(34px,5.4vw,60px)] font-normal leading-[1.08] tracking-[-0.5px] text-[#222]`}>
            Why Indian Marble Furniture Is the World’s Best Choice for Luxury Homes in 2026
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-[17px] font-light leading-[1.7] text-[#555]">
            From grand dining tables to sculptural coffee tables, handcrafted Indian marble is transforming
            luxury interiors across the USA, UK and beyond. Everything buyers, designers and homeowners need to know.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] uppercase tracking-[0.14em] text-[#9a9582]">
            <span className="text-[#647167]">HS Global Export</span>
            <span aria-hidden="true">·</span>
            <span>{publishedLabel}</span>
            <span aria-hidden="true">·</span>
            <span>12 min read</span>
          </div>
        </div>
      </header>

      {/* Hero image */}
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <ImagePlaceholder
          src={`${IMG_BASE}/hero-marble-dining-table.jpg`}
          alt="Handcrafted Indian white Makrana marble dining table styled in a bright luxury dining room"
          caption="A handcrafted Makrana white marble dining table — the crown jewel of a luxury home."
          ratio="aspect-[2/1]"
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
      <section className="mx-auto max-w-3xl px-6">
        <p className="text-[21px] font-light leading-[1.7] text-[#333]">
          When it comes to furnishing a luxury home, nothing compares to the timeless elegance of natural{' '}
          <strong className="font-semibold text-[#222]">marble furniture</strong>. In 2026, global demand for
          handcrafted <strong className="font-semibold text-[#222]">Indian marble furniture</strong> is at an
          all-time high — driven by homeowners, interior designers and architects who refuse to compromise on quality
          or craftsmanship.
        </p>
        <p className={`mt-6 ${BODY}`}>
          At HS Global Export, we have spent years perfecting the art of creating premium marble and granite
          furniture that travels from the quarries of India to living rooms across the world. This guide explores
          why marble is the smartest investment, which pieces are trending, how to care for them, and how to choose a
          manufacturer you can trust.
        </p>

        <h2 className={`${SERIF} mb-5 mt-14 text-[clamp(26px,3.4vw,38px)] font-normal leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          What makes Indian marble furniture truly world-class?
        </h2>
        <p className={BODY}>
          India sits atop some of the world’s most prized natural-stone deposits. Rajasthan’s iconic{' '}
          <strong className="font-semibold text-[#222]">Makrana White Marble</strong> — the same stone used to build
          the Taj Mahal — is celebrated globally for its pure white finish and extraordinary density. Rajasthan,
          Gujarat and Andhra Pradesh together make India one of the world’s largest marble producers.
        </p>
        <p className={`mt-6 ${BODY}`}>
          But raw stone is only part of the story. What sets Indian{' '}
          <strong className="font-semibold text-[#222]">marble furniture manufacturers</strong> apart is centuries of
          mastered stone-cutting, polishing and inlay artistry passed down through generations. When you buy a marble
          table from an Indian manufacturer, you acquire a piece of cultural heritage shaped by ancient craftsmanship
          and modern precision.
        </p>
      </section>

      {/* Advantages */}
      <section className="mx-auto mt-16 max-w-5xl px-6">
        <Eyebrow>Why it leads the world</Eyebrow>
        <h2 className={`${SERIF} mb-12 max-w-2xl text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          Key advantages of Indian marble furniture
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


      {/* Product types */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
        <Eyebrow>The collection</Eyebrow>
        <h2 className={`${SERIF} mb-4 max-w-2xl text-[clamp(26px,3.4vw,40px)] leading-[1.12] tracking-[-0.5px] text-[#222]`}>
          The marble pieces transforming luxury interiors in 2026
        </h2>
        <p className="mb-12 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
          Six categories driving global demand — each fully customizable in stone, dimension, finish and base.
        </p>
        <div className="grid gap-x-9 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <article key={p.title} className="group">
              <ImagePlaceholder src={p.img} alt={p.alt} ratio="aspect-[4/3]" />
              <h3 className={`${SERIF} mt-5 text-[22px] text-[#222]`}>{p.title}</h3>
              <p className="mt-2 text-[15px] font-light leading-[1.65] text-[#555]">{p.text}</p>
              <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-[#9a9582]">
                <span className="text-[#647167]">Best for</span> — {p.bestFor}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Pull quote */}
      <section className="mx-auto mt-20 max-w-4xl px-6">
        <blockquote className="border-y border-[#ece9dd] py-14 text-center">
          <p className={`${SERIF} mx-auto max-w-3xl text-[clamp(24px,3.4vw,38px)] font-normal italic leading-[1.3] text-[#222]`}>
            “No two slabs of natural marble are identical. Every vein is nature’s signature — when you invest in real
            marble, you own something that cannot be replicated.”
          </p>
          <cite className="mt-7 block text-[12px] uppercase not-italic tracking-[0.18em] text-[#9a9582]">
            HS Global Export
          </cite>
        </blockquote>
      </section>

      {/* Investment + comparison */}
      <section className="mx-auto mt-20 max-w-5xl px-6">
        <Eyebrow>The smart-money case</Eyebrow>
        <h2 className={`${SERIF} mb-4 max-w-2xl text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          Why marble furniture is a smart long-term investment
        </h2>
        <p className="mb-10 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
          Many buyers hesitate at the price of genuine marble — only to regret cheaper alternatives later. Here is
          how marble compares to the materials it replaces.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-y border-[#222]">
                {['Material', 'Typical lifespan', 'Main weakness', 'Verdict'].map((h) => (
                  <th key={h} className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#222]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VS_TABLE.map((row) => (
                <tr key={row.material} className={`border-b border-[#ece9dd] ${row.highlight ? 'bg-[#f4f2e3]' : ''}`}>
                  <td className={`${SERIF} px-4 py-4 text-[17px] text-[#222]`}>{row.material}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.lifespan}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.weakness}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.verdict}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 grid gap-x-12 gap-y-9 sm:grid-cols-2">
          {INVESTMENT.map((b) => (
            <div key={b.t} className="border-t border-[#ece9dd] pt-5">
              <h3 className={`${SERIF} mb-2 text-[20px] text-[#222]`}>{b.t}</h3>
              <p className="text-[15px] font-light leading-[1.65] text-[#555]">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto mt-20 max-w-3xl px-6">
        <Eyebrow>From quarry to living room</Eyebrow>
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


      {/* Stone guide */}
      <section className="mx-auto mt-20 max-w-5xl px-6">
        <Eyebrow>Choosing your stone</Eyebrow>
        <h2 className={`${SERIF} mb-10 text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          A quick marble guide for buyers
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-y border-[#222]">
                {['Marble type', 'Colour profile', 'Best use', 'Mood'].map((h) => (
                  <th key={h} className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#222]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STONE_TABLE.map((row) => (
                <tr key={row.type} className="border-b border-[#ece9dd]">
                  <td className={`${SERIF} px-4 py-4 text-[17px] text-[#222]`}>
                    <span className="flex items-center gap-3">
                      <span className="h-4 w-4 flex-shrink-0 rounded-full border border-[#ddd]" style={{ backgroundColor: row.swatch }} aria-hidden="true" />
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.color}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.use}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.mood}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Care */}
      <section className="mx-auto mt-20 max-w-5xl px-6">
        <Eyebrow>Keep it flawless</Eyebrow>
        <h2 className={`${SERIF} mb-4 text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          Caring for your marble furniture
        </h2>
        <p className="mb-12 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
          Marble is far easier to live with than most people expect. Four simple habits keep a piece immaculate for decades.
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

      {/* Regional */}
      <section className="mx-auto mt-20 max-w-5xl px-6">
        <Eyebrow>Buying from abroad</Eyebrow>
        <h2 className={`${SERIF} mb-10 text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          Sourcing Indian marble from the USA &amp; UK
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {REGIONS.map((r) => (
            <div key={r.title} className="bg-[#f4f3ec] p-9">
              <h3 className={`${SERIF} mb-3 text-[24px] text-[#222]`}>{r.title}</h3>
              <p className="text-[15px] font-light leading-[1.7] text-[#555]">{r.text}</p>
              <p className="mt-5 text-[11px] uppercase tracking-[0.14em] text-[#647167]">
                Worldwide delivery · 4–8 weeks for custom orders
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Trends */}
      <section className="mx-auto mt-20 max-w-3xl px-6">
        <Eyebrow>What’s next</Eyebrow>
        <h2 className={`${SERIF} mb-5 text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          The 2026 marble furniture trend report
        </h2>
        <p className="mb-10 text-[16px] font-light leading-[1.7] text-[#555]">
          The luxury furniture market is shifting from fast furniture toward investment pieces in natural,
          sustainable materials. Marble sits at the very centre of this movement.
        </p>
        <ol className="border-t border-[#ece9dd]">
          {TRENDS.map((t, i) => (
            <li key={t.title} className="grid grid-cols-[3rem_1fr] gap-5 border-b border-[#ece9dd] py-6">
              <span className={`${SERIF} text-[22px] leading-none text-[#647167]`}>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className={`${SERIF} mb-1 text-[20px] text-[#222]`}>{t.title}</h3>
                <p className="text-[15px] font-light leading-[1.65] text-[#555]">{t.text}</p>
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
            {WHY_US.map((w, i) => (
              <li key={w} className="flex items-start gap-4 border-t border-white/15 pt-5">
                <span className={`${SERIF} text-[15px] text-[#b9c2b3]`}>{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[16px] font-light leading-[1.6] text-white/85">{w}</span>
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
            Ready to transform your space with real marble?
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
            Whether you are a designer sourcing a luxury project, a homeowner building your dream living room, or a
            wholesale buyer seeking a reliable marble furniture manufacturer in India — HS Global Export is your
            trusted partner.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/products/furniture"
              className="inline-block bg-[#222] px-9 py-4 text-[13px] font-light uppercase tracking-[1.5px] text-white transition-colors hover:bg-black"
            >
              Browse the Furniture Collection
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
              Premium marble &amp; granite manufacturer and worldwide exporter — serving the USA, UK, Europe and the
              Middle East with handcrafted natural-stone furniture.
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
