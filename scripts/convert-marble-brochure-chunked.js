/**
 * Renders brochures/marble-furniture-brochure.html to PDF in small batches
 * of pages (relaunching Chrome between batches) and merges the results with
 * pdf-lib. The single-pass render (scripts/convert-brochures-to-pdf.js)
 * crashes on this file with a puppeteer ProtocolError (IO.read: Read failed)
 * because this machine only has ~1-2GB free RAM and the full 198-page /
 * 991-image, fully-upscaled brochure needs far more than that held in
 * Chrome's renderer at once. Batching keeps each pass's memory footprint
 * small enough to survive.
 *
 * Usage: node scripts/convert-marble-brochure-chunked.js [batchSize]
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const puppeteer = require('puppeteer-core');
const { PDFDocument } = require('pdf-lib');

const BROCHURES_DIR = path.join(__dirname, '..', 'brochures');
const SRC_HTML = path.join(BROCHURES_DIR, 'marble-furniture-brochure.html');
const OUT_PDF = path.join(BROCHURES_DIR, 'marble-furniture-brochure.pdf');
const TMP_DIR = path.join(os.tmpdir(), 'marble-brochure-chunks');

const BATCH_SIZE = parseInt(process.argv[2], 10) || 12;

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];
function findChrome() {
  for (const p of CHROME_CANDIDATES) if (fs.existsSync(p)) return p;
  throw new Error('No local Chrome/Edge install found.');
}

async function waitForAllImages(page) {
  return page.evaluate(async () => {
    const imgs = Array.from(document.images);
    imgs.forEach((img) => { if (img.loading === 'lazy') img.loading = 'eager'; });
    const waitOne = (img) => new Promise((resolve) => {
      const finish = (status) => resolve({ status, src: img.src });
      if (img.complete && img.naturalWidth > 0) {
        img.decode ? img.decode().then(() => finish('already-ok')).catch(() => finish('already-ok')) : finish('already-ok');
        return;
      }
      img.addEventListener('load', () => {
        img.decode ? img.decode().then(() => finish('loaded')).catch(() => finish('loaded')) : finish('loaded');
      }, { once: true });
      img.addEventListener('error', () => finish('error'), { once: true });
      setTimeout(() => finish('timeout'), 120000);
    });
    const settled = await Promise.all(imgs.map(async (img) => {
      let r = await waitOne(img);
      if (r.status === 'error' || r.status === 'timeout') {
        const src = img.src; img.src = ''; img.src = src;
        r = await waitOne(img);
      }
      return r;
    }));
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    return { total: imgs.length, failed: settled.filter((s) => s.status === 'error' || s.status === 'timeout') };
  });
}

function splitIntoBatches() {
  const html = fs.readFileSync(SRC_HTML, 'utf8');
  const headMatch = html.match(/^[\s\S]*?<\/style>\s*<\/head>/);
  if (!headMatch) throw new Error('Cannot locate </style></head>');
  const head = headMatch[0];

  const coverMatch = html.match(/<article class="cover-page"[\s\S]*?<\/article>/);
  const cover = coverMatch ? coverMatch[0] : '';

  const productRe = /<article class="product-page"[\s\S]*?<\/article>/g;
  const products = html.match(productRe) || [];

  const batches = [];
  // first batch carries the cover page
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const slice = products.slice(i, i + BATCH_SIZE);
    const body = (i === 0 ? cover : '') + slice.join('\n');
    batches.push(`${head}\n<body>\n${body}\n</body>\n</html>\n`);
  }
  return batches;
}

async function renderBatch(executablePath, batchHtml, outPath, idx, total) {
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--js-flags=--max-old-space-size=1024'],
    protocolTimeout: 0,
  });
  try {
    const tmpHtmlPath = path.join(TMP_DIR, `batch-${idx}.html`);
    fs.writeFileSync(tmpHtmlPath, batchHtml);

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    page.setDefaultTimeout(0);
    await page.setViewport({ width: 1123, height: 794 });
    await page.goto('file:///' + tmpHtmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
    const result = await waitForAllImages(page);
    console.log(`  batch ${idx + 1}/${total}: images ${result.total} total, ${result.failed.length} failed`);
    await new Promise((r) => setTimeout(r, 300));
    await page.pdf({ path: outPath, printBackground: true, preferCSSPageSize: true });
  } finally {
    await browser.close();
  }
}

async function main() {
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
  fs.mkdirSync(TMP_DIR, { recursive: true });

  const executablePath = findChrome();
  console.log(`Using browser: ${executablePath}`);

  const batches = splitIntoBatches();
  console.log(`Split into ${batches.length} batches of up to ${BATCH_SIZE} product pages each.`);

  const partPaths = [];
  for (let i = 0; i < batches.length; i++) {
    const outPath = path.join(TMP_DIR, `part-${String(i).padStart(3, '0')}.pdf`);
    let attempt = 0;
    while (true) {
      try {
        attempt++;
        await renderBatch(executablePath, batches[i], outPath, i, batches.length);
        break;
      } catch (err) {
        console.error(`  batch ${i + 1} attempt ${attempt} failed: ${err.message}`);
        if (attempt >= 3) throw err;
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    partPaths.push(outPath);
  }

  console.log('Merging batches...');
  const merged = await PDFDocument.create();
  for (const p of partPaths) {
    const bytes = fs.readFileSync(p);
    const doc = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((pg) => merged.addPage(pg));
  }
  const mergedBytes = await merged.save();
  fs.writeFileSync(OUT_PDF, mergedBytes);

  const sizeMb = (fs.statSync(OUT_PDF).size / (1024 * 1024)).toFixed(1);
  console.log(`\n✓ wrote ${OUT_PDF} (${sizeMb} MB, ${merged.getPageCount()} pages)`);

  fs.rmSync(TMP_DIR, { recursive: true, force: true });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
