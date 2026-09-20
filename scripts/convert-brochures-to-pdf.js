/**
 * Renders brochure HTML files to PDF using local Chrome (via puppeteer-core).
 * Forces every <img> (including loading="lazy" ones) to fully load and decode
 * before printing, so no image is blank/missing in the output PDF.
 *
 * Usage:
 *   node scripts/convert-brochures-to-pdf.js [file1.html file2.html ...]
 *   (defaults to leather, semi-precious-stone, wooden brochures)
 */

const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-core');

const BROCHURES_DIR = path.join(__dirname, '..', 'brochures');

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];

function findChrome() {
  for (const p of CHROME_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('No local Chrome/Edge install found. Update CHROME_CANDIDATES.');
}

const DEFAULT_FILES = [
  'leather-furniture-brochure.html',
  'semi-precious-stone-brochure.html',
  'wooden-furniture-brochure.html',
];

async function waitForAllImages(page, label) {
  // Force lazy images to start loading immediately, then wait for every
  // image to finish (loaded or errored) and decode.
  const result = await page.evaluate(async () => {
    const imgs = Array.from(document.images);
    imgs.forEach((img) => {
      if (img.loading === 'lazy') img.loading = 'eager';
    });

    const waitOne = (img) =>
      new Promise((resolve) => {
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

    const settled = await Promise.all(
      imgs.map(async (img) => {
        let r = await waitOne(img);
        if (r.status === 'error' || r.status === 'timeout') {
          // one retry: force a fresh fetch of the same URL
          const src = img.src;
          img.src = '';
          img.src = src;
          r = await waitOne(img);
        }
        return r;
      })
    );
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    return {
      total: imgs.length,
      failed: settled.filter((s) => s.status === 'error' || s.status === 'timeout'),
    };
  });

  console.log(`  [${label}] images: ${result.total} total, ${result.failed.length} failed/timed out`);
  if (result.failed.length) {
    result.failed.slice(0, 10).forEach((f) => console.log(`    ✗ ${f.status}: ${f.src}`));
  }
  return result;
}

async function convertOne(browser, htmlFile) {
  const htmlPath = path.join(BROCHURES_DIR, htmlFile);
  if (!fs.existsSync(htmlPath)) {
    console.log(`SKIP (not found): ${htmlFile}`);
    return;
  }
  const pdfFile = htmlFile.replace(/\.html$/, '.pdf');
  const pdfPath = path.join(BROCHURES_DIR, pdfFile);
  const label = htmlFile;

  console.log(`\n=== ${label} ===`);
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);
  page.setDefaultTimeout(0);

  await page.setViewport({ width: 1123, height: 794 });

  try {
    await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
    await waitForAllImages(page, label);
    // One more idle pass in case decode triggered any late reflow/paint work.
    await new Promise((r) => setTimeout(r, 500));

    await page.pdf({
      path: pdfPath,
      printBackground: true,
      preferCSSPageSize: true,
    });
    const sizeMb = (fs.statSync(pdfPath).size / (1024 * 1024)).toFixed(1);
    console.log(`  ✓ wrote ${pdfFile} (${sizeMb} MB)`);
  } finally {
    await page.close();
  }
}

async function main() {
  const files = process.argv.slice(2);
  const targets = files.length ? files : DEFAULT_FILES;

  const executablePath = findChrome();
  console.log(`Using browser: ${executablePath}`);
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox'],
    protocolTimeout: 0,
  });

  try {
    for (const f of targets) {
      await convertOne(browser, f);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
