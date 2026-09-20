"""
Compresses the 4 brochure PDFs into small, "shareable" versions that run
entirely on this machine (no Colab, no external binaries like Ghostscript —
just the pymupdf pip package).

How it works: each page of the source PDF is rasterized at TARGET_DPI, then
encoded BOTH as a JPEG (JPEG_QUALITY) and as a lossless PNG — whichever comes
out smaller is used for that page. Photo-heavy product pages compress far
better as JPEG; text/UI-heavy pages (covers, index, spec-grid-only pages)
compress better AND losslessly as PNG, since JPEG's block-based DCT visibly
smears thin lines, gradients, and small text (this is what caused the visible
quality drop in the first version of this script, which forced JPEG on every
page). Picking per-page avoids that tradeoff entirely for non-photo pages.

This is still a deliberate change vs. the Ghostscript approach (see
colab_compress_brochures.py): every page becomes one flattened image, so
headings/prices/spec labels stop being selectable/searchable text even on
pages that end up PNG-encoded. Photos look effectively identical to the
source either way. If you need selectable text preserved, that needs true
Ghostscript image-stream recompression instead (the Colab script does that);
installing Ghostscript locally hit a UAC prompt this session that couldn't be
completed non-interactively.

Usage:
  python scripts/compress-brochures.py [name1 name2 ...]
  (defaults to all 4 brochures; name = the file stem, e.g. "marble-furniture-brochure")
"""
import sys
import time
from pathlib import Path

import pymupdf as fitz

ROOT = Path(__file__).resolve().parent.parent
BROCHURES_DIR = ROOT / 'brochures'

TARGET_DPI = 200
JPEG_QUALITY = 93

DEFAULT_NAMES = [
    'leather-furniture-brochure',
    'semi-precious-stone-brochure',
    'wooden-furniture-brochure',
    'marble-furniture-brochure',
]


def compress_one(name, dpi=TARGET_DPI, quality=JPEG_QUALITY):
    src_path = BROCHURES_DIR / f'{name}.pdf'
    dst_path = BROCHURES_DIR / f'{name}-shareable.pdf'

    if not src_path.exists():
        print(f'SKIP (not found): {src_path.name}')
        return

    t0 = time.time()
    src = fitz.open(src_path)
    dst = fitz.open()

    zoom = dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)

    png_pages = 0
    for i, page in enumerate(src):
        pix = page.get_pixmap(matrix=mat, alpha=False)
        jpeg_bytes = pix.tobytes(output='jpg', jpg_quality=quality)
        png_bytes = pix.tobytes(output='png')

        if len(png_bytes) < len(jpeg_bytes):
            image_bytes = png_bytes
            png_pages += 1
        else:
            image_bytes = jpeg_bytes

        new_page = dst.new_page(width=page.rect.width, height=page.rect.height)
        new_page.insert_image(new_page.rect, stream=image_bytes)

        if (i + 1) % 25 == 0 or (i + 1) == len(src):
            print(f'  {name}: page {i + 1}/{len(src)}')

    page_count = len(src)
    dst.save(dst_path, garbage=4, deflate=True)
    dst.close()
    src.close()

    before_mb = src_path.stat().st_size / (1024 * 1024)
    after_mb = dst_path.stat().st_size / (1024 * 1024)
    pct = 100 * (1 - after_mb / before_mb) if before_mb else 0
    elapsed = time.time() - t0
    print(f'{name}: {before_mb:.1f} MB -> {after_mb:.1f} MB ({pct:.0f}% smaller, {elapsed:.0f}s, '
          f'{png_pages}/{page_count} pages lossless PNG)\n')


def main():
    names = sys.argv[1:] or DEFAULT_NAMES
    print(f'Compressing {len(names)} brochure(s) at {TARGET_DPI} DPI / JPEG q={JPEG_QUALITY}\n')
    for name in names:
        compress_one(name)


if __name__ == '__main__':
    main()
