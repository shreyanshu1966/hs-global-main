# ============================================================
# CELL 1 — Install dependencies
# ============================================================
# Run this cell first, then restart the runtime when prompted.

# spandrel loads RealESRGAN weights directly — no basicsr / setup.py needed.
# After this cell completes: Runtime → Restart session → then run Cells 2-4.
!pip install spandrel cloudinary

# Verify install
import importlib, sys
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
UPLOAD_FOLDER         = "hs-global/sps-brochure-hero"

RATIO_W, RATIO_H = 297, 82   # brochure panel ratio

# ============================================================
# CELL 3 — Product list (from sps.json)
# ============================================================

PRODUCTS = [
  {"sku":"HSG-SPS-001","name":"african-carnelian","version":"v1783574047","publicPath":"hs-global/products/semi-precious-stone/Agate/African-Carnelian/4","ext":"webp"},
  {"sku":"HSG-SPS-002","name":"banded-agate-slab","version":"v1783574118","publicPath":"hs-global/products/semi-precious-stone/Agate/Banded-Agate-Slab/5","ext":"webp"},
  {"sku":"HSG-SPS-003","name":"black-agate","version":"v1783574060","publicPath":"hs-global/products/semi-precious-stone/Agate/Black-Agate/4","ext":"webp"},
  {"sku":"HSG-SPS-004","name":"blueagate","version":"v1783574069","publicPath":"hs-global/products/semi-precious-stone/Agate/Blue-Agate/5","ext":"webp"},
  {"sku":"HSG-SPS-005","name":"brazilian-black-agate","version":"v1783574191","publicPath":"hs-global/products/semi-precious-stone/Agate/Brazilian-Black-Agate/5","ext":"webp"},
  {"sku":"HSG-SPS-006","name":"brazilian-blue-agate","version":"v1783574251","publicPath":"hs-global/products/semi-precious-stone/Agate/BRAZILIAN-BLUE-AGATE/4","ext":"webp"},
  {"sku":"HSG-SPS-007","name":"brazilian-green-agate","version":"v1783574165","publicPath":"hs-global/products/semi-precious-stone/Agate/Brazilian-Green-Agate/5","ext":"webp"},
  {"sku":"HSG-SPS-008","name":"brazilian-red-agate","version":"v1783574260","publicPath":"hs-global/products/semi-precious-stone/Agate/Brazilian-Red-Agate/5","ext":"webp"},
  {"sku":"HSG-SPS-009","name":"brown-agate","version":"v1783574077","publicPath":"hs-global/products/semi-precious-stone/Agate/Brown-Agate/4","ext":"webp"},
  {"sku":"HSG-SPS-010","name":"crystal-agate","version":"v1783574087","publicPath":"hs-global/products/semi-precious-stone/Agate/crystal-agate/5","ext":"webp"},
  {"sku":"HSG-SPS-011","name":"crystal-agate-2","version":"v1783574087","publicPath":"hs-global/products/semi-precious-stone/Agate/crystal-agate/5","ext":"webp"},
  {"sku":"HSG-SPS-012","name":"crystal-agate-golden-glitter","version":"v1783574096","publicPath":"hs-global/products/semi-precious-stone/Agate/Crystal-Agate-With-Golden-Glitter/5","ext":"webp"},
  {"sku":"HSG-SPS-013","name":"dendrite-agate","version":"v1783574202","publicPath":"hs-global/products/semi-precious-stone/Agate/Dendrite-Agate/6","ext":"webp"},
  {"sku":"HSG-SPS-014","name":"earth-agate","version":"v1783574108","publicPath":"hs-global/products/semi-precious-stone/Agate/Earth-Agate/4","ext":"webp"},
  {"sku":"HSG-SPS-015","name":"fossil-agate","version":"v1783574154","publicPath":"hs-global/products/semi-precious-stone/Agate/Fossil-Agate/5","ext":"webp"},
  {"sku":"HSG-SPS-016","name":"grey-agate","version":"v1783574243","publicPath":"hs-global/products/semi-precious-stone/Agate/grey-agate/6","ext":"webp"},
  {"sku":"HSG-SPS-017","name":"lace-agate","version":"v1783574137","publicPath":"hs-global/products/semi-precious-stone/Agate/Lace-Agate/10","ext":"webp"},
  {"sku":"HSG-SPS-018","name":"mix-agate","version":"v1783574182","publicPath":"hs-global/products/semi-precious-stone/Agate/Mix-Agate/5","ext":"webp"},
  {"sku":"HSG-SPS-019","name":"mix-agate-slabs","version":"v1783574174","publicPath":"hs-global/products/semi-precious-stone/Agate/Mix-Agate-Slabs/5","ext":"webp"},
  {"sku":"HSG-SPS-020","name":"moss-agate","version":"v1783574218","publicPath":"hs-global/products/semi-precious-stone/Agate/Moss-Agate/6","ext":"webp"},
  {"sku":"HSG-SPS-021","name":"ruby-agate","version":"v1783574125","publicPath":"hs-global/products/semi-precious-stone/Agate/Ruby-Agate/4","ext":"webp"},
  {"sku":"HSG-SPS-022","name":"straight-line","version":"v1783574271","publicPath":"hs-global/products/semi-precious-stone/Agate/Straight-Line/5","ext":"webp"},
  {"sku":"HSG-SPS-023","name":"white-quartz","version":"v1783574230","publicPath":"hs-global/products/semi-precious-stone/Agate/White-Quartz/5","ext":"webp"},
  {"sku":"HSG-SPS-024","name":"yellow-agate","version":"v1783574100","publicPath":"hs-global/products/semi-precious-stone/Agate/Yellow-Agate/4","ext":"webp"},
  {"sku":"HSG-SPS-025","name":"blue-calcite","version":"v1783574534","publicPath":"hs-global/products/semi-precious-stone/Quartz/Blue-Calcite/5","ext":"webp"},
  {"sku":"HSG-SPS-026","name":"crystal-quartz-rose-gold","version":"v1783574545","publicPath":"hs-global/products/semi-precious-stone/Quartz/crystal-quartz-with-rose-gold/2","ext":"webp"},
  {"sku":"HSG-SPS-027","name":"golden-hematite-quartz","version":"v1783574509","publicPath":"hs-global/products/semi-precious-stone/Quartz/Golden-Hematite-Quartz-Slab/5","ext":"webp"},
  {"sku":"HSG-SPS-028","name":"golden-quartz","version":"v1783574516","publicPath":"hs-global/products/semi-precious-stone/Quartz/Golden-Quartz/1","ext":"webp"},
  {"sku":"HSG-SPS-029","name":"green-quartz","version":"v1783574486","publicPath":"hs-global/products/semi-precious-stone/Quartz/Green-Quartz/6","ext":"webp"},
  {"sku":"HSG-SPS-030","name":"hemotied-quartz","version":"v1783574525","publicPath":"hs-global/products/semi-precious-stone/Quartz/Hemotied-Quartz/5","ext":"webp"},
  {"sku":"HSG-SPS-031","name":"obsidian-black-gold","version":"v1783574471","publicPath":"hs-global/products/semi-precious-stone/Quartz/Obsidian-Black-with-Gold/4","ext":"webp"},
  {"sku":"HSG-SPS-032","name":"obsidian-black-silver","version":"v1783574541","publicPath":"hs-global/products/semi-precious-stone/Quartz/Obsidian-Black-with-Silver/5","ext":"webp"},
  {"sku":"HSG-SPS-033","name":"orange-quartz","version":"v1783574480","publicPath":"hs-global/products/semi-precious-stone/Quartz/Orange-Quartz/6","ext":"webp"},
  {"sku":"HSG-SPS-034","name":"rose-quartz-slabs","version":"v1783574432","publicPath":"hs-global/products/semi-precious-stone/Quartz/Rose-Quartz-Slabs/5","ext":"webp"},
  {"sku":"HSG-SPS-035","name":"septaria-yellow","version":"v1783574496","publicPath":"hs-global/products/semi-precious-stone/Quartz/Septaria-Yellow/4","ext":"webp"},
  {"sku":"HSG-SPS-036","name":"smoky-quartz-dark","version":"v1783574453","publicPath":"hs-global/products/semi-precious-stone/Quartz/Smoky-Quartz-Dark/5","ext":"webp"},
  {"sku":"HSG-SPS-037","name":"smoky-quartz-dark-2","version":"v1783574453","publicPath":"hs-global/products/semi-precious-stone/Quartz/Smoky-Quartz-Dark/5","ext":"webp"},
  {"sku":"HSG-SPS-038","name":"white-mop","version":"v1783574447","publicPath":"hs-global/products/semi-precious-stone/Quartz/White-MOP/5","ext":"webp"},
  {"sku":"HSG-SPS-039","name":"white-quartz-sparkle","version":"v1783574439","publicPath":"hs-global/products/semi-precious-stone/Quartz/White-Quartz-with-Sparkle/4","ext":"webp"},
  {"sku":"HSG-SPS-040","name":"emerald-quartz","version":"v1783574346","publicPath":"hs-global/products/semi-precious-stone/Gemstone/Emerald-quartz/3","ext":"webp"},
  {"sku":"HSG-SPS-041","name":"labradorite","version":"v1783574340","publicPath":"hs-global/products/semi-precious-stone/Gemstone/Labradorite/6","ext":"webp"},
  {"sku":"HSG-SPS-042","name":"lapis-lazulli","version":"v1783574328","publicPath":"hs-global/products/semi-precious-stone/Gemstone/Lapis-Lazulli/5","ext":"webp"},
  {"sku":"HSG-SPS-043","name":"malachite","version":"v1783574306","publicPath":"hs-global/products/semi-precious-stone/Gemstone/Malachite/5","ext":"webp"},
  {"sku":"HSG-SPS-044","name":"malachite-flower-slabs","version":"v1783574298","publicPath":"hs-global/products/semi-precious-stone/Gemstone/Malachite-Flower-Slabs/5","ext":"webp"},
  {"sku":"HSG-SPS-045","name":"rose-quartz","version":"v1783574322","publicPath":"hs-global/products/semi-precious-stone/Gemstone/Rose-Quartz/5","ext":"webp"},
  {"sku":"HSG-SPS-046","name":"sodalite-blue","version":"v1783574313","publicPath":"hs-global/products/semi-precious-stone/Gemstone/Sodalite-Blue/4","ext":"webp"},
  {"sku":"HSG-SPS-047","name":"angel-jasper","version":"v1783574369","publicPath":"hs-global/products/semi-precious-stone/Jasper/Angel-Jasper/1","ext":"webp"},
  {"sku":"HSG-SPS-048","name":"green-jasper","version":"v1783574389","publicPath":"hs-global/products/semi-precious-stone/Jasper/Green-Jasper/5","ext":"webp"},
  {"sku":"HSG-SPS-049","name":"jamaican-jasper-slabs","version":"v1783574363","publicPath":"hs-global/products/semi-precious-stone/Jasper/Jamaican-Jasper-Slabs/5","ext":"webp"},
  {"sku":"HSG-SPS-050","name":"mockite-jasper","version":"v1783574383","publicPath":"hs-global/products/semi-precious-stone/Jasper/Mockite-Jasper/6","ext":"webp"},
  {"sku":"HSG-SPS-051","name":"polychrome-jasper","version":"v1783574396","publicPath":"hs-global/products/semi-precious-stone/Jasper/Polychrome-Jasper/4","ext":"webp"},
  {"sku":"HSG-SPS-052","name":"red-jasper","version":"v1783574357","publicPath":"hs-global/products/semi-precious-stone/Jasper/Red-Jasper/5","ext":"webp"},
  {"sku":"HSG-SPS-053","name":"beige-petrified-wood","version":"v1783574666","publicPath":"hs-global/products/semi-precious-stone/petrified wood/Beige-Petrified-Wood-Slab/4","ext":"webp"},
  {"sku":"HSG-SPS-054","name":"black-petrified-wood","version":"v1783574635","publicPath":"hs-global/products/semi-precious-stone/petrified wood/Black-Petrified-Wood-Retro-Slab/3","ext":"webp"},
  {"sku":"HSG-SPS-055","name":"brown-petrified-wood-retro","version":"v1783574660","publicPath":"hs-global/products/semi-precious-stone/petrified wood/Brown-Petrified-Wood-Retro-Slabs/5","ext":"webp"},
  {"sku":"HSG-SPS-056","name":"brown-petrified-wood","version":"v1783574650","publicPath":"hs-global/products/semi-precious-stone/petrified wood/Brown-Petrified-Wood-Slabs/4","ext":"webp"},
  {"sku":"HSG-SPS-057","name":"white-petrified-wood","version":"v1783574645","publicPath":"hs-global/products/semi-precious-stone/petrified wood/White-Petrified-Wood/2","ext":"webp"},
  {"sku":"HSG-SPS-058","name":"red-tiger-eye","version":"v1783574605","publicPath":"hs-global/products/semi-precious-stone/Tiger eye/Red-Tiger-Eye/6","ext":"webp"},
  {"sku":"HSG-SPS-059","name":"tiger-eye","version":"v1783574629","publicPath":"hs-global/products/semi-precious-stone/Tiger eye/Tiger-Eye/5","ext":"webp"},
  {"sku":"HSG-SPS-060","name":"tiger-eye-blue","version":"v1783574623","publicPath":"hs-global/products/semi-precious-stone/Tiger eye/Tiger-Eye-Blue/5","ext":"webp"},
  {"sku":"HSG-SPS-061","name":"tiger-eye-retro","version":"v1783574615","publicPath":"hs-global/products/semi-precious-stone/Tiger eye/Tiger-Eye-Retro/5","ext":"webp"},
  {"sku":"HSG-SPS-062","name":"black-mop","version":"v1783574423","publicPath":"hs-global/products/semi-precious-stone/Mother Of Pearl/Black-MOP/5","ext":"webp"},
  {"sku":"HSG-SPS-063","name":"golden-mop","version":"v1783574413","publicPath":"hs-global/products/semi-precious-stone/Mother Of Pearl/Golden Mop/5","ext":"webp"},
  {"sku":"HSG-SPS-064","name":"green-abalone","version":"v1783574407","publicPath":"hs-global/products/semi-precious-stone/Mother Of Pearl/Green-Abalone/5","ext":"webp"},
  {"sku":"HSG-SPS-065","name":"green-fluorite","version":"v1783574557","publicPath":"hs-global/products/semi-precious-stone/Semiprecious Stone/Green-Fluorite/5","ext":"webp"},
  {"sku":"HSG-SPS-066","name":"red-carnelian-agate","version":"v1783574593","publicPath":"hs-global/products/semi-precious-stone/Semiprecious Stone/Red-Carnelian-Agate-Slabs/6","ext":"webp"},
  {"sku":"HSG-SPS-067","name":"amazonite","version":"v1783574279","publicPath":"hs-global/products/semi-precious-stone/Amazonite/Amazonite/5","ext":"webp"},
  {"sku":"HSG-SPS-068","name":"amethyst","version":"v1783574290","publicPath":"hs-global/products/semi-precious-stone/Amethyst/Amethyst/6","ext":"webp"},
]

# ============================================================
# CELL 4 — Main pipeline
# ============================================================

import os, json, io, time, requests
import numpy as np
import torch
from PIL import Image
import cloudinary
import cloudinary.uploader
from spandrel import ImageModelDescriptor, ModelLoader

# --- Cloudinary init ---
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
)

# --- Download Real-ESRGAN model weights ---
MODEL_PATH = "/content/RealESRGAN_x4plus.pth"
if not os.path.exists(MODEL_PATH):
    print("Downloading model weights (~64 MB)...")
    url = "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth"
    r = requests.get(url, stream=True)
    with open(MODEL_PATH, "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)
    print("  Done.")

# --- Build upscaler via spandrel ---
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
model = ModelLoader().load_from_file(MODEL_PATH)
assert isinstance(model, ImageModelDescriptor), "Expected image-to-image model"
model = model.model.to(DEVICE).eval()
print(f"Upscaler ready on: {DEVICE.upper()}")

# --- Helpers ---
RESULTS_FILE = "/content/results-sps.json"

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

def entropy_crop(img, ratio_w, ratio_h):
    """Center-crop to ratio using entropy (busiest region)."""
    uw, uh = img.size
    target_w = uw
    target_h = round(target_w * ratio_h / ratio_w)
    if target_h > uh:
        target_h = uh
        target_w = round(target_h * ratio_w / ratio_h)
    left = (uw - target_w) // 2
    top  = (uh - target_h) // 2
    return img.crop((left, top, left + target_w, top + target_h))

def upload(local_path, sku):
    res = cloudinary.uploader.upload(
        local_path,
        folder=UPLOAD_FOLDER,
        public_id=sku,
        overwrite=True,
        resource_type="image",
    )
    return res["secure_url"], res["width"], res["height"]

# --- Pre-seed with already-completed SKUs (001-031 done locally) ---
# No file upload needed — these are baked in and will be skipped automatically.
ALREADY_DONE = {
  "HSG-SPS-001": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787943457/hs-global/sps-brochure-hero/HSG-SPS-001.webp",
  "HSG-SPS-002": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787943847/hs-global/sps-brochure-hero/HSG-SPS-002.webp",
  "HSG-SPS-003": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787944048/hs-global/sps-brochure-hero/HSG-SPS-003.webp",
  "HSG-SPS-004": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787944207/hs-global/sps-brochure-hero/HSG-SPS-004.webp",
  "HSG-SPS-005": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787944395/hs-global/sps-brochure-hero/HSG-SPS-005.webp",
  "HSG-SPS-006": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787944571/hs-global/sps-brochure-hero/HSG-SPS-006.webp",
  "HSG-SPS-007": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787944754/hs-global/sps-brochure-hero/HSG-SPS-007.webp",
  "HSG-SPS-008": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787944942/hs-global/sps-brochure-hero/HSG-SPS-008.webp",
  "HSG-SPS-009": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787945111/hs-global/sps-brochure-hero/HSG-SPS-009.webp",
  "HSG-SPS-010": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787945321/hs-global/sps-brochure-hero/HSG-SPS-010.webp",
  "HSG-SPS-011": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787945514/hs-global/sps-brochure-hero/HSG-SPS-011.webp",
  "HSG-SPS-012": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787945682/hs-global/sps-brochure-hero/HSG-SPS-012.webp",
  "HSG-SPS-013": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787945801/hs-global/sps-brochure-hero/HSG-SPS-013.webp",
  "HSG-SPS-014": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787945933/hs-global/sps-brochure-hero/HSG-SPS-014.webp",
  "HSG-SPS-015": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787946093/hs-global/sps-brochure-hero/HSG-SPS-015.webp",
  "HSG-SPS-016": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787946228/hs-global/sps-brochure-hero/HSG-SPS-016.webp",
  "HSG-SPS-017": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787946355/hs-global/sps-brochure-hero/HSG-SPS-017.webp",
  "HSG-SPS-018": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787946521/hs-global/sps-brochure-hero/HSG-SPS-018.webp",
  "HSG-SPS-019": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787946684/hs-global/sps-brochure-hero/HSG-SPS-019.webp",
  "HSG-SPS-020": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787946844/hs-global/sps-brochure-hero/HSG-SPS-020.webp",
  "HSG-SPS-021": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787946979/hs-global/sps-brochure-hero/HSG-SPS-021.webp",
  "HSG-SPS-022": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787947144/hs-global/sps-brochure-hero/HSG-SPS-022.webp",
  "HSG-SPS-023": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787947305/hs-global/sps-brochure-hero/HSG-SPS-023.webp",
  "HSG-SPS-024": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787947461/hs-global/sps-brochure-hero/HSG-SPS-024.webp",
  "HSG-SPS-025": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787947624/hs-global/sps-brochure-hero/HSG-SPS-025.webp",
  "HSG-SPS-026": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787947733/hs-global/sps-brochure-hero/HSG-SPS-026.webp",
  "HSG-SPS-027": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787947918/hs-global/sps-brochure-hero/HSG-SPS-027.webp",
  "HSG-SPS-028": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787948039/hs-global/sps-brochure-hero/HSG-SPS-028.webp",
  "HSG-SPS-029": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787948246/hs-global/sps-brochure-hero/HSG-SPS-029.webp",
  "HSG-SPS-030": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787948419/hs-global/sps-brochure-hero/HSG-SPS-030.webp",
  "HSG-SPS-031": "https://res.cloudinary.com/dynd1aan0/image/upload/v1787948652/hs-global/sps-brochure-hero/HSG-SPS-031.webp",
}

# --- Main loop ---
results = {**ALREADY_DONE, **load_results()}  # merge: file overrides baked-in on resume
save_result.__defaults__  # ensure file is written with merged state on first save
with open(RESULTS_FILE, "w") as _f:
    json.dump(results, _f, indent=2)
total = len(PRODUCTS)

for i, product in enumerate(PRODUCTS, 1):
    sku = product["sku"]
    if sku in results:
        print(f"[{i}/{total}] SKIP {sku} (already done)")
        continue

    print(f"\n[{i}/{total}] {'='*60}")
    print(f"  {sku} — {product['name']}")
    t0 = time.time()

    try:
        # 1. Fetch
        img = fetch_image(product)
        print(f"  Original: {img.size}")

        # 2. Trim white
        trimmed = trim_white(img)
        print(f"  Trimmed:  {trimmed.size}")

        # 3. 4x AI upscale
        upscaled = upscale_4x(trimmed)
        print(f"  Upscaled: {upscaled.size}  ({time.time()-t0:.0f}s so far)")

        # 4. Entropy crop to brochure ratio
        cropped = entropy_crop(upscaled, RATIO_W, RATIO_H)
        print(f"  Cropped:  {cropped.size}")

        # 5. Save as WebP
        out_path = f"/content/{sku}-final.webp"
        cropped.save(out_path, "WEBP", quality=92)

        # 6. Upload to Cloudinary
        url, w, h = upload(out_path, sku)
        print(f"  Uploaded: {url}  ({w}x{h})  total={time.time()-t0:.0f}s")

        # 7. Save progress
        save_result(results, sku, url)

        # 8. Clean up local file
        os.remove(out_path)

    except Exception as e:
        print(f"  ❌ FAILED: {e}")

print("\n\n✅ All done! Download /content/results-sps.json")

# ============================================================
# CELL 5 — Download results.json
# ============================================================
# from google.colab import files
# files.download('/content/results-sps.json')
