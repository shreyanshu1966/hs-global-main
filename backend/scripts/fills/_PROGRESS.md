# Spec-fill progress tracker

Target file: `backend/scripts/product-specs.json` (312 products). Fills applied via
`apply-fills.js` (blanks only) / `apply-fills-fu.js` (resolves fu-### via `_furniture-worklist.json`).

## Done
- semi-precious-stone (69): pre-filled in DB, untouched.
- wooden-furniture (15): ✅ images → `fills/wooden-furniture.json`
- leather (27): ✅ images → `fills/leather-1..4.json` (+3b)
- Business defaults on furniture/wooden/leather (243): ✅ `apply-defaults.js`
  (custom_product=Yes, imported=Yes, wayfair_verified=Yes, product_warranty=Manufacturer Warranty,
   assembly No/beds+dining Yes, warranty_length BLANK, customSpec Refund Window=15 Days)
- furniture visual fills: chunks 1–2 done (fu-001..016) → `fills/furniture-1.json`, `furniture-2.json`

## Remaining
- furniture visual fills fu-017..099 (worklist `fills/_furniture-worklist.json`, images in scratchpad `img/fu-###.webp`)
  Subcategories left: Console Table, Mirror Frame, Pedestal Sink, Side Table, Sink (all marble/stone).

## Conventions for marble/stone furniture
- material="Natural [Color] Marble" / "Natural Travertine Stone"; wood_species="Not Applicable";
  natural_variation_type="Natural Marble Veining" (or Travertine Texture & Veining);
  mixed_materials="No" unless glass/metal/wood present; base_type describes legs (Sphere/Pedestal/Slab/etc).
- Fill only observed fields; leave dimensions/weight/weight_capacity blank.

## Next step
`node scripts/apply-fills-fu.js --fills=scripts/fills/furniture-3.json` after building it from fu-017..024 images.
