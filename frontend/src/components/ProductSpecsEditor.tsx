import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, ChevronDown, Tag } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FurnitureSpecs {
  product?: string;
  type?: string;
  shape?: string;
  material?: string;
  size?: string;
  surfaceFinish?: string;
  delivery?: string;
  height?: string;
  colorName?: string;
  packagingDetails?: string;
  location?: string;
}

export interface SimpleSpec {
  label: string;
  value: string;
}

interface ProductSpecsEditorProps {
  category: string;
  furnitureSpecs?: FurnitureSpecs;
  customSpecs?: SimpleSpec[];
  onSpecsChange: (furnitureSpecs: FurnitureSpecs, customSpecs: SimpleSpec[]) => void;
}

// ─── Furniture predefined fields (unchanged) ──────────────────────────────────

const FURNITURE_FIELDS: { key: keyof FurnitureSpecs; label: string; type: 'text' | 'select' | 'textarea'; options?: string[] }[] = [
  { key: 'type',           label: 'Furniture Type',    type: 'select',   options: ['Table', 'Chair', 'Cabinet', 'Wash Basin', 'Sculpture', 'Bench', 'Planter', 'Fountain', 'Fireplace', 'Column', 'Urn', 'Decorative', 'Other'] },
  { key: 'shape',          label: 'Shape',             type: 'select',   options: ['Round', 'Square', 'Rectangle', 'Oval', 'Irregular', 'Freeform', 'Custom'] },
  { key: 'material',       label: 'Material',          type: 'select',   options: ['Marble', 'Granite', 'Quartzite', 'Onyx', 'Limestone', 'Travertine', 'Wood', 'Metal', 'Glass', 'Stone', 'Composite'] },
  { key: 'size',           label: 'Size / Dimensions', type: 'text' },
  { key: 'surfaceFinish',  label: 'Surface Finish',    type: 'select',   options: ['Polished', 'Honed', 'Brushed', 'Antique', 'Natural', 'Matte', 'Custom'] },
  { key: 'colorName',      label: 'Color / Pattern',   type: 'text' },
  { key: 'height',         label: 'Height',            type: 'text' },
  { key: 'location',       label: 'Origin / Location', type: 'text' },
  { key: 'packagingDetails', label: 'Packaging Details', type: 'textarea' },
];

// ─── Main component ───────────────────────────────────────────────────────────

const ProductSpecsEditor: React.FC<ProductSpecsEditorProps> = ({
  category,
  furnitureSpecs = {},
  customSpecs = [],
  onSpecsChange,
}) => {
  // Normalise incoming customSpecs (may still have old schema shape)
  const normalise = (specs: any[]): SimpleSpec[] =>
    specs.map(s => ({ label: s.label || '', value: s.value || '' }));

  const [localFurniture, setLocalFurniture] = useState<FurnitureSpecs>(furnitureSpecs);
  const [rows, setRows] = useState<SimpleSpec[]>(normalise(customSpecs));

  // Shared key pool
  const [savedKeys, setSavedKeys] = useState<string[]>([]);
  // Per-row: 'pick' = dropdown, 'type' = free-text new-key input
  const [keyMode, setKeyMode] = useState<('pick' | 'type')[]>(() => normalise(customSpecs).map(() => 'pick'));

  // Always-fresh ref so savedKeys effect can read rows without a stale closure
  const rowsRef = useRef<SimpleSpec[]>(rows);
  rowsRef.current = rows;

  useEffect(() => {
    fetch(`${API_URL}/spec-keys`)
      .then(r => r.json())
      .then(d => { if (d.ok) setSavedKeys(d.keys.map((k: any) => k.label)); })
      .catch(err => console.warn('Failed to load spec keys:', err));
  }, []);

  // When saved-key pool loads (or updates), re-evaluate keyMode:
  // - label is empty OR in the pool → 'pick' (show dropdown, correct value pre-selected)
  // - label exists but NOT in pool → 'type' (show text input so the custom label is visible)
  useEffect(() => {
    setKeyMode(rowsRef.current.map((row) =>
      (row.label === '' || savedKeys.includes(row.label)) ? 'pick' : 'type'
    ));
  }, [savedKeys]);

  // Sync when parent re-initialises (e.g. edit page loads existing product)
  useEffect(() => { setLocalFurniture(furnitureSpecs); }, [furnitureSpecs]);
  useEffect(() => {
    const n = normalise(customSpecs);
    setRows(n);
    // Reset all to 'pick'; the savedKeys effect above will correct custom labels
    setKeyMode(n.map(() => 'pick'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customSpecs]);

  // ── Furniture helpers ───────────────────────────────────────────────────────
  const handleFurnitureChange = (key: keyof FurnitureSpecs, value: string) => {
    const updated = { ...localFurniture, [key]: value };
    setLocalFurniture(updated);
    onSpecsChange(updated, rows);
  };

  // ── Custom spec helpers ─────────────────────────────────────────────────────
  const notify = (nextRows: SimpleSpec[]) => onSpecsChange(localFurniture, nextRows);

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

  // Keys not yet used in another row (avoids duplicate keys)
  const availableKeys = (rowIndex: number) =>
    savedKeys.filter(k => !rows.some((r, i) => i !== rowIndex && r.label === k));

  return (
    <div className="space-y-8">

      {/* ── Furniture specs (only for furniture category) ── */}
      {category === 'furniture' && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-500 rounded-full inline-block" />
            Furniture Specifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FURNITURE_FIELDS.map(({ key, label, type, options }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                {type === 'select' ? (
                  <select
                    value={localFurniture[key] || ''}
                    onChange={e => handleFurnitureChange(key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select {label}</option>
                    {options!.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : type === 'textarea' ? (
                  <textarea
                    value={localFurniture[key] || ''}
                    onChange={e => handleFurnitureChange(key, e.target.value)}
                    rows={2}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={localFurniture[key] || ''}
                    onChange={e => handleFurnitureChange(key, e.target.value)}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Custom key:value specifications ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-green-500 rounded-full inline-block" />
            Specifications
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
          <div className="border-2 border-dashed border-gray-200 rounded-xl py-10 text-center">
            <Tag className="w-7 h-7 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400 font-medium">No specifications yet</p>
            <p className="text-xs text-gray-400 mt-0.5">Click "Add Specification" to add key:value pairs</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Table header */}
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
                  {/* Key column */}
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

                  {/* Value column */}
                  <input
                    type="text"
                    value={row.value}
                    onChange={e => updateValue(i, e.target.value)}
                    placeholder="Enter value…"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  {/* Delete */}
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

        {/* Filled summary */}
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
