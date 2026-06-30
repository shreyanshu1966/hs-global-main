/* Server-rendered article body — fully static & crawlable.
 *
 * Visual language matches the homepage editorial system.
 */

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
  priority = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  ratio?: string;
  className?: string;
  priority?: boolean;
}) {
  const isPlaceholder = src.startsWith('/blog/') && src.includes('placeholder');

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

const SIZE_GUIDE = [
  { seats: '4 people', rect: '120–140 × 75–80 cm', round: '100–110 cm', oval: '130 × 85 cm' },
  { seats: '6 people', rect: '160–180 × 85–90 cm', round: '130–140 cm', oval: '175 × 95 cm' },
  { seats: '8 people', rect: '200–220 × 90–100 cm', round: '150–160 cm', oval: '210 × 105 cm' },
  { seats: '10 people', rect: '240–260 × 100 cm', round: '180 cm', oval: '250 × 110 cm' },
];

const FINISH_COMPARISON = [
  { finish: 'Polished', gloss: 'High', etch: 'Very visible', maintenance: 'High', marble: 'Calacatta, Statuario' },
  { finish: 'Honed', gloss: 'None / Matte', etch: 'Low-moderate', maintenance: 'Moderate', marble: 'Carrara, Bianco Sivec' },
  { finish: 'Leathered', gloss: 'Textured', etch: 'Very low', maintenance: 'Low-moderate', marble: 'Nero Marquina, Emperador' },
];

const BUYING_MATRIX = [
  { situation: '4-person, everyday dining, small room', size: '140×80 cm / 110 cm round', shape: 'Rect. or Round', edge: 'Bullnose', finish: 'Honed', marble: 'Carrara' },
  { situation: '6-person, formal entertaining', size: '180×90 cm', shape: 'Rect. or Oval', edge: 'Ogee / Waterfall', finish: 'Polished', marble: 'Calacatta / Statuario' },
  { situation: '6–8 person, family with children', size: '200×100 cm', shape: 'Oval / Rect.', edge: 'Full Bullnose', finish: 'Honed', marble: 'Carrara / Bianco Sivec' },
  { situation: 'Interior designer, high-impact lobby', size: '220+×100 cm', shape: 'Rectangular', edge: 'Mitered / Waterfall', finish: 'Polished', marble: 'Statuario / Calacatta' },
  { situation: 'Contemporary apartment, everyday use', size: '160×85 cm', shape: 'Round / Oval', edge: 'Straight/Eased', finish: 'Leathered', marble: 'Nero Marquina / Emperador' },
  { situation: 'Transitional room, budget-conscious', size: '160×85 cm', shape: 'Rectangular', edge: 'Beveled', finish: 'Honed', marble: 'Carrara' },
];

const TAGS = [
  'Marble Dining Table',
  'Marble Furniture',
  'Buyer\'s Guide',
  'Interior Design',
  'Home Decor',
];

const BODY = 'text-[17px] font-light leading-[1.8] text-[#444]';
const H3 = `${SERIF} mb-2 mt-2 text-[21px] text-[#222]`;

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
              <li aria-current="page" className="text-[#647167]">Marble Dining Table Buying Guide</li>
            </ol>
          </nav>

          <Eyebrow>Buying Guide</Eyebrow>

          <h1 className={`${SERIF} mx-auto max-w-3xl text-[clamp(34px,5.4vw,60px)] font-normal leading-[1.08] tracking-[-0.5px] text-[#222]`}>
            Marble Dining Table Buying Guide: Sizes, Edges & Finishes (2026)
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-[17px] font-light leading-[1.7] text-[#555]">
            Choosing a marble dining table is one of the most significant furniture decisions you'll make.
            Get the size wrong and the room feels cramped. Pick the wrong finish and you're resealing every six months.
            Here is everything you need to know.
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
          src="/blog/marble-dining-table-buying-guide/hero.png"
          alt="Marble dining table in a luxury home – HS Global Export"
          caption="A handcrafted marble dining table — the crown jewel of a luxury home."
          ratio="aspect-[2/1]"
          priority
        />
      </div>

      {/* Intro */}
      <section className="mx-auto max-w-3xl px-6 mt-16">
        <p className="text-[21px] font-light leading-[1.7] text-[#333]">
          Choosing a <a href="/products/furniture/dining-table" className="underline hover:text-[#222]">marble dining table</a> is one of the most significant furniture decisions you'll make — and one of the most permanent.
          Choose an edge profile that doesn't match your interior style and the whole piece looks off.
        </p>
        <p className={`mt-6 ${BODY}`}>
          At <a href="/" className="underline hover:text-[#222]">HS Global Export</a>, we manufacture and export <a href="/products/furniture/dining-table" className="underline hover:text-[#222]">marble dining tables</a> directly from our production facility to buyers in the USA, UK, and across Europe.
          We cut, finish, and crate every slab ourselves. This guide distils what we've learned across thousands of export orders into a single, practical resource —
          covering the right size for your room, every edge profile worth considering, and which finish actually suits your lifestyle.
        </p>

        {/* Section 1: Size */}
        <h2 className={`${SERIF} mb-5 mt-14 text-[clamp(26px,3.4vw,38px)] font-normal leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          1. What Size Marble Dining Table Do You Need?
        </h2>
        <p className={BODY}>
          The most common buying mistake is choosing a table size based on the dining room floor area — without accounting for clearance, chair depth, and slab weight logistics.
        </p>

        <h3 className={H3}>Standard Size Guide by Seating</h3>
        <div className="overflow-x-auto my-6">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-y border-[#222]">
                {['Seating', 'Rectangular (L × W)', 'Round (Diameter)', 'Oval (L × W)'].map((h) => (
                  <th key={h} className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#222]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIZE_GUIDE.map((row) => (
                <tr key={row.seats} className="border-b border-[#ece9dd]">
                  <td className={`${SERIF} px-4 py-4 text-[17px] text-[#222]`}>{row.seats}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.rect}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.round}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.oval}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className={BODY}>
          Allow at least 90–100 cm of clearance on all sides where people sit and push chairs back.
          For walk-behind traffic lanes (a server or host circulating), bump that to 110 cm minimum.
        </p>

        <h3 className={H3}>Room Size to Table Size — Quick Formula</h3>
        <p className={BODY}>
          Subtract 180 cm from both room dimensions. The result is your usable table envelope. A 360 × 300 cm dining room accommodates a table up to 180 × 120 cm comfortably.
        </p>

        <h3 className={H3}>Weight and Delivery Logistics</h3>
        <p className={BODY}>
          Natural marble is heavy — heavier than most buyers anticipate. Our standard 2 cm (¾ inch) slab at 200 × 100 cm weighs approximately 100–120 kg for the tabletop alone. At 3 cm thickness, that rises to 150–180 kg.
        </p>
        <ul className={`mt-4 list-disc pl-6 space-y-2 ${BODY}`}>
          <li>A 60-inch (152 cm) round slab cannot be tilted flat through a standard 32-inch (81 cm) interior door. Plan your delivery path — hallway widths, staircase turns, lift dimensions — before ordering.</li>
          <li>For US shipments, we export on EUR pallets in custom wooden crates with foam-padded internal bracing. Most residential deliveries to the USA require white-glove or threshold service, not standard curbside drop-off.</li>
          <li>UK buyers: our standard sea freight transit is 18–24 days port-to-port. Add 5–7 days for customs clearance and final-mile delivery.</li>
        </ul>
      </section>

      {/* Section 2: Shapes */}
      <section className="mx-auto max-w-3xl px-6 mt-16">
        <h2 className={`${SERIF} mb-5 text-[clamp(26px,3.4vw,38px)] font-normal leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          2. Marble Dining Table Shapes Explained
        </h2>
        
        <h3 className={H3}>Rectangular</h3>
        <p className={BODY}>
          The most common format for formal dining. Seats the most people per square metre of room space. Best for longer, narrower rooms. Suits 6–10 person households hosting larger dinners. Pairs naturally with a <a href="/products/furniture/dining-table" className="underline hover:text-[#222]">rectangular dining table</a> base.
        </p>
        <p className="mt-3 text-[14px] italic text-[#647167]">
          Exporter note: Rectangular slabs are the most structurally stable for long-haul shipping and have the lowest breakage rate in transit. For tables over 220 cm, we ship the top and base as two separate crates.
        </p>

        <h3 className={`${H3} mt-8`}>Round</h3>
        <p className={BODY}>
          Ideal for square rooms and smaller spaces. Promotes conversation — no hierarchy, everyone faces everyone. A <a href="/products/furniture/dining-table" className="underline hover:text-[#222]">round marble dining table</a> works well for 4 people at 100–110 cm diameter; for 6, go to 130–140 cm minimum.
        </p>
        <p className="mt-3 text-[14px] italic text-[#647167]">
          Exporter note: Round slabs are cut on CNC waterjet machines from a rectangular block. The curved edge requires additional polishing time — factor 2–3 extra production days for complex edge profiles on round tops.
        </p>

        <h3 className={`${H3} mt-8`}>Oval</h3>
        <p className={BODY}>
          The most versatile format. Offers rectangular seating capacity with softened, room-friendly edges. Works particularly well in rooms where a rectangular table would feel too angular. Interior designers frequently specify oval for open-plan spaces where the table is viewed from multiple angles.
        </p>

        <h3 className={`${H3} mt-8`}>Square</h3>
        <p className={BODY}>
          Best for 4-person compact dining. Creates an intimate, symmetrical look. Avoid for tables over 140 × 140 cm — the surface becomes difficult to reach across and the proportions begin to feel heavy.
        </p>
      </section>

      {/* Section 3: Edges */}
      <section className="mx-auto max-w-3xl px-6 mt-16">
        <h2 className={`${SERIF} mb-5 text-[clamp(26px,3.4vw,38px)] font-normal leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          3. Edge Profiles: The Detail That Changes Everything
        </h2>
        <p className={BODY}>
          Edge profiles are the cross-sectional shape of the table's perimeter. They affect safety, style, cleaning ease, and how long the edge stays chip-free over years of use. At our factory, all edge work is done by hand-guided diamond tooling after CNC rough-cutting.
        </p>

        <div className="mt-8 space-y-8">
          <div>
            <h3 className={H3}>Straight / Eased Edge</h3>
            <p className={BODY}>A clean 90-degree corner with the top and bottom edges very slightly softened. The most minimalist option. Maximises the visual mass of the slab.</p>
            <ul className={`mt-2 list-disc pl-6 ${BODY}`}>
              <li><strong>Best for:</strong> contemporary lofts, designer dining rooms, Japandi-style interiors.</li>
              <li><strong>Chip risk:</strong> moderate-high on the corners if the table is knocked or dragged.</li>
              <li><strong>Note:</strong> avoid for homes with young children.</li>
            </ul>
          </div>

          <div>
            <h3 className={H3}>Beveled Edge</h3>
            <p className={BODY}>An angled flat cut on the top edge, creating a 45-degree or shallower slope. Adds definition and visual interest without the softness of a round. Makes the slab appear slightly thinner and lighter.</p>
            <ul className={`mt-2 list-disc pl-6 ${BODY}`}>
              <li><strong>Best for:</strong> transitional and contemporary spaces; works well on both 2 cm and 3 cm slabs.</li>
              <li><strong>Chip risk:</strong> low on the bevel face; corners still require care.</li>
            </ul>
          </div>

          <div>
            <h3 className={H3}>Bullnose (Half and Full)</h3>
            <p className={BODY}>A rounded edge — half bullnose rounds the top corner only; full bullnose rounds the entire edge profile into a half-circle. The safest option for families with children.</p>
            <ul className={`mt-2 list-disc pl-6 ${BODY}`}>
              <li><strong>Best for:</strong> family dining rooms, coastal interiors, transitional or traditional settings.</li>
            </ul>
            <p className="mt-2 text-[14px] italic text-[#647167]">Exporter note: Full bullnose requires the most grinding time of any standard profile. On Carrara marble, we add a secondary sealing step on the bullnose edge after polishing to protect the rounded grain from early etching.</p>
          </div>

          <div>
            <h3 className={H3}>Ogee</h3>
            <p className={BODY}>An S-shaped profile — concave curve at top, convex below — that adds sculptural elegance. The classic choice for formal, European-style dining rooms. The profile depth catches light beautifully but also traps dust.</p>
            <ul className={`mt-2 list-disc pl-6 ${BODY}`}>
              <li><strong>Best for:</strong> classical, French, or formal traditional interiors; best on Calacatta or Statuario marble.</li>
              <li><strong>Chip risk:</strong> the concave portion is most vulnerable — recommend only for low-traffic formal dining rooms.</li>
            </ul>
          </div>

          <div>
            <h3 className={H3}>Waterfall / Half-Bullnose with Drip</h3>
            <p className={BODY}>A gentle curve that flows from the top surface and drops cleanly to the bottom edge. Creates the impression of liquid stone. Visually extends the slab downward, making the table feel more monumental.</p>
            <ul className={`mt-2 list-disc pl-6 ${BODY}`}>
              <li><strong>Best for:</strong> luxury contemporary interiors, hotel lobbies, high-end hospitality projects.</li>
            </ul>
            <p className="mt-2 text-[14px] italic text-[#647167]">Exporter note: The waterfall profile is our most-requested export profile for US and UK interior design projects. On Statuario marble with bold veining, the waterfall edge showcases the stone's full depth.</p>
          </div>

          <div>
            <h3 className={H3}>Mitered / Laminated Edge</h3>
            <p className={BODY}>Two pieces of marble joined at a 45-degree angle to create an edge that appears much thicker than the individual slabs. Produces a 4–6 cm-appearing edge from two 2 cm slabs. Preferred for clients who want a statement 'architectural' table without the freight cost of thick natural stone.</p>
            <ul className={`mt-2 list-disc pl-6 ${BODY}`}>
              <li><strong>Best for:</strong> high-impact design installs, hospitality, clients with freight weight constraints.</li>
            </ul>
            <p className="mt-2 text-[14px] italic text-[#647167]">Exporter note: Mitered edges require precise CNC cutting and expert adhesive bonding. We use epoxy-based stone adhesive colour-matched to the marble veining — the joint is invisible on-site.</p>
          </div>
        </div>
      </section>

      {/* Section 4: Finishes */}
      <section className="mx-auto max-w-4xl px-6 mt-16">
        <h2 className={`${SERIF} mb-5 text-[clamp(26px,3.4vw,38px)] font-normal leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          4. Honed vs Polished vs Leathered: Choosing Your Finish
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          <div>
            <h3 className={H3}>Polished Finish</h3>
            <p className={`${BODY} text-[15px]`}>High-gloss, mirror-like surface that amplifies the marble's veining and colour depth. The most visually dramatic option. Reflects light strongly.</p>
            <p className={`${BODY} text-[15px] mt-2`}><strong>Practical reality:</strong> polished marble shows every fingerprint, water ring, and smear. Etching from acidic substances creates dull spots that are immediately visible against the high-gloss surface. Requires the most attentive daily maintenance.</p>
            <p className={`${BODY} text-[15px] mt-2`}><strong>Best for:</strong> formal dining rooms not used for everyday meals; interior photography and showroom settings.</p>
          </div>
          <div>
            <h3 className={H3}>Honed Finish</h3>
            <p className={`${BODY} text-[15px]`}>Matte or satin surface — ground smooth but not buffed to a high gloss. Etching still occurs but dull spots blend into the matte surface and are far less obvious. Water rings and fingerprints are also less visible.</p>
            <p className={`${BODY} text-[15px] mt-2`}><strong>Our recommendation:</strong> for 90% of residential dining table applications, honed is the correct finish. It ages with character rather than showing damage.</p>
          </div>
          <div>
            <h3 className={H3}>Leathered / Brushed Finish</h3>
            <p className={`${BODY} text-[15px]`}>A textured surface created by wire-brushing or bush-hammering the honed stone. The most casual and contemporary of the three finishes. Particularly striking on darker marbles where the brushed texture creates a three-dimensional depth.</p>
            <ul className={`mt-2 list-disc pl-5 ${BODY} text-[15px]`}>
              <li>The most low-maintenance finish — hides etching and water marks almost completely.</li>
              <li><strong>Best for:</strong> everyday dining, open kitchens, contemporary and industrial interiors.</li>
            </ul>
          </div>
        </div>

        <h3 className={`${H3} mt-10`}>Side-by-Side Comparison</h3>
        <div className="overflow-x-auto mt-4">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-y border-[#222]">
                {['Finish', 'Gloss Level', 'Etch Visibility', 'Maintenance', 'Best Marble Type'].map((h) => (
                  <th key={h} className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#222]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FINISH_COMPARISON.map((row) => (
                <tr key={row.finish} className="border-b border-[#ece9dd]">
                  <td className={`${SERIF} px-4 py-4 text-[17px] text-[#222]`}>{row.finish}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.gloss}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.etch}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.maintenance}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.marble}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 5: Marble Varieties */}
      <section className="mx-auto max-w-3xl px-6 mt-16">
        <h2 className={`${SERIF} mb-5 text-[clamp(26px,3.4vw,38px)] font-normal leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          5. Which Marble Variety Pairs With Which Edge and Finish?
        </h2>
        <p className={BODY}>
          Not all marble behaves the same way under the chisel and the polishing wheel. At <a href="/about" className="underline hover:text-[#222]">HS Global Export</a>, we source slabs primarily from quarries in Italy, Turkey, Spain, and India for our <a href="/products/furniture" className="underline hover:text-[#222]">custom marble furniture</a>.
        </p>

        <div className="mt-8 space-y-6">
          <div>
            <h3 className={H3}>Carrara Marble (Italy)</h3>
            <p className={BODY}>White to blue-grey base with fine, feathery grey veining. Relatively soft (Mohs 3–4). The most widely exported Italian <a href="/products" className="underline hover:text-[#222]">Carrara marble</a>.</p>
            <ul className={`mt-1 list-disc pl-6 ${BODY}`}>
              <li><strong>Recommended:</strong> honed finish + bullnose or beveled edge</li>
              <li><strong>Avoid:</strong> polished finish for everyday dining; ogee profile in high-traffic settings</li>
            </ul>
          </div>
          <div>
            <h3 className={H3}>Calacatta Marble (Italy)</h3>
            <p className={BODY}>White base with bold, dramatic gold or brown veining. Higher price point due to quarry scarcity. Harder and denser <a href="/products" className="underline hover:text-[#222]">Calacatta</a>.</p>
            <ul className={`mt-1 list-disc pl-6 ${BODY}`}>
              <li><strong>Formal dining:</strong> polished finish + waterfall edge — the veining becomes vivid and the edge showcases depth</li>
              <li><strong>Everyday use:</strong> honed finish + straight/eased edge — clean lines let the veining speak</li>
            </ul>
          </div>
          <div>
            <h3 className={H3}>Statuario Marble (Italy)</h3>
            <p className={BODY}>Pure white base with bold, dramatic grey veining. The most prestigious Italian marble.</p>
            <ul className={`mt-1 list-disc pl-6 ${BODY}`}>
              <li><strong>Recommended:</strong> polished + mitered/laminated edge (showcases full veining at the edge)</li>
              <li><strong>Alternative:</strong> leathered finish — creates an extraordinarily contemporary, almost raw appearance</li>
            </ul>
          </div>
          <div>
            <h3 className={H3}>Nero Marquina (Spain)</h3>
            <p className={BODY}>Deep black base with distinctive white veining. The highest contrast marble available.</p>
            <ul className={`mt-1 list-disc pl-6 ${BODY}`}>
              <li><strong>Recommended:</strong> leathered or honed finish + straight/eased edge</li>
              <li><strong>Avoid:</strong> full bullnose — softens the stone's characteristic sharpness</li>
            </ul>
          </div>
          <div>
            <h3 className={H3}>Emperador Dark / Light (Spain)</h3>
            <p className={BODY}>Brown to dark chocolate base with cream veining. Warmer than black or grey marbles. Exceptional for transitional interiors.</p>
            <ul className={`mt-1 list-disc pl-6 ${BODY}`}>
              <li><strong>Recommended:</strong> honed finish + ogee or beveled edge — warmth of stone suits classical elegance</li>
            </ul>
          </div>
          <div>
            <h3 className={H3}>Bianco Sivec (Macedonia)</h3>
            <p className={BODY}>Among the purest white marbles available — minimal veining, intensely clean surface.</p>
            <ul className={`mt-1 list-disc pl-6 ${BODY}`}>
              <li><strong>Recommended:</strong> polished finish + straight/eased edge — any added detail fights the stone's quiet perfection</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 6: Buying Matrix */}
      <section className="mx-auto max-w-5xl px-6 mt-16">
        <h2 className={`${SERIF} mb-5 text-[clamp(26px,3.4vw,38px)] font-normal leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          6. The Buying Decision Matrix
        </h2>
        <p className={BODY}>
          Use this matrix to arrive at your specification before contacting any supplier.
        </p>

        <div className="overflow-x-auto mt-6">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-y border-[#222]">
                {['Your Situation', 'Size', 'Shape', 'Edge', 'Finish', 'Marble'].map((h) => (
                  <th key={h} className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#222]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BUYING_MATRIX.map((row) => (
                <tr key={row.situation} className="border-b border-[#ece9dd]">
                  <td className="px-4 py-4 text-[14px] font-semibold text-[#333]">{row.situation}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.size}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.shape}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.edge}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.finish}</td>
                  <td className="px-4 py-4 text-[14px] font-light text-[#555]">{row.marble}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 7: What to ask */}
      <section className="mx-auto max-w-3xl px-6 mt-16">
        <h2 className={`${SERIF} mb-5 text-[clamp(26px,3.4vw,38px)] font-normal leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          7. What to Ask Your Exporter Before You Order
        </h2>
        <p className={BODY}>
          Whether you order from HS Global Export or any other supplier, these questions protect your investment.
        </p>
        <ol className={`mt-6 list-decimal pl-5 space-y-4 ${BODY}`}>
          <li><strong>What is the exact slab thickness?</strong> Request a minimum of 2 cm (¾ inch) for any dining table. Tables under 1.5 cm risk cracking under load or thermal stress.</li>
          <li><strong>Is the table pre-sealed, and what product was used?</strong> Ask for the sealant brand and the recommended re-application interval. Quality stone sealants (impregnating, not topical) last 1–3 years depending on use.</li>
          <li><strong>What is the lead time from order confirmation to port-of-loading?</strong> Our current production lead time is approximately 4-6 weeks for custom orders.</li>
          <li><strong>What does the freight quote include?</strong> Crating, sea freight, destination port charges, and final-mile delivery are often quoted separately. Confirm whether white-glove delivery is available in your area.</li>
          <li><strong>What is the duty rate for natural marble furniture to your destination?</strong> For USA imports under HTS code 6802.91, duty rates apply — verify with your customs broker. UK buyers: confirm any preferential rates under current trade frameworks with your freight forwarder.</li>
          <li><strong>Can you see the actual slab before production?</strong> For premium marbles (Calacatta, Statuario), always request a slab photo or video with the stone on a light table. Veining varies dramatically between slabs. At HS Global, we send multiple slab options and confirm selection before cutting begins.</li>
          <li><strong>How is the table packaged for shipping?</strong> Your exporter should use wooden crates with foam or rubber internal padding, corner protectors, and moisture-absorbing desiccant packs for sea freight. Avoid suppliers who ship loose in cardboard.</li>
        </ol>
      </section>

      {/* Section 8: Care */}
      <section className="mx-auto max-w-3xl px-6 mt-16">
        <h2 className={`${SERIF} mb-5 text-[clamp(26px,3.4vw,38px)] font-normal leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          8. Care, Sealing & Long-Term Maintenance
        </h2>
        <p className={`${BODY} mb-6`}>
          For a comprehensive overview, please read our dedicated <a href="/blog" className="underline hover:text-[#222]">care and sealing</a> guide.
        </p>
        
        <h3 className={H3}>Daily Cleaning</h3>
        <p className={BODY}>
          Use a soft cloth or microfibre pad with warm water and a pH-neutral cleaner. Avoid anything acidic — vinegar-based cleaners, citrus-based products all etch the marble surface chemically regardless of sealing. Blot spills rather than wiping.
        </p>

        <h3 className={`${H3} mt-6`}>Sealing Schedule</h3>
        <p className={BODY}>
          For honed Carrara used as an everyday dining table, apply a penetrating stone sealer once every 12 months. Test your current seal: drop a small amount of water on the surface — if it beads, the seal is intact; if it absorbs within 5 minutes, it's time to reseal.
          <br />
          Polished marble in a low-use formal dining room may need sealing only every 18–24 months.
        </p>

        <h3 className={`${H3} mt-6`}>Addressing Etch Marks</h3>
        <p className={BODY}>
          Etching is a chemical reaction — acid dissolves the calcium carbonate in the marble surface — not a scratch. On honed surfaces, mild etching can be buffed out using a marble polishing powder (tin oxide compound). On polished surfaces, severe etching requires professional re-polishing. Prevention is easier than cure. A simple table runner reduces etch-risk contact by approximately 80%.
        </p>

        <h3 className={`${H3} mt-6 text-[#a33]`}>What Never to Do</h3>
        <ul className={`mt-2 list-disc pl-6 space-y-1 ${BODY}`}>
          <li>Never place hot cookware directly on marble — thermal shock can cause cracking.</li>
          <li>Never use abrasive pads or scouring powders.</li>
          <li>Never drag items across the surface — sliding a ceramic dish causes micro-scratches even on sealed stone.</li>
          <li>Never use vinegar, lemon juice, or bleach-based cleaners.</li>
        </ul>
      </section>

      {/* Section 9: FAQ */}
      <section aria-labelledby="faq-heading" className="mx-auto mt-20 max-w-3xl px-6">
        <Eyebrow>Common Questions</Eyebrow>
        <h2 id="faq-heading" className={`${SERIF} mb-8 text-[clamp(26px,3.4vw,38px)] leading-[1.15] tracking-[-0.5px] text-[#222]`}>
          9. Frequently Asked Questions
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
          <Eyebrow>Ready to Order?</Eyebrow>
          <h2 className={`${SERIF} mb-5 text-[clamp(28px,4vw,46px)] leading-[1.1] tracking-[-0.5px] text-[#222]`}>
            Transform your space with real marble
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-[16px] font-light leading-[1.7] text-[#555]">
            At HS Global Export, we manufacture and export marble dining tables in custom sizes, edge profiles, and finishes — direct from our production facility. Every order includes slab selection photos, quality inspection reports, and professional wooden crate packaging for international freight.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/contact"
              className="inline-block bg-[#222] px-9 py-4 text-[13px] font-light uppercase tracking-[1.5px] text-white transition-colors hover:bg-black"
            >
              Contact Us for a Quote
            </a>
            <a
              href="/products/furniture/dining-table"
              className="inline-block border border-[#222] px-9 py-4 text-[13px] font-light uppercase tracking-[1.5px] text-[#222] transition-colors hover:bg-[#222] hover:text-white"
            >
              Browse Dining Tables
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
