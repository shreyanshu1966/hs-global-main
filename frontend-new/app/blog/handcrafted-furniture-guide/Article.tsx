/* Server-rendered article body — fully static & crawlable (no 'use client'). */

type Faq = { q: string; a: string };

const IMG_BASE = '/blog/handcrafted-furniture-guide';

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
  const isPlaceholder = src.startsWith('/blog/') && !src.includes('handcrafted-teak-dining-table.jpg') && !src.includes('handcrafted-coffee-table.jpg') && !src.includes('handcrafted-console-table.jpg') && !src.includes('handcrafted-dining-table.jpg') && !src.includes('handcrafted-side-table.jpg');

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
  { value: '100%', label: 'Solid Hardwood' },
  { value: '50+ Yrs', label: 'Typical Lifespan' },
  { value: 'Low-Waste', label: 'Eco-Friendly Production' },
  { value: 'India', label: 'Century-old woodworking heritage' },
];

const ADVANTAGES: { title: string; text: string }[] = [
  { title: 'Quality over convenience', text: 'Unlike factory-made furniture, handcrafted pieces are created with greater attention to materials, finishing, and structural strength.' },
  { title: 'One-of-a-kind uniqueness', text: 'Every handcrafted item carries its own grain patterns, textures, and subtle details, making each piece unique.' },
  { title: 'Bespoke customization', text: 'Tailor collections in terms of finish, dimensions, wood selection, upholstery, and design details to fit your space perfectly.' },
  { title: 'Solid wood construction', text: 'Built exclusively with solid hardwoods like oak, teak, walnut, and sheesham. No particle board or veneer shortcuts.' },
  { title: 'Traditional joinery', text: 'Mortise-and-tenon, dovetail, and dowel joints are used to deliver exceptional structural integrity and lasting strength.' },
  { title: 'Naturally sustainable', text: 'Made using reclaimed or responsibly sourced wood, with low-waste production where artisans repurpose offcuts.' },
];

const PRODUCTS: { img: string; alt: string; title: string; text: string; bestFor: string }[] = [
  { img: `${IMG_BASE}/handcrafted-coffee-table.jpg`, alt: 'Handcrafted wooden coffee table in a modern living room', title: 'Handcrafted Coffee Tables', text: 'A functional piece that defines the style of a living room and creates a strong visual anchor for the seating area. Available in rustic, modern, minimalist, or luxury styles.', bestFor: 'Living rooms · lounges · apartments' },
  { img: `${IMG_BASE}/handcrafted-console-table.jpg`, alt: 'Handcrafted wooden console table in an elegant entryway', title: 'Handcrafted Console Tables', text: 'A versatile piece for entryways, hallways, or living rooms. Slim and refined designs transform narrow spaces into visually appealing areas without cluttering.', bestFor: 'Entryways · hallways · behind-sofa styling' },
  { img: `${IMG_BASE}/handcrafted-dining-table.jpg`, alt: 'Handcrafted wooden dining table in a spacious dining area', title: 'Handcrafted Dining Tables', text: 'The heart of the home, offering strong construction and custom sizing. Available in classic solid wood designs to contemporary silhouettes with clean lines.', bestFor: 'Dining rooms · formal dining spaces · hospitality' },
  { img: `${IMG_BASE}/handcrafted-side-table.jpg`, alt: 'Handcrafted wooden side table next to a bed or sofa', title: 'Handcrafted Side Tables', text: 'Compact but impactful, these tables add convenience next to sofas, beds, or reading corners. Introduce texture and detail without changing the entire layout.', bestFor: 'Bedrooms · reading corners · living rooms' },
  { img: 'https://res.cloudinary.com/dynd1aan0/image/upload/v1779285360/hs-global/leather/etsy/HSLSOGR1/il_1588xN.8010286042_iajq.webp', alt: 'Handcrafted upholstered sofa with solid wood frame', title: 'Handcrafted Seating & Sofas', text: 'Combining comfort with design excellence, featuring stronger frames, premium upholstery options, and meticulous hand-finishing details.', bestFor: 'Upscale living rooms · luxury hotel lobbies' },
];

const VS_TABLE: { factor: string; handcrafted: string; massproduced: string; highlight?: boolean }[] = [
  { factor: 'Durability', handcrafted: 'Built to last generations', massproduced: 'Often designed for short-term use', highlight: true },
  { factor: 'Materials', handcrafted: 'Solid hardwoods (oak, teak, walnut, sheesham)', massproduced: 'Engineered wood, MDF, veneers' },
  { factor: 'Uniqueness', handcrafted: 'One-of-a-kind or limited runs', massproduced: 'Identical copies by the thousands' },
  { factor: 'Sustainability', handcrafted: 'Uses reclaimed or responsibly sourced wood', massproduced: 'Higher environmental footprint' },
  { factor: 'Repairability', handcrafted: 'Easy to refinish and restore', massproduced: 'Difficult or impossible to repair' },
];

const WOOD_TABLE: { type: string; color: string; use: string; mood: string; swatch: string }[] = [
  { type: 'Teak Wood', color: 'Rich golden-brown', use: 'Outdoor & indoor dining tables', mood: 'Warm, timeless luxury', swatch: '#c49c5e' },
  { type: 'Oak Wood', color: 'Light wheat to medium brown', use: 'Coffee & dining tables', mood: 'Classic, sturdy elegance', swatch: '#e0cbb2' },
  { type: 'Walnut Wood', color: 'Deep dark chocolate brown', use: 'Console tables, study desks', mood: 'Modern, sophisticated', swatch: '#4b3c31' },
  { type: 'Sheesham Wood', color: 'Chestnut with dark veins', use: 'Dining tables, cabinets', mood: 'Rustic, bold character', swatch: '#8a5a36' },
  { type: 'Mango Wood', color: 'Light golden-yellow', use: 'Side tables & accent pieces', mood: 'Eco-friendly, modern', swatch: '#dfc49c' },
];

const IDENTIFY_STEPS: { step: string; title: string; text: string }[] = [
  { step: '01', title: 'Solid wood throughout', text: 'Check drawer bottoms, backs, and hidden surfaces. True handcrafted furniture avoids engineered wood/veneer shortcuts.' },
  { step: '02', title: 'Traditional joinery', text: 'Look for dovetail joints on drawers and mortise-and-tenon or dowel joints on frames for lasting strength.' },
  { step: '03', title: 'Smooth, even finishes', text: 'Feel the surfaces. Premium handcrafted pieces boast smooth, hand-finished staining, polishing, and sealing without drips.' },
  { step: '04', title: 'Weight & density', text: 'Solid hardwood is noticeably heavier and more dense than hollow or engineered MDF alternatives.' },
  { step: '05', title: 'Provenance & transparency', text: 'Reputable makers share details of their wood species, sourcing, finishes, and the location of their artisan workshop.' },
];

const CARE_TIPS = [
  { n: '01', title: 'Dust regularly', text: 'Use a soft, dry cloth to clean the wood surfaces and prevent dust buildup in the grain.' },
  { n: '02', title: 'Avoid direct sunlight', text: 'Place furniture away from windows to prevent uneven color fading and wood cracking.' },
  { n: '03', title: 'Use protection', text: 'Always use coasters, placemats, and hot pads to protect the finish from heat and water rings.' },
  { n: '04', title: 'Reapply finish', text: 'For oiled or waxed finishes, reapply the recommended wax or oil annually to nourish the timber.' },
];

const TAGS = [
  'Handcrafted Furniture',
  'Handmade Wooden Furniture',
  'Artisan Furniture',
  'Custom Wood Furniture',
  'Sustainable Handcrafted Furniture',
  'Handcrafted Furniture India',
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
              <li aria-current="page" className="text-[#647167]">Handcrafted Furniture Guide</li>
            </ol>
          </nav>

          <h1 className={`${SERIF} text-[clamp(28px,4.5vw,48px)] font-normal leading-[1.1] tracking-[-1px] text-[#222]`}>
            Handcrafted Furniture: The Complete Guide to Timeless Artisan Pieces for Your Home
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-[17px] font-light leading-[1.7] text-[#555]">
            Handcrafted furniture brings warmth, character, and durability that mass-produced pieces simply cannot match.
            Learn how to choose, care for, and invest in timeless artisan pieces.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] uppercase tracking-[0.14em] text-[#9a9582]">
            <span className="text-[#647167]">HS Global Export</span>
            <span aria-hidden="true">·</span>
            <span>{publishedLabel}</span>
            <span aria-hidden="true">·</span>
            <span>10 min read</span>
          </div>
        </div>
      </header>

      {/* Hero image */}
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <ImagePlaceholder
          src={heroImage}
          alt="Handcrafted teak wood dining table styled in a bright luxury dining room"
          caption="A beautiful handcrafted teak dining table — solid, timeless, and sustainably made."
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
      <section className="mx-auto max-w-3xl px-6 mt-16">
        <p className="text-[21px] font-light leading-[1.7] text-[#333]">
          Whether you're furnishing a new home, upgrading your living space, or sourcing unique artisan furniture for a project, 
          understanding what sets handmade wooden furniture apart is the first step toward making a lasting investment.
        </p>
        <p className={`mt-6 ${BODY}`}>
          This comprehensive guide covers everything you need to know — from identifying quality craftsmanship to choosing 
          the right custom wood furniture for your space and understanding why it remains the gold standard in premium interiors.
        </p>

        <h2 className={`${SERIF} mb-5 mt-14 text-[clamp(26px,3.4vw,38px)] font-normal leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          What Is Handcrafted Furniture?
        </h2>
        <p className={BODY}>
          Handcrafted furniture refers to pieces made primarily by skilled artisans using traditional woodworking techniques, 
          hand tools, and careful attention to detail. Unlike factory-made furniture, each handmade piece carries subtle 
          variations that reflect the maker's expertise and the natural beauty of the wood.
        </p>
      </section>

      {/* Advantages */}
      <section className="mx-auto mt-16 max-w-5xl px-6">
        <Eyebrow>Why it leads the world</Eyebrow>
        <h2 className={`${SERIF} mb-12 max-w-2xl text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          Key advantages of handcrafted furniture
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
          A Complete Guide to Coffee Tables, Consoles, Dining, Side Tables and Sofas
        </h2>
        <p className="mb-12 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
          Five categories bringing together timeless design, skilled workmanship, and customizable silhouettes.
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
            “Handcrafted furniture is an investment — not just in your home, but in sustainability and supporting skilled trades that preserve centuries-old artistic legacies.”
          </p>
          <cite className="mt-7 block text-[12px] uppercase not-italic tracking-[0.18em] text-[#9a9582]">
            HS Global Export
          </cite>
        </blockquote>
      </section>

      {/* Comparison table */}
      <section className="mx-auto mt-20 max-w-5xl px-6">
        <Eyebrow>Handcrafted vs. Mass-produced</Eyebrow>
        <h2 className={`${SERIF} mb-4 max-w-2xl text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          Why Choose Handmade Wooden Furniture?
        </h2>
        <p className="mb-10 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
          A clear side-by-side comparison of durability, materials, and long-term value.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-y border-[#222]">
                {['Factor', 'Handcrafted Furniture', 'Mass-Produced Furniture'].map((h) => (
                  <th key={h} className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#222]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VS_TABLE.map((row) => (
                <tr key={row.factor} className={`border-b border-[#ece9dd] ${row.highlight ? 'bg-[#f4f2e3]' : ''}`}>
                  <td className={`${SERIF} px-4 py-4 text-[17px] text-[#222]`}>{row.factor}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.handcrafted}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.massproduced}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sourcing/Wood guide */}
      <section className="mx-auto mt-20 max-w-5xl px-6">
        <Eyebrow>Choosing your timber</Eyebrow>
        <h2 className={`${SERIF} mb-10 text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          A quick guide to premium hardwoods
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-y border-[#222]">
                {['Wood species', 'Colour profile', 'Best use', 'Mood'].map((h) => (
                  <th key={h} className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#222]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WOOD_TABLE.map((row) => (
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

      {/* How to identify */}
      <section className="mx-auto mt-20 max-w-3xl px-6">
        <Eyebrow>Artisan Verification</Eyebrow>
        <h2 className={`${SERIF} mb-12 text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          How to identify quality handcrafted furniture
        </h2>
        <ol className="border-t border-[#ece9dd]">
          {IDENTIFY_STEPS.map(({ step, title, text }) => (
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

      {/* Sustainability */}
      <section className="mx-auto mt-20 max-w-3xl px-6">
        <Eyebrow>Eco-Friendly Design</Eyebrow>
        <h2 className={`${SERIF} mb-5 text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          Sustainable handcrafted furniture: why it matters
        </h2>
        <p className={`mt-6 ${BODY}`}>
          Sustainability is a growing priority for furniture buyers worldwide. Handcrafted furniture supports this in several ways:
        </p>
        <ul className="mt-6 space-y-4 text-[16px] font-light leading-[1.7] text-[#555]">
          <li><strong>Reclaimed wood:</strong> Salvaged timber from old buildings, railway sleepers, or retired furniture gets a second life.</li>
          <li><strong>Responsibly sourced hardwoods:</strong> Sourced from FSC-certified forests or locally harvested, keeping environmental footprints minimal.</li>
          <li><strong>Low-waste production:</strong> Artisans manually optimize cuts, repurpose offcuts, and utilize organic finishes.</li>
          <li><strong>Generational longevity:</strong> A piece built to last 50+ years means fewer resources consumed and less waste in landfills.</li>
        </ul>
      </section>

      {/* Global tradition */}
      <section className="mx-auto mt-20 max-w-3xl px-6">
        <Eyebrow>Global Craft</Eyebrow>
        <h2 className={`${SERIF} mb-5 text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          Handcrafted furniture from India: a global tradition
        </h2>
        <p className={BODY}>
          India has a centuries-old tradition of woodworking, with regional styles ranging from the intricate carvings of Rajasthan 
          to the clean, minimalist lines of contemporary Jodhpur workshops. Today, Indian artisans supply handcrafted furniture 
          to retailers, developers, and homeowners across the USA, UK, Europe, and beyond.
        </p>
        <p className={`mt-4 ${BODY}`}>
          By sourcing from India, buyers gain access to high-quality native hardwoods (like sheesham, mango wood, and acacia) and 
          multi-generational carving and carpentry expertise, securing world-class bespoke design at highly competitive factory-direct pricing.
        </p>
      </section>

      {/* Care */}
      <section className="mx-auto mt-20 max-w-5xl px-6">
        <Eyebrow>Care guide</Eyebrow>
        <h2 className={`${SERIF} mb-4 text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          Caring for your handmade wooden furniture
        </h2>
        <p className="mb-12 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
          With simple preventative steps and regular care, solid wood furniture retains its character and beauty for decades.
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
              <span className="text-[16px] font-light leading-[1.6] text-white/85">Direct manufacturer — no middlemen, better pricing</span>
            </li>
            <li className="flex items-start gap-4 border-t border-white/15 pt-5">
              <span className={`${SERIF} text-[15px] text-[#b9c2b3]`}>02</span>
              <span className="text-[16px] font-light leading-[1.6] text-white/85">Premium material varieties sourced directly from certified quarries & forests</span>
            </li>
            <li className="flex items-start gap-4 border-t border-white/15 pt-5">
              <span className={`${SERIF} text-[15px] text-[#b9c2b3]`}>03</span>
              <span className="text-[16px] font-light leading-[1.6] text-white/85">Fully customizable dimensions, materials, finishes, and base types</span>
            </li>
            <li className="flex items-start gap-4 border-t border-white/15 pt-5">
              <span className={`${SERIF} text-[15px] text-[#b9c2b3]`}>04</span>
              <span className="text-[16px] font-light leading-[1.6] text-white/85">Experienced exporter serving USA, UK, Europe, and worldwide</span>
            </li>
            <li className="flex items-start gap-4 border-t border-white/15 pt-5">
              <span className={`${SERIF} text-[15px] text-[#b9c2b3]`}>05</span>
              <span className="text-[16px] font-light leading-[1.6] text-white/85">Export-grade packaging ensures furniture arrives safe and intact</span>
            </li>
            <li className="flex items-start gap-4 border-t border-white/15 pt-5">
              <span className={`${SERIF} text-[15px] text-[#b9c2b3]`}>06</span>
              <span className="text-[16px] font-light leading-[1.6] text-white/85">Trade-friendly wholesale pricing for designers, retailers, and developers</span>
            </li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#f4f2e3]">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <Eyebrow>Begin your project</Eyebrow>
          <h2 className={`${SERIF} mb-5 text-[clamp(28px,4vw,46px)] leading-[1.1] tracking-[-0.5px] text-[#222]`}>
            Ready to transform your space with handcrafted furniture?
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
            Whether you are a designer sourcing a luxury project, a homeowner building your dream living room, or a
            wholesale buyer seeking a reliable artisan furniture manufacturer in India — HS Global Export is your
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
              Premium handcrafted furniture &amp; natural-stone manufacturer and worldwide exporter — serving the USA, UK, Europe and the
              Middle East with exceptional bespoke design.
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
