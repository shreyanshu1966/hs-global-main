import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, ChevronDown, Tag } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SimpleSpec {
  label: string;
  value: string;
}

export interface ProductSpecifications {
  other_dimensions: {
    overall_dimensions: string;
    overall_product_weight: string;
  };
  details: {
    table_top_shape: string;
    top_material: string;
    base_material: string;
    natural_variation_type: string;
    seating_capacity: string;
    table_base_type: string;
    custom_product: string;
    imported: string;
    weight_capacity: string;
    base_shape: string;
    base_color: string;
    top_color: string;
    wood_species: string;
    wayfair_verified: string;
    mixed_materials: string;
    detailing: string;
    material: string;
    base_type: string;
    overall_shape: string;
  };
  assembly: {
    assembly_required: string;
  };
  warranty: {
    product_warranty: string;
    warranty_length: string;
    warranty_details: string;
  };
}

const EMPTY_SPECS: ProductSpecifications = {
  other_dimensions: { overall_dimensions: '', overall_product_weight: '' },
  details: {
    table_top_shape: '', top_material: '', base_material: '',
    natural_variation_type: '', seating_capacity: '', table_base_type: '',
    custom_product: '', imported: '', weight_capacity: '', base_shape: '',
    base_color: '', top_color: '', wood_species: '', wayfair_verified: '',
    mixed_materials: '', detailing: '', material: '', base_type: '', overall_shape: '',
  },
  assembly: { assembly_required: '' },
  warranty: { product_warranty: '', warranty_length: '', warranty_details: '' },
};

interface ProductSpecsEditorProps {
  category: string;
  productSpecifications?: ProductSpecifications;
  customSpecs?: SimpleSpec[];
  onSpecsChange: (productSpecifications: ProductSpecifications, customSpecs: SimpleSpec[]) => void;
}

// ─── Field definitions ─────────────────────────────────────────────────────────

type FieldDef = {
  key: string;
  label: string;
  type: 'text' | 'select' | 'textarea';
  options?: string[];
};

const OTHER_DIMENSION_FIELDS: FieldDef[] = [
  { key: 'overall_dimensions',    label: 'Overall Dimensions',    type: 'text' },
  { key: 'overall_product_weight', label: 'Overall Product Weight', type: 'text' },
];

const DETAIL_FIELDS: FieldDef[] = [
  { key: 'overall_shape',         label: 'Overall Shape',         type: 'select', options: ['Round', 'Square', 'Rectangle', 'Oval', 'L-shaped', 'Irregular', 'Custom'] },
  { key: 'material',              label: 'Material',              type: 'text' },
  { key: 'top_material',          label: 'Top Material',          type: 'text' },
  { key: 'base_material',         label: 'Base Material',         type: 'text' },
  { key: 'table_top_shape',       label: 'Table Top Shape',       type: 'select', options: ['Round', 'Square', 'Rectangle', 'Oval', 'Irregular', 'Custom'] },
  { key: 'base_shape',            label: 'Base Shape',            type: 'select', options: ['Round', 'Square', 'Rectangle', 'X-base', 'Pedestal', 'Custom'] },
  { key: 'table_base_type',       label: 'Table Base Type',       type: 'select', options: ['Pedestal', 'Trestle', '4-Leg', 'X-Base', 'Hairpin', 'Custom'] },
  { key: 'base_type',             label: 'Base Type',             type: 'text' },
  { key: 'top_color',             label: 'Top Color',             type: 'text' },
  { key: 'base_color',            label: 'Base Color',            type: 'text' },
  { key: 'wood_species',          label: 'Wood Species',          type: 'text' },
  { key: 'natural_variation_type', label: 'Natural Variation Type', type: 'text' },
  { key: 'detailing',             label: 'Detailing',             type: 'text' },
  { key: 'mixed_materials',       label: 'Mixed Materials',       type: 'select', options: ['Yes', 'No'] },
  { key: 'seating_capacity',      label: 'Seating Capacity',      type: 'text' },
  { key: 'weight_capacity',       label: 'Weight Capacity',       type: 'text' },
  { key: 'custom_product',        label: 'Custom Product',        type: 'select', options: ['Yes', 'No'] },
  { key: 'imported',              label: 'Imported',              type: 'select', options: ['Yes', 'No'] },
  { key: 'wayfair_verified',      label: 'Wayfair Verified',      type: 'select', options: ['Yes', 'No'] },
];

const ASSEMBLY_FIELDS: FieldDef[] = [
  { key: 'assembly_required', label: 'Assembly Required', type: 'select', options: ['Yes', 'No'] },
];

const WARRANTY_FIELDS: FieldDef[] = [
  { key: 'product_warranty', label: 'Product Warranty',  type: 'select', options: ['Manufacturer Warranty', 'Limited Warranty', 'No Warranty'] },
  { key: 'warranty_length',  label: 'Warranty Length',   type: 'text' },
  { key: 'warranty_details', label: 'Warranty Details',  type: 'textarea' },
];

// ─── Field renderer ───────────────────────────────────────────────────────────

function SectionField({
  field, value, onChange,
}: { field: FieldDef; value: string; onChange: (v: string) => void }) {
  const base = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
      {field.type === 'select' ? (
        <select value={value} onChange={e => onChange(e.target.value)} className={base}>
          <option value="">Select {field.label}</option>
          {field.options!.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={2}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          className={`${base} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          className={base}
        />
      )}
    </div>
  );
}

// ─── Section block ─────────────────────────────────────────────────────────────

function SpecSection({
  title, color, fields, sectionData, onSectionChange,
}: {
  title: string;
  color: string;
  fields: FieldDef[];
  sectionData: Record<string, string>;
  onSectionChange: (key: string, value: string) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className={`w-1.5 h-4 ${color} rounded-full inline-block`} />
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map(f => (
          <SectionField
            key={f.key}
            field={f}
            value={sectionData[f.key] || ''}
            onChange={v => onSectionChange(f.key, v)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const ProductSpecsEditor: React.FC<ProductSpecsEditorProps> = ({
  category,
  productSpecifications,
  customSpecs = [],
  onSpecsChange,
}) => {
  const normalise = (specs: any[]): SimpleSpec[] =>
    specs.map(s => ({ label: s.label || '', value: s.value || '' }));

  const [localSpecs, setLocalSpecs] = useState<ProductSpecifications>(
    productSpecifications ?? EMPTY_SPECS
  );
  const [rows, setRows] = useState<SimpleSpec[]>(normalise(customSpecs));

  const [savedKeys, setSavedKeys] = useState<string[]>([]);
  const [keyMode, setKeyMode] = useState<('pick' | 'type')[]>(() => normalise(customSpecs).map(() => 'pick'));

  const rowsRef = useRef<SimpleSpec[]>(rows);
  rowsRef.current = rows;

  useEffect(() => {
    fetch(`${API_URL}/spec-keys`)
      .then(r => r.json())
      .then(d => { if (d.ok) setSavedKeys(d.keys.map((k: any) => k.label)); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setKeyMode(rowsRef.current.map(row =>
      (row.label === '' || savedKeys.includes(row.label)) ? 'pick' : 'type'
    ));
  }, [savedKeys]);

  useEffect(() => {
    setLocalSpecs(productSpecifications ?? EMPTY_SPECS);
  }, [productSpecifications]);

  useEffect(() => {
    const n = normalise(customSpecs);
    setRows(n);
    setKeyMode(n.map(() => 'pick'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customSpecs]);

  // ── Section change helpers ──────────────────────────────────────────────────

  const handleSectionChange = (
    section: keyof ProductSpecifications,
    key: string,
    value: string
  ) => {
    const updated: ProductSpecifications = {
      ...localSpecs,
      [section]: { ...(localSpecs[section] as any), [key]: value },
    };
    setLocalSpecs(updated);
    onSpecsChange(updated, rows);
  };

  // ── Custom spec helpers ─────────────────────────────────────────────────────

  const notify = (nextRows: SimpleSpec[]) => onSpecsChange(localSpecs, nextRows);

  const addRow = () => {
    const next = [...rows, { label: '', value: '' }];
    setRows(next);
    setKeyMode(prev => [...prev, 'pick']);
    notify(next);
  };

  const updateLabel = (i: number, label: string) => {
    const next = rows.map((r, idx) => idx === i ? { ...r, label } : r);
    setRows(next);
    notify(next);
  };

  const updateValue = (i: number, value: string) => {
    const next = rows.map((r, idx) => idx === i ? { ...r, value } : r);
    setRows(next);
    notify(next);
  };

  const removeRow = (i: number) => {
    const next = rows.filter((_, idx) => idx !== i);
    setKeyMode(prev => prev.filter((_, idx) => idx !== i));
    setRows(next);
    notify(next);
  };

  const setMode = (i: number, mode: 'pick' | 'type') => {
    setKeyMode(prev => prev.map((m, idx) => idx === i ? mode : m));
    if (mode === 'pick') updateLabel(i, '');
  };

  const availableKeys = (rowIndex: number) =>
    savedKeys.filter(k => !rows.some((r, i) => i !== rowIndex && r.label === k));

  const NON_STONE_CATEGORIES = ['furniture', 'handicraft', 'leather'];
  const isNonStone = NON_STONE_CATEGORIES.includes(category);

  return (
    <div className="space-y-8">

      {/* ── Fixed specification sections (non-stone categories) ── */}
      {isNonStone && (
        <>
          <SpecSection
            title="Other Dimensions"
            color="bg-blue-500"
            fields={OTHER_DIMENSION_FIELDS}
            sectionData={localSpecs.other_dimensions as unknown as Record<string, string>}
            onSectionChange={(k, v) => handleSectionChange('other_dimensions', k, v)}
          />

          <SpecSection
            title="Details"
            color="bg-violet-500"
            fields={DETAIL_FIELDS}
            sectionData={localSpecs.details as unknown as Record<string, string>}
            onSectionChange={(k, v) => handleSectionChange('details', k, v)}
          />

          <SpecSection
            title="Assembly"
            color="bg-orange-500"
            fields={ASSEMBLY_FIELDS}
            sectionData={localSpecs.assembly as unknown as Record<string, string>}
            onSectionChange={(k, v) => handleSectionChange('assembly', k, v)}
          />

          <SpecSection
            title="Warranty"
            color="bg-emerald-500"
            fields={WARRANTY_FIELDS}
            sectionData={localSpecs.warranty as unknown as Record<string, string>}
            onSectionChange={(k, v) => handleSectionChange('warranty', k, v)}
          />
        </>
      )}

      {/* ── Custom key:value specifications ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-green-500 rounded-full inline-block" />
            Additional Specifications
            {rows.length > 0 && (
              <span className="ml-1 text-xs font-normal text-gray-400">({rows.filter(r => r.label && r.value).length} filled)</span>
            )}
          </h3>
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Specification
          </button>
        </div>

        {rows.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl py-8 text-center">
            <Tag className="w-7 h-7 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400 font-medium">No additional specifications</p>
            <p className="text-xs text-gray-400 mt-0.5">Click "Add Specification" to add extra key:value pairs</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-3 px-3 pb-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Specification Key</span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Value</span>
              <span />
            </div>

            {rows.map((row, i) => {
              const mode = keyMode[i] ?? 'pick';
              const avail = availableKeys(i);

              return (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-start bg-gray-50 rounded-xl px-3 py-3 border border-gray-100">
                  <div>
                    {mode === 'pick' ? (
                      <div className="relative">
                        <select
                          value={row.label}
                          onChange={e => {
                            if (e.target.value === '__new__') {
                              setMode(i, 'type');
                            } else {
                              updateLabel(i, e.target.value);
                            }
                          }}
                          className="w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                        >
                          <option value="">— pick a key —</option>
                          {avail.map(k => (
                            <option key={k} value={k}>{k}</option>
                          ))}
                          <option value="__new__">＋ New key…</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={row.label}
                          onChange={e => updateLabel(i, e.target.value)}
                          placeholder="e.g. Finish, Thickness…"
                          autoFocus
                          className="w-full px-3 py-2 text-sm border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {savedKeys.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setMode(i, 'pick')}
                            className="text-[10px] text-blue-500 hover:underline"
                          >
                            ← Pick from saved keys
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <input
                    type="text"
                    value={row.value}
                    onChange={e => updateValue(i, e.target.value)}
                    placeholder="Enter value…"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="mt-0.5 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {rows.some(r => r.label && r.value) && (
          <div className="mt-4 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-green-600 mb-2">Preview (filled only)</p>
            <div className="space-y-1">
              {rows.filter(r => r.label && r.value).map((r, i) => (
                <div key={i} className="flex justify-between text-xs text-green-900">
                  <span className="font-medium">{r.label}</span>
                  <span>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSpecsEditor;
