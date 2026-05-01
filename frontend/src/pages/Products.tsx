import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowUpDown, Check, X, SlidersHorizontal, Package, ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as Slider from "@radix-ui/react-slider";

import type { Product } from "../services/productService";
import { useProducts, useCategories } from "../hooks/useProducts";
import { ProductCard } from "../components/cards/ProductCard";
import { ProductCardSkeleton } from "../components/cards/ProductCardSkeleton";
import { SORT_OPTIONS, getSortOptionLabel } from "../components/filters/SortDropdown";
import { useCurrency } from "../contexts/CurrencyContext";

const toSlug = (v: string) => v.toLowerCase().trim().replace(/\s+/g, "-");
const LIMIT = 12;
const MAX_INR = 1_000_000;

// ── Desktop sort dropdown ──────────────────────────────────────────────────────
function DesktopSort({
  sortBy, sortOrder,
  onChange,
}: {
  sortBy: string;
  sortOrder: "asc" | "desc";
  onChange: (by: string, order: "asc" | "desc") => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const label = getSortOptionLabel(sortBy, sortOrder);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap"
      >
        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span>
          Sort:{" "}
          <span className="font-medium text-gray-900">{label}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 overflow-hidden"
          >
            {SORT_OPTIONS.map((opt) => {
              const active = opt.sortBy === sortBy && opt.sortOrder === sortOrder;
              return (
                <button
                  key={`${opt.sortBy}-${opt.sortOrder}`}
                  onClick={() => { onChange(opt.sortBy, opt.sortOrder); setOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                    active
                      ? "bg-gray-50 text-gray-900 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                  {active && <Check className="w-3.5 h-3.5 text-gray-700" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function Products() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCurrencySymbol, exchangeRates, currency } = useCurrency();
  const rate = exchangeRates[currency] || exchangeRates.INR || 1;
  const maxLocal = Math.ceil(MAX_INR * rate);
  const stepLocal = Math.ceil(50 * rate);

  // Parse URL on mount only
  const initParams = useMemo(() => {
    const qp = new URLSearchParams(location.search);
    return {
      category: qp.get("category") || "",
      subcategory: toSlug(
        qp.get("subcategory") ||
        (location.state as { target?: string } | null)?.target || ""
      ),
      minPrice: qp.get("minPrice") ? Number(qp.get("minPrice")) : undefined,
      maxPrice: qp.get("maxPrice") ? Number(qp.get("maxPrice")) : undefined,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter state
  const [activeCategory, setActiveCategory] = useState(initParams.category);
  const [activeSubcategory, setActiveSubcategory] = useState(initParams.subcategory);
  const [minPrice, setMinPrice] = useState<number | undefined>(initParams.minPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initParams.maxPrice);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initParams.minPrice != null ? Math.floor(initParams.minPrice * rate) : 0,
    initParams.maxPrice != null ? Math.ceil(initParams.maxPrice * rate) : maxLocal,
  ]);
  const [firstNewIndex, setFirstNewIndex] = useState(0);

  // Mobile sheets
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(true);
  const lastScrollYRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY || 0;
        const delta = currentScrollY - lastScrollYRef.current;
        
        if (currentScrollY < 150) {
          setShowMobileNav(true);
        } else if (delta > 8) {
          setShowMobileNav(false);
        } else if (delta < -8) {
          setShowMobileNav(true);
        }
        
        lastScrollYRef.current = currentScrollY;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Data
  const { categories } = useCategories();
  const { products, loading, error, pagination } = useProducts({
    category: activeCategory,
    subcategory: activeSubcategory,
    sortBy,
    sortOrder,
    page,
    limit: LIMIT,
    minPrice,
    maxPrice,
  });

  const normalizedCats = useMemo(
    () =>
      categories
        .map((cat) => ({
          ...cat,
          subcategories: Array.from(
            new Set(cat.subcategories.map(toSlug).filter(Boolean))
          ).sort(),
        }))
        .sort((a, b) => a.category.localeCompare(b.category)),
    [categories]
  );

  const activeCatData = normalizedCats.find((c) => c.category === activeCategory);
  const subcategories = activeCatData?.subcategories || [];

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (activeSubcategory) params.set("subcategory", activeSubcategory);
    if (minPrice != null) params.set("minPrice", String(minPrice));
    if (maxPrice != null) params.set("maxPrice", String(maxPrice));
    navigate({ search: params.toString() }, { replace: true });
  }, [activeCategory, activeSubcategory, minPrice, maxPrice, navigate]);

  // Accumulate pages
  useEffect(() => {
    if (loading || error) return;
    if (page === 1) {
      setVisibleProducts(products);
      setFirstNewIndex(0);
      return;
    }
    setVisibleProducts((prev) => {
      const seen = new Set(prev.map((p) => p._id || p.productId));
      const newOnes = products.filter((p) => !seen.has(p._id || p.productId));
      if (newOnes.length > 0) setFirstNewIndex(prev.length);
      return [...prev, ...newOnes];
    });
  }, [products, page, loading, error]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleCategory = useCallback((cat: string) => {
    setActiveCategory(cat);
    setActiveSubcategory("");
    setPage(1);
    setVisibleProducts([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSubcategory = useCallback((sub: string) => {
    setActiveSubcategory((prev) => (prev === sub ? "" : sub));
    setPage(1);
    setVisibleProducts([]);
  }, []);

  const handlePriceCommit = useCallback(
    (vals: number[]) => {
      setMinPrice(vals[0] > 0 ? Math.floor(vals[0] / rate) : undefined);
      setMaxPrice(vals[1] < maxLocal ? Math.ceil(vals[1] / rate) : undefined);
      setPage(1);
      setVisibleProducts([]);
    },
    [rate, maxLocal]
  );

  const clearPriceFilter = useCallback(() => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setPriceRange([0, maxLocal]);
    setPage(1);
    setVisibleProducts([]);
  }, [maxLocal]);

  const clearFilters = useCallback(() => {
    setActiveCategory("");
    setActiveSubcategory("");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setPriceRange([0, maxLocal]);
    setPage(1);
    setVisibleProducts([]);
  }, [maxLocal]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const totalItems = pagination?.totalItems || 0;
  const hasMore = page < (pagination?.total || 1);
  const isLoadingMore = loading && page > 1;

  // Infinite scroll — reconnects after every fetch so loading=true blocks double-triggers
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  const sortLabel = getSortOptionLabel(sortBy, sortOrder);
  const hasFilters = !!(activeCategory || activeSubcategory || minPrice != null || maxPrice != null);
  const filterCount = [
    activeCategory,
    activeSubcategory,
    minPrice != null ? "p" : "",
    maxPrice != null ? "p" : "",
  ].filter(Boolean).length;

  const pageTitle = [
    activeCategory ? activeCategory.replace(/-/g, " ") : "All Products",
    activeSubcategory ? activeSubcategory.replace(/-/g, " ") : "",
  ]
    .filter(Boolean)
    .join(" — ");

  // ── Reusable price slider ────────────────────────────────────────────────────
  const PriceSlider = ({ compact = false }: { compact?: boolean }) => (
    <div className={compact ? "" : "px-1"}>
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={priceRange}
        max={maxLocal}
        step={stepLocal}
        onValueChange={(v) => setPriceRange([v[0], v[1]])}
        onValueCommit={handlePriceCommit}
      >
        <Slider.Track className="bg-gray-200 relative grow rounded-full h-[3px]">
          <Slider.Range className="absolute bg-gray-900 rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-4 h-4 bg-white border-2 border-gray-900 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-grab active:cursor-grabbing"
          aria-label="Min price"
        />
        <Slider.Thumb
          className="block w-4 h-4 bg-white border-2 border-gray-900 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-grab active:cursor-grabbing"
          aria-label="Max price"
        />
      </Slider.Root>
      <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
        <span className="px-2 py-1 bg-gray-50 rounded-md border border-gray-200">
          {getCurrencySymbol()}{priceRange[0].toLocaleString()}
        </span>
        <span className="text-gray-300">—</span>
        <span className="px-2 py-1 bg-gray-50 rounded-md border border-gray-200">
          {priceRange[1] >= maxLocal
            ? `${getCurrencySymbol()}${priceRange[1].toLocaleString()}+`
            : `${getCurrencySymbol()}${priceRange[1].toLocaleString()}`}
        </span>
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <Helmet>
        <title>
          Best Luxury &amp; Imported Marble Stones at Marble, Granite Centre International
        </title>
        <meta
          name="description"
          content="Best Marble & Granite Company at USA, UK and Across world wide - Hs Global Export"
        />
        <meta
          name="keywords"
          content="Premium Granite Stones, Marble Tiles Supplier, Imported Marble, Marble Slabs Manufacturer, Granite Tiles Exporter, High Quality Marble, Natural Stone Supplier"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.hsglobalexport.com/products" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.hsglobalexport.com/products" />
        <meta
          property="og:title"
          content="Best Luxury & Imported Marble Stones at Marble, Granite Centre International"
        />
      </Helmet>

      <div className="min-h-screen bg-[#FAF8F5]">

        {/* ── Page header + desktop category tabs ── */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-[1680px] mx-auto px-4 sm:px-6 xl:px-8 pt-8 pb-0 md:pt-10">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight capitalize pb-1">
              {pageTitle}
            </h1>
            <p className="text-sm md:text-base text-gray-500 pb-5">
              Premium natural stone &amp; luxury furniture for every space
            </p>
          </div>

          {/* Desktop category tab bar */}
          <nav
            aria-label="Product categories"
            className="hidden md:block max-w-[1680px] mx-auto px-4 sm:px-6 xl:px-8"
          >
            <div
              className="flex items-end overflow-x-auto border-t border-gray-100"
              style={{ scrollbarWidth: "none" }}
            >
              {[{ category: "" }, ...normalizedCats].map((cat) => (
                <button
                  key={cat.category || "all"}
                  onClick={() => handleCategory(cat.category)}
                  className={`relative px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors capitalize shrink-0 ${
                    activeCategory === cat.category
                      ? "border-gray-900 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                  }`}
                >
                  {cat.category ? cat.category.replace(/-/g, " ") : "All Products"}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* ── Mobile sticky nav ── */}
        <div
          className={`md:hidden mt-3 sticky z-40 shadow-sm transition-transform duration-300 ease-in-out ${showMobileNav ? 'translate-y-0' : '-translate-y-[110%]'}`}
          style={{ top: "calc(var(--itsbits-header-offset, 0px) + 8px)" }}
        >
          {/* Category row */}
          <div
            className="bg-white border-b border-gray-100 px-3 py-2.5 overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex gap-2 min-w-max">
              {[{ category: "" }, ...normalizedCats].map((cat) => (
                <button
                  key={cat.category || "all"}
                  onClick={() => handleCategory(cat.category)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all capitalize ${
                    activeCategory === cat.category
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat.category ? cat.category.replace(/-/g, " ") : "All"}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategory row — only when applicable */}
          {subcategories.length > 0 && (
            <div
              className="bg-white border-b border-gray-100 px-3 py-2 overflow-x-auto"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="flex gap-2 min-w-max">
                <button
                  onClick={() => {
                    setActiveSubcategory("");
                    setPage(1);
                    setVisibleProducts([]);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    !activeSubcategory
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {subcategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => handleSubcategory(sub)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-all ${
                      activeSubcategory === sub
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {sub.replace(/-/g, " ")}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filter / Sort / Count bar */}
          <div className="bg-white border-b border-gray-100 px-3 py-2 flex items-center gap-2">
            <button
              onClick={() => setIsFilterOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                filterCount > 0
                  ? "bg-gray-900 border-gray-900 text-white"
                  : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {filterCount > 0 ? `Filter (${filterCount})` : "Filter"}
            </button>

            <button
              onClick={() => setIsSortOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="truncate max-w-[90px]">{sortLabel}</span>
            </button>

            <span className="ml-auto text-xs text-gray-400">
              {totalItems.toLocaleString()} items
            </span>
          </div>
        </div>

        {/* ── Main layout ── */}
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 xl:px-8 py-6 md:py-8">
          <div className="flex gap-6 xl:gap-8 items-start">

            {/* ── Desktop sidebar ── */}
            <aside
              className="hidden md:flex flex-col w-56 xl:w-64 shrink-0 sticky"
              style={{ top: "calc(var(--itsbits-header-offset, 0px) + 24px)" }}
            >
              {/* Subcategory list — shown when a category is active */}
              {subcategories.length > 0 && (
                <div className="mb-6">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">
                    {activeCategory.replace(/-/g, " ")}
                  </p>
                  <nav className="space-y-0.5">
                    <button
                      onClick={() => handleSubcategory("")}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                        !activeSubcategory
                          ? "bg-gray-100 text-gray-900 font-semibold"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      All {activeCategory.replace(/-/g, " ")}
                    </button>
                    {subcategories.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => handleSubcategory(sub)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                          activeSubcategory === sub
                            ? "bg-gray-900 text-white font-medium"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        {sub.replace(/-/g, " ")}
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              {/* Category overview — shown when no category selected */}
              {!activeCategory && normalizedCats.length > 0 && (
                <div className="mb-6">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">
                    Categories
                  </p>
                  <nav className="space-y-0.5">
                    {normalizedCats.map((cat) => (
                      <button
                        key={cat.category}
                        onClick={() => handleCategory(cat.category)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm capitalize text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      >
                        <span>{cat.category.replace(/-/g, " ")}</span>
                        <span className="text-xs text-gray-400">{cat.count}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              {/* Price filter */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3 px-1">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    Price ({currency})
                  </p>
                  {(minPrice != null || maxPrice != null) && (
                    <button
                      onClick={clearPriceFilter}
                      className="text-gray-400 hover:text-gray-700 transition-colors"
                      aria-label="Clear price filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <PriceSlider />
              </div>

              {/* Clear all */}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear all filters
                </button>
              )}
            </aside>

            {/* ── Product grid area ── */}
            <div className="flex-1 min-w-0">

              {/* Desktop toolbar */}
              <div className="hidden md:flex items-center justify-between mb-5 gap-4">
                {/* Breadcrumb */}
                <p className="text-sm text-gray-500 flex items-center gap-1 flex-wrap">
                  <button
                    onClick={() => handleCategory("")}
                    className={`transition-colors ${!activeCategory ? "text-gray-900 font-semibold" : "hover:text-gray-900"}`}
                  >
                    All Products
                  </button>
                  {activeCategory && (
                    <>
                      <span className="text-gray-300">/</span>
                      <button
                        onClick={() => { setActiveSubcategory(""); setPage(1); setVisibleProducts([]); }}
                        className={`capitalize transition-colors ${
                          activeSubcategory ? "hover:text-gray-900" : "text-gray-900 font-semibold"
                        }`}
                      >
                        {activeCategory.replace(/-/g, " ")}
                      </button>
                    </>
                  )}
                  {activeSubcategory && (
                    <>
                      <span className="text-gray-300">/</span>
                      <span className="text-gray-900 font-semibold capitalize">
                        {activeSubcategory.replace(/-/g, " ")}
                      </span>
                    </>
                  )}
                  <span className="text-gray-400 ml-1">({totalItems.toLocaleString()})</span>
                </p>

                <DesktopSort
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onChange={(by, order) => {
                    setSortBy(by);
                    setSortOrder(order);
                    setPage(1);
                    setVisibleProducts([]);
                  }}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-2xl bg-red-50 border border-red-100 p-10 text-center">
                  <p className="text-red-600 font-medium mb-4">Failed to load products</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Loading skeletons */}
              {loading && page === 1 && !error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
                >
                  {Array.from({ length: LIMIT }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </motion.div>
              )}

              {/* Empty state */}
              {!loading && !error && visibleProducts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-white border border-gray-100 p-16 text-center shadow-sm"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-7 h-7 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
                    Nothing matches your current selection. Try a different category or clear your filters.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-colors"
                  >
                    Clear Filters
                  </button>
                </motion.div>
              )}

              {/* Products grid */}
              {!error && visibleProducts.length > 0 && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeCategory}:${activeSubcategory}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
                  >
                    {visibleProducts.map((product, index) => {
                      const isNew = page > 1 && index >= firstNewIndex;
                      const batchIndex = isNew ? index - firstNewIndex : 0;
                      return (
                        <motion.div
                          key={product._id || product.productId}
                          initial={isNew ? { opacity: 0, y: 24 } : false}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.38,
                            delay: Math.min(batchIndex * 0.045, 0.3),
                            ease: [0.25, 0.46, 0.45, 0.94],
                          }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Infinite scroll sentinel — always in DOM so ref is ready when observer attaches */}
              <div ref={sentinelRef} className="h-1 mt-6" aria-hidden="true" />

              {/* Skeleton cards while fetching next page */}
              <AnimatePresence>
                {isLoadingMore && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-4"
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <ProductCardSkeleton key={`inf-sk-${i}`} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* End of results */}
              {!hasMore && !loading && visibleProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="flex flex-col items-center py-10 gap-2"
                >
                  <div className="flex items-center gap-4 w-full max-w-xs">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-medium tracking-wide whitespace-nowrap">
                      All products shown
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <p className="text-xs text-gray-300">
                    {visibleProducts.length.toLocaleString()} of {totalItems.toLocaleString()} items
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* ── Mobile sort bottom sheet ── */}
        <AnimatePresence>
          {isSortOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40 md:hidden"
                onClick={() => setIsSortOpen(false)}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 250 }}
                className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl p-5 pb-8 md:hidden"
              >
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
                <h3 className="text-base font-semibold text-gray-900 mb-4">Sort by</h3>
                <div className="space-y-1.5">
                  {SORT_OPTIONS.map((opt) => {
                    const active = opt.sortBy === sortBy && opt.sortOrder === sortOrder;
                    return (
                      <button
                        key={`${opt.sortBy}-${opt.sortOrder}`}
                        onClick={() => {
                          setSortBy(opt.sortBy);
                          setSortOrder(opt.sortOrder);
                          setPage(1);
                          setVisibleProducts([]);
                          setIsSortOpen(false);
                        }}
                        className={`w-full h-12 px-4 rounded-xl flex items-center justify-between text-sm border transition-colors ${
                          active
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-100 bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {active && <Check className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Mobile filter right-slide sheet ── */}
        <AnimatePresence>
          {isFilterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40 md:hidden"
                onClick={() => setIsFilterOpen(false)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 250 }}
                className="fixed inset-y-0 right-0 z-50 w-[85vw] max-w-xs bg-white p-5 md:hidden overflow-y-auto flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Price range */}
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                    Price Range ({currency})
                  </h4>
                  <Slider.Root
                    className="relative flex items-center select-none touch-none w-full h-5"
                    value={priceRange}
                    max={maxLocal}
                    step={stepLocal}
                    onValueChange={(v) => setPriceRange([v[0], v[1]])}
                    onValueCommit={handlePriceCommit}
                  >
                    <Slider.Track className="bg-gray-200 relative grow rounded-full h-[3px]">
                      <Slider.Range className="absolute bg-gray-900 rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb
                      className="block w-5 h-5 bg-white border-2 border-gray-900 rounded-full shadow focus:outline-none cursor-grab active:cursor-grabbing"
                      aria-label="Min price"
                    />
                    <Slider.Thumb
                      className="block w-5 h-5 bg-white border-2 border-gray-900 rounded-full shadow focus:outline-none cursor-grab active:cursor-grabbing"
                      aria-label="Max price"
                    />
                  </Slider.Root>
                  <div className="flex items-center justify-between mt-5">
                    <span className="text-sm font-medium text-gray-700 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                      {getCurrencySymbol()}{priceRange[0].toLocaleString()}
                    </span>
                    <span className="text-gray-300 text-sm">—</span>
                    <span className="text-sm font-medium text-gray-700 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                      {priceRange[1] >= maxLocal
                        ? `${getCurrencySymbol()}${priceRange[1].toLocaleString()}+`
                        : `${getCurrencySymbol()}${priceRange[1].toLocaleString()}`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 space-y-3">
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full h-12 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-colors"
                  >
                    Apply Filters
                  </button>
                  {hasFilters && (
                    <button
                      onClick={() => { clearFilters(); setIsFilterOpen(false); }}
                      className="w-full h-12 border border-gray-200 text-gray-700 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
