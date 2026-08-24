#!/usr/bin/env node
'use strict';
/**
 * Generates brochures/leather-furniture-brochure.html
 * from backend/scripts/all-products-live.json  (category: "leather")
 * Run: node brochures/generate-leather-furniture-brochure.js
 */
const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'backend/scripts/all-products-live.json');
const TMPL_PATH = path.join(__dirname, 'leather-furniture-brochure.html');
const OUT_PATH  = TMPL_PATH;

const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

const CATEGORY_META = [
  { key: 'Sofa',          label: 'Sofas',           group: 'Seating Collection' },
  { key: 'Chair',         label: 'Chairs',           group: 'Seating Collection' },
  { key: 'Bench',         label: 'Benches',          group: 'Seating Collection' },
  { key: 'Stool',         label: 'Stools',           group: 'Seating Collection' },
  { key: 'Ottoman',       label: 'Ottomans',         group: 'Seating Collection' },
  { key: 'Bed',           label: 'Beds',             group: 'Bedroom & Tables'   },
  { key: 'Dresser',       label: 'Dressers',         group: 'Bedroom & Tables'   },
  { key: 'Coffee Table',  label: 'Coffee Tables',    group: 'Bedroom & Tables'   },
  { key: 'Console Table', label: 'Console Tables',   group: 'Bedroom & Tables'   },
  { key: 'Side Table',    label: 'Side Tables',      group: 'Bedroom & Tables'   },
  { key: 'Cabinet',       label: 'Cabinets',         group: 'Storage & Decor'    },
  { key: 'Mirror',        label: 'Mirrors',          group: 'Storage & Decor'    },
  { key: 'Mirror Frame',  label: 'Mirror Frames',    group: 'Storage & Decor'    },
];
const CAT_BY_KEY = Object.fromEntries(CATEGORY_META.map(c => [c.key, c]));

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function shortDesc(name, sub) {
  const variants = {
    'Sofa':          'Full-grain leather upholstered sofa, hand-stitched in the Indian tannery tradition with sinuous spring seating.',
    'Chair':         'A bespoke leather accent chair combining artisanal stitching with kiln-dried hardwood frame — built for generations.',
    'Bench':         'Hand-upholstered leather bench with precision stitching — a versatile luxury piece for bedroom or entryway.',
    'Stool':         'Leather-topped stool with solid wood frame, hand-stitched with the precision of a master saddler.',
    'Ottoman':       'Full-grain leather ottoman, hand-tufted and upholstered — a statement piece for any luxury interior.',
    'Bed':           'Leather-upholstered bed frame with deep buttoning and hand-stitched detailing for a truly bespoke sleeping environment.',
    'Dresser':       'Leather-fronted dresser combining artisanal upholstery with solid wood joinery from Kanpur master craftsmen.',
    'Coffee Table':  'Leather-wrapped coffee table with polished brass hardware — an heirloom piece with old-world craftsmanship.',
    'Console Table': 'Hand-upholstered leather console table with decorative stitching and solid hardwood frame.',
    'Side Table':    'Compact leather side table with hand-sewn detailing and turned solid wood legs.',
    'Cabinet':       'Leather-panelled cabinet combining bespoke upholstery with precision joinery from India\'s finest craftsmen.',
    'Mirror':        'Leather-framed mirror with hand-stitched border detailing — a luxury accent for any interior.',
    'Mirror Frame':  'Hand-upholstered leather mirror frame with exquisite stitch detailing and premium tannery leather.',
  };
  return variants[sub] || `A premium handcrafted leather ${sub.toLowerCase()} from HS Global Export.`;
}

// Filter & sort
const products = raw
  .filter(p => p.category === 'leather' && p.images && p.images.length >= 1)
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
  p.sku = 'HSG-LTH-' + String(i + 1).padStart(3, '0');
});

console.log(`Building leather brochure: ${TOTAL} products`);

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
      border: 0.5pt solid rgba(139,69,19,0.35);
      filter: saturate(0.9) contrast(1.05);
    }
    .desc-content {
      display: flex;
      flex-direction: column;
      gap: 3mm;
      margin-top: auto;
    }
    .product-details {
      overflow: hidden;
    }
    /* ── REDUCED HEADING SIZE ── */
    .product-name {
      font-size: 14pt !important;
      line-height: 1.2 !important;
    }
    .product-variant {
      font-size: 8pt !important;
      margin-top: 0.5mm !important;
    }
`;

let headBlock = headMatch[0].replace('</style>', EXTRA_CSS + '\n  </style>');

// Cover
const coverImg = products.find(p => p.images?.[0])?.images[0] || 'COVER_IMAGE_URL';

function renderCover() {
  return `  <article class="cover-page" id="cover">

    <!-- LEFT — CONTENT -->
    <div class="cover-left">
      <div class="cover-eyebrow">Exclusive Export Collection</div>

      <h1 class="cover-headline">
        Leather<br/><em>Furniture</em>
      </h1>

      <div class="cover-stitch-rule">
        <span></span><span></span><span></span><span></span>
        <span></span><span></span><span></span><span></span>
        <span></span><span></span>
      </div>

      <p class="cover-tagline">
        Full-grain and top-grain leather upholstered pieces — sofas, armchairs,
        ottomans, benches, beds &amp; storage — handcrafted in India's finest tannery
        tradition.
      </p>

      <div class="cover-grades">
        <div class="grade-item"><div class="grade-dot"></div><span class="grade-text">Seating — Sofas, Armchairs, Ottomans</span></div>
        <div class="grade-item"><div class="grade-dot"></div><span class="grade-text">Bedroom &amp; Tables</span></div>
        <div class="grade-item"><div class="grade-dot"></div><span class="grade-text">Storage &amp; Decor</span></div>
      </div>

      <div class="cover-brand-block">
        <div class="cover-brand-name">HS Global Export</div>
        <div class="cover-brand-sub">Luxury Leather Furniture · Est. 2004 · ${TOTAL} Products</div>
      </div>
    </div>

    <!-- CENTRE COGNAC DIVIDER BAR -->
    <div class="cover-centre-bar"></div>

    <!-- RIGHT — IMAGE -->
    <div class="cover-right">
      <img src="${esc(coverImg)}" alt="Leather Furniture — HS Global Export Cover" />
      <div class="cover-right-overlay"></div>

      <div class="cover-stamp">
        <span class="stamp-main">Full Grain<br/>Leather</span>
        <span class="stamp-sub">Indian Tanneries · Kanpur</span>
      </div>

      <div class="cover-contact-strip">
        <div class="cover-contact-text">
          export@hsglobalexport.com &nbsp;·&nbsp; +91 98765 43210 &nbsp;·&nbsp; www.hsglobalexport.com
        </div>
      </div>
    </div>

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
       PRODUCT ${String(p.seq).padStart(2,'0')} / ${TOTAL} — ${esc(p.name).toUpperCase().slice(0,60)}
  ════════════════════════════════════════════ -->
  <article class="product-page" id="product-${p.seq}">

    <!-- TOP BRAND BAND -->
    <header class="top-band">
      <div class="brand-name">HS <em>Global</em> Export</div>
      <div class="top-meta">
        <div class="category-badge">
          <div class="cat-name">Leather Furniture</div>
          <div class="subgroup-name">${esc(cat.group)}</div>
        </div>
        <div class="page-num-badge">${String(p.seq).padStart(2,'0')}</div>
      </div>
    </header>

    <!-- MAIN BODY -->
    <div class="page-body">

      <!-- LEFT IMAGE -->
      <div class="product-image-wrap">
        <img src="${esc(mainImg)}" alt="${esc(p.name)} — Leather Furniture by HS Global Export" loading="lazy" />
        <div class="img-overlay"></div>
        <div class="img-sku-badge">SKU · ${esc(p.sku)}</div>
        <div class="stitch-edge">
          <div class="stitch-dot"></div><div class="stitch-dot"></div>
          <div class="stitch-dot"></div><div class="stitch-dot"></div>
          <div class="stitch-dot"></div><div class="stitch-dot"></div>
          <div class="stitch-dot"></div><div class="stitch-dot"></div>
          <div class="stitch-dot"></div><div class="stitch-dot"></div>
          <div class="stitch-dot"></div><div class="stitch-dot"></div>
        </div>
      </div>

      <!-- RIGHT DETAILS -->
      <aside class="product-details">

        <!-- 4 THUMBNAIL IMAGES (top) -->
        <div class="end-images">
          <img src="${esc(thumbs[0])}" alt="View 1" loading="lazy" />
          <img src="${esc(thumbs[1])}" alt="View 2" loading="lazy" />
          <img src="${esc(thumbs[2])}" alt="View 3" loading="lazy" />
          <img src="${esc(thumbs[3])}" alt="View 4" loading="lazy" />
        </div>

        <!-- DESCRIPTION CONTENT (pushed to bottom) -->
        <div class="desc-content">
          <div>
            <div class="product-sku">${esc(p.sku)}</div>
            <h1 class="product-name">${esc(p.name)}</h1>
            <div class="product-variant">${esc(cat.label)} · Full-Grain Leather</div>
          </div>

          <div class="cognac-rule"></div>

          <table class="spec-table">
            <tbody>
              <tr><td>Leather Type</td><td>Full-Grain Vegetable-Tanned</td></tr>
              <tr><td>Category</td><td>${esc(cat.label)}</td></tr>
              <tr><td>Origin</td><td>Kanpur Tanneries, India</td></tr>
              <tr><td>Lead Time</td><td>5–7 Weeks</td></tr>
              <tr><td>Customisation</td><td>Colour, Dimensions, Finish</td></tr>
            </tbody>
          </table>

          <div class="tags-row">
            <span class="tag">Full-Grain</span>
            <span class="tag">Handcrafted</span>
            <span class="tag">${esc(cat.label)}</span>
          </div>

          <div class="price-row">
            <div>
              <div class="price-label">Wholesale / Export Price</div>
              <div class="price-amount">On Request</div>
            </div>
            <div class="price-note">FOB India · MOQ 1 Piece</div>
          </div>
        </div>

      </aside>
    </div>

    <!-- BOTTOM DESCRIPTION BAND -->
    <div class="bottom-band">
      <p class="product-description">${esc(desc)}</p>
      <div class="footer-contact">
        HS Global Export<br/>
        export@hsglobalexport.com · +91 98765 43210<br/>
        www.hsglobalexport.com
      </div>
    </div>

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
