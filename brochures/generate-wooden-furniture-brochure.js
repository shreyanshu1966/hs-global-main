#!/usr/bin/env node
'use strict';
/**
 * Generates brochures/wooden-furniture-brochure.html
 * from backend/scripts/all-products-live.json  (category: "wooden-furniture")
 * Run: node brochures/generate-wooden-furniture-brochure.js
 */
const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'backend/scripts/all-products-live.json');
const TMPL_PATH = path.join(__dirname, 'wooden-furniture-brochure.html');
const OUT_PATH  = TMPL_PATH;

const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

const CATEGORY_META = [
  { key: 'Coffee Table',  label: 'Coffee Tables',  group: 'Tables' },
  { key: 'Dining Table',  label: 'Dining Tables',  group: 'Tables' },
  { key: 'Console Table', label: 'Console Tables', group: 'Tables' },
  { key: 'Side Table',    label: 'Side Tables',    group: 'Tables' },
  { key: 'Sofa',          label: 'Sofas',          group: 'Seating' },
  { key: 'Armoire',       label: 'Armoires',       group: 'Storage' },
  { key: 'Bookshelf',     label: 'Bookshelves',    group: 'Storage' },
  { key: 'Cabinet',       label: 'Cabinets',       group: 'Storage' },
  { key: 'Trunk',         label: 'Trunks',         group: 'Storage' },
  { key: 'Door',          label: 'Doors',          group: 'Architectural' },
];
const CAT_BY_KEY = Object.fromEntries(CATEGORY_META.map(c => [c.key, c]));

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function shortDesc(name, sub) {
  const variants = {
    'Coffee Table':  'Individually hand-chiselled brass wire inlay — a technique mastered over three generations in Jodhpur, Rajasthan.',
    'Dining Table':  'Solid Indian Sheesham dining table with hand-hammered brass inlay in traditional Rajasthani geometric patterns.',
    'Console Table': 'Crafted from solid Sheesham with mortise &amp; tenon joinery — a timeless console table for luxury interiors.',
    'Side Table':    'Hand-turned solid wood side table with brass inlay detailing, built using traditional Rajasthani joinery techniques.',
    'Sofa':          'Traditional Rajasthani joinery — mortise &amp; tenon, no metal fasteners — ensures structural integrity for decades.',
    'Armoire':       'Solid Sheesham armoire with hand-carved detailing and brass hardware, built for heirloom longevity.',
    'Bookshelf':     'Solid wood bookshelf with hand-chiselled brass accents, crafted by three-generation Jodhpur artisans.',
    'Cabinet':       'Hand-carved wooden cabinet with brass inlay, built using traditional Rajasthani joinery for lasting quality.',
    'Trunk':         'Heirloom-quality wooden trunk with brass inlay and hand-hammered hardware from Jodhpur master craftsmen.',
    'Door':          'Architecturally sculptural solid wood door with hand-carved decorative panels and traditional brass fittings.',
  };
  return variants[sub] || `A premium handcrafted wooden ${sub.toLowerCase()} from HS Global Export, made in Jodhpur, Rajasthan.`;
}

// Filter & sort
const products = raw
  .filter(p => p.category === 'wooden-furniture' && p.images && p.images.length >= 1)
  .map(p => ({ ...p, _catMeta: CAT_BY_KEY[p.subcategory] || { key: p.subcategory, label: p.subcategory, group: 'Other' } }));

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
  p.sku = 'HSG-WD-' + String(i + 1).padStart(3, '0');
});

console.log(`Building wooden furniture brochure: ${TOTAL} products`);

// Read template for style block
const existing = fs.readFileSync(TMPL_PATH, 'utf8');
const headMatch = existing.match(/^[\s\S]*?<\/style>\s*<\/head>/);
if (!headMatch) throw new Error('Cannot locate </style></head> in template');

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
      border: 0.5pt solid rgba(196,147,74,0.35);
      filter: saturate(1.05) contrast(1.05);
    }
    .desc-content {
      display: flex;
      flex-direction: column;
      gap: 2mm;
      margin-top: auto;
      flex: 1;
    }
    .right-panel {
      overflow: hidden;
      padding-bottom: 16mm !important;
    }
    /* ── REDUCED HEADING SIZE ── */
    .product-name {
      font-size: 14pt !important;
      line-height: 1.2 !important;
    }
    .product-subtitle {
      font-size: 8pt !important;
      margin-top: 0.5mm !important;
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
      color: var(--mist);
    }
    .spec-cell .s-value {
      font-size: 7pt;
      color: var(--walnut);
      line-height: 1.3;
    }
`;

let headBlock = headMatch[0].replace('</style>', EXTRA_CSS + '\n  </style>');

// Cover
const coverImg = products.find(p => p.images?.[0])?.images[0] || 'COVER_IMAGE_URL';

function renderCover() {
  return `  <article class="cover-page" id="cover">

    <!-- Brass top stripe -->
    <div class="brass-top"></div>

    <!-- LEFT — TEXT CONTENT -->
    <div class="cover-left">
      <div class="cover-eyebrow">Exclusive Export Collection</div>

      <h1 class="cover-headline">
        Wooden<br/>
        <em>Furniture</em>
      </h1>

      <div class="cover-brass-rule"></div>

      <p class="cover-tagline">
        Solid Sheesham with hand-chiselled brass wire inlay — coffee tables,
        console tables, dining tables, sofas &amp; side tables crafted by
        three-generation artisans in Jodhpur.
      </p>

      <div class="cover-subgroups">
        <span class="cover-subgroup-item">Tables — Coffee, Console, Dining, Side</span>
        <span class="cover-subgroup-item">Sofas &amp; Seating</span>
        <span class="cover-subgroup-item">Storage — Armoires, Cabinets, Trunks</span>
        <span class="cover-subgroup-item">Architectural Doors</span>
      </div>
    </div>

    <!-- RIGHT — IMAGE PANEL -->
    <div class="cover-right">
      <img src="${esc(coverImg)}" alt="Wooden Furniture — HS Global Export Cover" />
      <div class="cover-right-overlay"></div>

      <div class="cover-craft-stamp">
        <span class="stamp-line1">Handcrafted in</span>
        <span class="stamp-line2">Jodhpur</span>
        <span class="stamp-line3">Rajasthan · India</span>
      </div>
    </div>

    <!-- FOOTER -->
    <footer class="cover-footer">
      <div class="cover-brand">HS Global Export</div>
      <div class="cover-contact">
        export@hsglobalexport.com &nbsp;·&nbsp; +91 98765 43210 &nbsp;·&nbsp; www.hsglobalexport.com
      </div>
    </footer>

  </article>
`;
}

function renderProduct(p) {
  const imgs = p.images || [];
  const mainImg = imgs[0] || '';
  const thumbs = [0,1,2,3].map(i => imgs[i % Math.max(imgs.length,1)] || mainImg);
  const desc = shortDesc(p.name, p.subcategory);
  const cat = p._catMeta;

  return `  <!-- ════════════════════════════════════════════
       PRODUCT ${String(p.seq).padStart(2,'0')} / ${TOTAL} — ${esc(p.name).slice(0,60).toUpperCase()}
  ════════════════════════════════════════════ -->
  <article class="product-page" id="product-${p.seq}">

    <!-- ── LEFT DARK PANEL ── -->
    <div class="left-panel">
      <div class="product-image-wrap">
        <img src="${esc(mainImg)}" alt="${esc(p.name)} — Wooden Furniture by HS Global Export" loading="lazy" />
        <div class="img-overlay"></div>
      </div>

      <div class="category-watermark">
        <span class="cat-eyebrow">Wooden Furniture</span>
        <div class="cat-title">${esc(cat.label)}</div>
      </div>

      <div class="img-sku">SKU · ${esc(p.sku)}</div>
    </div>

    <!-- ── RIGHT PARCHMENT PANEL ── -->
    <div class="right-panel">

      <div class="brand-header">
        <div>
          <div class="brand-name">HS Global Export</div>
          <div class="brand-sub">Handcrafted Wooden Furniture · Est. 2004</div>
        </div>
        <div class="page-num-top">${String(p.seq).padStart(2,'0')}</div>
      </div>

      <div class="brass-rule"></div>

      <!-- 4 THUMBNAIL IMAGES (top, before description) -->
      <div class="end-images">
        <img src="${esc(thumbs[0])}" alt="View 1" loading="lazy" />
        <img src="${esc(thumbs[1])}" alt="View 2" loading="lazy" />
        <img src="${esc(thumbs[2])}" alt="View 3" loading="lazy" />
        <img src="${esc(thumbs[3])}" alt="View 4" loading="lazy" />
      </div>

      <!-- DESCRIPTION (pushed to bottom via margin-top:auto) -->
      <div class="desc-content">
        <h1 class="product-name">${esc(p.name)}</h1>
        <div class="product-subtitle">${esc(cat.label)} · Brass Inlay · Natural Finish</div>

        <div class="spec-grid">
          <div class="spec-cell"><span class="s-label">Wood Species</span><span class="s-value">Indian Sheesham (Dalbergia Sissoo)</span></div>
          <div class="spec-cell"><span class="s-label">Inlay Work</span><span class="s-value">Solid Brass Wire, Hand-Hammered</span></div>
          <div class="spec-cell"><span class="s-label">Category</span><span class="s-value">${esc(cat.label)}</span></div>
          <div class="spec-cell"><span class="s-label">Origin</span><span class="s-value">Jodhpur, Rajasthan, India</span></div>
          <div class="spec-cell"><span class="s-label">Lead Time</span><span class="s-value">4–6 Weeks</span></div>
          <div class="spec-cell"><span class="s-label">Customisation</span><span class="s-value">Dimensions, Inlay Pattern, Finish</span></div>
        </div>

        <div class="materials-row">
          <span class="chip">Sheesham</span>
          <span class="chip">Brass Inlay</span>
          <span class="chip">Handcrafted</span>
        </div>

        <div class="price-block">
          <span class="price-label">Export Price</span>
          <span class="price-value">On Request</span>
          <span class="price-note">FOB Jodhpur</span>
        </div>
      </div>

    </div><!-- end .right-panel -->

    <!-- FOOTER DESCRIPTION BAR -->
    <footer class="page-footer">
      <p class="footer-desc">${esc(desc)}</p>
      <div class="footer-contact">
        HS Global Export<br/>
        export@hsglobalexport.com · +91 98765 43210<br/>
        www.hsglobalexport.com
      </div>
    </footer>

  </article>
`;
}

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
