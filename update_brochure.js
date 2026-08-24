const fs = require('fs');
const file = 'd:/hs-global-main/brochures/semi-precious-stone-brochure.html';
let content = fs.readFileSync(file, 'utf8');

// Replace cover image
content = content.replace(
  '<img src="COVER_IMAGE_URL" alt="Semi Precious Stone — HS Global Export Cover" />',
  '<img src="https://res.cloudinary.com/dynd1aan0/image/upload/v1780647053/hs-global/products/semi-precious-stone/Quartz/file_hjagkc.jpg" alt="Semi Precious Stone — HS Global Export Cover" />'
);

const products = [
  {
    id: 1,
    name: 'Natural Agate<br/>Slab',
    type: 'Agate Slab',
    series: 'Agate Slabs Series',
    stoneName: 'Agate · Banded Silica',
    variant: 'Hand-Polished · Natural Geode Slice',
    hardness: '6.5–7',
    sku: 'HSG-SPS-001',
    group: 'Chalcedony / Quartz',
    system: 'Trigonal',
    colorOrigin: 'Trace Iron Oxide',
    transparency: 'Translucent to Opaque',
    prodType: 'Decorative Slab',
    dim: '60 × 40 × 3 cm (approx.)',
    finish: 'High-Polish, Natural Edge',
    origin: 'Gujarat, India',
    lead: '2–4 Weeks',
    soldAs: 'Single Piece',
    price: 'USD 350',
    moq: '1 piece',
    img: 'https://res.cloudinary.com/dynd1aan0/image/upload/v1780563752/hs-global/products/semi-precious-stone/Agate%20Slabs/file_bbdwi4.webp',
    desc: 'Extracted from large geodes, these natural Agate Slabs feature stunning concentric banding and rich earthy tones. Polished to perfection, they bring an undeniable geological elegance to any luxury interior space.',
    color: '#9B59B6',
    chips: '<span class="spectrum-chip">Agate</span><span class="spectrum-chip teal">Natural Banding</span><span class="spectrum-chip">Polished</span>'
  },
  {
    id: 2,
    name: 'Blue Lace<br/>Agate Tray',
    type: 'Agate',
    series: 'Agate Series',
    stoneName: 'Blue Agate · Chalcedony',
    variant: 'Hand-Polished · Natural Geode Slice · Pair',
    hardness: '6.5–7',
    sku: 'HSG-SPS-002',
    group: 'Chalcedony / Quartz',
    system: 'Trigonal',
    colorOrigin: 'Trace Iron Oxide',
    transparency: 'Translucent to Opaque',
    prodType: 'Decorative Serving Tray',
    dim: '35 × 22 × 2.5 cm (approx.)',
    finish: 'High-Polish, Gold-Plated Edge',
    origin: 'Rajasthan, India',
    lead: '2–4 Weeks',
    soldAs: 'Pair (2 pieces, naturally matched)',
    price: 'USD 380',
    moq: '2 pairs',
    img: 'https://res.cloudinary.com/dynd1aan0/image/upload/v1780566317/hs-global/preview/semi-precious-stone/Agate/file_aci3di.webp',
    desc: 'Matched from the same geode formation for natural colour continuity, these Blue Lace Agate trays display the stone\'s characteristic powder-blue and white banding — each one an unrepeatable geological record formed over millions of years.',
    color: '#2EA8A8',
    chips: '<span class="spectrum-chip">Blue Agate</span><span class="spectrum-chip teal">Natural Banding</span><span class="spectrum-chip rose">Gold Edge</span><span class="spectrum-chip">Polished</span>'
  },
  {
    id: 3,
    name: 'Mother Of Pearl<br/>Inlay Table',
    type: 'Mother Of Pearl',
    series: 'Organic Gem Series',
    stoneName: 'Nacre · Calcium Carbonate',
    variant: 'Handcrafted Inlay · Geometric Pattern',
    hardness: '2.5–4.5',
    sku: 'HSG-SPS-003',
    group: 'Aragonite',
    system: 'Orthorhombic',
    colorOrigin: 'Organic secretion',
    transparency: 'Opaque to Translucent',
    prodType: 'Inlay Furniture / Decor',
    dim: 'Various sizes available',
    finish: 'Polished Resin & Shell',
    origin: 'Coastal India',
    lead: '4–6 Weeks',
    soldAs: 'Single Piece',
    price: 'USD 250',
    moq: '5 pieces',
    img: 'https://res.cloudinary.com/dynd1aan0/image/upload/v1780575898/hs-global/products/semi-precious-stone/Mother%20Of%20Pearl/file_chzcx4.webp',
    desc: 'Crafted with precision, our Mother of Pearl inlay pieces showcase the iridescent beauty of natural nacre. The meticulous geometric patterns reflect light beautifully, creating a sophisticated and timeless aesthetic.',
    color: '#F0EEF8',
    chips: '<span class="spectrum-chip">Nacre</span><span class="spectrum-chip teal">Iridescent</span><span class="spectrum-chip">Handcrafted Inlay</span>'
  },
  {
    id: 4,
    name: 'Petrified Wood<br/>Table Top',
    type: 'Petrified Wood',
    series: 'Fossilized Series',
    stoneName: 'Petrified Wood · Fossilized Silica',
    variant: 'Polished Slice · Natural Bark Edge',
    hardness: '6.5–7.5',
    sku: 'HSG-SPS-004',
    group: 'Microcrystalline Quartz',
    system: 'Trigonal',
    colorOrigin: 'Trace Minerals (Iron, Carbon)',
    transparency: 'Opaque',
    prodType: 'Table Top',
    dim: '80 × 60 × 5 cm (approx.)',
    finish: 'High-Polish Top, Natural Edge',
    origin: 'Madagascar / India',
    lead: '3–5 Weeks',
    soldAs: 'Single Piece',
    price: 'USD 650',
    moq: '1 piece',
    img: 'https://res.cloudinary.com/dynd1aan0/image/upload/v1780652336/hs-global/products/semi-precious-stone/petrified%20wood/file_abqjgh.jpg',
    desc: 'A slice of ancient history, our Petrified Wood table tops feature the preserved cell structure of prehistoric trees, replaced molecule by molecule with silica over millions of years. A stunning conversation piece for any room.',
    color: '#8B5A2B',
    chips: '<span class="spectrum-chip">Petrified Wood</span><span class="spectrum-chip rose">Fossilized</span><span class="spectrum-chip">Natural Edge</span>'
  },
  {
    id: 5,
    name: 'Golden Tiger Eye<br/>Block',
    type: 'Tiger Eye',
    series: 'Tiger Eye Series',
    stoneName: 'Tiger Eye · Chatoyant Quartz',
    variant: 'Polished Block · High Chatoyancy',
    hardness: '7.0',
    sku: 'HSG-SPS-005',
    group: 'Quartz',
    system: 'Trigonal',
    colorOrigin: 'Iron Oxide',
    transparency: 'Opaque',
    prodType: 'Decorative Block',
    dim: '15 × 10 × 10 cm',
    finish: 'High-Polish All Sides',
    origin: 'South Africa / India',
    lead: '2–4 Weeks',
    soldAs: 'Single Piece',
    price: 'USD 450',
    moq: '2 pieces',
    img: 'https://res.cloudinary.com/dynd1aan0/image/upload/v1780637866/hs-global/products/semi-precious-stone/Tiger%20eye/file_aauh1u.webp',
    desc: 'Featuring a mesmerizing chatoyant effect, our Golden Tiger Eye blocks shift in the light like a cat\'s eye. The rich gold and brown banding provides a warm, powerful aesthetic to luxury spaces.',
    color: '#DAA520',
    chips: '<span class="spectrum-chip">Tiger Eye</span><span class="spectrum-chip teal">Chatoyant</span><span class="spectrum-chip rose">Polished</span>'
  }
];

let htmlProducts = '';

products.forEach(p => {
  htmlProducts += `
  <!-- ════════════════════════════════════════════
       PRODUCT PAGE ${p.id} — ${p.type.toUpperCase()}
  ════════════════════════════════════════════ -->
  <article class="product-page" id="product-${p.id}">

    <!-- LEFT — IMAGE PANEL -->
    <div class="image-panel">
      <img src="${p.img}" alt="${p.type} Product — Semi Precious Stone by HS Global Export" loading="lazy" />
      <div class="facet-overlay"></div>
      <div class="refraction-lines"></div>

      <!-- Stone type badge -->
      <div class="stone-badge">
        <div class="stone-type">
          <span class="stone-dot" style="background: ${p.color};"></span>
          <span class="stone-type-name">${p.stoneName}</span>
        </div>
      </div>

      <!-- Mohs hardness badge -->
      <div class="hardness-badge">
        <span class="hardness-label">Mohs Hardness</span>
        <div class="hardness-value">${p.hardness}</div>
        <div class="hardness-scale">on 10-point scale</div>
      </div>

      <div class="img-sku">SKU · ${p.sku}</div>
    </div>

    <!-- RIGHT — DETAILS PANEL -->
    <div class="details-panel">

      <div class="brand-bar">
        <div>
          <div class="brand-name">HS Global Export</div>
          <div class="brand-sub">Semi Precious Stone Collection · Est. 2004</div>
        </div>
        <div class="page-indicator">0${p.id} / 05</div>
      </div>

      <div class="gem-rule"></div>

      <div class="cat-header">Semi Precious Stone — ${p.series}</div>

      <div>
        <h1 class="product-name">${p.name}</h1>
        <div class="product-variant">${p.variant}</div>
      </div>

      <!-- Gemological data box -->
      <div class="gem-data-box">
        <div class="gem-data-title">Gemological Properties</div>
        <div class="gem-props">
          <div class="gem-prop">
            <span class="gem-prop-label">Mineral Group</span>
            <span class="gem-prop-value">${p.group}</span>
          </div>
          <div class="gem-prop">
            <span class="gem-prop-label">Crystal System</span>
            <span class="gem-prop-value">${p.system}</span>
          </div>
          <div class="gem-prop">
            <span class="gem-prop-label">Colour Origin</span>
            <span class="gem-prop-value">${p.colorOrigin}</span>
          </div>
          <div class="gem-prop">
            <span class="gem-prop-label">Transparency</span>
            <span class="gem-prop-value">${p.transparency}</span>
          </div>
        </div>
      </div>

      <table class="spec-table">
        <tbody>
          <tr><td>Product Type</td><td>${p.prodType}</td></tr>
          <tr><td>Dimensions</td><td>${p.dim}</td></tr>
          <tr><td>Finish</td><td>${p.finish}</td></tr>
          <tr><td>Origin</td><td>${p.origin}</td></tr>
          <tr><td>Lead Time</td><td>${p.lead}</td></tr>
          <tr><td>Sold As</td><td>${p.soldAs}</td></tr>
        </tbody>
      </table>

      <div class="spectrum-row">
        ${p.chips}
      </div>

      <div class="price-row">
        <div>
          <div class="price-label">Export Price</div>
          <div class="price-amount">${p.price}</div>
        </div>
        <div class="price-note">FOB Jaipur<br/>MOQ ${p.moq}</div>
      </div>

    </div><!-- end .details-panel -->

    <!-- GRADIENT DESCRIPTION FOOTER -->
    <footer class="page-footer">
      <p class="product-description">
        ${p.desc}
      </p>
      <div class="footer-contact">
        export@hsglobalexport.com<br/>
        +91 98765 43210<br/>
        www.hsglobalexport.com
      </div>
    </footer>

  </article>
  <!-- END PRODUCT PAGE ${p.id} -->
`;
});

// Remove existing product pages and replace with new ones
const startMarker = '  <!-- ════════════════════════════════════════════\n       PRODUCT PAGE 1';
const endIndex = content.lastIndexOf('</body>');

const startIndex = content.indexOf(startMarker);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + htmlProducts + '\n</body>\n</html>\n';
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated brochure.');
} else {
  console.log('Could not find markers to replace products. startIndex: ' + startIndex + ' endIndex: ' + endIndex);
}
