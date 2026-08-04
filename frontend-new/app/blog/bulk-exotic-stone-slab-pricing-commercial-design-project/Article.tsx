import React from 'react';
import Link from 'next/link';

type Faq = { q: string; a: string };

const SERIF = "![font-family:var(--dibs-font-serif)]";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-4 block text-[11px] font-medium uppercase tracking-[0.24em] text-[#647167]">
      {children}
    </span>
  );
}

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
    <article className="min-h-screen bg-[#fcfbf7] text-[#1a1a1a] selection:bg-[#1a1a1a] selection:text-white font-sans antialiased">
      {/* Top Header & Breadcrumb */}
      <header className="border-b border-[#e5e2d9] bg-[#f7f5ed] pt-12 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs font-light text-[#736e60]">
            <Link href="/" className="hover:text-[#1a1a1a] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#1a1a1a] transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-[#1a1a1a] font-normal truncate max-w-[280px] sm:max-w-none">Bulk Exotic Stone Slab Pricing</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-block bg-[#1a1a1a] text-white px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-semibold rounded-full">
              Exotic Stone Slabs
            </span>
            <span className="text-xs text-[#736e60] font-light">14 min read</span>
            <span className="text-xs text-[#736e60] font-light">•</span>
            <span className="text-xs text-[#736e60] font-light">{publishedLabel}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-[#1a1a1a] leading-[1.25] tracking-tight font-serif mb-6">
            How to Secure the Best Pricing on Bulk Orders of Rare Exotic Stone Slabs for Commercial Design Projects
          </h1>

          <p className="text-lg sm:text-xl font-light text-[#4a473e] leading-relaxed">
            Exotic and rare stone slabs are among the most prized materials in commercial interior design — and among the most misunderstood to source. Most commercial buyers pay 30–60% more than necessary simply by entering the supply chain at the wrong tier.
          </p>

          <div className="mt-8 pt-6 border-t border-[#e5e2d9] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center font-serif text-sm">
                HS
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#1a1a1a]">HS Global Export</p>
                <p className="text-[11px] text-[#736e60] font-light">Natural Stone Export & Commercial Sourcing</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-14">
        <figure className="rounded-2xl overflow-hidden shadow-2xl border border-[#e5e2d9] bg-white">
          <img
            src={heroImage}
            alt="Bulk order exotic stone slab commercial project best pricing - HS Global Export"
            className="w-full h-[340px] sm:h-[480px] object-cover"
          />
          <figcaption className="p-4 bg-white text-xs text-[#736e60] font-light border-t border-[#f0eee6] italic text-center">
            Direct quarry batch sourcing for rare quartzite, marble, and granite slabs specified in luxury hospitality and commercial developments.
          </figcaption>
        </figure>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20">

        {/* Intro Highlight Box */}
        <div className="bg-[#f2efe4] border-l-4 border-[#1a1a1a] p-6 sm:p-8 rounded-r-xl mb-12">
          <p className="text-sm sm:text-base font-normal text-[#2c2a24] leading-relaxed">
            At <strong>HS Global Export</strong>, we supply exotic and rare natural stone slabs directly to commercial design projects — hotels, retail flagships, hospitality venues, luxury residential developments — in the USA, UK, and across Europe. We source directly from quarries, cut and finish slabs ourselves, and export internationally. This guide shares the sourcing and negotiation playbook we see the most successful commercial buyers use — and the costly mistakes the rest make.
          </p>
        </div>

        {/* SECTION 1 */}
        <section className="mb-14">
          <Eyebrow>Section 01</Eyebrow>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#1a1a1a] mb-6">
            1. The Supply Chain Tier Map: Where You Buy Determines What You Pay
          </h2>
          <p className="text-base text-[#4a473e] leading-relaxed mb-6 font-light">
            The single biggest pricing lever for a commercial buyer is which tier of the stone supply chain you access. Most buyers default to the tier closest to them — a regional distributor or a fabricator&apos;s existing supplier — without knowing how much they&apos;re leaving on the table.
          </p>

          {/* Supply Chain Tier Table */}
          <div className="my-8 overflow-x-auto rounded-xl border border-[#e5e2d9] shadow-sm bg-white">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#1a1a1a] text-white uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 sm:p-4">Supply Chain Tier</th>
                  <th className="p-3.5 sm:p-4">Who Buys Here</th>
                  <th className="p-3.5 sm:p-4">Exotic Stone Price (per sq ft)</th>
                  <th className="p-3.5 sm:p-4">Minimum Order</th>
                  <th className="p-3.5 sm:p-4">Lead Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0eee6] text-[#333]">
                <tr className="hover:bg-[#fcfbf7]">
                  <td className="p-3.5 sm:p-4 font-semibold text-[#1a1a1a]">Quarry / Block level</td>
                  <td className="p-3.5 sm:p-4 text-gray-600">Very large volume importers only</td>
                  <td className="p-3.5 sm:p-4 font-medium text-emerald-700">$3–$12 (raw block)</td>
                  <td className="p-3.5 sm:p-4">Full container (20–25 MT)</td>
                  <td className="p-3.5 sm:p-4">12–24 weeks</td>
                </tr>
                <tr className="bg-[#fcfbf7] hover:bg-[#f7f5ed]">
                  <td className="p-3.5 sm:p-4 font-semibold text-[#1a1a1a]">Processing facility / Exporter</td>
                  <td className="p-3.5 sm:p-4 text-gray-600">Importers, commercial buyers, direct exporters</td>
                  <td className="p-3.5 sm:p-4 font-bold text-emerald-700">$15–$40 (finished slab)</td>
                  <td className="p-3.5 sm:p-4">Full bundle (8–12 slabs) or container</td>
                  <td className="p-3.5 sm:p-4">8–16 weeks</td>
                </tr>
                <tr className="hover:bg-[#fcfbf7]">
                  <td className="p-3.5 sm:p-4 font-semibold text-[#1a1a1a]">Importer / Specialty distributor</td>
                  <td className="p-3.5 sm:p-4 text-gray-600">Fabricators, designers with trade accounts</td>
                  <td className="p-3.5 sm:p-4 text-gray-800">$35–$80</td>
                  <td className="p-3.5 sm:p-4">Full bundle or lot (4–8 slabs)</td>
                  <td className="p-3.5 sm:p-4">1–6 weeks</td>
                </tr>
                <tr className="hover:bg-[#fcfbf7]">
                  <td className="p-3.5 sm:p-4 font-semibold text-[#1a1a1a]">Regional stone yard / Distributor</td>
                  <td className="p-3.5 sm:p-4 text-gray-600">Fabricators, designers, retail</td>
                  <td className="p-3.5 sm:p-4 text-gray-800">$60–$120+</td>
                  <td className="p-3.5 sm:p-4">Individual slab</td>
                  <td className="p-3.5 sm:p-4">Days to weeks</td>
                </tr>
                <tr className="hover:bg-[#fcfbf7]">
                  <td className="p-3.5 sm:p-4 font-semibold text-[#1a1a1a]">Fabricator pass-through</td>
                  <td className="p-3.5 sm:p-4 text-gray-600">End clients (retail)</td>
                  <td className="p-3.5 sm:p-4 text-red-600 font-medium">$100–$200+ installed</td>
                  <td className="p-3.5 sm:p-4">Single piece</td>
                  <td className="p-3.5 sm:p-4">2–8 weeks post-order</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-base text-[#4a473e] leading-relaxed mb-6 font-light">
            For a commercial project purchasing 200+ square feet of exotic stone, accessing the processing facility or exporter tier directly — rather than buying through a regional distributor — can reduce material cost alone by $20–$40 per square foot. On a 500 sq ft hotel lobby feature wall in a rare quartzite, that is $10,000–$20,000 in material savings before fabrication.
          </p>

          <div className="p-6 bg-white rounded-xl border border-[#e5e2d9] shadow-sm">
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#1a1a1a] mb-2">HS Global Export Note</h4>
            <p className="text-sm text-[#4a473e] font-light leading-relaxed">
              We work directly with commercial buyers who meet minimum order thresholds, bypassing importer and distributor margins entirely. For qualifying projects, we provide slab selection photos from the production batch, quarry-lot documentation, and export-ready crated packaging with full container options.
            </p>
          </div>
        </section>

        {/* SECTION 2 */}
        <section className="mb-14">
          <Eyebrow>Section 02</Eyebrow>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#1a1a1a] mb-6">
            2. What Actually Drives the Price of Rare and Exotic Stone Slabs
          </h2>
          <p className="text-base text-[#4a473e] leading-relaxed mb-6 font-light">
            Understanding what you&apos;re paying for is the foundation of effective negotiation. Exotic stone pricing is not arbitrary — it is driven by a small number of measurable factors.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div className="p-5 bg-white rounded-xl border border-[#e5e2d9]">
              <h3 className="text-base font-semibold text-[#1a1a1a] mb-2">Quarry Scarcity and Origin</h3>
              <p className="text-xs text-[#555] leading-relaxed font-light">
                Rare exotic stones — Blue Bahia granite from Brazil, Azul Macaubas quartzite, Arabescato Corchia marble from Italy, Verde Alpi — come from smaller quarries with limited annual extraction volumes. Scarcity is geological. When a quarry face is exhausted, that specific stone is simply gone.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[#e5e2d9]">
              <h3 className="text-base font-semibold text-[#1a1a1a] mb-2">Stone Grade and Visual Quality</h3>
              <p className="text-xs text-[#555] leading-relaxed font-light">
                The stone industry&apos;s Level 1 / Level 2 / Level 3+ grading system reflects visual quality, not structural strength — every grade of granite is equally durable. What you pay for in an exotic Level 3+ stone is rarity of colour, boldness of veining, and uniqueness of pattern.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[#e5e2d9]">
              <h3 className="text-base font-semibold text-[#1a1a1a] mb-2">Slab Size (Jumbo vs Standard)</h3>
              <p className="text-xs text-[#555] leading-relaxed font-light">
                Jumbo slabs — over 120 × 70 inches — command a premium because they are harder to quarry intact, heavier to ship, and require careful handling. For hotel bar tops and reception desks, jumbo slabs reduce visible seams significantly.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[#e5e2d9]">
              <h3 className="text-base font-semibold text-[#1a1a1a] mb-2">Finish Type & Thickness</h3>
              <p className="text-xs text-[#555] leading-relaxed font-light">
                Polished is the baseline. Honed and leathered finishes require extra processing steps ($3–$8 more per sq ft). For thickness, 3 cm slabs price higher than 2 cm by $5–$12 per sq ft at wholesale, providing edge depth without laminated build-ups.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3 */}
        <section className="mb-14">
          <Eyebrow>Section 03</Eyebrow>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#1a1a1a] mb-6">
            3. Negotiation Tactics That Actually Work for Exotic Stone Bulk Orders
          </h2>
          <p className="text-base text-[#4a473e] leading-relaxed mb-6 font-light">
            Generic negotiation advice — &quot;get three quotes&quot; — works for commodity stone. For rare and exotic varieties, the leverage dynamics are different. These are the tactics that move price on premium material.
          </p>

          <div className="space-y-4">
            <div className="p-6 bg-white rounded-xl border border-[#e5e2d9] shadow-sm">
              <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#647167]">Tactic 1</span>
              <h3 className="text-lg font-semibold text-[#1a1a1a] mt-1 mb-2">Commit to a Full Quarry Lot or Full Container Early</h3>
              <p className="text-sm text-[#4a473e] font-light leading-relaxed">
                On rare stone varieties, the supplier&apos;s biggest risk is holding slow-moving inventory. If you can commit to purchasing a full bundle (8–12 slabs) or a full quarry lot from the same block in one order, you remove that risk from them — and they will price accordingly. We regularly see 15–25% reductions for full-lot commitments.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-[#e5e2d9] shadow-sm">
              <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#647167]">Tactic 2</span>
              <h3 className="text-lg font-semibold text-[#1a1a1a] mt-1 mb-2">Buy at the Right Time in the Project Timeline</h3>
              <p className="text-sm text-[#4a473e] font-light leading-relaxed">
                The worst time to negotiate is when your project is already under construction and the deadline is visible. The best time to negotiate exotic stone is 12–16 weeks before installation — when you have optionality, the supplier has inventory risk, and you can threaten credibly to substitute if pricing does not move.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-[#e5e2d9] shadow-sm">
              <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#647167]">Tactic 3</span>
              <h3 className="text-lg font-semibold text-[#1a1a1a] mt-1 mb-2">Bundle Varieties Across the Project</h3>
              <p className="text-sm text-[#4a473e] font-light leading-relaxed">
                If your commercial project uses multiple stone types — marble for bathrooms, granite or quartzite for common areas, an exotic statement piece for the lobby — negotiate them together rather than separately to win maximum supplier volume pricing.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-[#e5e2d9] shadow-sm">
              <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#647167]">Tactic 4</span>
              <h3 className="text-lg font-semibold text-[#1a1a1a] mt-1 mb-2">Offer Faster Payment Terms</h3>
              <p className="text-sm text-[#4a473e] font-light leading-relaxed">
                Most stone suppliers extend 30–60 day payment terms at standard pricing. Offering 50% upfront with balance on shipment removes financing cost — exporters often reduce total order pricing by 3–8% for upfront payment on full lots.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-[#e5e2d9] shadow-sm">
              <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#647167]">Tactic 5</span>
              <h3 className="text-lg font-semibold text-[#1a1a1a] mt-1 mb-2">Accept Slight Visual Variation Within a Lot</h3>
              <p className="text-sm text-[#4a473e] font-light leading-relaxed">
                The premium for &quot;selected&quot; slabs within a quarry lot is real. If your installation can accommodate modest variation within the natural range of the material (standard for large-format flooring), accepting standard lot slabs reduces costs.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4 */}
        <section className="mb-14">
          <Eyebrow>Section 04</Eyebrow>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#1a1a1a] mb-6">
            4. The Risk Most Commercial Buyers Never Plan For: Quarry Lot Inconsistency
          </h2>
          <p className="text-base text-[#4a473e] leading-relaxed mb-6 font-light">
            Natural stone varies, sometimes significantly, between blocks extracted from different depths or faces of the same quarry. A distributor that runs out of your specified lot and substitutes from a new quarry extraction may supply material that matches the name but looks noticeably different.
          </p>

          <div className="bg-[#fffdf9] p-6 rounded-xl border border-[#e5e2d9] mb-6">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-3">Book-Matching on Commercial Projects</h3>
            <p className="text-sm text-[#4a473e] font-light leading-relaxed mb-4">
              Book-matching and sequence-matching — selecting and positioning adjacent slabs so veining flows continuously across a feature wall or reception desk — requires sourcing consecutive slabs from the same block at the quarry, before they are separated into different shipments. This is only possible if you purchase in lot at the source.
            </p>

            <h4 className="text-xs uppercase font-bold tracking-wider text-[#1a1a1a] mb-2">How to Contract Against Lot Inconsistency:</h4>
            <ul className="list-disc pl-5 text-sm text-[#4a473e] font-light space-y-2">
              <li>Specify the <strong>quarry lot number</strong> (or quarry block number) in the purchase order — not just the stone name.</li>
              <li>For feature walls and reception desks, require <strong>lot photos and slab approval</strong> from the specific batch before committing.</li>
              <li>For phased projects, contractually request the supplier to <strong>reserve matching slabs</strong> from the same quarry lot under a hold agreement.</li>
              <li>Build a <strong>15–20% material overage buffer</strong> into the initial order for rare varieties.</li>
            </ul>
          </div>

          <div className="p-5 bg-red-50/80 border border-red-200 rounded-xl">
            <span className="text-xs uppercase tracking-widest font-bold text-red-700">Red Flag Warning</span>
            <p className="text-xs text-red-900 mt-1 font-light leading-relaxed">
              Any supplier who quotes &quot;Blue Bahia&quot; or &quot;Azul Macaubas&quot; at a fixed per-sq-ft price without referencing a specific quarry lot is almost certainly quoting from aggregated stock of varying quality. Price is easy to guarantee; visual consistency across 300+ sq ft requires direct lot sourcing.
            </p>
          </div>
        </section>

        {/* SECTION 5 */}
        <section className="mb-14">
          <Eyebrow>Section 05</Eyebrow>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#1a1a1a] mb-6">
            5. Exotic Stone Slab Price Benchmarks for Commercial Buyers (2026)
          </h2>
          <p className="text-base text-[#4a473e] leading-relaxed mb-6 font-light">
            These ranges reflect wholesale/importer-tier pricing for finished slabs. Installed all-in costs add fabrication ($25–$60 per sq ft) and installation ($10–$30 per sq ft) on top.
          </p>

          <div className="overflow-x-auto rounded-xl border border-[#e5e2d9] bg-white shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#1a1a1a] text-white uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 sm:p-4">Stone Type</th>
                  <th className="p-3.5 sm:p-4">Origin</th>
                  <th className="p-3.5 sm:p-4">Wholesale Price (per sq ft)</th>
                  <th className="p-3.5 sm:p-4">Commercial Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0eee6] text-[#333]">
                <tr className="hover:bg-[#fcfbf7]">
                  <td className="p-3.5 sm:p-4 font-semibold text-[#1a1a1a]">Blue Bahia Granite</td>
                  <td className="p-3.5 sm:p-4 text-gray-600">Brazil</td>
                  <td className="p-3.5 sm:p-4 font-medium text-emerald-700">$35–$65</td>
                  <td className="p-3.5 sm:p-4">Highly scarce; lot reservation essential</td>
                </tr>
                <tr className="bg-[#fcfbf7] hover:bg-[#f7f5ed]">
                  <td className="p-3.5 sm:p-4 font-semibold text-[#1a1a1a]">Azul Macaubas Quartzite</td>
                  <td className="p-3.5 sm:p-4 text-gray-600">Brazil</td>
                  <td className="p-3.5 sm:p-4 font-medium text-emerald-700">$40–$75</td>
                  <td className="p-3.5 sm:p-4">Hardness 7 Mohs; ideal for high-traffic floors</td>
                </tr>
                <tr className="hover:bg-[#fcfbf7]">
                  <td className="p-3.5 sm:p-4 font-semibold text-[#1a1a1a]">Calacatta Gold Marble</td>
                  <td className="p-3.5 sm:p-4 text-gray-600">Italy</td>
                  <td className="p-3.5 sm:p-4 font-medium text-emerald-700">$45–$90</td>
                  <td className="p-3.5 sm:p-4">Premium for book-matching feature walls</td>
                </tr>
                <tr className="bg-[#fcfbf7] hover:bg-[#f7f5ed]">
                  <td className="p-3.5 sm:p-4 font-semibold text-[#1a1a1a]">Statuario Marble</td>
                  <td className="p-3.5 sm:p-4 text-gray-600">Italy</td>
                  <td className="p-3.5 sm:p-4 font-medium text-emerald-700">$50–$100</td>
                  <td className="p-3.5 sm:p-4">Most prestigious; single-hide slab selection critical</td>
                </tr>
                <tr className="hover:bg-[#fcfbf7]">
                  <td className="p-3.5 sm:p-4 font-semibold text-[#1a1a1a]">Taj Mahal Quartzite</td>
                  <td className="p-3.5 sm:p-4 text-gray-600">Brazil</td>
                  <td className="p-3.5 sm:p-4 font-medium text-emerald-700">$30–$60</td>
                  <td className="p-3.5 sm:p-4">Popular for lobby counters; good lot availability</td>
                </tr>
                <tr className="bg-[#fcfbf7] hover:bg-[#f7f5ed]">
                  <td className="p-3.5 sm:p-4 font-semibold text-[#1a1a1a]">Onyx (Backlit)</td>
                  <td className="p-3.5 sm:p-4 text-gray-600">Multiple</td>
                  <td className="p-3.5 sm:p-4 font-medium text-emerald-700">$60–$150+</td>
                  <td className="p-3.5 sm:p-4">Thickness key; 2 cm for backlit feature panels</td>
                </tr>
                <tr className="hover:bg-[#fcfbf7]">
                  <td className="p-3.5 sm:p-4 font-semibold text-[#1a1a1a]">Nero Marquina Marble</td>
                  <td className="p-3.5 sm:p-4 text-gray-600">Spain</td>
                  <td className="p-3.5 sm:p-4 font-medium text-emerald-700">$25–$55</td>
                  <td className="p-3.5 sm:p-4">Consistent lot availability; strong contrast walls</td>
                </tr>
                <tr className="bg-[#fcfbf7] hover:bg-[#f7f5ed]">
                  <td className="p-3.5 sm:p-4 font-semibold text-[#1a1a1a]">Verde Alpi Green Marble</td>
                  <td className="p-3.5 sm:p-4 text-gray-600">Italy</td>
                  <td className="p-3.5 sm:p-4 font-medium text-emerald-700">$40–$80</td>
                  <td className="p-3.5 sm:p-4">Limited quarry; supply increasingly restricted</td>
                </tr>
                <tr className="hover:bg-[#fcfbf7]">
                  <td className="p-3.5 sm:p-4 font-semibold text-[#1a1a1a]">Fantasy Brown Quartzite</td>
                  <td className="p-3.5 sm:p-4 text-gray-600">India</td>
                  <td className="p-3.5 sm:p-4 font-medium text-emerald-700">$25–$50</td>
                  <td className="p-3.5 sm:p-4">High movement; strong commercial availability</td>
                </tr>
                <tr className="bg-[#fcfbf7] hover:bg-[#f7f5ed]">
                  <td className="p-3.5 sm:p-4 font-semibold text-[#1a1a1a]">Patagonia Quartzite</td>
                  <td className="p-3.5 sm:p-4 text-gray-600">Brazil</td>
                  <td className="p-3.5 sm:p-4 font-medium text-emerald-700">$35–$65</td>
                  <td className="p-3.5 sm:p-4">Dramatic book-matching impact; requires lot sourcing</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 6 */}
        <section className="mb-14">
          <Eyebrow>Section 06</Eyebrow>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#1a1a1a] mb-6">
            6. What to Ask Your Stone Exporter Before Committing to a Bulk Order
          </h2>

          <div className="space-y-4">
            <div className="p-5 bg-white rounded-xl border border-[#e5e2d9]">
              <h3 className="text-sm font-bold text-[#1a1a1a] mb-1">1. Can you reference a specific quarry lot number for this stone?</h3>
              <p className="text-xs text-[#555] font-light leading-relaxed">
                If yes: ask for photos of the actual slabs in that lot. If no: the supplier is working from aggregated stock with no visual consistency guarantee.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[#e5e2d9]">
              <h3 className="text-sm font-bold text-[#1a1a1a] mb-1">2. How many square feet of material can you guarantee from this lot?</h3>
              <p className="text-xs text-[#555] font-light leading-relaxed">
                Key question for phased projects. If the supplier can only guarantee what is currently in stock, order your overage buffer immediately.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[#e5e2d9]">
              <h3 className="text-sm font-bold text-[#1a1a1a] mb-1">3. What is the slab-level visual consistency within this lot?</h3>
              <p className="text-xs text-[#555] font-light leading-relaxed">
                Ask whether the supplier pre-sorts for background colour and veining intensity. For feature walls and book-matching: require pre-sort.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[#e5e2d9]">
              <h3 className="text-sm font-bold text-[#1a1a1a] mb-1">4. What is included in your export packaging for commercial stone?</h3>
              <p className="text-xs text-[#555] font-light leading-relaxed">
                Commercial quantities require wooden crate packaging with foam-padded internal bracing, corner protectors, and desiccant packs for moisture control during sea freight.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[#e5e2d9]">
              <h3 className="text-sm font-bold text-[#1a1a1a] mb-1">5. Can you provide a certificate of origin and quarry documentation?</h3>
              <p className="text-xs text-[#555] font-light leading-relaxed">
                Required for customs clearance and LEED-targeted commercial projects requiring quarry location and processing location certificates.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 7 & 8 */}
        <section className="mb-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-xl border border-[#e5e2d9]">
            <Eyebrow>Section 07</Eyebrow>
            <h2 className="text-xl font-serif font-normal text-[#1a1a1a] mb-4">
              7. LEED and Sustainability Considerations
            </h2>
            <ul className="text-xs text-[#4a473e] font-light space-y-3 leading-relaxed">
              <li>• <strong>LEED v4 Materials & Resources:</strong> Supply-chain transparency — quarry location documentation and processing data — contributes directly to credit qualification.</li>
              <li>• <strong>Responsible Sourcing:</strong> Specify natural stone from quarries with environmental management credentials.</li>
              <li>• <strong>HS Global Export Documentation:</strong> We provide quarry-of-origin documentation and processing certificates for all commercial orders.</li>
            </ul>
          </div>

          <div className="p-6 bg-white rounded-xl border border-[#e5e2d9]">
            <Eyebrow>Section 08</Eyebrow>
            <h2 className="text-xl font-serif font-normal text-[#1a1a1a] mb-4">
              8. Logistics Checklist for Commercial Imports
            </h2>
            <ul className="text-xs text-[#4a473e] font-light space-y-3 leading-relaxed">
              <li>• <strong>Delivery Path Planning:</strong> Full containers weigh 20–25 MT. Confirm your receiving stone yard has gantry cranes or overhead lifts.</li>
              <li>• <strong>White-Glove Service:</strong> Confirm whether job-site delivery and crate removal are included in your freight scope.</li>
              <li>• <strong>Cargo Insurance:</strong> Insure full declared slab value (not just freight value) for high-value rare exotic stone shipments.</li>
            </ul>
          </div>
        </section>

        {/* SECTION 9 FAQs */}
        <section className="mb-16">
          <Eyebrow>Section 09</Eyebrow>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#1a1a1a] mb-6">
            9. Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 bg-white rounded-xl border border-[#e5e2d9] shadow-sm">
                <h3 className="text-base font-semibold text-[#1a1a1a] mb-2">{faq.q}</h3>
                <p className="text-sm text-[#555] font-light leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="rounded-2xl bg-[#1a1a1a] text-white p-8 sm:p-12 text-center shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-semibold mb-3 block">
              Commercial Sourcing & Export
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-white mb-4">
              Sourcing Rare Exotic Stone for a Commercial Project?
            </h2>
            <p className="text-sm text-gray-300 font-light leading-relaxed mb-8">
              HS Global Export supplies rare and exotic natural stone slabs direct from source to commercial design projects worldwide. We provide quarry-lot documentation, slab selection photos, sequential slab crating for book-matching, and commercial export packaging for USA, UK, and European delivery.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="bg-white text-gray-900 px-7 py-3.5 rounded-lg text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-100 transition-all shadow-md"
              >
                Request Commercial Lot Quote
              </Link>
              <Link
                href="/products"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-7 py-3.5 rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all"
              >
                Browse Stone Collection
              </Link>
            </div>
          </div>
        </section>

      </div>
    </article>
  );
}
