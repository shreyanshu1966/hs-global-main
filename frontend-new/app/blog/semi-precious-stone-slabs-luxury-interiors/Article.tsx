/* Server-rendered article body — fully static & crawlable (no 'use client'). */

import { AuthorBio, SocialShare, RelatedProducts } from '../_components/ArticleFooter';

type Faq = { q: string; a: string };

const IMG_BASE = '/blog/semi-precious-stone-slabs-luxury-interiors';

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
    src.startsWith('/blog/') &&
    !src.includes('semi-precious-stone-slabs.png') &&
    !src.includes('agate-slabs.jpg') &&
    !src.includes('amethyst-slabs.jpg') &&
    !src.includes('quartz-slabs.jpg') &&
    !src.includes('amazonite-slabs.jpg') &&
    !src.includes('jasper-slabs.jpg') &&
    !src.includes('tiger-eye-slabs.jpg') &&
    !src.includes('mother-of-pearl-slabs.jpg') &&
    !src.includes('petrified-wood-slabs.jpg');

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
  { value: '8+', label: 'Gemstone Varieties Available' },
  { value: 'Backlit', label: 'Translucent properties' },
  { value: 'Millions', label: 'Of years in natural formation' },
  { value: '100%', label: 'Authentic semi precious stone' },
];

const ADVANTAGES: { title: string; text: string }[] = [
  { title: 'Unique natural patterns', text: 'No two slabs are identical. Intricate bands, crystal groupings, and rich mineral tones create an unrepeatable canvas.' },
  { title: 'Exceptional visual appeal', text: 'Naturally reflective and shimmering minerals capture light beautifully, elevating spaces to premium luxury levels.' },
  { title: 'Exclusivity & status', text: 'Highly valued for their rarity and artistic prestige, perfect for creating upscale residential and commercial projects.' },
  { title: 'Backlighting capabilities', text: 'Agates and crystalline quartz varieties can be backlit with LED systems, transforming feature walls into glowing focal points.' },
  { title: 'Durability & strength', text: 'Resistant to heat, scratches, and daily wear, offering stone-grade longevity in heavy-use statement installations.' },
  { title: 'High-end architectural value', text: 'Adds massive aesthetic and monetary value to luxury penthouses, boutique hotels, lobbies, and executive suites.' },
];

const CLASSIC_GEMSTONES: { img: string; alt: string; title: string; text: string; bestFor: string; href: string }[] = [
  { img: `${IMG_BASE}/agate-slabs.jpg`, alt: 'Backlit blue agate semi precious stone slab feature wall', title: 'Agate Slabs', text: 'Agate slabs are among the most sought-after semi precious stones due to their vibrant bands, translucent properties, and striking natural patterns.', bestFor: 'Feature walls · bar fronts · reception counters · luxury tabletops', href: '/products/semi-precious-stone/agate' },
  { img: `${IMG_BASE}/amethyst-slabs.jpg`, alt: 'Luxury purple amethyst crystalline stone slab', title: 'Amethyst Slabs', text: 'Captivating deep purple tones bringing elegance and sophistication to premium interiors. Rich crystalline surfaces reflect depth and status.', bestFor: 'Accent walls · decorative columns · high-end hotel lounges', href: '/products/semi-precious-stone/amethyst' },
  { img: `${IMG_BASE}/quartz-slabs.jpg`, alt: 'Crystalline white quartz slab surface cladding', title: 'Quartz Slabs', text: 'Offers timeless mineral beauty, crystalline structures, and versatility. Blends seamlessly into both contemporary and classic designs.', bestFor: 'Luxury vanity tops · accent walls · decorative countertops', href: '/products/semi-precious-stone/quartz' },
];

const EXOTIC_GEMSTONES: { img: string; alt: string; title: string; text: string; bestFor: string; href: string }[] = [
  { img: `${IMG_BASE}/amazonite-slabs.jpg`, alt: 'Amazonite blue-green exotic stone slab', title: 'Amazonite Slabs', text: 'Admired for its stunning blue-green coloration and natural elegance. Sourced directly to create calming, sophisticated architectural features.', bestFor: 'Bathroom feature walls · fireplace surrounds · luxury vanity units', href: '/products/semi-precious-stone/amazonite' },
  { img: `${IMG_BASE}/jasper-slabs.jpg`, alt: 'Rich patterned earthy red jasper slab', title: 'Jasper Slabs', text: 'Rich earthy tones and intricate, organic patterns that add warmth, depth, and character to custom high-end interior spaces.', bestFor: 'Accent panels · study table tops · custom hotel lobbies', href: '/products/semi-precious-stone/jasper' },
  { img: `${IMG_BASE}/tiger-eye-slabs.jpg`, alt: 'Shimmering golden tiger eye stone slab', title: 'Tiger Eye Slabs', text: 'Renowned for its dramatic chatoyancy and shimmering golden-brown layers. Reflects light beautifully, showcasing intense depth.', bestFor: 'Luxury wall cladding · feature lobby columns · bespoke bar fronts', href: '/products/semi-precious-stone/tiger-eye' },
];

const ORGANIC_TREASURES: { img: string; alt: string; title: string; text: string; bestFor: string; href: string }[] = [
  { img: `${IMG_BASE}/mother-of-pearl-slabs.jpg`, alt: 'Iridescent white mother of pearl slab tiling', title: 'Mother of Pearl Slabs', text: 'Unmatched elegance through natural iridescence and luminosity. Captures ambient light, providing an opulent shell-glow finish.', bestFor: 'Furniture inlays · luxury powder room walls · decorative panel accents', href: '/products/semi-precious-stone/mother-of-pearl' },
  { img: `${IMG_BASE}/petrified-wood-slabs.jpg`, alt: 'Fossilized petrified wood slab detailing', title: 'Petrified Wood Slabs', text: 'Extraordinary natural treasures formed over millions of years. Combines the historic beauty of organic wood grain with stone durability.', bestFor: 'Executive conference tables · entryway focal slabs · statement coffee tables', href: '/products/semi-precious-stone/petrified-wood' },
];

const PROCESS: { step: string; title: string; text: string }[] = [
  { step: '01', title: 'Stone Sourcing', text: 'We source certified, premium-grade gemstone roughs from across the globe, selected for crystal density, colour depth, and minimal inclusions.' },
  { step: '02', title: 'Master Artisan Assembly', text: 'Artisans slice raw gemstones into precise pieces and hand-assemble them like mosaics, bonding them with high-strength resins.' },
  { step: '03', title: 'Precision Calibration & Polish', text: 'Slabs are calibrated for uniform thickness and polished using fine diamond pads to expose the natural brilliance of the crystals.' },
  { step: '04', title: 'Export-Grade Packaging', text: 'Secured inside custom steel-reinforced, foam-lined wooden crates with moisture-absorbent lining to withstand ocean and air shipping.' },
  { step: '05', title: 'Worldwide Delivery', text: 'Delivered directly to architectural sites, fabrication yards, and luxury developers globally with comprehensive shipping support.' },
];

const TAGS = [
  'Semi Precious Stone',
  'Agate Slabs',
  'Amethyst Slabs',
  'Luxury Interiors',
  'Gemstone Slabs',
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
              <li aria-current="page" className="text-[#647167]">Semi Precious Stone Slabs</li>
            </ol>
          </nav>

          <h1 className={`${SERIF} text-[clamp(28px,4.5vw,48px)] font-normal leading-[1.1] tracking-[-1px] text-[#222]`}>
            Luxury Semi Precious Stone Slabs for Premium Interior Applications
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-[17px] font-light leading-[1.7] text-[#555]">
            Semi precious stone slabs represent the perfect blend of natural artistry, exclusivity, and luxury. Discover the Agate, Amethyst, and Quartz slabs transforming global interiors.
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
        <ImagePlaceholder
          src={heroImage}
          alt="Backlit blue Agate semi precious stone slab feature wall glowing in luxury hotel lobby"
          caption="Translucent Agate and Quartz slabs can be backlit with LEDs to create spectacular, glowing installations."
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
          Semi precious stone slabs represent the perfect blend of natural artistry, exclusivity, and luxury. 
          Formed over millions of years, these extraordinary stones feature unique colors, patterns, and textures 
          that transform ordinary spaces into remarkable architectural masterpieces.
        </p>
        <p className={`mt-6 ${BODY}`}>
          At HS Global Export, we offer a premium collection of semi precious stone slabs sourced from the finest natural materials. 
          Our collection includes Agate, Amethyst, Quartz, Amazonite, Jasper, Tiger Eye, Mother of Pearl, and Petrified Wood slabs, 
          designed to elevate luxury residential, hospitality, retail, and commercial projects worldwide.
        </p>

        <h2 className={`${SERIF} mb-5 mt-14 text-[clamp(26px,3.4vw,38px)] font-normal leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          Why Choose Semi Precious Stone Slabs?
        </h2>
        <p className={BODY}>
          Semi precious stone slabs are highly valued for their rarity, beauty, and ability to create one-of-a-kind interiors. 
          Every slab is unique, showcasing natural formations that cannot be replicated by artificial materials.
        </p>
      </section>

      {/* Advantages */}
      <section className="mx-auto mt-16 max-w-5xl px-6">
        <Eyebrow>The Gemstone Edge</Eyebrow>
        <h2 className={`${SERIF} mb-12 max-w-2xl text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          Key advantages of semi precious stone slabs
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

      {/* Collection 1: Classic Gemstones */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
        <Eyebrow>Classic Gemstones</Eyebrow>
        <h2 className={`${SERIF} mb-4 max-w-2xl text-[clamp(26px,3.4vw,40px)] leading-[1.12] tracking-[-0.5px] text-[#222]`}>
          Agate, Amethyst &amp; Quartz
        </h2>
        <p className="mb-12 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
          Renowned translucent selections, designed to capture backlighting and form stunning focal centerpieces.
        </p>
        <div className="grid gap-x-9 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {CLASSIC_GEMSTONES.map((p) => (
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

      {/* Collection 2: Rare & Exotic */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
        <Eyebrow>Rare &amp; Exotic Stone</Eyebrow>
        <h2 className={`${SERIF} mb-4 max-w-2xl text-[clamp(26px,3.4vw,40px)] leading-[1.12] tracking-[-0.5px] text-[#222]`}>
          Amazonite, Jasper &amp; Tiger Eye
        </h2>
        <p className="mb-12 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
          Spectacular metallic chatoyancy, blue-green elegance, and earthy patterns for high-impact spaces.
        </p>
        <div className="grid gap-x-9 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {EXOTIC_GEMSTONES.map((p) => (
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

      {/* Collection 3: Nature Organic Treasures */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
        <Eyebrow>Nature Organic Treasures</Eyebrow>
        <h2 className={`${SERIF} mb-4 max-w-2xl text-[clamp(26px,3.4vw,40px)] leading-[1.12] tracking-[-0.5px] text-[#222]`}>
          Mother of Pearl &amp; Petrified Wood
        </h2>
        <p className="mb-12 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
          Iridescent shell reflections and fossilized logs preserved in crystalline quartz over millions of years.
        </p>
        <div className="grid gap-x-9 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {ORGANIC_TREASURES.map((p) => (
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
            “Semi precious stone slabs represent the perfect blend of natural history and modern luxury. To own one is to own a portion of Earth\'s structural legacy.”
          </p>
          <cite className="mt-7 block text-[12px] uppercase not-italic tracking-[0.18em] text-[#9a9582]">
            HS Global Export
          </cite>
        </blockquote>
      </section>

      {/* Process */}
      <section className="mx-auto mt-20 max-w-3xl px-6">
        <Eyebrow>Quarry &amp; Assembly Process</Eyebrow>
        <h2 className={`${SERIF} mb-12 text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          How we manufacture &amp; ship gemstone slabs
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
              <span className="text-[16px] font-light leading-[1.6] text-white/85">Premium material selection sourced from certified global quarries</span>
            </li>
            <li className="flex items-start gap-4 border-t border-white/15 pt-5">
              <span className={`${SERIF} text-[15px] text-[#b9c2b3]`}>02</span>
              <span className="text-[16px] font-light leading-[1.6] text-white/85">Bespoke custom sizing and fabrication options for seamless architectural integration</span>
            </li>
            <li className="flex items-start gap-4 border-t border-white/15 pt-5">
              <span className={`${SERIF} text-[15px] text-[#b9c2b3]`}>03</span>
              <span className="text-[16px] font-light leading-[1.6] text-white/85">Export-quality processing, diamond polishing, and structural calibration</span>
            </li>
            <li className="flex items-start gap-4 border-t border-white/15 pt-5">
              <span className={`${SERIF} text-[15px] text-[#b9c2b3]`}>04</span>
              <span className="text-[16px] font-light leading-[1.6] text-white/85">Consistent premium quality standards supervised by in-house geo-specialists</span>
            </li>
            <li className="flex items-start gap-4 border-t border-white/15 pt-5">
              <span className={`${SERIF} text-[15px] text-[#b9c2b3]`}>05</span>
              <span className="text-[16px] font-light leading-[1.6] text-white/85">Steel-reinforced export-grade packaging ensuring safe worldwide transit</span>
            </li>
            <li className="flex items-start gap-4 border-t border-white/15 pt-5">
              <span className={`${SERIF} text-[15px] text-[#b9c2b3]`}>06</span>
              <span className="text-[16px] font-light leading-[1.6] text-white/85">Global shipping support with full customs clearance and tracking documentation</span>
            </li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#f4f2e3]">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <Eyebrow>Begin your project</Eyebrow>
          <h2 className={`${SERIF} mb-5 text-[clamp(28px,4vw,46px)] leading-[1.1] tracking-[-0.5px] text-[#222]`}>
            Ready to transform your interiors with gemstone slabs?
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
            Whether you are an interior designer designing a feature wall, a builder sourcing luxury lobby materials, or a
            developer building luxury penthouses — HS Global Export is your reliable supplier.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/products/semi-precious-stone"
              className="inline-block bg-[#222] px-9 py-4 text-[13px] font-light uppercase tracking-[1.5px] text-white transition-colors hover:bg-black"
            >
              Browse our Collections
            </a>
            <a
              href="/contact"
              className="inline-block border border-[#222] px-9 py-4 text-[13px] font-light uppercase tracking-[1.5px] text-[#222] transition-colors hover:bg-[#222] hover:text-white"
            >
              Custom Sizing &amp; Slabs Inquiries
            </a>
          </div>
        </div>
      </section>

      {/* You might also like */}
      <RelatedProducts products={[...CLASSIC_GEMSTONES, ...EXOTIC_GEMSTONES]} />

      {/* Share · Author · tags */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <SocialShare
          url={canonical}
          title="Luxury Semi Precious Stone Slabs for Premium Interior Applications"
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
