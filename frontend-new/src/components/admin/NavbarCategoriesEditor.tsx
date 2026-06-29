'use client';
import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  Edit2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import {
  fetchNavbarConfig,
  labelToSlug,
  NavCategoryConfig,
  NavItem,
  NavSection,
  saveNavbarConfig,
} from '../../services/navbarService';

// ---------- Hardcoded defaults (mirrors Header.tsx) ----------
const DEFAULTS: Record<string, NavCategoryConfig> = {
  furniture: {
    categoryId: 'furniture',
    categoryName: 'Marble Furniture',
    sections: [
      {
        id: 'tables-seating',
        title: 'Tables & Seating',
        items: [
          { id: 'center-table', label: 'center table', slug: 'center-table' },
          { id: 'coffee-table', label: 'coffee table', slug: 'coffee-table' },
          { id: 'console-table', label: 'console table', slug: 'console-table' },
          { id: 'dining-table', label: 'dining table', slug: 'dining-table' },
          { id: 'side-table', label: 'side table', slug: 'side-table' },
          { id: 'chaise-chair', label: 'chaise chair', slug: 'chaise-chair' },
        ],
      },
      {
        id: 'bath-basins',
        title: 'Bath & Basins',
        items: [
          { id: 'bathtub', label: 'bathtub', slug: 'bathtub' },
          { id: 'pedestal-sink', label: 'pedestal sink', slug: 'pedestal-sink' },
          { id: 'sink', label: 'sink', slug: 'sink' },
        ],
      },
      {
        id: 'decor-lighting',
        title: 'Decor & Lighting',
        items: [
          { id: 'bowl', label: 'bowl', slug: 'bowl' },
          { id: 'clock', label: 'clock', slug: 'clock' },
          { id: 'lamp', label: 'lamp', slug: 'lamp' },
          { id: 'mirror-frame', label: 'mirror frame', slug: 'mirror-frame' },
          { id: 'tree-sculpture', label: 'tree sculpture', slug: 'tree-sculpture' },
          { id: 'vase', label: 'vase', slug: 'vase' },
        ],
      },
    ],
  },
  'wooden-furniture': {
    categoryId: 'wooden-furniture',
    categoryName: 'Wooden Furniture',
    sections: [
      {
        id: 'wooden-furniture-tables',
        title: 'Wooden Tables',
        items: [
          { id: 'coffee-table', label: 'coffee table', slug: 'coffee-table' },
          { id: 'console-table', label: 'console table', slug: 'console-table' },
          { id: 'dining-table', label: 'dining table', slug: 'dining-table' },
          { id: 'side-table', label: 'side table', slug: 'side-table' },
        ],
      },
      {
        id: 'wooden-furniture-seating',
        title: 'Wooden Seating',
        items: [{ id: 'sofa', label: 'sofa', slug: 'sofa' }],
      },
    ],
  },
  leather: {
    categoryId: 'leather',
    categoryName: 'Leather Furniture',
    sections: [
      {
        id: 'seating',
        title: 'Seating',
        items: [
          { id: 'sofa', label: 'sofa', slug: 'sofa' },
          { id: 'armchair', label: 'armchair', slug: 'armchair' },
          { id: 'ottoman', label: 'ottoman', slug: 'ottoman' },
          { id: 'bench', label: 'bench', slug: 'bench' },
        ],
      },
      {
        id: 'beds-tables',
        title: 'Beds & Tables',
        items: [
          { id: 'bed', label: 'bed', slug: 'bed' },
          { id: 'side-table', label: 'side table', slug: 'side-table' },
          { id: 'coffee-table', label: 'coffee table', slug: 'coffee-table' },
          { id: 'console-table', label: 'console table', slug: 'console-table' },
        ],
      },
      {
        id: 'storage-decor',
        title: 'Storage & Decor',
        items: [
          { id: 'dresser', label: 'dresser', slug: 'dresser' },
          { id: 'mirror', label: 'mirror', slug: 'mirror' },
          { id: 'storage', label: 'storage', slug: 'storage' },
        ],
      },
    ],
  },
  'semi-precious-stone': {
    categoryId: 'semi-precious-stone',
    categoryName: 'Semi Precious Stone',
    sections: [],
  },
};

const CATEGORY_IDS = ['furniture', 'wooden-furniture', 'leather', 'semi-precious-stone'];

// ---------- Small helper components ----------
const inputCls =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100';

const iconBtn = (extra = '') =>
  `flex-shrink-0 p-1.5 rounded-lg border border-transparent transition hover:border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed ${extra}`;

const move = <T,>(arr: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

const uniqueId = () => Math.random().toString(36).slice(2, 9);

// ---------- Main component ----------
const NavbarCategoriesEditor = () => {
  const [savedConfigs, setSavedConfigs] = useState<Record<string, NavCategoryConfig>>({});
  const [sections, setSections] = useState<NavSection[]>([]);
  const [selected, setSelected] = useState('furniture');
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Per-section collapse state
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Inline editing state
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState('');
  const [editingItemKey, setEditingItemKey] = useState<{ sectionId: string; itemId: string } | null>(null);
  const [editingItemLabel, setEditingItemLabel] = useState('');

  // Add-item state per section
  const [addingInSection, setAddingInSection] = useState<string | null>(null);
  const [addingLabel, setAddingLabel] = useState('');

  // Move-item state
  const [movingItem, setMovingItem] = useState<{ sectionId: string; item: NavItem } | null>(null);

  // Add section
  const [addingSectionTitle, setAddingSectionTitle] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);

  // ---- Load ----
  const loadConfigs = async () => {
    setLoadingFetch(true);
    try {
      const data = await fetchNavbarConfig();
      setSavedConfigs(data);
      loadCategory(selected, data);
    } finally {
      setLoadingFetch(false);
    }
  };

  const loadCategory = (catId: string, configs: Record<string, NavCategoryConfig>) => {
    const cfg = configs[catId] ?? DEFAULTS[catId];
    setSections(cfg ? JSON.parse(JSON.stringify(cfg.sections)) : []);
    setDirty(false);
    setEditingSectionId(null);
    setEditingItemKey(null);
    setAddingInSection(null);
    setShowAddSection(false);
    setMovingItem(null);
    setCollapsed({});
  };

  useEffect(() => { loadConfigs(); }, []);

  const selectCategory = (catId: string) => {
    setSelected(catId);
    loadCategory(catId, savedConfigs);
  };

  // ---- Mutation helpers (all mark dirty) ----
  const mutateSections = (fn: (prev: NavSection[]) => NavSection[]) => {
    setSections((prev) => {
      const next = fn(prev);
      setDirty(true);
      return next;
    });
  };

  // Section ops
  const moveSection = (idx: number, dir: -1 | 1) =>
    mutateSections((s) => move(s, idx, idx + dir));

  const deleteSection = (sectionId: string) => {
    if (!confirm('Delete this section and all its items?')) return;
    mutateSections((s) => s.filter((sec) => sec.id !== sectionId));
  };

  const renameSectionCommit = () => {
    if (!editingSectionId || !editingSectionTitle.trim()) return;
    mutateSections((s) =>
      s.map((sec) =>
        sec.id === editingSectionId ? { ...sec, title: editingSectionTitle.trim() } : sec
      )
    );
    setEditingSectionId(null);
    setEditingSectionTitle('');
  };

  const addSection = () => {
    const title = addingSectionTitle.trim();
    if (!title) return;
    const id = labelToSlug(title) || uniqueId();
    mutateSections((s) => [...s, { id, title, items: [] }]);
    setAddingSectionTitle('');
    setShowAddSection(false);
  };

  // Item ops
  const moveItem = (sectionId: string, itemIdx: number, dir: -1 | 1) =>
    mutateSections((s) =>
      s.map((sec) =>
        sec.id === sectionId ? { ...sec, items: move(sec.items, itemIdx, itemIdx + dir) } : sec
      )
    );

  const deleteItem = (sectionId: string, itemId: string) =>
    mutateSections((s) =>
      s.map((sec) =>
        sec.id === sectionId ? { ...sec, items: sec.items.filter((it) => it.id !== itemId) } : sec
      )
    );

  const renameItemCommit = () => {
    if (!editingItemKey || !editingItemLabel.trim()) return;
    const { sectionId, itemId } = editingItemKey;
    const newLabel = editingItemLabel.trim();
    mutateSections((s) =>
      s.map((sec) =>
        sec.id === sectionId
          ? {
              ...sec,
              items: sec.items.map((it) =>
                it.id === itemId ? { ...it, label: newLabel, slug: labelToSlug(newLabel) } : it
              ),
            }
          : sec
      )
    );
    setEditingItemKey(null);
    setEditingItemLabel('');
  };

  const addItem = (sectionId: string) => {
    const label = addingLabel.trim();
    if (!label) return;
    const slug = labelToSlug(label);
    const id = slug || uniqueId();
    mutateSections((s) =>
      s.map((sec) =>
        sec.id === sectionId ? { ...sec, items: [...sec.items, { id, label, slug }] } : sec
      )
    );
    setAddingLabel('');
    setAddingInSection(null);
  };

  const moveItemToSection = (targetSectionId: string) => {
    if (!movingItem || movingItem.sectionId === targetSectionId) {
      setMovingItem(null);
      return;
    }
    mutateSections((s) =>
      s.map((sec) => {
        if (sec.id === movingItem.sectionId) {
          return { ...sec, items: sec.items.filter((it) => it.id !== movingItem.item.id) };
        }
        if (sec.id === targetSectionId) {
          return { ...sec, items: [...sec.items, movingItem.item] };
        }
        return sec;
      })
    );
    setMovingItem(null);
  };

  // ---- Save ----
  const handleSave = async () => {
    setSaving(true);
    try {
      const cfg = savedConfigs[selected] ?? DEFAULTS[selected];
      await saveNavbarConfig(selected, {
        categoryName: cfg?.categoryName ?? selected,
        sections,
      });
      const updated = await fetchNavbarConfig();
      setSavedConfigs(updated);
      setDirty(false);
      if (typeof (window as any).refreshNavCategories === 'function') {
        (window as any).refreshNavCategories();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save');
    }
    setSaving(false);
  };

  // ---- Initialise from defaults ----
  const handleInitDefaults = () => {
    const def = DEFAULTS[selected];
    if (!def) return;
    setSections(JSON.parse(JSON.stringify(def.sections)));
    setDirty(true);
  };

  // ---- Discard ----
  const handleDiscard = () => loadCategory(selected, savedConfigs);

  const isConfigured = !!savedConfigs[selected];
  const totalItems = sections.reduce((n, sec) => n + sec.items.length, 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Navbar Structure Editor</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage the sections and subcategories that appear in each navbar dropdown.
              Changes are saved to the database and reflected on the live site.
            </p>
          </div>
          {dirty && (
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleDiscard}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition"
              >
                <RotateCcw size={13} /> Discard
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                <Save size={13} />
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* ---- Category sidebar ---- */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 px-1">
            Categories
          </p>
          <div className="space-y-1">
            {CATEGORY_IDS.map((catId) => {
              const cfg = savedConfigs[catId];
              const secs = cfg?.sections ?? DEFAULTS[catId]?.sections ?? [];
              const items = secs.reduce((n: number, s: NavSection) => n + s.items.length, 0);
              return (
                <button
                  key={catId}
                  onClick={() => selectCategory(catId)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                    selected === catId
                      ? 'bg-emerald-50 text-emerald-700 font-medium border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="font-medium capitalize">
                    {(cfg?.categoryName ?? DEFAULTS[catId]?.categoryName ?? catId)
                      .split('-')
                      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ')}
                  </div>
                  <div className="text-xs mt-0.5 flex items-center gap-1.5">
                    <span className={`text-slate-400`}>
                      {secs.length} section{secs.length !== 1 ? 's' : ''} · {items} items
                    </span>
                    {cfg ? (
                      <span className="inline-flex items-center gap-0.5 text-emerald-500">
                        <Check size={10} /> saved
                      </span>
                    ) : (
                      <span className="text-amber-400">defaults</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ---- Editor panel ---- */}
        <div className="lg:col-span-3 space-y-4">
          {loadingFetch ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 flex items-center justify-center text-slate-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mr-3" />
              Loading…
            </div>
          ) : (
            <>
              {/* Status bar */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    {sections.length} section{sections.length !== 1 ? 's' : ''} · {totalItems} subcategories
                  </span>
                  {dirty && (
                    <span className="text-xs text-amber-500 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Unsaved changes
                    </span>
                  )}
                  {!dirty && isConfigured && (
                    <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check size={10} /> Saved to database
                    </span>
                  )}
                  {!dirty && !isConfigured && (
                    <span className="text-xs text-amber-500 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Using hardcoded defaults
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isConfigured && (
                    <button
                      onClick={handleInitDefaults}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                    >
                      <RotateCcw size={12} /> Load Defaults
                    </button>
                  )}
                  {dirty && (
                    <>
                      <button
                        onClick={handleDiscard}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                      >
                        <X size={12} /> Discard
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                      >
                        <Save size={12} />
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* ---- Sections list ---- */}
              {sections.map((sec, si) => (
                <div
                  key={sec.id}
                  className={`rounded-2xl border bg-white shadow-sm overflow-hidden transition-all ${
                    movingItem && movingItem.sectionId !== sec.id
                      ? 'border-emerald-300 ring-2 ring-emerald-100 cursor-pointer'
                      : 'border-slate-200'
                  }`}
                  onClick={() => movingItem && movingItem.sectionId !== sec.id && moveItemToSection(sec.id)}
                >
                  {/* Section header */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                    {/* Collapse toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCollapsed((prev) => ({ ...prev, [sec.id]: !prev[sec.id] }));
                      }}
                      className={iconBtn()}
                    >
                      {collapsed[sec.id] ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                    </button>

                    {/* Title / rename inline */}
                    {editingSectionId === sec.id ? (
                      <input
                        value={editingSectionTitle}
                        onChange={(e) => setEditingSectionTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') renameSectionCommit();
                          if (e.key === 'Escape') { setEditingSectionId(null); setEditingSectionTitle(''); }
                        }}
                        onBlur={renameSectionCommit}
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-sm font-medium focus:border-emerald-400 focus:outline-none"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="flex-1 text-sm font-semibold text-slate-700">
                        {sec.title}
                        <span className="ml-2 text-xs font-normal text-slate-400">
                          {sec.items.length} item{sec.items.length !== 1 ? 's' : ''}
                        </span>
                      </span>
                    )}

                    {/* Section controls */}
                    <div className="flex items-center gap-1 ml-auto" onClick={(e) => e.stopPropagation()}>
                      <button className={iconBtn()} onClick={() => moveSection(si, -1)} disabled={si === 0} title="Move section up">
                        <ArrowUp size={13} />
                      </button>
                      <button className={iconBtn()} onClick={() => moveSection(si, 1)} disabled={si === sections.length - 1} title="Move section down">
                        <ArrowDown size={13} />
                      </button>
                      <button
                        className={iconBtn()}
                        onClick={() => { setEditingSectionId(sec.id); setEditingSectionTitle(sec.title); }}
                        title="Rename section"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className={iconBtn('hover:text-red-500 hover:border-red-100 hover:bg-red-50')}
                        onClick={() => deleteSection(sec.id)}
                        title="Delete section"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Section items */}
                  {!collapsed[sec.id] && (
                    <div className="p-3 space-y-1.5">
                      {sec.items.length === 0 && (
                        <p className="text-xs text-slate-400 italic px-2 py-1">No items — add one below.</p>
                      )}

                      {sec.items.map((item, ii) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                            movingItem?.item.id === item.id
                              ? 'bg-emerald-50 border-emerald-300'
                              : 'bg-white border-slate-100 hover:border-slate-200'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {editingItemKey?.sectionId === sec.id && editingItemKey?.itemId === item.id ? (
                            <>
                              <input
                                value={editingItemLabel}
                                onChange={(e) => setEditingItemLabel(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') renameItemCommit();
                                  if (e.key === 'Escape') { setEditingItemKey(null); setEditingItemLabel(''); }
                                }}
                                onBlur={renameItemCommit}
                                className={`flex-1 ${inputCls}`}
                                autoFocus
                              />
                              <button className={iconBtn('text-emerald-600')} onClick={renameItemCommit} title="Save">
                                <Check size={13} />
                              </button>
                              <button className={iconBtn()} onClick={() => { setEditingItemKey(null); setEditingItemLabel(''); }} title="Cancel">
                                <X size={13} />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="flex-1 text-sm text-slate-700 capitalize">{item.label}</span>
                              <span className="text-xs text-slate-300 font-mono hidden sm:block">{item.slug}</span>

                              {/* Item controls */}
                              <button className={iconBtn()} onClick={() => moveItem(sec.id, ii, -1)} disabled={ii === 0} title="Move up">
                                <ArrowUp size={12} />
                              </button>
                              <button className={iconBtn()} onClick={() => moveItem(sec.id, ii, 1)} disabled={ii === sec.items.length - 1} title="Move down">
                                <ArrowDown size={12} />
                              </button>
                              <button
                                className={iconBtn()}
                                onClick={() => { setEditingItemKey({ sectionId: sec.id, itemId: item.id }); setEditingItemLabel(item.label); }}
                                title="Edit label"
                              >
                                <Edit2 size={12} />
                              </button>
                              {sections.length > 1 && (
                                <button
                                  className={iconBtn(
                                    movingItem?.item.id === item.id
                                      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                                      : ''
                                  )}
                                  onClick={() =>
                                    movingItem?.item.id === item.id
                                      ? setMovingItem(null)
                                      : setMovingItem({ sectionId: sec.id, item })
                                  }
                                  title={movingItem?.item.id === item.id ? 'Cancel move' : 'Move to another section'}
                                >
                                  <ArrowRight size={12} />
                                </button>
                              )}
                              <button
                                className={iconBtn('hover:text-red-500 hover:border-red-100 hover:bg-red-50')}
                                onClick={() => deleteItem(sec.id, item.id)}
                                title="Delete item"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      ))}

                      {/* Add item inline */}
                      {addingInSection === sec.id ? (
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            value={addingLabel}
                            onChange={(e) => setAddingLabel(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') addItem(sec.id);
                              if (e.key === 'Escape') { setAddingInSection(null); setAddingLabel(''); }
                            }}
                            placeholder="Subcategory name…"
                            className={inputCls}
                            autoFocus
                          />
                          <button
                            onClick={() => addItem(sec.id)}
                            disabled={!addingLabel.trim()}
                            className="flex-shrink-0 p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => { setAddingInSection(null); setAddingLabel(''); }}
                            className="flex-shrink-0 p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddingInSection(sec.id);
                            setAddingLabel('');
                          }}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition mt-1"
                        >
                          <Plus size={12} /> Add subcategory
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Move hint */}
              {movingItem && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
                  <ArrowRight size={14} />
                  Click a section above to move <strong>"{movingItem.item.label}"</strong> into it.
                  <button onClick={() => setMovingItem(null)} className="ml-auto text-emerald-500 hover:text-emerald-700">
                    Cancel
                  </button>
                </div>
              )}

              {/* Add section */}
              {showAddSection ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                  <p className="text-sm font-medium text-slate-700">New Section</p>
                  <div className="flex gap-2">
                    <input
                      value={addingSectionTitle}
                      onChange={(e) => setAddingSectionTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addSection();
                        if (e.key === 'Escape') { setShowAddSection(false); setAddingSectionTitle(''); }
                      }}
                      placeholder="Section title (e.g. Tables & Seating)"
                      className={inputCls}
                      autoFocus
                    />
                    <button
                      onClick={addSection}
                      disabled={!addingSectionTitle.trim()}
                      className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-40 transition"
                    >
                      <Check size={14} /> Add
                    </button>
                    <button
                      onClick={() => { setShowAddSection(false); setAddingSectionTitle(''); }}
                      className="flex-shrink-0 p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddSection(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-transparent py-3.5 text-sm text-slate-400 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/40 transition"
                >
                  <Plus size={15} /> Add Section
                </button>
              )}

              {/* Save button — bottom duplicate for convenience */}
              {dirty && (
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleDiscard}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition"
                  >
                    <RotateCcw size={13} /> Discard
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition"
                  >
                    <Save size={13} />
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavbarCategoriesEditor;
