// Generates brochures/semi-precious-stone-brochure.html from the live product
// export at backend/scripts/semi-precious-stone-live.json.
// Run: node brochures/generate-semi-precious-stone-brochure.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'backend/scripts/semi-precious-stone-live.json');
const BROCHURE_PATH = path.join(__dirname, 'semi-precious-stone-brochure.html');

const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

// ── Category metadata: display order (largest first), accent colours ──
const CATEGORY_META = [
  { key: 'Agate',               label: 'Agate',               lt: '#C79EDD', rgb: '199,158,221', bg: '#1C1228' },
  { key: 'Quartz',               label: 'Quartz',              lt: '#8FB8D9', rgb: '143,184,217', bg: '#0E1B24' },
  { key: 'Gemstone',             label: 'Gemstone',            lt: '#5FBE8A', rgb: '95,190,138',  bg: '#0E211A' },
  { key: 'Jasper',               label: 'Jasper',              lt: '#D97A5C', rgb: '217,122,92',  bg: '#241408' },
  { key: 'petrified wood',       label: 'Petrified Wood',      lt: '#D9A15C', rgb: '217,161,92',  bg: '#1F150C' },
  { key: 'Tiger eye',            label: 'Tiger Eye',           lt: '#F0C440', rgb: '240,196,64',  bg: '#241C08' },
  { key: 'Mother Of Pearl',      label: 'Mother Of Pearl',     lt: '#E8EDF5', rgb: '232,237,245', bg: '#1A1D24' },
  { key: 'Semiprecious Stone',   label: 'Semiprecious Stone',  lt: '#2EA8A8', rgb: '46,168,168',  bg: '#0E2323' },
  { key: 'Amazonite',            label: 'Amazonite',           lt: '#7FBF7F', rgb: '127,191,127', bg: '#142414' },
  { key: 'Amethyst',             label: 'Amethyst',            lt: '#8B5CC0', rgb: '139,92,192',  bg: '#170E24' },
];
const CATEGORY_BY_KEY = Object.fromEntries(CATEGORY_META.map(c => [c.key, c]));

const CRYSTAL_SYSTEM = {
  'agate': 'Trigonal',
  'quartz': 'Trigonal',
  'jasper stone': 'Trigonal',
  'jasper': 'Trigonal',
  'gemstone slab': 'Varies',
  'amazonite': 'Triclinic',
  'amethyst': 'Trigonal',
  'mother of pearl': 'Orthorhombic',
  'petrified wood': 'Trigonal',
};

function normMaterial(m) {
  return (m || '').replace(/\s+/g, ' ').trim();
}

function crystalSystem(material) {
  return CRYSTAL_SYSTEM[(material || '').toLowerCase()] || 'Varies';
}

function cleanDescription(desc) {
  let d = (desc || '').split(/Discover our exclusive collection/i)[0].trim();
  d = d.replace(/[,;–-]+$/, '').trim();
  const maxLen = 260;
  if (d.length <= maxLen) return /[.!?]$/.test(d) ? d : d + '.';
  const sentences = d.match(/[^.!?]+[.!?]+/g) || [d];
  let out = '';
  for (const s of sentences) {
    if ((out + s).length > maxLen) break;
    out += s;
  }
  if (!out.trim()) out = d.slice(0, maxLen).trim() + '…';
  return out.trim();
}

function parsePriceAmount(priceRangeText) {
  const m = (priceRangeText || '').match(/INR\s*([\d,]+)/i);
  return m ? m[1] : null;
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// HSL → {hex, rgb "r,g,b"} for CSS custom properties.
function hslToColor(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1, g1, b1;
  if (h < 60)       [r1, g1, b1] = [c, x, 0];
  else if (h < 120)  [r1, g1, b1] = [x, c, 0];
  else if (h < 180)  [r1, g1, b1] = [0, c, x];
  else if (h < 240)  [r1, g1, b1] = [0, x, c];
  else if (h < 300)  [r1, g1, b1] = [x, 0, c];
  else               [r1, g1, b1] = [c, 0, x];
  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);
  const hex = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  return { hex, rgb: `${r},${g},${b}` };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return [h, s * 100, l * 100];
}

// A page's accent is derived from the actual colour of its chosen slab photo
// (see resolveProductImage below), not an arbitrary hue — so a blue agate
// page is genuinely blue, a green malachite page is genuinely green, etc.
// The chosen photo is a studio shot with plain light margins on both sides
// (that's the whole point of resolveProductImage), so colour is sampled from
// a centred crop only — averaging the full frame would wash the colour out
// toward the white/grey backdrop instead of the stone itself.
async function extractAccent(imageUrl) {
  const res = await fetch(thumbUrl(imageUrl, 400));
  const buf = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(buf).metadata();
  const cropW = Math.round(meta.width * 0.5);
  const cropH = Math.round(meta.height * 0.5);
  const stats = await sharp(buf)
    .extract({ left: Math.round((meta.width - cropW) / 2), top: Math.round(meta.height * 0.18), width: cropW, height: cropH })
    .stats();
  const [r, g, b] = stats.channels.map((c) => c.mean);
  const [h, s] = rgbToHsl(r, g, b);
  const lt = hslToColor(h, Math.min(65, Math.max(42, s)), 70);
  const rgbTint = hslToColor(h, Math.min(58, Math.max(38, s)), 46);
  const bg = hslToColor(h, Math.min(50, Math.max(26, s)), 9);
  return { lt: lt.hex, rgb: rgbTint.rgb, bg: bg.hex };
}

function thumbUrl(url, w) {
  return url.replace('/upload/', `/upload/w_${w},q_auto/`);
}

function meanBrightnessOfRegion(data, W, ch, x0, y0, w, h) {
  let sum = 0, n = 0;
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const idx = (y * W + x) * ch;
      sum += data[idx] + data[idx + 1] + data[idx + 2];
      n += 3;
    }
  }
  return sum / n;
}

// Wants the catalogue-style shot of the whole rectangular slab standing on
// its display legs against a plain light backdrop (not a lifestyle render,
// and not a zoomed-in texture crop that fills the whole frame and reads as
// an abstract, square-ish swatch). That composition always leaves a plain,
// bright margin down BOTH the left and right edges — a lifestyle scene's
// edges are usually darker/coloured room surfaces, and a full-bleed macro
// crop has no plain margin on either side. Score = the dimmer of the two
// edge strips, so an image only scores well if *both* sides are bright.
async function edgeBrightnessScore(buf) {
  const W = 160, H = 120;
  const { data, info } = await sharp(buf).resize(W, H, { fit: 'cover' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const stripW = Math.round(W * 0.08);
  const left = meanBrightnessOfRegion(data, W, info.channels, 0, 0, stripW, H);
  const right = meanBrightnessOfRegion(data, W, info.channels, W - stripW, 0, stripW, H);
  return Math.min(left, right);
}

// Finds where the actual slab starts/ends horizontally within the chosen
// studio photo, so the plain light margins on either side (the very thing
// resolveProductImage selects for) can be cropped away before the image
// is used on the page. Per-column mean brightness stays near the frame's
// max (plain backdrop) until the column enters the slab, where the darker
// stone texture pulls it down — that drop marks the left/right edge.
async function detectHorizontalCropBounds(buf) {
  const W = 200, H = 100;
  const { data, info } = await sharp(buf).resize(W, H, { fit: 'cover' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const profile = new Array(W);
  for (let x = 0; x < W; x++) {
    let sum = 0;
    for (let y = 0; y < H; y++) {
      const idx = (y * W + x) * ch;
      sum += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    }
    profile[x] = sum / H;
  }
  const maxB = Math.max(...profile);
  const threshold = maxB * 0.85;
  let left = 0, right = W - 1;
  for (let x = 0; x < W; x++) { if (profile[x] < threshold) { left = x; break; } }
  for (let x = W - 1; x >= 0; x--) { if (profile[x] < threshold) { right = x; break; } }
  // Small safety pad so a slightly-early edge detection never clips the slab itself.
  const pad = 0.015;
  return {
    left: Math.max(0, left / W - pad),
    right: Math.min(1, right / W + pad),
  };
}

// Crops the plain side margins off a chosen slab photo using Cloudinary's
// fractional crop (fl_relative works in 0-1 coordinates regardless of the
// source image's actual pixel dimensions, so no metadata lookup is needed).
function withHorizontalCrop(url, left, right) {
  const w = Math.max(0.2, right - left);
  const transform = `x_${left.toFixed(3)},y_0,w_${w.toFixed(3)},h_1.0,c_crop,fl_relative`;
  return url.replace('/upload/', `/upload/${transform}/`);
}

async function pMap(items, limit, fn) {
  const results = new Array(items.length);
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

// Picks the catalogue-style "whole slab on display legs" photo out of a
// product's image set. The first 1-2 images in this catalogue are always
// staged lifestyle renders (the stone used as a wall panel in a furnished
// room) — those are excluded up front. Among the rest, the photo with the
// highest edgeBrightnessScore wins. Dead links (404s) are skipped silently;
// if every candidate fails, returns null.
async function resolveProductImage(images) {
  const candidates = images.length > 2 ? images.map((_, i) => i).slice(2) : images.map((_, i) => i);

  async function scoreAll(indices) {
    const scored = [];
    await pMap(indices, 8, async (i) => {
      try {
        const res = await fetch(thumbUrl(images[i], 160));
        if (!res.ok) return;
        const buf = Buffer.from(await res.arrayBuffer());
        const score = await edgeBrightnessScore(buf);
        scored.push({ i, score });
      } catch (e) { /* dead/unreachable image, skip */ }
    });
    return scored;
  }

  let scored = await scoreAll(candidates);
  if (scored.length === 0 && candidates.length < images.length) {
    // Nothing usable past the skipped lifestyle shots — fall back to the full set.
    scored = await scoreAll(images.map((_, i) => i));
  }
  if (scored.length === 0) return null;
  scored.sort((a, b) => b.score - a.score);
  return scored[0].i;
}

// ── Normalize + group products ──
const normalized = raw.map((p) => {
  const specs = p.stoneSpecs || {};
  const material = normMaterial(specs.material);
  const catMeta = CATEGORY_BY_KEY[p.subcategory] || CATEGORY_META[0];
  return {
    id: p._id,
    name: (p.name || '').trim(),
    category: catMeta,
    material,
    crystalSystem: crystalSystem(material),
    moh: specs.moh || '—',
    refractiveIndex: specs.refractiveIndex || '—',
    waterAbsorption: specs.waterAbsorption || '—',
    form: specs.form || 'Slab',
    surfaceFinish: specs.surfaceFinish || 'Polished',
    minSlabSize: specs.minSlabSize || '—',
    maxSlabSize: specs.maxSlabSize || '—',
    thickness: specs.thickness || '—',
    usage: specs.usage || '—',
    priceAmount: parsePriceAmount(specs.priceRange),
    images: p.images || (p.image ? [p.image] : []),
    description: cleanDescription(p.description),
  };
});

// Populated once image resolution + colour extraction finishes (see bottom).
let grouped = [];
let ordered = [];
let TOTAL = 0;

// ── Load existing brochure, extract <style> block to preserve fonts/tokens ──
const existing = fs.readFileSync(BROCHURE_PATH, 'utf8');
const headMatch = existing.match(/^[\s\S]*?<\/style>\s*<\/head>/);
if (!headMatch) throw new Error('Could not locate </style></head> in existing brochure file');
let headBlock = headMatch[0];

const EXTRA_CSS = `
    /* ═══════════════════════════════════════════
       INDEX / TABLE OF CONTENTS PAGE
    ═══════════════════════════════════════════ */
    .index-page {
      width: var(--page-w);
      height: var(--page-h);
      background: var(--void);
      position: relative;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
      padding: 12mm 16mm 10mm;
      display: flex;
      flex-direction: column;
      gap: 5mm;
    }
    .index-page::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 70% 60% at 8% 0%, rgba(107,63,160,0.14) 0%, transparent 55%),
        radial-gradient(ellipse 60% 60% at 95% 100%, rgba(26,122,122,0.10) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }
    .index-header, .category-summary, .index-columns { position: relative; z-index: 1; }
    .index-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .index-eyebrow {
      font-size: 6pt;
      font-weight: 300;
      letter-spacing: 0.5em;
      text-transform: uppercase;
      color: var(--teal-lt);
      margin-bottom: 2mm;
    }
    .index-title {
      font-family: var(--ff-title);
      font-size: 24pt;
      font-weight: 400;
      letter-spacing: 0.08em;
      color: var(--crystal);
      line-height: 1;
    }
    .index-count {
      text-align: right;
      font-family: var(--ff-title);
      font-size: 16pt;
      color: var(--amethyst-lt);
    }
    .index-count span {
      display: block;
      font-family: var(--ff-body);
      font-size: 5.5pt;
      font-weight: 300;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--muted);
      margin-top: 1mm;
    }
    .index-rule {
      height: 1pt;
      background: linear-gradient(90deg, var(--amethyst), var(--teal-lt) 60%, transparent);
    }
    .category-summary {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .category-chip {
      display: flex;
      align-items: center;
      gap: 5px;
      border: 0.5pt solid rgba(240,238,248,0.18);
      padding: 3px 9px;
    }
    .category-chip-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .category-chip-name {
      font-size: 6pt;
      font-weight: 300;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--fog);
    }
    .category-chip-count {
      font-size: 6pt;
      font-weight: 300;
      color: var(--muted);
    }
    .index-columns {
      display: flex;
      gap: 9mm;
      flex: 1;
      min-height: 0;
    }
    .index-col {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
    .index-cat-heading {
      font-size: 6.5pt;
      font-weight: 400;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      margin-top: 3.5mm;
      margin-bottom: 1.5mm;
      padding-bottom: 1mm;
      border-bottom: 0.5pt solid rgba(240,238,248,0.22);
    }
    .index-cat-heading:first-child { margin-top: 0; }
    .index-item {
      display: flex;
      align-items: baseline;
      gap: 4px;
      font-size: 6.3pt;
      font-weight: 300;
      color: var(--fog);
      padding: 1.1px 0;
    }
    .index-item-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .index-item-leader {
      flex: 1;
      border-bottom: 1px dotted rgba(196,192,212,0.28);
      margin-bottom: 2.5px;
      min-width: 4px;
    }
    .index-item-page {
      color: var(--muted);
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }
    .index-footer {
      position: relative;
      z-index: 1;
      font-size: 5.5pt;
      font-weight: 300;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(240,238,248,0.5);
      text-align: center;
    }
    .facet-overlay {
      box-shadow: inset 12mm 0 0 var(--page-bg), inset -12mm 0 0 var(--page-bg);
    }
`;

headBlock = headBlock.replace('</style>', EXTRA_CSS + '  </style>');

// ── Cover page (kept, with real category legend + counts) ──
function renderCover() {
  const varietyItems = CATEGORY_META
    .map((c) => `        <div class="stone-variety-item">
          <div class="variety-gem-dot" style="background: ${c.lt};"></div>
          <span class="variety-name">${esc(c.label)}</span>
        </div>`)
    .join('\n');

  return `  <article class="cover-page" id="cover">

    <div class="cover-left">

      <div class="cover-eyebrow">Exclusive Export Collection</div>

      <h1 class="cover-headline">
        Semi Precious
        <span>Stone</span>
      </h1>

      <div class="cover-gem-rule"></div>

      <p class="cover-tagline">
        Natural agate, quartz, onyx &amp; gemstone decoratives — sourced from
        certified Rajasthan quarries and hand-finished by master lapidaries.
        Each piece is a geological artefact, unrepeatable in colour and form.
      </p>

      <div class="stone-variety-grid">
${varietyItems}
      </div>

      <div class="cover-brand">
        <div class="cover-brand-name">HS Global Export</div>
        <div class="cover-brand-sub">Semi Precious Stone Collection · Est. 2004</div>
      </div>

    </div>

    <div class="cover-right">
      <img src="https://res.cloudinary.com/dynd1aan0/image/upload/v1780647053/hs-global/products/semi-precious-stone/Quartz/file_hjagkc.jpg" alt="Semi Precious Stone — HS Global Export Cover" />
      <div class="cover-right-overlay"></div>

      <div class="cover-gem-data">
        <div class="cover-stone-count">${TOTAL}</div>
        <div class="cover-stone-label">Live Stone Varieties · ${CATEGORY_META.length} Categories</div>
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

// ── Index page ──
function renderIndex() {
  const chips = CATEGORY_META
    .map((c) => {
      const count = grouped.find((g) => g.cat.key === c.key).items.length;
      return `      <div class="category-chip">
        <span class="category-chip-dot" style="background: ${c.lt};"></span>
        <span class="category-chip-name">${esc(c.label)}</span>
        <span class="category-chip-count">${count}</span>
      </div>`;
    })
    .join('\n');

  // Split the flat ordered list into 3 columns of consecutive items,
  // printing a category heading whenever a new category starts.
  const numCols = 3;
  const colSize = Math.ceil(TOTAL / numCols);
  let lastCatPrinted = null;
  const cols = [];
  for (let c = 0; c < numCols; c++) {
    const slice = ordered.slice(c * colSize, (c + 1) * colSize);
    let html = '';
    for (const p of slice) {
      if (p.category.key !== lastCatPrinted) {
        html += `        <div class="index-cat-heading" style="color: ${p.category.lt};">${esc(p.category.label)}</div>\n`;
        lastCatPrinted = p.category.key;
      }
      html += `        <div class="index-item">
          <span class="index-item-name">${esc(p.name)}</span>
          <span class="index-item-leader"></span>
          <span class="index-item-page">${String(p.seq).padStart(2, '0')}</span>
        </div>\n`;
    }
    cols.push(html);
  }

  return `  <article class="index-page" id="index">

    <div class="index-header">
      <div>
        <div class="index-eyebrow">Full Catalogue</div>
        <h2 class="index-title">Index of Stones</h2>
      </div>
      <div class="index-count">${TOTAL}<span>Products Across ${CATEGORY_META.length} Categories</span></div>
    </div>

    <div class="index-rule"></div>

    <div class="category-summary">
${chips}
    </div>

    <div class="index-columns">
      <div class="index-col">
${cols[0]}      </div>
      <div class="index-col">
${cols[1]}      </div>
      <div class="index-col">
${cols[2]}      </div>
    </div>

    <div class="index-footer">HS Global Export &nbsp;·&nbsp; export@hsglobalexport.com &nbsp;·&nbsp; +91 98765 43210 &nbsp;·&nbsp; www.hsglobalexport.com</div>

  </article>
`;
}

// ── Product page ──
function renderProduct(p) {
  const cat = p.category;
  const acc = p.accent;
  
  const thumbs = [];
  for (let i = 0; i < 4; i++) {
    thumbs.push(p.images[i % p.images.length] || p.image);
  }

  return `  <!-- ════════════════════════════════════════════
       PRODUCT ${String(p.seq).padStart(2, '0')} / ${TOTAL} — ${esc(p.name).toUpperCase()} (${esc(cat.label).toUpperCase()})
  ════════════════════════════════════════════ -->
  <article class="product-page" id="product-${p.seq}" style="--acc-rgb:${acc.rgb}; --acc-lt:${acc.lt}; --page-bg:${acc.bg};">

    <div class="image-panel">
      <img src="${esc(p.image)}" alt="${esc(p.name)} — Semi Precious Stone by HS Global Export" loading="lazy" />
      <div class="facet-overlay"></div>
      <div class="refraction-lines"></div>

      <div class="stone-badge">
        <div class="stone-type">
          <span class="stone-dot" style="background: ${acc.lt};"></span>
          <span class="stone-type-name">${esc(p.material)}</span>
        </div>
      </div>

      <div class="hardness-badge">
        <span class="hardness-label">Mohs Hardness</span>
        <div class="hardness-value">${esc(p.moh)}</div>
        <div class="hardness-scale">on 10-point scale</div>
      </div>

      <div class="img-sku">SKU · ${p.sku}</div>
    </div>

    <div class="content-row">

      <div class="info-panel">

        <div class="brand-bar">
          <div>
            <div class="brand-name">HS Global Export</div>
            <div class="brand-sub">Semi Precious Stone Collection · Est. 2004</div>
          </div>
          <div class="page-indicator">${String(p.seq).padStart(2, '0')} / ${TOTAL}</div>
        </div>

        <div class="gem-rule"></div>

        <div class="cat-header">Semi Precious Stone — ${esc(cat.label)} Series</div>

        <div>
          <h1 class="product-name">${esc(p.name)}</h1>
          <div class="product-variant">${esc(p.surfaceFinish)} Finish · ${esc(p.form)}</div>
        </div>

        <div class="gem-data-box">
          <div class="gem-data-title">Gemological Properties</div>
          <div class="gem-props">
            <div class="gem-prop">
              <span class="gem-prop-label">Mineral Group</span>
              <span class="gem-prop-value">${esc(p.material)}</span>
            </div>
            <div class="gem-prop">
              <span class="gem-prop-label">Crystal System</span>
              <span class="gem-prop-value">${esc(p.crystalSystem)}</span>
            </div>
            <div class="gem-prop">
              <span class="gem-prop-label">Refractive Index</span>
              <span class="gem-prop-value">${esc(p.refractiveIndex)}</span>
            </div>
            <div class="gem-prop">
              <span class="gem-prop-label">Water Absorption</span>
              <span class="gem-prop-value">${esc(p.waterAbsorption)}</span>
            </div>
          </div>
        </div>

        <table class="spec-table">
          <tbody>
            <tr><td>Product Type</td><td>${esc(p.form)}</td></tr>
            <tr><td>Slab Size Range</td><td>${esc(p.minSlabSize)} – ${esc(p.maxSlabSize)}</td></tr>
            <tr><td>Thickness</td><td>${esc(p.thickness)}</td></tr>
            <tr><td>Finish</td><td>${esc(p.surfaceFinish)}</td></tr>
            <tr><td>Usage</td><td>${esc(p.usage)}</td></tr>
            <tr><td>Origin</td><td>Kishangarh, Rajasthan, India</td></tr>
          </tbody>
        </table>

        <div class="spectrum-row">
          <span class="spectrum-chip">${esc(cat.label)}</span><span class="spectrum-chip teal">Natural Stone</span><span class="spectrum-chip rose">${esc(p.surfaceFinish)}</span>
        </div>

        <div class="price-row">
          <div>
            <div class="price-label">Export Price</div>
            <div class="price-amount">${p.priceAmount ? `₹${esc(p.priceAmount)}<span class="price-unit"> / sq.ft</span>` : `<span style="font-size:11pt;">On Request</span>`}</div>
          </div>
          <div class="price-note">Thickness: ${esc(p.thickness)}<br/>Kishangarh, Rajasthan</div>
        </div>

      </div>

      <div class="desc-panel">
        <div class="end-images">
          <img src="${esc(thumbs[0])}" alt="View 1" loading="lazy" />
          <img src="${esc(thumbs[1])}" alt="View 2" loading="lazy" />
          <img src="${esc(thumbs[2])}" alt="View 3" loading="lazy" />
          <img src="${esc(thumbs[3])}" alt="View 4" loading="lazy" />
        </div>
        <div class="desc-content">
          <div class="desc-eyebrow">The Provenance</div>
          <p class="product-description">
            ${esc(p.description)}
          </p>
        </div>
        <div class="desc-footer">
          <div class="gem-rule-mini"></div>
          <div class="footer-contact">
            export@hsglobalexport.com<br/>
            +91 98765 43210<br/>
            www.hsglobalexport.com
          </div>
        </div>
      </div>

    </div>

  </article>
`;
}

(async () => {
  console.log(`Resolving slab photo + colour for ${normalized.length} products...`);
  const survivors = [];
  const dropped = [];

  await pMap(normalized, 6, async (p) => {
    const bestIdx = await resolveProductImage(p.images);
    if (bestIdx === null) {
      dropped.push(p.name);
      return;
    }
    const chosenUrl = p.images[bestIdx];
    const thumbRes = await fetch(thumbUrl(chosenUrl, 200));
    const thumbBuf = Buffer.from(await thumbRes.arrayBuffer());
    const { left, right } = await detectHorizontalCropBounds(thumbBuf);
    const croppedUrl = withHorizontalCrop(chosenUrl, left, right);
    p.image = croppedUrl;
    p.accent = await extractAccent(croppedUrl);
    survivors.push(p);
  });

  if (dropped.length) {
    console.log(`Dropped ${dropped.length} product(s) with no usable image: ${dropped.join(', ')}`);
  }

  for (const cat of CATEGORY_META) {
    const items = survivors
      .filter((p) => p.category.key === cat.key)
      .sort((a, b) => a.name.localeCompare(b.name));
    grouped.push({ cat, items });
  }

  ordered = grouped.flatMap((g) => g.items);
  TOTAL = ordered.length;
  ordered.forEach((p, i) => {
    p.seq = i + 1;
    p.sku = 'HSG-SPS-' + String(i + 1).padStart(3, '0');
  });

  const body = [
    '<body>\n',
    renderCover(),
    renderIndex(),
    ...ordered.map(renderProduct),
    '</body>\n</html>\n',
  ].join('\n');

  const finalHtml = headBlock + '\n' + body;

  fs.writeFileSync(BROCHURE_PATH, finalHtml, 'utf8');
  console.log(`Wrote ${BROCHURE_PATH}`);
  console.log(`Products: ${TOTAL}, Categories: ${CATEGORY_META.length}`);
})();
