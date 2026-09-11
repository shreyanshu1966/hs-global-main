/**
 * Builds colab_marble_upscale.py from marble-products-list.json (post hero-pick
 * swaps). Mirrors colab_sps_upscale.py's pipeline but pads to the panel ratio on
 * a white background (cropStrategy 'contain') instead of entropy-cropping,
 * since marble pieces are discrete furniture objects, not flat slab textures.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const list = JSON.parse(fs.readFileSync(path.join(root, 'scripts/marble-products-list.json'), 'utf8'));

const RATIO_W = 148;
const RATIO_H = 174;
const UPLOAD_FOLDER = 'hs-global/marble-brochure-hero';

function parseSrc(src) {
  // https://res.cloudinary.com/dynd1aan0/image/upload/v170.../hs-global/.../file.webp
  const m = src.match(/\/upload\/(v\d+)\/(.+)\.([a-zA-Z0-9]+)$/);
  if (!m) throw new Error(`Could not parse src: ${src}`);
  const [, version, encodedPath, ext] = m;
  return { version, publicPath: decodeURIComponent(encodedPath), ext };
}

const products = list.map((p) => {
  const { version, publicPath, ext } = parseSrc(p.src);
  return { sku: p.sku, version, publicPath, ext };
});

const productsJson = JSON.stringify(products, null, 2)
  .replace(/"sku"/g, '"sku"')
  .replace(/^\[/, '[')
  .replace(/\]$/, ']');

// Convert JSON to a Python literal (true/false/null differences don't matter here — no booleans/nulls present)
const pyProducts = productsJson;

const script = `# ============================================================
# CELL 1 — Install dependencies
# ============================================================
# Run this cell first, then restart the runtime when prompted.
!pip install spandrel cloudinary

import importlib
for pkg in ('spandrel', 'cloudinary'):
    try:
        importlib.import_module(pkg)
        print(f"  \u2705 {pkg} OK")
    except ModuleNotFoundError:
        print(f"  \u274c {pkg} MISSING \u2014 restart runtime and try again")

# ============================================================
# CELL 2 \u2014 Config (paste your Cloudinary keys here)
# ============================================================

CLOUDINARY_CLOUD_NAME = "dynd1aan0"
CLOUDINARY_API_KEY    = "PASTE_YOUR_CLOUDINARY_API_KEY"
CLOUDINARY_API_SECRET = "PASTE_YOUR_CLOUDINARY_API_SECRET"
UPLOAD_FOLDER         = "${UPLOAD_FOLDER}"

RATIO_W, RATIO_H = ${RATIO_W}, ${RATIO_H}   # brochure image-panel ratio (148mm x 174mm)
PADDING = 0.02                    # fractional white margin around the product

# ============================================================
# CELL 3 \u2014 Product list (from marble-products-list.json, post hero-pick audit)
# ============================================================

PRODUCTS = ${pyProducts}

# ============================================================
# CELL 4 \u2014 Main pipeline
# ============================================================

import os, json, io, time, requests
import numpy as np
import torch
from PIL import Image
import cloudinary
import cloudinary.uploader
from spandrel import ImageModelDescriptor, ModelLoader

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
)

MODEL_PATH = "/content/RealESRGAN_x4plus.pth"
if not os.path.exists(MODEL_PATH):
    print("Downloading model weights (~64 MB)...")
    url = "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth"
    r = requests.get(url, stream=True)
    with open(MODEL_PATH, "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)
    print("  Done.")

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
model = ModelLoader().load_from_file(MODEL_PATH)
assert isinstance(model, ImageModelDescriptor), "Expected image-to-image model"
model = model.model.to(DEVICE).eval()
print(f"Upscaler ready on: {DEVICE.upper()}")

RESULTS_FILE = "/content/results-marble.json"

def load_results():
    if os.path.exists(RESULTS_FILE):
        with open(RESULTS_FILE) as f:
            return json.load(f)
    return {}

def save_result(results, sku, url):
    results[sku] = url
    with open(RESULTS_FILE, "w") as f:
        json.dump(results, f, indent=2)

def fetch_image(product):
    url = (f"https://res.cloudinary.com/{CLOUDINARY_CLOUD_NAME}/image/upload"
           f"/{product['version']}/{requests.utils.quote(product['publicPath'])}.{product['ext']}")
    r = requests.get(url, timeout=30)
    r.raise_for_status()
    return Image.open(io.BytesIO(r.content)).convert("RGB")

def trim_white(img, threshold=15):
    """Remove white background borders."""
    arr = np.array(img)
    mask = np.any(arr < (255 - threshold), axis=2)
    rows = np.where(mask.any(axis=1))[0]
    cols = np.where(mask.any(axis=0))[0]
    if not rows.size or not cols.size:
        return img
    return img.crop((cols[0], rows[0], cols[-1]+1, rows[-1]+1))

def upscale_4x(img):
    arr = np.array(img).astype(np.float32) / 255.0
    t = torch.from_numpy(arr).permute(2, 0, 1).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        out = model(t)
    out_arr = out.squeeze(0).permute(1, 2, 0).cpu().float().numpy()
    out_arr = (out_arr * 255).clip(0, 255).astype(np.uint8)
    return Image.fromarray(out_arr)

def pad_to_ratio(img, ratio_w, ratio_h, padding=0.02):
    """Pad the upscaled product back out to the panel's ratio on a white
    background, centered \u2014 whole piece always visible, never cropped."""
    uw, uh = img.size
    target_w = uw / (1 - padding)
    target_h = target_w * (ratio_h / ratio_w)
    if target_h < uh / (1 - padding):
        target_h = uh / (1 - padding)
        target_w = target_h * (ratio_w / ratio_h)
    target_w, target_h = round(target_w), round(target_h)
    canvas = Image.new("RGB", (target_w, target_h), (255, 255, 255))
    left = (target_w - uw) // 2
    top = (target_h - uh) // 2
    canvas.paste(img, (left, top))
    return canvas

def upload(local_path, sku):
    res = cloudinary.uploader.upload(
        local_path,
        folder=UPLOAD_FOLDER,
        public_id=sku,
        overwrite=True,
        resource_type="image",
    )
    return res["secure_url"], res["width"], res["height"]

results = load_results()
total = len(PRODUCTS)

for i, product in enumerate(PRODUCTS, 1):
    sku = product["sku"]
    if sku in results:
        print(f"[{i}/{total}] SKIP {sku} (already done)")
        continue

    print(f"\\n[{i}/{total}] {'='*60}")
    print(f"  {sku}")
    t0 = time.time()

    try:
        img = fetch_image(product)
        print(f"  Original: {img.size}")

        trimmed = trim_white(img)
        print(f"  Trimmed:  {trimmed.size}")

        upscaled = upscale_4x(trimmed)
        print(f"  Upscaled: {upscaled.size}  ({time.time()-t0:.0f}s so far)")

        padded = pad_to_ratio(upscaled, RATIO_W, RATIO_H, PADDING)
        print(f"  Padded:   {padded.size}")

        out_path = f"/content/{sku}-final.webp"
        padded.save(out_path, "WEBP", quality=92)

        url, w, h = upload(out_path, sku)
        print(f"  Uploaded: {url}  ({w}x{h})  total={time.time()-t0:.0f}s")

        save_result(results, sku, url)
        os.remove(out_path)

    except Exception as e:
        print(f"  \u274c FAILED: {e}")

print("\\n\\n\u2705 All done! Download /content/results-marble.json")

# ============================================================
# CELL 5 \u2014 Download results.json
# ============================================================
# from google.colab import files
# files.download('/content/results-marble.json')
`;

fs.writeFileSync(path.join(root, 'colab_marble_upscale.py'), script);
console.log(`Wrote colab_marble_upscale.py with ${products.length} products.`);
