import React from 'react';
import { Package, Truck, Wrench, FileText } from 'lucide-react';

interface ProductSpecificationsProps {
  product: any;
}

// ── helpers ──────────────────────────────────────────────────────────────────
function formatKey(raw: string): string {
  return raw
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-6 py-3 border-b border-[#f0f0f0] last:border-b-0">
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#888] shrink-0 pt-px">
        {label}
      </span>
      <span className="text-[13px] text-[#2a2a2a] text-right leading-snug">{value}</span>
    </div>
  );
}

function SpecGroup({ title, rows }: { title: string; rows: [string, string][] }) {
  if (!rows.length) return null;
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#bbb] mb-1 mt-5 first:mt-0">
        {title}
      </p>
      <div className="bg-[#fafafa] rounded-lg px-4">
        {rows.map(([label, value]) => (
          <SpecRow key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  );
}

// Render description text: turn line-breaks into paragraphs, bold **text**
function DescriptionBody({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);

  return (
    <div className="space-y-3">
      {paragraphs.map((para, i) => {
        // single newlines → <br>
        const lines = para.split(/\n/).map((l, li) => (
          <React.Fragment key={li}>
            {li > 0 && <br />}
            {l}
          </React.Fragment>
        ));
        return (
          <p key={i} className="text-[13.5px] text-[#444] leading-[1.75]">
            {lines}
          </p>
        );
      })}
    </div>
  );
}

// ── Tab button ────────────────────────────────────────────────────────────────
type Tab = 'details' | 'custom' | 'shipping';

function TabBtn({
  active, onClick, icon, label,
}: {
  active: boolean; onClick: () => void;
  icon: React.ReactNode; label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] rounded-full transition-all ${
        active
          ? 'bg-[#111] text-white'
          : 'text-[#888] hover:text-[#111] hover:bg-[#f3f3f3]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function ProductSpecifications({ product }: ProductSpecificationsProps) {
  const [activeTab, setActiveTab] = React.useState<Tab>('details');

  const description = (product.description || '').trim();

  // ── Spec groups ──────────────────────────────────────────────────────────
  const SKIP_SPEC_KEYS = new Set(['etsyUrl', '_id', '__v']);

  // Furniture-specific rows (furniture category only)
  const furnitureRows: [string, string][] = Object.entries(product.specs || {})
    .filter(([k, v]) => v && !SKIP_SPEC_KEYS.has(k))
    .map(([k, v]) => [formatKey(k), String(v)]);

  // Custom key:value specs — only entries with a value are shown
  const customSpecRows: [string, string][] = (product.customSpecs || [])
    .filter((s: any) => s.value)
    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
    .map((s: any) => [s.label || formatKey(s.key), String(s.value)]);

  // Dimensions
  const dims = product.dimensions;
  const dimRows: [string, string][] = [];
  if (dims?.length) dimRows.push(['Length', `${dims.length} ${dims.unit || 'cm'}`]);
  if (dims?.width)  dimRows.push(['Width',  `${dims.width} ${dims.unit || 'cm'}`]);
  if (dims?.height) dimRows.push(['Height', `${dims.height} ${dims.unit || 'cm'}`]);
  if (product.weight) dimRows.push(['Weight', `${product.weight} kg`]);

  // Identity rows
  const identityRows: [string, string][] = [
    product.productCode ? ['SKU', product.productCode] : null,
    product.productId   ? ['Reference', product.productId] : null,
    product.category    ? ['Category', product.category] : null,
    product.subcategory ? ['Type', product.subcategory] : null,
    ['Availability', product.available ? 'In Stock' : 'Out of Stock'],
  ].filter(Boolean) as [string, string][];

  // Manufacturing rows
  const mfg = product.manufacturing || {};
  const mfgRows: [string, string][] = [
    mfg.countryOfOrigin ? ['Origin', mfg.countryOfOrigin] : null,
    mfg.leadTime        ? ['Lead Time', mfg.leadTime]     : null,
    typeof mfg.minimumOrder === 'number' && mfg.minimumOrder > 1
      ? ['Min. Order', `${mfg.minimumOrder} units`] : null,
    mfg.isCustomMade !== undefined
      ? ['Custom Made', mfg.isCustomMade ? 'Yes' : 'No'] : null,
  ].filter(Boolean) as [string, string][];

  // Tags
  const tags: string[] = (product.tags || []).filter(Boolean);

  // Semi-precious-stone specific rows
  const STONE_SPEC_LABELS: Record<string, string> = {
    minSlabSize:     'Minimum Slab Size',
    maxSlabSize:     'Maximum Slab Size',
    thickness:       'Thickness',
    surfaceFinish:   'Surface Finish',
    form:            'Form',
    material:        'Material',
    usage:           'Usage',
    moh:             'MOH',
    refractiveIndex: 'Refractive Index',
    waterAbsorption: 'Water Absorption',
    priceRange:      'Price Range',
  };
  const stoneSpecs = product.stoneSpecs || {};
  const stoneSpecRows: [string, string][] = Object.entries(STONE_SPEC_LABELS)
    .filter(([key]) => stoneSpecs[key])
    .map(([key, label]) => [label, String(stoneSpecs[key])]);

  const isSemiPreciousStone = product.category === 'semi-precious-stone';
  const allSpecRows = isSemiPreciousStone
    ? [...stoneSpecRows, ...customSpecRows]
    : [...furnitureRows, ...customSpecRows];

  // Fixed product specifications sections (furniture / handicraft / leather)
  const ps = product.productSpecifications || {};

  const DETAIL_LABELS: [string, string][] = [
    ['overall_shape',         'Overall Shape'],
    ['material',              'Material'],
    ['top_material',          'Top Material'],
    ['base_material',         'Base Material'],
    ['table_top_shape',       'Table Top Shape'],
    ['base_shape',            'Base Shape'],
    ['table_base_type',       'Table Base Type'],
    ['base_type',             'Base Type'],
    ['top_color',             'Top Color'],
    ['base_color',            'Base Color'],
    ['wood_species',          'Wood Species'],
    ['natural_variation_type','Natural Variation Type'],
    ['detailing',             'Detailing'],
    ['mixed_materials',       'Mixed Materials'],
    ['seating_capacity',      'Seating Capacity'],
    ['weight_capacity',       'Weight Capacity'],
    ['custom_product',        'Custom Product'],
    ['imported',              'Imported'],
    ['wayfair_verified',      'Wayfair Verified'],
  ];

  const psDetailRows: [string, string][] = DETAIL_LABELS
    .filter(([k]) => (ps.details || {})[k])
    .map(([k, label]) => [label, String(ps.details[k])]);

  const psDimensionRows: [string, string][] = [
    ps.other_dimensions?.overall_dimensions    ? ['Overall Dimensions',    ps.other_dimensions.overall_dimensions]    : null,
    ps.other_dimensions?.overall_product_weight ? ['Overall Product Weight', ps.other_dimensions.overall_product_weight] : null,
  ].filter(Boolean) as [string, string][];

  const psAssemblyRows: [string, string][] = ps.assembly?.assembly_required
    ? [['Assembly Required', ps.assembly.assembly_required]]
    : [];

  const psWarrantyRows: [string, string][] = [
    ps.warranty?.product_warranty ? ['Product Warranty', ps.warranty.product_warranty] : null,
    ps.warranty?.warranty_length  ? ['Warranty Length',  ps.warranty.warranty_length]  : null,
    ps.warranty?.warranty_details ? ['Warranty Details', ps.warranty.warranty_details] : null,
  ].filter(Boolean) as [string, string][];

  // ── Shipping data ────────────────────────────────────────────────────────
  const ship = product.shipping || {};
  const shippingRows: [string, string][] = [
    ['Ships From', 'Ahmedabad, India'],
    ship.shippingClass
      ? ['Shipping Class', formatKey(ship.shippingClass)] : null,
    ship.handlingTime
      ? ['Handling Time', ship.handlingTime] : null,
    ['Worldwide', ship.shipsWorldwide === false ? 'Selected countries only' : 'Yes'],
    ['Incoterms',  'FOB & CIF available'],
    ['Insurance',  'Marine transit insurance included'],
    ['Packaging',  'ISPM-15 certified wooden crates with foam'],
  ].filter(Boolean) as [string, string][];

  const returnRows: [string, string][] = [
    ['Inspection Window', '30 days from port clearance'],
    ['Claim Types',       'Structural defects, transit damage, spec mismatch'],
    ['Resolution',        'Priority replacement or proportional refund'],
    ['Pre-shipment',      'HD photos & video approval before dispatch'],
  ];

  // ── Customization data ───────────────────────────────────────────────────
  const customizationRows: [string, string][] = [
    mfg.leadTime ? ['Lead Time', mfg.leadTime] : ['Lead Time', '3–6 weeks typical'],
    typeof mfg.minimumOrder === 'number' && mfg.minimumOrder > 1
      ? ['Min. Order', `${mfg.minimumOrder} units`]
      : ['Min. Order', 'Contact us'],
    ['Dimensions',  'Custom-cut to architectural specs'],
    ['Finishes',    'High-gloss diamond polish · Matte honed · Leather'],
    ['Colours',     'Subject to quarry availability'],
    ['Certification', 'ISPM-15 compliant packaging'],
  ].filter(Boolean) as [string, string][];

  return (
    <div className="max-w-6xl mx-auto">

      {/* Section heading */}
      <div className="mb-8">
        <p className="text-[10.5px] font-semibold tracking-[0.18em] text-[#aaa] uppercase mb-1.5">Product</p>
        <h2 className="font-serif text-[26px] sm:text-[30px] font-normal text-[#1a1a1a] leading-tight">
          Item Details
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <TabBtn active={activeTab === 'details'}  onClick={() => setActiveTab('details')}
          icon={<FileText className="w-3.5 h-3.5" strokeWidth={1.8} />} label="Details" />
        <TabBtn active={activeTab === 'custom'}   onClick={() => setActiveTab('custom')}
          icon={<Wrench className="w-3.5 h-3.5" strokeWidth={1.8} />}   label="Customisation" />
        <TabBtn active={activeTab === 'shipping'} onClick={() => setActiveTab('shipping')}
          icon={<Truck className="w-3.5 h-3.5" strokeWidth={1.8} />}    label="Shipping & Returns" />
      </div>

      {/* ── DETAILS TAB ── */}
      {activeTab === 'details' && (
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">

          {/* Left: description */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#bbb] mb-4">Description</p>
            {description
              ? <DescriptionBody text={description} />
              : <p className="text-[13.5px] text-[#999] italic">No description provided.</p>
            }

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-1.5">
                {tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-[#f3f3f3] text-[11px] text-[#666] tracking-wide">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: spec groups */}
          <div>
            {/* Stone category: legacy single group */}
            {isSemiPreciousStone && allSpecRows.length > 0 && (
              <SpecGroup title="Specifications" rows={allSpecRows} />
            )}

            {/* Non-stone: fixed sectioned specs */}
            {!isSemiPreciousStone && (
              <>
                {psDetailRows.length > 0 && (
                  <SpecGroup title="Details" rows={psDetailRows} />
                )}
                {psDimensionRows.length > 0 && (
                  <SpecGroup title="Dimensions & Weight" rows={[...psDimensionRows, ...dimRows]} />
                )}
                {dimRows.length > 0 && psDimensionRows.length === 0 && (
                  <SpecGroup title="Dimensions & Weight" rows={dimRows} />
                )}
                {psAssemblyRows.length > 0 && (
                  <SpecGroup title="Assembly" rows={psAssemblyRows} />
                )}
                {psWarrantyRows.length > 0 && (
                  <SpecGroup title="Warranty" rows={psWarrantyRows} />
                )}
                {/* Legacy furniture specs + custom specs */}
                {(furnitureRows.length > 0 || customSpecRows.length > 0) && (
                  <SpecGroup title="Additional Specifications" rows={[...furnitureRows, ...customSpecRows]} />
                )}
              </>
            )}

            {mfgRows.length > 0 && (
              <SpecGroup title="Manufacturing" rows={mfgRows} />
            )}
            <SpecGroup title="Product Identity" rows={identityRows} />
          </div>

        </div>
      )}

      {/* ── CUSTOMISATION TAB ── */}
      {activeTab === 'custom' && (
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#bbb] mb-4">About Custom Orders</p>
            <div className="space-y-3 text-[13.5px] text-[#444] leading-[1.75]">
              <p>
                We accept custom bulk orders tailored to your architectural specifications — including bespoke
                dimensions, finishes, and material selections from our premium quarry partners.
              </p>
              <p>
                Every custom order is subject to a pre-production approval process: you will receive
                high-resolution material samples, dimensional drawings, and a Proforma Invoice before
                manufacturing begins.
              </p>
              <p>
                Custom orders are produced to the agreed specification and are non-returnable except in
                cases of structural defect or significant dimensional variance.
              </p>
            </div>
          </div>
          <div>
            <SpecGroup title="Custom Order Details" rows={customizationRows} />
          </div>
        </div>
      )}

      {/* ── SHIPPING & RETURNS TAB ── */}
      {activeTab === 'shipping' && (
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <SpecGroup title="Shipping" rows={shippingRows} />
          </div>
          <div>
            <SpecGroup title="Inspection & Returns" rows={returnRows} />
          </div>
        </div>
      )}

    </div>
  );
}
