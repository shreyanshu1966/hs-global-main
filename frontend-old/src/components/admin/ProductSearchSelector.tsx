import { useEffect, useMemo, useState, type DragEvent } from 'react';
import { GripVertical, Loader2, Search, Trash2 } from 'lucide-react';
import { productService, type Product } from '../../services/productService';

interface ProductSearchSelectorProps {
  selectedProductIds: string[];
  onChange: (nextIds: string[]) => void;
  maxItems?: number;
  className?: string;
}

const moveItem = <T,>(items: T[], from: number, to: number): T[] => {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

const ProductSearchSelector = ({
  selectedProductIds,
  onChange,
  maxItems = Infinity,
  className = '',
}: ProductSearchSelectorProps) => {
  const [search, setSearch] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loadingSelected, setLoadingSelected] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const selectedIdSet = useMemo(() => new Set(selectedProductIds), [selectedProductIds]);

  useEffect(() => {
    let active = true;

    const loadSelectedProducts = async () => {
      if (selectedProductIds.length === 0) {
        setSelectedProducts([]);
        return;
      }

      try {
        setLoadingSelected(true);
        const results = await Promise.all(
          selectedProductIds.map(async (productId) => {
            try {
              const response = await productService.getProductById(productId);
              if (response.success && response.data?.product) {
                return response.data.product;
              }
              return null;
            } catch {
              return null;
            }
          })
        );

        if (!active) {
          return;
        }

        const mapById = new Map(
          results
            .filter(Boolean)
            .map((product) => [String((product as Product).productId || (product as Product)._id), product as Product])
        );

        const ordered = selectedProductIds
          .map((id) => mapById.get(id))
          .filter(Boolean) as Product[];

        setSelectedProducts(ordered);
      } finally {
        if (active) {
          setLoadingSelected(false);
        }
      }
    };

    loadSelectedProducts();

    return () => {
      active = false;
    };
  }, [selectedProductIds]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      const q = search.trim();
      if (q.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setLoadingSearch(true);
        const response = await productService.getAllProducts({
          page: 1,
          limit: 12,
          search: q,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });

        if (!active) {
          return;
        }

        const rows = Array.isArray(response.data) ? response.data : [];
        setSearchResults(rows.filter((item) => !selectedIdSet.has(item.productId)));
      } catch {
        if (active) {
          setSearchResults([]);
        }
      } finally {
        if (active) {
          setLoadingSearch(false);
        }
      }
    };

    const timer = setTimeout(run, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, selectedIdSet]);

  const addProduct = (productId: string) => {
    if (selectedIdSet.has(productId) || selectedProductIds.length >= maxItems) {
      return;
    }

    onChange([...selectedProductIds, productId]);
    setSearch('');
    setSearchResults([]);
  };

  const removeProduct = (productId: string) => {
    onChange(selectedProductIds.filter((id) => id !== productId));
  };

  const onDragStart = (index: number) => setDraggedIndex(index);
  const onDragOver = (event: DragEvent<HTMLDivElement>) => event.preventDefault();

  const onDrop = (index: number) => {
    if (draggedIndex === null) {
      return;
    }
    onChange(moveItem(selectedProductIds, draggedIndex, index));
    setDraggedIndex(null);
  };

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-3 ${className}`}>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-3 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name or product ID"
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div className="mt-2 max-h-52 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50">
        {loadingSearch && (
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500">
            <Loader2 size={13} className="animate-spin" />
            Searching products...
          </div>
        )}
        {!loadingSearch && search.trim().length < 2 && (
          <div className="px-3 py-2 text-xs text-slate-500">Type at least 2 characters to search.</div>
        )}
        {!loadingSearch && search.trim().length >= 2 && searchResults.length === 0 && (
          <div className="px-3 py-2 text-xs text-slate-500">No matching products found.</div>
        )}
        {!loadingSearch &&
          searchResults.map((product) => (
            <button
              key={product.productId}
              type="button"
              onClick={() => addProduct(product.productId)}
              className="flex w-full items-center justify-between border-b border-slate-200 px-3 py-2 text-left hover:bg-emerald-50"
            >
              <div>
                <div className="text-sm font-medium text-slate-800">{product.name}</div>
                <div className="text-xs text-slate-500">{product.productId}</div>
              </div>
              <span className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">Add</span>
            </button>
          ))}
      </div>

      <div className="mt-3 text-xs text-slate-500">Selected products ({selectedProductIds.length}{isFinite(maxItems) ? `/${maxItems}` : ''})</div>
      <div className="mt-2 space-y-2">
        {loadingSelected && selectedProductIds.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 size={13} className="animate-spin" />
            Loading selected products...
          </div>
        )}

        {!loadingSelected && selectedProductIds.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
            No products selected yet.
          </div>
        )}

        {selectedProducts.map((product, index) => (
          <div
            key={`${product.productId}-${index}`}
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(index)}
            onDragEnd={() => setDraggedIndex(null)}
            className="grid grid-cols-12 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2"
          >
            <div className="col-span-1 flex cursor-grab justify-center text-slate-400 active:cursor-grabbing">
              <GripVertical size={15} />
            </div>
            <div className="col-span-2 h-10 w-10 overflow-hidden rounded-md border border-slate-200 bg-white">
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="col-span-8 min-w-0">
              <div className="truncate text-sm font-medium text-slate-800">{product.name}</div>
              <div className="truncate text-xs text-slate-500">{product.productId}</div>
            </div>
            <button
              type="button"
              onClick={() => removeProduct(product.productId)}
              className="col-span-1 inline-flex justify-center rounded-md bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSearchSelector;
