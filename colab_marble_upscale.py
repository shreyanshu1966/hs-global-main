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
# CELL 3 — Product list (from marble-products-list.json, post hero-pick audit)
# ============================================================

PRODUCTS = [
  {
    "sku": "HSG-MBL-001",
    "version": "v1783587981",
    "publicPath": "hs-global/furniture/etsy/HSMCETWH37/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-002",
    "version": "v1779285638",
    "publicPath": "hs-global/furniture/etsy/HSMCETBE10/6",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-003",
    "version": "v1784559828",
    "publicPath": "hs-global/products/furniture/Coffee Table/file_r48vzy",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-004",
    "version": "v1779285343",
    "publicPath": "hs-global/furniture/etsy/HSMCETWH3/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-005",
    "version": "v1779285316",
    "publicPath": "hs-global/furniture/etsy/HSMCETWH1/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-006",
    "version": "v1779285347",
    "publicPath": "hs-global/furniture/etsy/HSMCETBL4/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-007",
    "version": "v1784382000",
    "publicPath": "hs-global/products/furniture/Coffee Table/file_df9cew",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-008",
    "version": "v1778264611",
    "publicPath": "hs-global/furniture/etsy/HSMCETGR14/Screenshot 2026-03-19 160237",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-009",
    "version": "v1783517207",
    "publicPath": "hs-global/furniture/etsy/HSMCETGRWH25/904f5e15-b596-49ce-8492-effde8219c18",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-010",
    "version": "v1784559753",
    "publicPath": "hs-global/products/furniture/Coffee Table/file_b0xhlo",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-011",
    "version": "v1783631741",
    "publicPath": "hs-global/products/furniture/Coffee Table/file_af2b6f",
    "ext": "jpg"
  },
  {
    "sku": "HSG-MBL-012",
    "version": "v1783587366",
    "publicPath": "hs-global/furniture/etsy/HSMCETGR26/6",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-013",
    "version": "v1779285356",
    "publicPath": "hs-global/furniture/etsy/HSMCETBE6/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-014",
    "version": "v1783587874",
    "publicPath": "hs-global/furniture/etsy/HSMCETBE23/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-015",
    "version": "v1779285666",
    "publicPath": "hs-global/furniture/etsy/HSMCETBR12/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-016",
    "version": "v1784559930",
    "publicPath": "hs-global/products/furniture/Coffee Table/file_ohbfur",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-017",
    "version": "v1779454413",
    "publicPath": "hs-global/products/furniture/Coffee Table/file_mlbp48",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-018",
    "version": "v1783587622",
    "publicPath": "hs-global/furniture/etsy/HSMCETWH30/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-019",
    "version": "v1779285651",
    "publicPath": "hs-global/furniture/etsy/HSMCETBLWH11/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-020",
    "version": "v1783631354",
    "publicPath": "hs-global/products/furniture/Coffee Table/file_ccvus9",
    "ext": "jpg"
  },
  {
    "sku": "HSG-MBL-021",
    "version": "v1779515185",
    "publicPath": "hs-global/products/furniture/Coffee Table/file_dv89yf",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-022",
    "version": "v1779285734",
    "publicPath": "hs-global/furniture/etsy/HSMCETWHBR16/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-023",
    "version": "v1779285706",
    "publicPath": "hs-global/furniture/etsy/HSMCETWH13/WhatsApp Image 2025-05-25 at 2.43.29 PM (1)",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-024",
    "version": "v1784289795",
    "publicPath": "hs-global/products/furniture/Coffee Table/file_kl9nqa",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-025",
    "version": "v1784560411",
    "publicPath": "hs-global/products/furniture/Coffee Table/file_pnvx2b",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-026",
    "version": "v1783587879",
    "publicPath": "hs-global/furniture/etsy/HSMCETBE36/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-027",
    "version": "v1783588022",
    "publicPath": "hs-global/furniture/etsy/HSMCETBE34/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-028",
    "version": "v1783587726",
    "publicPath": "hs-global/furniture/etsy/HSMCETBE29/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-029",
    "version": "v1783587757",
    "publicPath": "hs-global/furniture/etsy/HSMDTBE3/4",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-030",
    "version": "v1779285753",
    "publicPath": "hs-global/furniture/etsy/HSMCETBE17/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-031",
    "version": "v1783587905",
    "publicPath": "hs-global/furniture/etsy/HSMDTMU4/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-032",
    "version": "v1785495978",
    "publicPath": "hs-global/products/furniture/Dining Table/file_rsxpdt",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-033",
    "version": "v1779286860",
    "publicPath": "hs-global/furniture/etsy/HSMDTWHBL8/ChatGPT Image May 18, 2026, 06_45_26 PM",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-034",
    "version": "v1783587703",
    "publicPath": "hs-global/furniture/etsy/HSMDTBE6/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-035",
    "version": "v1780661992",
    "publicPath": "hs-global/products/furniture/Dining Table/file_wwu1nm",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-036",
    "version": "v1779286813",
    "publicPath": "hs-global/furniture/etsy/HSMDTWH5/file_000000001c1c71fbbd46fd584b2887ca",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-037",
    "version": "v1783588058",
    "publicPath": "hs-global/furniture/etsy/HSMDTBE7/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-038",
    "version": "v1778264375",
    "publicPath": "hs-global/furniture/etsy/HSMDTWH1/4",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-039",
    "version": "v1784464716",
    "publicPath": "hs-global/products/furniture/Console Table/file_gg5uah",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-040",
    "version": "v1783587630",
    "publicPath": "hs-global/furniture/etsy/HSMCOGR17/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-041",
    "version": "v1779285840",
    "publicPath": "hs-global/furniture/etsy/HSMCOTGR6/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-042",
    "version": "v1779285814",
    "publicPath": "hs-global/furniture/etsy/HSMCOTGR4/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-043",
    "version": "v1783587837",
    "publicPath": "hs-global/furniture/etsy/HSMCOTGR10/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-044",
    "version": "v1783587361",
    "publicPath": "hs-global/furniture/etsy/HSMCOGR18/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-045",
    "version": "v1779285285",
    "publicPath": "hs-global/furniture/etsy/HSMCTBE1/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-046",
    "version": "v1779286862",
    "publicPath": "hs-global/furniture/etsy/HSMCOBL28/ChatGPT Image May 18, 2026, 06_39_33 PM",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-047",
    "version": "v1784398977",
    "publicPath": "hs-global/products/furniture/Console Table/file_zh6cla",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-048",
    "version": "v1783587926",
    "publicPath": "hs-global/furniture/etsy/HSMCOTBL8/4",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-049",
    "version": "v1783588061",
    "publicPath": "hs-global/furniture/etsy/HSMCOTWH5/4",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-050",
    "version": "v1783587845",
    "publicPath": "hs-global/furniture/etsy/HSMCOTWHBL11/4",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-051",
    "version": "v1783587886",
    "publicPath": "hs-global/furniture/etsy/HSMCOBLWH24/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-052",
    "version": "v1783517216",
    "publicPath": "hs-global/furniture/etsy/HSMCOWHBL16/0ef1cf9a-a749-4f8a-abc6-7ce88a2a1590",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-053",
    "version": "v1779286873",
    "publicPath": "hs-global/furniture/etsy/HSMCORE29/ChatGPT Image May 18, 2026, 06_33_11 PM",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-054",
    "version": "v1783587902",
    "publicPath": "hs-global/furniture/etsy/HSMCORE19/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-055",
    "version": "v1779286637",
    "publicPath": "hs-global/furniture/etsy/HSMCORE21/ChatGPT Image May 19, 2026, 05_07_27 PM",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-056",
    "version": "v1779286674",
    "publicPath": "hs-global/furniture/etsy/HSMCOBE25/ChatGPT Image May 19, 2026, 04_08_27 PM",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-057",
    "version": "v1779286836",
    "publicPath": "hs-global/furniture/etsy/HSMCOBE26/839d4bc6-112c-4489-afc5-76493acee0e6",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-058",
    "version": "v1779286845",
    "publicPath": "hs-global/furniture/etsy/HSMCOBE27/ChatGPT Image May 18, 2026, 06_55_19 PM",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-059",
    "version": "v1784464582",
    "publicPath": "hs-global/products/furniture/Console Table/file_sc2hbj",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-060",
    "version": "v1779285797",
    "publicPath": "hs-global/furniture/etsy/HSMCOTBE2/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-061",
    "version": "v1783589345",
    "publicPath": "hs-global/furniture/etsy/HSMCOBE22/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-062",
    "version": "v1779285786",
    "publicPath": "hs-global/furniture/etsy/HSMCOTBE1/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-063",
    "version": "v1783587847",
    "publicPath": "hs-global/furniture/etsy/HSMCOTWH12/5",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-064",
    "version": "v1779285845",
    "publicPath": "hs-global/furniture/etsy/HSMCOTWH7/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-065",
    "version": "v1783587934",
    "publicPath": "hs-global/furniture/etsy/HSMCOTWH9/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-066",
    "version": "v1779285806",
    "publicPath": "hs-global/furniture/etsy/HSMCOTWH3/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-067",
    "version": "v1783587584",
    "publicPath": "hs-global/furniture/etsy/HSMCETGR27/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-068",
    "version": "v1779285680",
    "publicPath": "hs-global/furniture/etsy/HSMCTGR3/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-069",
    "version": "v1779285533",
    "publicPath": "hs-global/furniture/etsy/HSMCTGR2/5",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-070",
    "version": "v1779285688",
    "publicPath": "hs-global/furniture/etsy/HSMCTBL4/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-071",
    "version": "v1783588007",
    "publicPath": "hs-global/furniture/etsy/HSMCETWH15/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-072",
    "version": "v1778264385",
    "publicPath": "hs-global/furniture/etsy/HSMCETWH2/5",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-073",
    "version": "v1779285755",
    "publicPath": "hs-global/furniture/etsy/HSMCETWH18/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-074",
    "version": "v1778265041",
    "publicPath": "hs-global/furniture/etsy/HSMSTBE22/Gemini_Generated_Image_xa4ve0xa4ve0xa4v",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-075",
    "version": "v1779536348",
    "publicPath": "hs-global/products/furniture/Side Table/file_dmjdtt",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-076",
    "version": "v1779286739",
    "publicPath": "hs-global/furniture/etsy/HSMSTBL57/file_000000008bb87208a343763bf2dfd4eb",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-077",
    "version": "v1778265027",
    "publicPath": "hs-global/furniture/etsy/HSMSTBL21/Gemini_Generated_Image_9coqgr9coqgr9coq",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-078",
    "version": "v1784431628",
    "publicPath": "hs-global/products/furniture/Side Table/file_lyqpgs",
    "ext": "jpg"
  },
  {
    "sku": "HSG-MBL-079",
    "version": "v1783589341",
    "publicPath": "hs-global/furniture/etsy/HSMSTWHBL16/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-080",
    "version": "v1778264831",
    "publicPath": "hs-global/furniture/etsy/HSMSTWHBL12/Gemini_Generated_Image_5l6ctx5l6ctx5l6c",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-081",
    "version": "v1784431719",
    "publicPath": "hs-global/products/furniture/Side Table/file_zfa3dk",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-082",
    "version": "v1779285375",
    "publicPath": "hs-global/furniture/etsy/HSMSTWH4/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-083",
    "version": "v1779285388",
    "publicPath": "hs-global/furniture/etsy/HSMSTBR7/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-084",
    "version": "v1779285280",
    "publicPath": "hs-global/furniture/etsy/HSMSTGR1/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-085",
    "version": "v1779539350",
    "publicPath": "hs-global/products/furniture/Side Table/file_feccdx",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-086",
    "version": "v1783587406",
    "publicPath": "hs-global/furniture/etsy/HSMSTGR47/5",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-087",
    "version": "v1783517188",
    "publicPath": "hs-global/furniture/etsy/HSMSTGRWH40/2cb05e3b-fffe-474b-8291-c1badddded42",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-088",
    "version": "v1779286579",
    "publicPath": "hs-global/furniture/etsy/HSMSTGR49/file_0000000003c07208947d6d04c0a94d77",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-089",
    "version": "v1783587319",
    "publicPath": "hs-global/furniture/etsy/HSMSTGR46/5",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-090",
    "version": "v1778264841",
    "publicPath": "hs-global/furniture/etsy/HSMSTGE13/Gemini_Generated_Image_nbxm9anbxm9anbxm",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-091",
    "version": "v1783587409",
    "publicPath": "hs-global/furniture/etsy/HSMSTGR24/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-092",
    "version": "v1779286584",
    "publicPath": "hs-global/furniture/etsy/HSMSTGR50/file_00000000ed307207b1713efdfea28b56",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-093",
    "version": "v1783587987",
    "publicPath": "hs-global/furniture/etsy/HSMSTGR65/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-094",
    "version": "v1783587892",
    "publicPath": "hs-global/furniture/etsy/HSMSTGR30/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-095",
    "version": "v1783587334",
    "publicPath": "hs-global/furniture/etsy/HSMSTGR23/5",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-096",
    "version": "v1784431502",
    "publicPath": "hs-global/products/furniture/Side Table/file_vfwkwm",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-097",
    "version": "v1778264821",
    "publicPath": "hs-global/furniture/etsy/HSMSTGR11/Gemini_Generated_Image_elkgcfelkgcfelkg",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-098",
    "version": "v1779286768",
    "publicPath": "hs-global/furniture/etsy/HSMSTGE60/file_00000000df70722fa520bfeb27b72dc2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-099",
    "version": "v1779285387",
    "publicPath": "hs-global/furniture/etsy/HSMSTGR6/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-100",
    "version": "v1779285365",
    "publicPath": "hs-global/furniture/etsy/HSMSTWH3/4",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-101",
    "version": "v1778265096",
    "publicPath": "hs-global/furniture/etsy/HSMSTWH27/Gemini_Generated_Image_sudocksudocksudo",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-102",
    "version": "v1783587865",
    "publicPath": "hs-global/furniture/etsy/HSMSTBL32/5",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-103",
    "version": "v1783587419",
    "publicPath": "hs-global/furniture/etsy/HSMSTWH26/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-104",
    "version": "v1779285594",
    "publicPath": "hs-global/furniture/etsy/HSMSTMU8/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-105",
    "version": "v1779286755",
    "publicPath": "hs-global/furniture/etsy/HSMSTGE59/5",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-106",
    "version": "v1783517208",
    "publicPath": "hs-global/furniture/etsy/HSMSTWHRE43/6ee5bd0b-5dba-4565-8848-cc90e32fe46c",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-107",
    "version": "v1784431444",
    "publicPath": "hs-global/products/furniture/Side Table/file_wqit2q",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-108",
    "version": "v1779538931",
    "publicPath": "hs-global/products/furniture/Side Table/file_ieclrz",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-109",
    "version": "v1783517180",
    "publicPath": "hs-global/furniture/etsy/HSMSTGE39/cfce28fe-ff59-4136-a49a-805704e66066",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-110",
    "version": "v1784431767",
    "publicPath": "hs-global/products/furniture/Side Table/file_ruuc2j",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-111",
    "version": "v1779538788",
    "publicPath": "hs-global/products/furniture/Side Table/file_ojwb2l",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-112",
    "version": "v1779285298",
    "publicPath": "hs-global/furniture/etsy/HSMSTBR2/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-113",
    "version": "v1783588031",
    "publicPath": "hs-global/furniture/etsy/HSMSTRE56/4",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-114",
    "version": "v1779286809",
    "publicPath": "hs-global/furniture/etsy/HSMSTRE64/ChatGPT Image May 19, 2026, 11_44_07 AM",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-115",
    "version": "v1779286709",
    "publicPath": "hs-global/furniture/etsy/HSMSTRE55/file_00000000305c71fd8ec5a844e1780703",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-116",
    "version": "v1779286803",
    "publicPath": "hs-global/furniture/etsy/HSMSTRE63/file_00000000fbc471fba426e7164527b925",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-117",
    "version": "v1779286796",
    "publicPath": "hs-global/furniture/etsy/HSMSTRE62/file_000000000f0871fb9fdac21f1bf69f8a",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-118",
    "version": "v1779286705",
    "publicPath": "hs-global/furniture/etsy/HSMSTRE54/ChatGPT Image May 19, 2026, 02_18_49 PM",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-119",
    "version": "v1779286785",
    "publicPath": "hs-global/furniture/etsy/HSMSTRE61/file_000000003e7471fb915fbaf615063742",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-120",
    "version": "v1779538572",
    "publicPath": "hs-global/products/furniture/Side Table/file_plwruh",
    "ext": "jpg"
  },
  {
    "sku": "HSG-MBL-121",
    "version": "v1783517227",
    "publicPath": "hs-global/furniture/etsy/HSMSTWH44/60784e2c-04f0-42d0-9410-5ab8dc0d69be",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-122",
    "version": "v1778265042",
    "publicPath": "hs-global/furniture/etsy/HSMCETWH19/Gemini_Generated_Image_kormydkormydkorm",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-123",
    "version": "v1783589351",
    "publicPath": "hs-global/furniture/etsy/HSMSTBE20/5",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-124",
    "version": "v1783587299",
    "publicPath": "hs-global/furniture/etsy/HSMSTBE9/13",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-125",
    "version": "v1783587425",
    "publicPath": "hs-global/furniture/etsy/HSMSTWH28/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-126",
    "version": "v1779285376",
    "publicPath": "hs-global/furniture/etsy/HSMSTWH5/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-127",
    "version": "v1783588019",
    "publicPath": "hs-global/furniture/etsy/HSMSTWH45/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-128",
    "version": "v1783587529",
    "publicPath": "hs-global/furniture/etsy/HSMSTWH48/5",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-129",
    "version": "v1783587994",
    "publicPath": "hs-global/furniture/etsy/HSMSTWH52/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-130",
    "version": "v1783589334",
    "publicPath": "hs-global/furniture/etsy/HSMBTBE4/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-131",
    "version": "v1784462950",
    "publicPath": "hs-global/products/furniture/Bathtub/file_bedisv",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-132",
    "version": "v1779285559",
    "publicPath": "hs-global/furniture/etsy/HSMBTGE7/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-133",
    "version": "v1783517107",
    "publicPath": "hs-global/furniture/etsy/HSMBTBL2/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-134",
    "version": "v1779285557",
    "publicPath": "hs-global/furniture/etsy/HSMBTBL6/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-135",
    "version": "v1778264521",
    "publicPath": "hs-global/furniture/etsy/HSMBTWH5/5",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-136",
    "version": "v1779285574",
    "publicPath": "hs-global/furniture/etsy/HSMBTWH8/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-137",
    "version": "v1779285475",
    "publicPath": "hs-global/furniture/etsy/HSMBTBE1/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-138",
    "version": "v1779285591",
    "publicPath": "hs-global/furniture/etsy/HSMBTWH9/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-139",
    "version": "v1778265123",
    "publicPath": "hs-global/furniture/etsy/HSMSBE11/Gemini_Generated_Image_3qp8ms3qp8ms3qp8",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-140",
    "version": "v1778265259",
    "publicPath": "hs-global/furniture/etsy/HSMSBL25/Gemini_Generated_Image_tautehtautehtaut",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-141",
    "version": "v1778265133",
    "publicPath": "hs-global/furniture/etsy/HSMSWH12/Gemini_Generated_Image_ndtiwondtiwondti",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-142",
    "version": "v1778265248",
    "publicPath": "hs-global/furniture/etsy/HSMSWH24/Gemini_Generated_Image_mchl4qmchl4qmchl",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-143",
    "version": "v1783587963",
    "publicPath": "hs-global/furniture/etsy/HSMSWH18/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-144",
    "version": "v1778265201",
    "publicPath": "hs-global/furniture/etsy/HSMSWH20/Gemini_Generated_Image_ojgsjiojgsjiojgs",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-145",
    "version": "v1783587503",
    "publicPath": "hs-global/furniture/etsy/HSMSGR38/5",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-146",
    "version": "v1778265178",
    "publicPath": "hs-global/furniture/etsy/HSMSGR19/Gemini_Generated_Image_5a8835a8835a8835",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-147",
    "version": "v1783587942",
    "publicPath": "hs-global/furniture/etsy/HSMSGR13/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-148",
    "version": "v1778265160",
    "publicPath": "hs-global/furniture/etsy/HSMSGR16/Gemini_Generated_Image_rokd0frokd0frokd",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-149",
    "version": "v1783587957",
    "publicPath": "hs-global/furniture/etsy/HSMSBE15/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-150",
    "version": "v1779285459",
    "publicPath": "hs-global/furniture/etsy/HSMSPI4/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-151",
    "version": "v1784814510",
    "publicPath": "hs-global/products/furniture/Sink/file_dwrggl",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-152",
    "version": "v1779285465",
    "publicPath": "hs-global/furniture/etsy/HSMSWH5/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-153",
    "version": "v1779285513",
    "publicPath": "hs-global/furniture/etsy/HSMSWH7/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-154",
    "version": "v1779285444",
    "publicPath": "hs-global/furniture/etsy/HSMSPI1/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-155",
    "version": "v1779285449",
    "publicPath": "hs-global/furniture/etsy/HSMSPIWH2/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-156",
    "version": "v1779285467",
    "publicPath": "hs-global/furniture/etsy/HSMSWH6/4",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-157",
    "version": "v1779285583",
    "publicPath": "hs-global/furniture/etsy/HSMSRE8/4",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-158",
    "version": "v1778265225",
    "publicPath": "hs-global/furniture/etsy/HSMSWH22/Gemini_Generated_Image_c9fz9ac9fz9ac9fz",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-159",
    "version": "v1778265169",
    "publicPath": "hs-global/furniture/etsy/HSMSWH17/IMG-20250116-WA0041",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-160",
    "version": "v1783587858",
    "publicPath": "hs-global/furniture/etsy/HSMSWHBR10/4",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-161",
    "version": "v1778265220",
    "publicPath": "hs-global/furniture/etsy/HSMSWHBL21/Gemini_Generated_Image_ujl1w6ujl1w6ujl1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-162",
    "version": "v1784814643",
    "publicPath": "hs-global/products/furniture/Sink/file_kbdvlm",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-163",
    "version": "v1778265243",
    "publicPath": "hs-global/furniture/etsy/HSMSWH23/Gemini_Generated_Image_8ufa6x8ufa6x8ufa",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-164",
    "version": "v1784431944",
    "publicPath": "hs-global/products/furniture/Sink/file_fcppqp",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-165",
    "version": "v1784814384",
    "publicPath": "hs-global/products/furniture/Sink/file_fbasmf",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-166",
    "version": "v1783587807",
    "publicPath": "hs-global/furniture/etsy/HSMSBE39/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-167",
    "version": "v1783587391",
    "publicPath": "hs-global/furniture/etsy/HSMPSBL26/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-168",
    "version": "v1783587708",
    "publicPath": "hs-global/furniture/etsy/HSMPSWH24/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-169",
    "version": "v1783587725",
    "publicPath": "hs-global/furniture/etsy/HSMPSBE22/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-170",
    "version": "v1783588001",
    "publicPath": "hs-global/furniture/etsy/HSMPSWH25/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-171",
    "version": "v1783587794",
    "publicPath": "hs-global/furniture/etsy/HSMPSGR8/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-172",
    "version": "v1778265197",
    "publicPath": "hs-global/furniture/etsy/HSMPSGE13/Gemini_Generated_Image_cotgl2cotgl2cotg",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-173",
    "version": "v1779285326",
    "publicPath": "hs-global/furniture/etsy/HSMPSBL5/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-174",
    "version": "v1779285309",
    "publicPath": "hs-global/furniture/etsy/HSMPSWH2/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-175",
    "version": "v1783587329",
    "publicPath": "hs-global/furniture/etsy/HSMPSWH23/5",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-176",
    "version": "v1779285320",
    "publicPath": "hs-global/furniture/etsy/HSMPSWHPU4/3",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-177",
    "version": "v1779285291",
    "publicPath": "hs-global/furniture/etsy/HSMPSBE1/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-178",
    "version": "v1779285407",
    "publicPath": "hs-global/furniture/etsy/HSMPSWHBL6/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-179",
    "version": "v1784876844",
    "publicPath": "hs-global/products/furniture/Pedestal Sink/file_zjmm2e",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-180",
    "version": "v1783587666",
    "publicPath": "hs-global/furniture/etsy/HSMSRE35/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-181",
    "version": "v1784876660",
    "publicPath": "hs-global/products/furniture/Pedestal Sink/file_zzbywe",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-182",
    "version": "v1778265111",
    "publicPath": "hs-global/furniture/etsy/HSMPSWH12/Gemini_Generated_Image_hxouzwhxouzwhxou",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-183",
    "version": "v1778264766",
    "publicPath": "hs-global/furniture/etsy/HSMPSWH7/IMG-20250116-WA0039",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-184",
    "version": "v1778264789",
    "publicPath": "hs-global/furniture/etsy/HSMPSWH10/Gemini_Generated_Image_ocxk3zocxk3zocxk",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-185",
    "version": "v1784876507",
    "publicPath": "hs-global/products/furniture/Pedestal Sink/file_nfozxd",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-186",
    "version": "v1778264797",
    "publicPath": "hs-global/furniture/etsy/HSMPSWH11/Gemini_Generated_Image_mspynwmspynwmspy",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-187",
    "version": "v1783517258",
    "publicPath": "hs-global/furniture/etsy/HSMLABR7/de1ab4b0-fe24-4cb0-8990-40840706226c",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-188",
    "version": "v1779285508",
    "publicPath": "hs-global/furniture/etsy/HSMLAWH3/4",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-189",
    "version": "v1783517231",
    "publicPath": "hs-global/furniture/etsy/HSMLAWH4/a3b3ce39-49a2-4064-aea2-aecf551bd88e",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-190",
    "version": "v1779285398",
    "publicPath": "hs-global/furniture/etsy/HSMLABE2/1",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-191",
    "version": "v1779285393",
    "publicPath": "hs-global/furniture/etsy/HSMLAMU1/4",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-192",
    "version": "v1779286776",
    "publicPath": "hs-global/furniture/etsy/HSMLABR8/2ded8586-6de9-4a97-ae42-504586a3a4fe",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-193",
    "version": "v1779286628",
    "publicPath": "hs-global/furniture/etsy/HSMLABE6/b1a574d9-2851-434c-b884-0d224d74bafe",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-194",
    "version": "v1783517241",
    "publicPath": "hs-global/furniture/etsy/HSMLAWH5/440e8d90-a4e5-489f-ab6a-d8f77d0a2853",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-195",
    "version": "v1779285525",
    "publicPath": "hs-global/furniture/etsy/HSMMFPI1/5",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-196",
    "version": "v1779285608",
    "publicPath": "hs-global/furniture/etsy/HSMMFWH2/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-197",
    "version": "v1779285410",
    "publicPath": "hs-global/furniture/etsy/HSMVAWH1/2",
    "ext": "webp"
  },
  {
    "sku": "HSG-MBL-198",
    "version": "v1779285540",
    "publicPath": "hs-global/furniture/etsy/HSMCCGR1/1",
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

print("\n\n✅ All done! Download /content/results-marble.json")

# ============================================================
# CELL 5 — Download results.json
# ============================================================
# from google.colab import files
# files.download('/content/results-marble.json')
