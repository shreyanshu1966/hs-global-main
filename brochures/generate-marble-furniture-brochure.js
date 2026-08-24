#!/usr/bin/env node
'use strict';
/**
 * Generates brochures/marble-furniture-brochure.html
 * from backend/scripts/all-products-live.json  (category: "furniture")
 * Run: node brochures/generate-marble-furniture-brochure.js
 */
const fs   = require('fs');
const path = require('path');

const ROOT        = path.resolve(__dirname, '..');
const DATA_PATH   = path.join(ROOT, 'backend/scripts/all-products-live.json');
const TMPL_PATH   = path.join(__dirname, 'marble-furniture-brochure.html');
const OUT_PATH    = TMPL_PATH;          // overwrite in place

const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

// ── Category order & display labels ──────────────────────────────────────────
const CATEGORY_META = [
  { key: 'Coffee Table',   label: 'Coffee Tables',   group: 'Tables Collection' },
  { key: 'Dining Table',   label: 'Dining Tables',   group: 'Tables Collection' },
  { key: 'Console Table',  label: 'Console Tables',  group: 'Tables Collection' },
  { key: 'Center Table',   label: 'Center Tables',   group: 'Tables Collection' },
  { key: 'Side Table',     label: 'Side Tables',     group: 'Tables Collection' },
  { key: 'Bathtub',        label: 'Bathtubs',        group: 'Bath Collection'   },
  { key: 'Sink',           label: 'Sinks',           group: 'Bath Collection'   },
  { key: 'Pedestal Sink',  label: 'Pedestal Sinks',  group: 'Bath Collection'   },
  { key: 'Lamp',           label: 'Lamps',           group: 'Decor & Lighting'  },
  { key: 'Mirror Frame',   label: 'Mirror Frames',   group: 'Decor & Lighting'  },
  { key: 'Vase',           label: 'Vases',           group: 'Decor & Lighting'  },
  { key: 'Chaise Chair',   label: 'Chaise Chairs',   group: 'Seating'           },
];
const CAT_BY_KEY = Object.fromEntries(CATEGORY_META.map(c => [c.key, c]));

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function cleanName(n) {
  // Trim very long names for display
  return (n || '').trim().replace(/\s+/g,' ');
}

function shortDesc(name, sub) {
  const variants = {
    'Coffee Table':  'Hand-carved from natural stone, this coffee table brings sculptural elegance to any living space.',
    'Dining Table':  'A statement dining table crafted from premium marble, each piece unique in its veining and form.',
    'Console Table': 'Precision-crafted console table in natural stone — refined, timeless, and built to last generations.',
    'Center Table':  'A centrepiece in solid stone with artisanal hand-finishing from Rajasthan master craftsmen.',
    'Side Table':    'Sculptural stone side table, hand-finished in our Jaipur atelier for luxury interiors.',
    'Bathtub':       'Carved from a single block of natural stone, this freestanding bathtub is the pinnacle of bath luxury.',
    'Sink':          'Hand-carved stone vessel sink — a functional art piece for bespoke bathroom interiors.',
    'Pedestal Sink': 'Solid stone pedestal wash basin, individually hand-finished for a seamless luxury aesthetic.',
    'Lamp':          'Natural alabaster table lamp that diffuses light with a warm, living glow unique to each stone.',
    'Mirror Frame':  'Hand-carved stone mirror frame — an artistic accent crafted by master lapidaries in Rajasthan.',
    'Vase':          'Artisanal stone vase, individually hand-turned and finished to showcase the natural beauty of marble.',
    'Chaise Chair':  'Sculptural stone chaise chair — a rare fusion of functional seating and fine art craftsmanship.',
  };
  return variants[sub] || `A premium handcrafted ${sub.toLowerCase()} in natural stone from HS Global Export.`;
}

// ── Filter & group products ───────────────────────────────────────────────────
const products = raw
  .filter(p => p.category === 'furniture' && p.images && p.images.length >= 1)
  .map(p => ({ ...p, _catMeta: CAT_BY_KEY[p.subcategory] || { key: p.subcategory, label: p.subcategory, group: 'Other' } }));

// Sort by category order then name
const catOrder = CATEGORY_META.map(c => c.key);
products.sort((a, b) => {
  const oi = catOrder.indexOf(a.subcategory);
  const oj = catOrder.indexOf(b.subcategory);
  const orderDiff = (oi < 0 ? 999 : oi) - (oj < 0 ? 999 : oj);
  if (orderDiff !== 0) return orderDiff;
  return (a.name || '').localeCompare(b.name || '');
});

const TOTAL = products.length;
products.forEach((p, i) => {
  p.seq = i + 1;
  p.sku = 'HSG-MBL-' + String(i + 1).padStart(3, '0');
});

console.log(`Building marble brochure: ${TOTAL} products`);

// ── Read existing template to grab the <style> block ─────────────────────────
const existing = fs.readFileSync(TMPL_PATH, 'utf8');
const headMatch = existing.match(/^[\s\S]*?<\/style>\s*<\/head>/);
if (!headMatch) throw new Error('Cannot locate </style></head> in template');

// Add extra CSS for end-images layout (matching semi-precious brochure)
const EXTRA_CSS = `
    /* ── END-PRODUCT THUMBNAIL IMAGES (top of right panel, above description) ── */
    .end-images {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2mm;
      margin-bottom: 4mm;
      flex-shrink: 0;
    }
    .end-images img {
      width: 100%;
      height: 30mm;
      object-fit: cover;
      border: 0.5pt solid var(--rule);
      filter: saturate(1.05) contrast(1.05);
    }
    .desc-content {
      display: flex;
      flex-direction: column;
      gap: 2mm;
      margin-top: auto;
    }
    /* overflow guard */
    .product-details {
      overflow: hidden;
      min-height: 0;
    }
    .page-body { min-height: 0; }
    /* ── REDUCED HEADING SIZE ── */
    .product-name {
      font-size: 14pt !important;
      line-height: 1.2 !important;
    }
    /* ── 2×2 SPEC GRID ── */
    .spec-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2mm 3mm;
    }
    .spec-cell {
      display: flex;
      flex-direction: column;
      gap: 0.5mm;
    }
    .spec-cell .s-label {
      font-size: 5.5pt;
      font-weight: 500;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--stone);
    }
    .spec-cell .s-value {
      font-size: 7pt;
      color: var(--charcoal);
      font-weight: 300;
      line-height: 1.3;
    }
    /* Price unit helper */
    .price-unit {
      font-size: 9pt;
      font-weight: 300;
      color: var(--stone);
      margin-left: 2px;
    }
`;

let headBlock = headMatch[0].replace('</style>', EXTRA_CSS + '\n  </style>');

// ── Cover page ────────────────────────────────────────────────────────────────
const coverImg = products.find(p => p.images && p.images[0])?.images[0] || 'COVER_IMAGE_URL';

function renderCover() {
  const subGroups = [...new Set(CATEGORY_META.map(c => c.group))];
  return `  <article class="cover-page" id="cover">

    <!-- SVG marble veins -->
    <svg class="cover-veins" viewBox="0 0 297 210" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 60 0 Q 90 30 70 70 Q 50 110 80 150 Q 110 190 90 210" stroke="#B8975A" stroke-width="0.4" fill="none"/>
      <path d="M 120 0 Q 140 40 110 90 Q 80 140 120 180 Q 150 205 130 210" stroke="#D4B87A" stroke-width="0.25" fill="none"/>
      <path d="M 180 10 Q 160 50 185 100 Q 210 150 190 210" stroke="#B8975A" stroke-width="0.3" fill="none"/>
      <path d="M 230 0 Q 250 60 240 120 Q 228 170 255 210" stroke="#D4B87A" stroke-width="0.2" fill="none"/>
    </svg>

    <div class="cover-ghost-num">${TOTAL}</div>

    <!-- LEFT GOLD STRIPE -->
    <div class="cover-stripe">
      <span class="cover-stripe-text">Product Catalogue · 2025–26</span>
    </div>

    <!-- CENTRE CONTENT -->
    <div class="cover-centre">
      <div class="cover-eyebrow">Exclusive Export Collection</div>

      <h1 class="cover-headline">
        Marble<br/>
        <strong>Furniture</strong>
      </h1>

      <div class="cover-rule"></div>

      <p class="cover-tagline">
        Bespoke stone interiors carved by master artisans in Rajasthan —
        bathtubs, tables, sinks &amp; decorative lighting in natural marble and stone.
      </p>

      <div class="cover-subgroups">
        ${subGroups.map(g => `<span class="cover-subgroup-item">${esc(g)}</span>`).join('\n        ')}
      </div>
    </div>

    <!-- RIGHT IMAGE PANEL -->
    <div class="cover-image">
      <img src="${esc(coverImg)}" alt="Marble Furniture — HS Global Export Cover" />
      <div class="cover-image-overlay"></div>
    </div>

    <!-- BOTTOM BRAND FOOTER -->
    <footer class="cover-footer">
      <div class="cover-brand-name">HS <span>Global</span> Export</div>
      <div class="cover-contact">
        export@hsglobalexport.com &nbsp;·&nbsp; +91 98765 43210 &nbsp;·&nbsp; www.hsglobalexport.com
      </div>
    </footer>

  </article>
`;
}

// ── Product page ──────────────────────────────────────────────────────────────
function renderProduct(p) {
  const imgs = p.images || [];
  const mainImg = imgs[0] || '';
  // 4 thumbs: use images[0..3], cycling if fewer
  const thumbs = [0, 1, 2, 3].map(i => imgs[i % Math.max(imgs.length, 1)] || mainImg);
  const desc = shortDesc(p.name, p.subcategory);
  const cat = p._catMeta;

  return `  <!-- ════════════════════════════════════════════
       PRODUCT ${String(p.seq).padStart(2, '0')} / ${TOTAL} — ${esc(cleanName(p.name)).toUpperCase()} (${esc(cat.label).toUpperCase()})
  ════════════════════════════════════════════ -->
  <article class="product-page" id="product-${p.seq}">

    <!-- Corner watermark -->
    <span class="corner-watermark">${esc(cat.label)}</span>

    <!-- ── HEADER ── -->
    <header class="page-header">
      <div class="brand-lockup">
        <div>
          <div class="brand-name">HS <span>Global</span> Export</div>
          <div class="brand-tagline">Luxury Stone &amp; Marble Atelier · Est. 2004</div>
        </div>
      </div>
      <div class="category-badge">
        <span class="category-label">Marble Furniture</span>
        <span class="subgroup-label">${esc(cat.group)}</span>
      </div>
    </header>

    <!-- ── BODY ── -->
    <div class="page-body">

      <!-- LEFT — IMAGE -->
      <div class="product-image-wrap">
        <img src="${esc(mainImg)}" alt="${esc(cleanName(p.name))} — Marble Furniture by HS Global Export" loading="lazy" />
        <div class="img-vignette"></div>
        <div class="product-number">SKU · ${esc(p.sku)}</div>
      </div>

      <!-- RIGHT — DETAILS -->
      <aside class="product-details">

        <!-- 4 THUMBNAIL IMAGES (top) -->
        <div class="end-images">
          <img src="${esc(thumbs[0])}" alt="View 1" loading="lazy" />
          <img src="${esc(thumbs[1])}" alt="View 2" loading="lazy" />
          <img src="${esc(thumbs[2])}" alt="View 3" loading="lazy" />
          <img src="${esc(thumbs[3])}" alt="View 4" loading="lazy" />
        </div>

        <!-- DESCRIPTION (pushed to bottom) -->
        <div class="desc-content">
          <div class="product-sku">${esc(p.sku)}</div>
          <h1 class="product-name">${esc(cleanName(p.name))}</h1>

          <div class="gold-rule"></div>

          <div class="spec-grid">
            <div class="spec-cell"><span class="s-label">Category</span><span class="s-value">${esc(cat.label)}</span></div>
            <div class="spec-cell"><span class="s-label">Subcategory</span><span class="s-value">${esc(p.subcategory)}</span></div>
            <div class="spec-cell"><span class="s-label">Finish</span><span class="s-value">Hand-Polished &amp; Sealed</span></div>
            <div class="spec-cell"><span class="s-label">Origin</span><span class="s-value">Rajasthan, India</span></div>
            <div class="spec-cell"><span class="s-label">Lead Time</span><span class="s-value">4–8 Weeks</span></div>
            <div class="spec-cell"><span class="s-label">MOQ</span><span class="s-value">1 Piece</span></div>
            <div class="spec-cell"><span class="s-label">Customisation</span><span class="s-value">Size, Finish, Edge Profile</span></div>
          </div>

          <div class="materials-row">
            <span class="material-chip">Natural Stone</span>
            <span class="material-chip">Handcrafted</span>
            <span class="material-chip">Export Ready</span>
          </div>

          <div class="price-block">
            <div class="price-label">Wholesale / Export Price</div>
            <div class="price-value">On Request</div>
            <div class="price-note">FOB Jaipur · Prices subject to material grade</div>
          </div>
        </div>

      </aside>
    </div><!-- end .page-body -->

    <!-- ── FOOTER DESCRIPTION BAR ── -->
    <footer class="page-footer">
      <p class="product-description">${esc(desc)}</p>
      <div class="footer-meta">
        <div class="footer-contact">
          <strong>HS Global Export</strong><br/>
          export@hsglobalexport.com<br/>
          +91 98765 43210<br/>
          www.hsglobalexport.com
        </div>
      </div>
    </footer>

    <div class="page-num">${String(p.seq).padStart(2,'0')} / ${TOTAL}</div>

  </article>
`;
}

// ── Assemble & write ──────────────────────────────────────────────────────────
const body = [
  '<body>\n',
  renderCover(),
  ...products.map(renderProduct),
  '</body>\n</html>\n',
].join('\n');

const finalHtml = headBlock + '\n' + body;
fs.writeFileSync(OUT_PATH, finalHtml, 'utf8');
console.log(`Wrote ${OUT_PATH}`);
console.log(`Products: ${TOTAL}`);
