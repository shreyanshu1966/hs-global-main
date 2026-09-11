const fs = require('fs');
const https = require('https');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'configs', 'sps.json'), 'utf8'));
const output = path.join(root, 'temp-brochure-crops', 'sps-mapped-selection-sheet.jpg');
const columns = 6;
const imageWidth = 300;
const imageHeight = 190;
const labelHeight = 32;
const cellHeight = imageHeight + labelHeight;
const rows = Math.ceil(config.products.length / columns);

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
        response.resume();
        return;
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

function escapeXml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  })[character]);
}

function labelSvg(product, sourceIndex) {
  const text = `${product.sku}  |  source ${sourceIndex}`;
  return Buffer.from(`
    <svg width="${imageWidth}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#111827"/>
      <text x="12" y="21" fill="#ffffff" font-family="Arial, sans-serif" font-size="15">${escapeXml(text)}</text>
    </svg>
  `);
}

async function makeCell(product) {
  const sourceIndex = product.publicPath.split('/').pop();
  const url = `https://res.cloudinary.com/dynd1aan0/image/upload/${product.version}/${encodeURI(product.publicPath)}.${product.ext}`;
  const image = await fetchBuffer(url);
  return sharp({
    create: { width: imageWidth, height: cellHeight, channels: 3, background: '#f8fafc' },
  })
    .composite([
      { input: await sharp(image).resize(imageWidth, imageHeight, { fit: 'contain', background: '#ffffff' }).jpeg({ quality: 88 }).toBuffer(), top: 0, left: 0 },
      { input: labelSvg(product, sourceIndex), top: imageHeight, left: 0 },
    ])
    .jpeg({ quality: 88 })
    .toBuffer();
}

async function main() {
  const cells = [];
  for (let index = 0; index < config.products.length; index += 6) {
    const batch = config.products.slice(index, index + 6);
    cells.push(...await Promise.all(batch.map(makeCell)));
    console.log(`Prepared ${Math.min(index + batch.length, config.products.length)}/${config.products.length}`);
  }

  const composites = cells.map((input, index) => ({
    input,
    left: (index % columns) * imageWidth,
    top: Math.floor(index / columns) * cellHeight,
  }));
  await sharp({
    create: { width: columns * imageWidth, height: rows * cellHeight, channels: 3, background: '#e5e7eb' },
  })
    .composite(composites)
    .jpeg({ quality: 90 })
    .toFile(output);
  console.log(`Saved ${output}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
