'use client';
import React from 'react';
import { Truck, Wrench, FileText, Ruler, Settings, ShieldCheck, Tag as TagIcon } from 'lucide-react';

interface ProductSpecificationsProps {
  product: any;
}

function formatKey(raw: string): string {
  return raw
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

// ── Description renderer ──────────────────────────────────────────────────────
function DescriptionBody({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  return (
    <div className="space-y-3">
      {paragraphs.map((para, i) => {
        const lines = para.split(/\n/).map((l, li) => (
          <React.Fragment key={li}>{li > 0 && <br />}{l}</React.Fragment>
        ));
        return <p key={i} className="text-[13.5px] text-[#444] leading-[1.75]">{lines}</p>;
      })}
    </div>
  );
}

// ── Grid spec card (for sections with many items: Details) ─────────────────────
function SpecGrid({
  title, icon, rows,
}: {
  title: string;
  icon: React.ReactNode;
  rows: [string, string][];
}) {
  if (!rows.length) return null;
  return (
    <div className="rounded-xl border border-[#e8e8e4] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f5f4ef] border-b border-[#e8e8e4]">
        <span className="text-[#888]">{icon}</span>
        <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#777]">{title}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-[#efefeb] bg-white">
        {rows.map(([label, value]) => (
          <div key={label} className="px-3.5 py-3">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#aaa] mb-0.5 truncate">{label}</p>
            <p className="text-[12.5px] text-[#1a1a1a] font-medium leading-snug">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Row spec card (for short sections: Dimensions, Assembly, Warranty, Identity) ─
function SpecList({
  title, icon, rows,
}: {
  title: string;
  icon: React.ReactNode;
  rows: [string, string][];
}) {
  if (!rows.length) return null;
  return (
    <div className="rounded-xl border border-[#e8e8e4] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f5f4ef] border-b border-[#e8e8e4]">
        <span className="text-[#888]">{icon}</span>
        <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#777]">{title}</span>
      </div>
      <div className="divide-y divide-[#f0f0ec] bg-white">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 px-4 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#999] shrink-0 pt-px">{label}</span>
            <span className="text-[12.5px] text-[#1a1a1a] text-right leading-snug">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab button ────────────────────────────────────────────────────────────────
type Tab = 'details' | 'custom' | 'shipping';

function TabBtn({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void;
  icon: React.ReactNode; label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] rounded-full transition-all ${
        active ? 'bg-[#111] text-white' : 'text-[#888] hover:text-[#111] hover:bg-[#f3f3f3]'
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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false);

  const description = (product.description || '').trim();
  const tags: string[] = (product.tags || []).filter(Boolean);

  // ── Data preparation ─────────────────────────────────────────────────────

  const SKIP_SPEC_KEYS = new Set(['etsyUrl', '_id', '__v']);
  const furnitureRows: [string, string][] = Object.entries(product.specs || {})
    .filter(([k, v]) => v && !SKIP_SPEC_KEYS.has(k))
    .map(([k, v]) => [formatKey(k), String(v)]);

  const customSpecRows: [string, string][] = (product.customSpecs || [])
    .filter((s: any) => s.value)
    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
    .map((s: any) => [s.label || formatKey(s.key), String(s.value)]);

  const dims = product.dimensions;
  const dimRows: [string, string][] = [
    dims?.length ? ['Length', `${dims.length} ${dims.unit || 'cm'}`] : null,
    dims?.width  ? ['Width',  `${dims.width} ${dims.unit || 'cm'}`]  : null,
    dims?.height ? ['Height', `${dims.height} ${dims.unit || 'cm'}`] : null,
    product.weight ? ['Weight', `${product.weight} kg`] : null,
  ].filter(Boolean) as [string, string][];

  const identityRows: [string, string][] = [
    product.productCode ? ['SKU', product.productCode] : null,
    product.productId   ? ['Reference', product.productId] : null,
    product.category    ? ['Category', formatKey(product.category)] : null,
    product.subcategory ? ['Type', formatKey(product.subcategory)] : null,
    ['Availability', product.available ? 'In Stock' : 'Out of Stock'],
  ].filter(Boolean) as [string, string][];

  const mfg = product.manufacturing || {};
  const mfgRows: [string, string][] = [
    mfg.countryOfOrigin ? ['Origin', mfg.countryOfOrigin] : null,
    mfg.leadTime        ? ['Lead Time', mfg.leadTime] : null,
    typeof mfg.minimumOrder === 'number' && mfg.minimumOrder > 1
      ? ['Min. Order', `${mfg.minimumOrder} units`] : null,
    mfg.isCustomMade !== undefined
      ? ['Custom Made', mfg.isCustomMade ? 'Yes' : 'No'] : null,
  ].filter(Boolean) as [string, string][];

  // Stone specs
  const STONE_SPEC_LABELS: Record<string, string> = {
    minSlabSize: 'Min Slab Size', maxSlabSize: 'Max Slab Size',
    thickness: 'Thickness', surfaceFinish: 'Surface Finish',
    form: 'Form', material: 'Material', usage: 'Usage',
    moh: 'MOH', refractiveIndex: 'Refractive Index',
    waterAbsorption: 'Water Absorption', priceRange: 'Price Range',
  };
  const stoneSpecs = product.stoneSpecs || {};
  const stoneSpecRows: [string, string][] = Object.entries(STONE_SPEC_LABELS)
    .filter(([key]) => stoneSpecs[key])
    .map(([key, label]) => [label, String(stoneSpecs[key])]);

  const isSemiPreciousStone = product.category === 'semi-precious-stone';

  // Fixed product spec sections
  const ps = product.productSpecifications || {};

  // Furniture is predominantly marble/stone, so its species field reads as
  // "Marble / Stone Species"; wood-based categories keep "Wood Species".
  const speciesLabel = product.category === 'furniture' ? 'Marble / Stone Species' : 'Wood Species';

  const DETAIL_LABELS: [string, string][] = [
    ['overall_shape', 'Overall Shape'], ['material', 'Material'],
    ['base_type', 'Base Type'],
    ['top_color', 'Color'],
    ['wood_species', speciesLabel], ['natural_variation_type', 'Natural Variation'],
    ['detailing', 'Detailing'], ['mixed_materials', 'Mixed Materials'],
    // ['weight_capacity', 'Weight Capacity'], // removed for now
    ['custom_product', 'Custom Product'], ['imported', 'Imported'],
    ['wayfair_verified', 'Eligible for Refund'],
  ];

  const psDetailRows: [string, string][] = DETAIL_LABELS
    .filter(([k]) => (ps.details || {})[k])
    .map(([k, label]) => [label, String(ps.details[k])]);

  const psDimensionRows: [string, string][] = [
    ps.other_dimensions?.overall_dimensions     ? ['Overall Dimensions',    ps.other_dimensions.overall_dimensions]     : null,
    // ps.other_dimensions?.overall_product_weight ? ['Overall Product Weight', ps.other_dimensions.overall_product_weight] : null, // removed for now
    ...dimRows,
  ].filter(Boolean) as [string, string][];

  const psAssemblyRows: [string, string][] = ps.assembly?.assembly_required
    ? [['Assembly Required', ps.assembly.assembly_required]] : [];

  const psWarrantyRows: [string, string][] = [
    ps.warranty?.product_warranty ? ['Product Warranty', ps.warranty.product_warranty] : null,
    ps.warranty?.warranty_length  ? ['Warranty Length',  ps.warranty.warranty_length]  : null,
  ].filter(Boolean) as [string, string][];

  const allAdditionalRows = [...furnitureRows, ...customSpecRows];

  // Shipping / returns / customisation
  const ship = product.shipping || {};
  const shippingRows: [string, string][] = [
    ['Ships From', 'Ahmedabad, India'],
    ship.shippingClass  ? ['Shipping Class', formatKey(ship.shippingClass)] : null,
    ship.handlingTime   ? ['Handling Time',  ship.handlingTime] : null,
    ['Worldwide',   ship.shipsWorldwide === false ? 'Selected countries only' : 'Yes'],
    ['Incoterms',   'FOB & CIF available'],
    ['Insurance',   'Marine transit insurance included'],
    ['Packaging',   'ISPM-15 certified wooden crates with foam'],
  ].filter(Boolean) as [string, string][];

  const returnRows: [string, string][] = [
    ['Inspection Window', '30 days from port clearance'],
    ['Claim Types',       'Structural defects, transit damage, spec mismatch'],
    ['Resolution',        'Priority replacement or proportional refund'],
    ['Pre-shipment',      'HD photos & video approval before dispatch'],
  ];

  const customizationRows: [string, string][] = [
    mfg.leadTime ? ['Lead Time', mfg.leadTime] : ['Lead Time', '3–6 weeks typical'],
    typeof mfg.minimumOrder === 'number' && mfg.minimumOrder > 1
      ? ['Min. Order', `${mfg.minimumOrder} units`] : ['Min. Order', 'Contact us'],
    ['Dimensions',    'Custom-cut to architectural specs'],
    ['Finishes',      'High-gloss diamond polish · Matte honed · Leather'],
    ['Colours',       'Subject to quarry availability'],
    ['Certification', 'ISPM-15 compliant packaging'],
  ].filter(Boolean) as [string, string][];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto">

      {/* Heading */}
      <div className="mb-7">
        <p className="text-[10.5px] font-semibold tracking-[0.18em] text-[#aaa] uppercase mb-1">Product</p>
        <h2 className="font-serif text-[24px] sm:text-[28px] font-normal text-[#1a1a1a] leading-tight">
          Item Details
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-[#f0f0ec] pb-4">
        <TabBtn active={activeTab === 'details'}  onClick={() => setActiveTab('details')}
          icon={<FileText className="w-3.5 h-3.5" strokeWidth={1.8} />} label="Details" />
        <TabBtn active={activeTab === 'custom'}   onClick={() => setActiveTab('custom')}
          icon={<Wrench className="w-3.5 h-3.5" strokeWidth={1.8} />}   label="Customisation" />
        <TabBtn active={activeTab === 'shipping'} onClick={() => setActiveTab('shipping')}
          icon={<Truck className="w-3.5 h-3.5" strokeWidth={1.8} />}    label="Shipping & Returns" />
      </div>

      {/* ── DETAILS TAB ── */}
      {activeTab === 'details' && (
        <div className="grid lg:grid-cols-[2fr_3fr] gap-8 lg:gap-12">

          {/* Left: description + tags */}
          <div className="space-y-5">
            <div>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#bbb] mb-3">Description</p>
              {description ? (
                <>
                  <div className={!isDescriptionExpanded ? 'line-clamp-4 lg:line-clamp-none' : undefined}>
                    <DescriptionBody text={description} />
                  </div>
                  <button
                    onClick={() => setIsDescriptionExpanded(prev => !prev)}
                    className="lg:hidden mt-2 text-[12px] font-medium text-[#555] underline underline-offset-2"
                  >
                    {isDescriptionExpanded ? 'See less' : 'See more'}
                  </button>
                </>
              ) : (
                <p className="text-[13.5px] text-[#999] italic">No description provided.</p>
              )}
            </div>

            {tags.length > 0 && (
              <div>
                <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#bbb] mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-[#f3f3f0] border border-[#e8e8e4] text-[11px] text-[#555] tracking-wide">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Product identity card — shown below desc on desktop */}
            <div className="hidden lg:block">
              <SpecList
                title="Product Identity"
                icon={<TagIcon className="w-3.5 h-3.5" />}
                rows={identityRows}
              />
            </div>
          </div>

          {/* Right: spec cards */}
          <div className="space-y-3">

            {/* Stone category */}
            {isSemiPreciousStone && (
              <>
                {stoneSpecRows.length > 0 && (
                  <SpecGrid
                    title="Stone Specifications"
                    icon={<Settings className="w-3.5 h-3.5" />}
                    rows={stoneSpecRows}
                  />
                )}
                {customSpecRows.length > 0 && (
                  <SpecGrid
                    title="Additional Specifications"
                    icon={<Settings className="w-3.5 h-3.5" />}
                    rows={customSpecRows}
                  />
                )}
              </>
            )}

            {/* Non-stone: sectioned fixed specs */}
            {!isSemiPreciousStone && (
              <>
                {psDimensionRows.length > 0 && (
                  <SpecGrid
                    title="Dimensions & Weight"
                    icon={<Ruler className="w-3.5 h-3.5" />}
                    rows={psDimensionRows}
                  />
                )}

                {psDetailRows.length > 0 && (
                  <SpecGrid
                    title="Details"
                    icon={<FileText className="w-3.5 h-3.5" />}
                    rows={psDetailRows}
                  />
                )}

                {psAssemblyRows.length > 0 && (
                  <SpecList
                    title="Assembly"
                    icon={<Settings className="w-3.5 h-3.5" />}
                    rows={psAssemblyRows}
                  />
                )}

                {psWarrantyRows.length > 0 && (
                  <SpecList
                    title="Warranty"
                    icon={<ShieldCheck className="w-3.5 h-3.5" />}
                    rows={psWarrantyRows}
                  />
                )}

                {allAdditionalRows.length > 0 && (
                  <SpecGrid
                    title="Additional Specifications"
                    icon={<Settings className="w-3.5 h-3.5" />}
                    rows={allAdditionalRows}
                  />
                )}
              </>
            )}

            {mfgRows.length > 0 && (
              <SpecList
                title="Manufacturing"
                icon={<Settings className="w-3.5 h-3.5" />}
                rows={mfgRows}
              />
            )}

            {/* Product identity on mobile */}
            <div className="lg:hidden">
              <SpecList
                title="Product Identity"
                icon={<TagIcon className="w-3.5 h-3.5" />}
                rows={identityRows}
              />
            </div>
          </div>

        </div>
      )}

      {/* ── CUSTOMISATION TAB ── */}
      {activeTab === 'custom' && (
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#bbb] mb-3">About Custom Orders</p>
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
            <SpecList
              title="Custom Order Details"
              icon={<Wrench className="w-3.5 h-3.5" />}
              rows={customizationRows}
            />
          </div>
        </div>
      )}

      {/* ── SHIPPING & RETURNS TAB ── */}
      {activeTab === 'shipping' && (
        <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
          <SpecList
            title="Shipping"
            icon={<Truck className="w-3.5 h-3.5" />}
            rows={shippingRows}
          />
          <SpecList
            title="Inspection & Returns"
            icon={<ShieldCheck className="w-3.5 h-3.5" />}
            rows={returnRows}
          />
        </div>
      )}

    </div>
  );
}
