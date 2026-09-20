# ============================================================
# CELL 1 — Install dependencies
# ============================================================
# Run this cell first, then restart the runtime when prompted.
!pip install spandrel cloudinary

import importlib
for pkg in ('spandrel', 'cloudinary'):
    try:
        importlib.import_module(pkg)
        print(f"  ✅ {pkg} OK")
    except ModuleNotFoundError:
        print(f"  ❌ {pkg} MISSING — restart runtime and try again")

# ============================================================
# CELL 2 — Config (paste your Cloudinary keys here)
# ============================================================

CLOUDINARY_CLOUD_NAME = "dynd1aan0"
CLOUDINARY_API_KEY    = "354469638923711"
CLOUDINARY_API_SECRET = "dCkEl9uD2RyJnU7835KRntdc1jQ"
UPLOAD_FOLDER         = "hs-global/marble-brochure-hero"

RATIO_W, RATIO_H = 148, 174   # brochure image-panel ratio (148mm x 174mm)
PADDING = 0.02                    # fractional white margin around the product

# ============================================================
# CELL 3 — Product list: ONLY the 14 SKUs whose hero image was
# swapped (2026-09-15 marble-hero-picks re-audit). Same public_id
# convention as the full run — this OVERWRITES the stale upscaled
# asset already at hs-global/marble-brochure-hero/<SKU>.webp with
# the new source photo's upscaled version.
# ============================================================

PRODUCTS = [
  {
    "sku": "HSG-MBL-002",
    "version": "v1779285639",
    "publicPath": "hs-global/furniture/etsy/HSMCETBE10/6",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-019",
    "version": "v1779285642",
    "publicPath": "hs-global/furniture/etsy/HSMCETBLWH11/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-057",
    "version": None,
    "publicPath": "hs-global/furniture/etsy/HSMCOBE26/839d4bc6-112c-4489-afc5-76493acee0e6",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-062",
    "version": "v1779285788",
    "publicPath": "hs-global/furniture/etsy/HSMCOTBE1/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-070",
    "version": "v1779285682",
    "publicPath": "hs-global/furniture/etsy/HSMCTBL4/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-094",
    "version": "v1783587895",
    "publicPath": "hs-global/furniture/etsy/HSMSTGR30/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-121",
    "version": "v1783517229",
    "publicPath": "hs-global/furniture/etsy/HSMSTWH44/60784e2c-04f0-42d0-9410-5ab8dc0d69be",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-126",
    "version": "v1779285377",
    "publicPath": "hs-global/furniture/etsy/HSMSTWH5/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-156",
    "version": "v1779285472",
    "publicPath": "hs-global/furniture/etsy/HSMSWH6/4",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-167",
    "version": "v1783587384",
    "publicPath": "hs-global/furniture/etsy/HSMPSBL26/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-168",
    "version": "v1783587710",
    "publicPath": "hs-global/furniture/etsy/HSMPSWH24/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-169",
    "version": "v1783587722",
    "publicPath": "hs-global/furniture/etsy/HSMPSBE22/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-173",
    "version": "v1779285327",
    "publicPath": "hs-global/furniture/etsy/HSMPSBL5/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-178",
    "version": "v1779285404",
    "publicPath": "hs-global/furniture/etsy/HSMPSWHBL6/1",
    "ext": "webp"
  }
]

# ============================================================
# CELL 4 — Main pipeline
# ============================================================

import os
os.environ.setdefault("PYTORCH_CUDA_ALLOC_CONF", "expandable_segments:True")

import json, io, time, gc, requests
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

RESULTS_FILE = "/content/results-marble-new14.json"

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
    if product.get("version"):
        url = (f"https://res.cloudinary.com/{CLOUDINARY_CLOUD_NAME}/image/upload"
               f"/{product['version']}/{requests.utils.quote(product['publicPath'])}.{product['ext']}")
    else:
        url = (f"https://res.cloudinary.com/{CLOUDINARY_CLOUD_NAME}/image/upload"
               f"/{requests.utils.quote(product['publicPath'])}.{product['ext']}")
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

MAX_UPSCALE_INPUT = 1000  # cap the long side fed into the 4x model — a 1000px
                           # input already yields a 4000px output, far beyond
                           # what a 148mm print panel needs (~2300px @ 400dpi),
                           # and uncapped inputs (1800-2000px+) are what were
                           # driving the CUDA OOM failures.

def upscale_4x(img):
    w, h = img.size
    long_side = max(w, h)
    if long_side > MAX_UPSCALE_INPUT:
        scale = MAX_UPSCALE_INPUT / long_side
        img = img.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)

    arr = np.array(img).astype(np.float32) / 255.0
    t = torch.from_numpy(arr).permute(2, 0, 1).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        out = model(t)
    out_arr = out.squeeze(0).permute(1, 2, 0).cpu().float().numpy()
    out_arr = (out_arr * 255).clip(0, 255).astype(np.uint8)
    result = Image.fromarray(out_arr)

    del t, out, arr, out_arr
    gc.collect()
    if DEVICE == "cuda":
        torch.cuda.empty_cache()

    return result

def pad_to_ratio(img, ratio_w, ratio_h, padding=0.02):
    """Pad the upscaled product back out to the panel's ratio on a white
    background, centered — whole piece always visible, never cropped."""
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

    print(f"\n[{i}/{total}] {'='*60}")
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
        print(f"  ❌ FAILED: {e}")
        gc.collect()
        if DEVICE == "cuda":
            torch.cuda.empty_cache()

print("\n\n✅ All done! Download /content/results-marble-new14.json")

# ============================================================
# CELL 5 — Download results.json
# ============================================================
from google.colab import files
files.download('/content/results-marble-new14.json')
