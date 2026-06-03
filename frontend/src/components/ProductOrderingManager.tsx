import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, GripVertical, Plus, X, Save, RotateCcw, Loader2, ChevronDown, Search } from 'lucide-react';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('authToken')}`,
});

interface AdminProduct {
  productId: string;
  name: string;
  images: string[];
  category: string;
  subcategory?: string;
  status: string;
  available: boolean;
}

interface Scope {
  category: string | null;
  subcategory: string | null;
}

interface ProductOrderingManagerProps {
  onBack: () => void;
}

const thumb = (product: AdminProduct) =>
  Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;

const scopeLabel = ({ category, subcategory }: Scope) => {
  if (!category) return 'Global (all products)';
  if (!subcategory) return category.charAt(0).toUpperCase() + category.slice(1);
  return `${category.charAt(0).toUpperCase() + category.slice(1)} / ${subcategory}`;
};

const ProductOrderingManager: React.FC<ProductOrderingManagerProps> = ({ onBack }) => {
  const [scope, setScope] = useState<Scope>({ category: null, subcategory: null });

  // Categories from server
  const [categories, setCategories] = useState<{ category: string; subcategories: string[] }[]>([]);

  // All products for the current scope
  const [allProducts, setAllProducts] = useState<AdminProduct[]>([]);

  // Ordered product IDs (the sequence)
  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [orderedSearch, setOrderedSearch] = useState('');
  const [unorderedSearch, setUnorderedSearch] = useState('');

  // Drag state for ordered list
  const dragIdx = useRef<number | null>(null);

  // ── Derived lists ───────────────────────────────────────────────────────────
  const orderedProducts = orderedIds
    .map(id => allProducts.find(p => p.productId === id))
    .filter(Boolean) as AdminProduct[];

  const unorderedProducts = allProducts.filter(p => !orderedIds.includes(p.productId));

  const filterBySearch = (products: AdminProduct[], query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p => p.name.toLowerCase().includes(q) || p.productId.toLowerCase().includes(q));
  };

  const visibleOrdered = filterBySearch(orderedProducts, orderedSearch);
  const visibleUnordered = filterBySearch(unorderedProducts, unorderedSearch);

  // ── Toast helper ────────────────────────────────────────────────────────────
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch categories ────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/products/categories`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data)) {
          setCategories(
            d.data.map((c: any) => ({
              category: c.category,
              subcategories: (c.subcategories || []).filter(Boolean).sort(),
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // ── Fetch ordering for current scope ───────────────────────────────────────
  const fetchOrdering = useCallback(async (s: Scope) => {
    setLoading(true);
    setIsDirty(false);
    try {
      const params = new URLSearchParams();
      if (s.category)    params.set('category', s.category);
      if (s.subcategory) params.set('subcategory', s.subcategory);
      const res = await fetch(`${API_BASE}/admin/product-ordering?${params}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setAllProducts(data.data.products || []);
        setOrderedIds(data.data.productIds || []);
      }
    } catch {
      showToast('Failed to load ordering', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrdering(scope);
  }, [scope, fetchOrdering]);

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/admin/product-ordering`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          category:    scope.category,
          subcategory: scope.subcategory,
          productIds:  orderedIds,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsDirty(false);
        showToast('Order saved successfully');
      } else {
        showToast('Failed to save order', 'error');
      }
    } catch {
      showToast('Failed to save order', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Reset ───────────────────────────────────────────────────────────────────
  const handleReset = async () => {
    if (!window.confirm('Clear the custom ordering for this scope? Products will fall back to newest first.')) return;
    try {
      const params = new URLSearchParams();
      if (scope.category)    params.set('category', scope.category);
      if (scope.subcategory) params.set('subcategory', scope.subcategory);
      const res = await fetch(`${API_BASE}/admin/product-ordering?${params}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setOrderedIds([]);
        setIsDirty(false);
        showToast('Ordering cleared');
      }
    } catch {
      showToast('Failed to reset ordering', 'error');
    }
  };

  // ── Drag-and-drop (native HTML5) ────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragIdx.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === dropIndex) return;
    const next = [...orderedIds];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(dropIndex, 0, moved);
    setOrderedIds(next);
    setIsDirty(true);
    dragIdx.current = null;
  };

  // ── Add / Remove ─────────────────────────────────────────────────────────
  const addToOrdered = (productId: string) => {
    setOrderedIds(prev => [...prev, productId]);
    setIsDirty(true);
  };

  const removeFromOrdered = (productId: string) => {
    setOrderedIds(prev => prev.filter(id => id !== productId));
    setIsDirty(true);
  };

  // ── Scope selectors ─────────────────────────────────────────────────────────
  const currentCatMeta = categories.find(c => c.category === scope.category);
  const subcategoryOptions = currentCatMeta?.subcategories || [];

  const changeCategory = (cat: string | null) => {
    setScope({ category: cat, subcategory: null });
    setOrderedSearch('');
    setUnorderedSearch('');
  };

  const changeSubcategory = (sub: string | null) => {
    setScope(s => ({ ...s, subcategory: sub }));
    setOrderedSearch('');
    setUnorderedSearch('');
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <h2 className="text-base font-semibold text-gray-900">
            Product Order &mdash; {scopeLabel(scope)}
          </h2>
          {isDirty && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Order
          </button>
        </div>
      </div>

      {/* Scope selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Scope</p>
        <div className="flex flex-wrap items-center gap-2">
          {/* Global */}
          <button
            onClick={() => changeCategory(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              scope.category === null
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            Global
          </button>

          {/* Category */}
          <div className="relative">
            <select
              value={scope.category || ''}
              onChange={e => changeCategory(e.target.value || null)}
              className={`appearance-none pl-3 pr-8 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                scope.category
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <option value="">Category…</option>
              {categories.map(c => (
                <option key={c.category} value={c.category}>
                  {c.category.charAt(0).toUpperCase() + c.category.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-current opacity-70" />
          </div>

          {/* Subcategory (only when category selected and subcategories exist) */}
          {scope.category && subcategoryOptions.length > 0 && (
            <div className="relative">
              <select
                value={scope.subcategory || ''}
                onChange={e => changeSubcategory(e.target.value || null)}
                className={`appearance-none pl-3 pr-8 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                  scope.subcategory
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                <option value="">All {scope.category}</option>
                {subcategoryOptions.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-current opacity-70" />
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading products…
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Ordered list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Ordered</h3>
                <p className="text-xs text-gray-400 mt-0.5">Drag rows to reorder · appears first in "Relevance" sort</p>
              </div>
              <span className="text-xs bg-orange-50 text-orange-600 font-semibold px-2 py-1 rounded-full">
                {orderedProducts.length}
              </span>
            </div>
            <div className="px-4 py-2.5 border-b border-gray-50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={orderedSearch}
                  onChange={e => setOrderedSearch(e.target.value)}
                  placeholder="Search ordered…"
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent placeholder-gray-400"
                />
              </div>
            </div>
            <div className="divide-y divide-gray-50 max-h-[540px] overflow-y-auto">
              {orderedProducts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">
                  No custom order set. Add products from the right →
                </p>
              ) : visibleOrdered.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No matches for "{orderedSearch}"</p>
              ) : (
                visibleOrdered.map((product) => {
                  const index = orderedIds.indexOf(product.productId);
                  return (
                  <div
                    key={product.productId}
                    draggable
                    onDragStart={e => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={e => handleDrop(e, index)}
                    className="flex items-center gap-3 px-4 py-3 cursor-move hover:bg-gray-50 transition-colors group"
                  >
                    <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
                    <span className="text-xs font-mono text-gray-300 w-6 text-center flex-shrink-0">
                      {index + 1}
                    </span>
                    {thumb(product) ? (
                      <img
                        src={thumb(product)!}
                        alt={product.name}
                        className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.productId}</p>
                    </div>
                    {!product.available && (
                      <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded flex-shrink-0">
                        hidden
                      </span>
                    )}
                    <button
                      onClick={() => removeFromOrdered(product.productId)}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                      title="Remove from order"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Unordered list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Unordered</h3>
                <p className="text-xs text-gray-400 mt-0.5">Click + to add to the ordered list</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-1 rounded-full">
                {unorderedProducts.length}
              </span>
            </div>
            <div className="px-4 py-2.5 border-b border-gray-50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={unorderedSearch}
                  onChange={e => setUnorderedSearch(e.target.value)}
                  placeholder="Search unordered…"
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent placeholder-gray-400"
                />
              </div>
            </div>
            <div className="divide-y divide-gray-50 max-h-[540px] overflow-y-auto">
              {unorderedProducts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">
                  {allProducts.length === 0 ? 'No products in this scope.' : 'All products are in the ordered list.'}
                </p>
              ) : visibleUnordered.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No matches for "{unorderedSearch}"</p>
              ) : (
                visibleUnordered.map(product => (
                  <div
                    key={product.productId}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                  >
                    {thumb(product) ? (
                      <img
                        src={thumb(product)!}
                        alt={product.name}
                        className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.productId}</p>
                    </div>
                    {!product.available && (
                      <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded flex-shrink-0">
                        hidden
                      </span>
                    )}
                    <button
                      onClick={() => addToOrdered(product.productId)}
                      className="p-1 text-gray-300 hover:text-orange-500 transition-colors flex-shrink-0"
                      title="Add to ordered list"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductOrderingManager;
