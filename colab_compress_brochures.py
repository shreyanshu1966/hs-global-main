# ============================================================
# CELL 1 — Install dependencies
# ============================================================
# Run this cell first. Colab has far more RAM than the local machine this
# pipeline normally runs on (which is why the full-res marble PDF kept
# crashing Chrome locally) — rendering here should complete in one pass.
!pip install -q playwright
!playwright install --with-deps chromium
!apt-get -qq install -y ghostscript

# ============================================================
# CELL 2 — Upload the 4 brochure HTML files
# ============================================================
# These are small (all images are remote Cloudinary URLs, nothing local) —
# just the 4 *-brochure.html files from the brochures/ folder:
#   leather-furniture-brochure.html
#   semi-precious-stone-brochure.html
#   wooden-furniture-brochure.html
#   marble-furniture-brochure.html
import os
from google.colab import files

os.makedirs('/content/brochures', exist_ok=True)
uploaded = files.upload()
for name, data in uploaded.items():
    with open(f'/content/brochures/{name}', 'wb') as f:
        f.write(data)
print('Uploaded:', list(uploaded.keys()))

# ============================================================
# CELL 3 — Config
# ============================================================
# Target DPI / JPEG quality for the "shareable" pass. 150-200 DPI is crisp
# on screen and for normal home/office printing; the source images going
# into the full-res PDF are ~400 DPI print-archival quality, which is what
# makes the raw files hundreds of MB to multiple GB. This step is
# deliberately lossy (JPEG re-encode + downsample) — visually indistinguishable
# at normal zoom, but NOT bit-for-bit identical to the source.
TARGET_DPI = 180
JPEG_QUALITY = 88

BROCHURES = [
    'leather-furniture-brochure',
    'semi-precious-stone-brochure',
    'wooden-furniture-brochure',
    'marble-furniture-brochure',
]

HTML_DIR = '/content/brochures'
RAW_PDF_DIR = '/content/pdf-raw'
SHARE_PDF_DIR = '/content/pdf-shareable'
os.makedirs(RAW_PDF_DIR, exist_ok=True)
os.makedirs(SHARE_PDF_DIR, exist_ok=True)

# ============================================================
# CELL 4 — Render each HTML brochure to a full-quality PDF
# ============================================================
import asyncio
from playwright.async_api import async_playwright

WAIT_FOR_IMAGES_JS = """
async () => {
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
}
"""

async def render_one(browser, name):
    html_path = f'{HTML_DIR}/{name}.html'
    pdf_path = f'{RAW_PDF_DIR}/{name}.pdf'
    print(f'\n=== {name} ===')

    page = await browser.new_page(viewport={'width': 1123, 'height': 794})
    page.set_default_navigation_timeout(0)
    page.set_default_timeout(0)

    await page.goto(f'file://{html_path}', wait_until='networkidle')
    result = await page.evaluate(WAIT_FOR_IMAGES_JS)
    print(f'  images: {result["total"]} total, {len(result["failed"])} failed')
    await page.wait_for_timeout(500)

    await page.pdf(path=pdf_path, print_background=True, prefer_css_page_size=True)
    size_mb = os.path.getsize(pdf_path) / (1024 * 1024)
    print(f'  wrote {pdf_path} ({size_mb:.1f} MB)')
    await page.close()

async def render_all():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=['--no-sandbox'])
        try:
            for name in BROCHURES:
                if not os.path.exists(f'{HTML_DIR}/{name}.html'):
                    print(f'SKIP (not uploaded): {name}.html')
                    continue
                await render_one(browser, name)
        finally:
            await browser.close()

await render_all()

# ============================================================
# CELL 5 — Compress each PDF into a shareable version (Ghostscript)
# ============================================================
# Downsamples embedded images to TARGET_DPI and re-encodes as JPEG at
# JPEG_QUALITY — this is the step that actually gets a multi-GB print-res
# file down to an emailable size. Nothing else about the PDF (layout, text,
# page count) changes.
import subprocess

def compress_pdf(src, dst, dpi=TARGET_DPI, quality=JPEG_QUALITY):
    cmd = [
        'gs', '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4',
        '-dNOPAUSE', '-dQUIET', '-dBATCH',
        '-dDetectDuplicateImages=true',
        '-dDownsampleColorImages=true', f'-dColorImageResolution={dpi}',
        '-dColorImageDownsampleType=/Bicubic',
        '-dDownsampleGrayImages=true', f'-dGrayImageResolution={dpi}',
        '-dGrayImageDownsampleType=/Bicubic',
        '-dAutoFilterColorImages=false', '-dColorImageFilter=/DCTEncode',
        '-dAutoFilterGrayImages=false', '-dGrayImageFilter=/DCTEncode',
        f'-dJPEGQ={quality}',
        '-sOutputFile=' + dst, src,
    ]
    subprocess.run(cmd, check=True)

for name in BROCHURES:
    src = f'{RAW_PDF_DIR}/{name}.pdf'
    dst = f'{SHARE_PDF_DIR}/{name}-shareable.pdf'
    if not os.path.exists(src):
        continue
    compress_pdf(src, dst)
    before = os.path.getsize(src) / (1024 * 1024)
    after = os.path.getsize(dst) / (1024 * 1024)
    print(f'{name}: {before:.1f} MB -> {after:.1f} MB ({100 * (1 - after / before):.0f}% smaller)')

# ============================================================
# CELL 6 — Download the shareable PDFs
# ============================================================
for name in BROCHURES:
    dst = f'{SHARE_PDF_DIR}/{name}-shareable.pdf'
    if os.path.exists(dst):
        files.download(dst)
