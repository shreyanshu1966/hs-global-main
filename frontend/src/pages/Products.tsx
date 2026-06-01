import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowUpDown, Check, X, SlidersHorizontal, Package, ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import type { Product } from "../services/productService";
import { useProducts, useCategories } from "../hooks/useProducts";
import { ProductCard } from "../components/cards/ProductCard";
import { ProductCardSkeleton } from "../components/cards/ProductCardSkeleton";
import { SORT_OPTIONS, DEFAULT_SORT, getSortOptionLabel } from "../components/filters/SortDropdown";

const toSlug = (v: string) => v.toLowerCase().trim().replace(/\s+/g, "-");
const LIMIT = 12;

// Subcategories that exist in both furniture AND handicraft
const SHARED_SUBCATEGORY_SLUGS = new Set([
  "coffee-table",
  "console-table",
  "dining-table",
  "side-table",
]);

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
  // Read path params from the matched route:
  //   /products                               → {}
  //   /products/:category                     → { category }
  //   /products/:category/:subcategory        → { category, subcategory }
  //   /products/all/:subcategory              → { subcategory } (category param is "all" from route)
  //   /products/all/:subcategory/:categoryFilter → { subcategory, categoryFilter }
  const {
    category: paramCategory,
    subcategory: paramSubcategory,
    categoryFilter: paramCategoryFilter,
  } = useParams<{ category?: string; subcategory?: string; categoryFilter?: string }>();

  const initParams = useMemo(() => {
    // "all" is a virtual category used in cross-category routes, not a real category
    const rawCategory = paramCategory === "all" ? "" : (paramCategory || "");
    return {
      category: rawCategory,
      subcategory: toSlug(paramSubcategory || ""),
      categoryFilter: ((paramCategoryFilter || "") as "" | "furniture" | "handicraft"),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter state
  const [activeCategory, setActiveCategory] = useState(initParams.category);
  const [activeSubcategory, setActiveSubcategory] = useState(initParams.subcategory);
  const [crossCategoryFilter, setCrossCategoryFilter] = useState<"" | "furniture" | "handicraft">(initParams.categoryFilter);
  const [sortBy, setSortBy] = useState(DEFAULT_SORT.sortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(DEFAULT_SORT.sortOrder);
  const [page, setPage] = useState(1);
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [firstNewIndex, setFirstNewIndex] = useState(0);

  // Subcategory list expand/collapse in desktop sidebar
  // Mobile sheets
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(true);
  const lastScrollYRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [tabCanScrollLeft, setTabCanScrollLeft] = useState(false);
  const [tabCanScrollRight, setTabCanScrollRight] = useState(false);

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


  // True when a shared subcategory is selected with no specific category active
  const isCrossMode = activeCategory === "" && SHARED_SUBCATEGORY_SLUGS.has(activeSubcategory);

  // Effective category for the API call — must be before useProducts
  const effectiveCategory = activeCategory || (isCrossMode ? crossCategoryFilter : "");

  // Data
  const { categories } = useCategories();
  const { products, loading, error, pagination } = useProducts({
    category: effectiveCategory,
    subcategory: activeSubcategory,
    sortBy,
    sortOrder,
    page,
    limit: LIMIT,
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

  // Subcategories to display in sidebar/mobile nav
  const displaySubcategories = useMemo(() => {
    if (activeCategory) {
      const activeCatData = normalizedCats.find((c) => c.category === activeCategory);
      return activeCatData?.subcategories || [];
    }
    // No category selected — show union of all subcategories from all categories
    const all = normalizedCats.flatMap((cat) => cat.subcategories);
    return Array.from(new Set(all)).sort();
  }, [activeCategory, normalizedCats]);

  const checkTabScroll = useCallback(() => {
    const el = tabScrollRef.current;
    if (!el) return;
    setTabCanScrollLeft(el.scrollLeft > 1);
    setTabCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    checkTabScroll();
    const el = tabScrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkTabScroll, { passive: true });
    const ro = new ResizeObserver(checkTabScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkTabScroll);
      ro.disconnect();
    };
  }, [checkTabScroll, normalizedCats]);

  // Sync URL — build clean path-based URL
  useEffect(() => {
    let path = "/products";
    if (activeCategory) {
      path += `/${activeCategory}`;
      if (activeSubcategory) path += `/${activeSubcategory}`;
    } else if (activeSubcategory) {
      // Cross-category mode: /products/all/:subcategory[/:categoryFilter]
      path += `/all/${activeSubcategory}`;
      if (crossCategoryFilter) path += `/${crossCategoryFilter}`;
    }

    navigate({ pathname: path }, { replace: true });
  }, [activeCategory, activeSubcategory, crossCategoryFilter, navigate]);

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
    setCrossCategoryFilter("");
    setPage(1);
    setVisibleProducts([]);
    // On desktop, scroll the grid panel; on mobile, scroll the window
    if (gridRef.current && window.innerWidth >= 768) {
      gridRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const handleSubcategory = useCallback((sub: string) => {
    setActiveSubcategory((prev) => (prev === sub ? "" : sub));
    setCrossCategoryFilter("");
    setPage(1);
    setVisibleProducts([]);
  }, []);

  const handleCrossFilter = useCallback((filter: "" | "furniture" | "handicraft") => {
    setCrossCategoryFilter(filter);
    setPage(1);
    setVisibleProducts([]);
  }, []);

  const clearFilters = useCallback(() => {
    setActiveCategory("");
    setActiveSubcategory("");
    setCrossCategoryFilter("");
    setPage(1);
    setVisibleProducts([]);
  }, []);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const totalItems = pagination?.totalItems || 0;
  const hasMore = page < (pagination?.total || 1);
  const isLoadingMore = loading && page > 1;

  // Infinite scroll — reconnects after every fetch so loading=true blocks double-triggers
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;
    // On desktop, use grid container as root so sentinel is observed within the scrollable panel
    const isDesktop = window.innerWidth >= 768;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((p) => p + 1);
        }
      },
      { root: isDesktop ? gridRef.current : null, rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  const sortLabel = getSortOptionLabel(sortBy, sortOrder);
  const hasFilters = !!(activeCategory || activeSubcategory || crossCategoryFilter);
  const filterCount = [activeCategory, activeSubcategory, crossCategoryFilter].filter(Boolean).length;

  const pageTitle = [
    activeCategory ? activeCategory.replace(/-/g, " ") : "Best Luxury & Imported Marble Stones at Marble, Granite Centre International",
    activeSubcategory ? activeSubcategory.replace(/-/g, " ") : "",
  ]
    .filter(Boolean)
    .join(" — ");

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <Helmet>
        <title>Best Marble &amp; Granite Company at USA, UK and Across Worldwide - Hs Global Export</title>
        <meta name="description" content="Explore our range of premium granite stones, tiles, marble & slabs at Marble Centre. Discover high-quality imported marble, crafted to perfection for various application needs. Custom Order." />
        <meta name="keywords" content="Premium Granite Stones, Marble Tiles Supplier, Imported Marble, Marble Slabs Manufacturer, Granite Tiles Exporter, High Quality Marble, Natural Stone Supplier, Custom Marble Orders, Granite Slabs Supplier, Luxury Marble Stones, Marble Centre, Stone Tiles Manufacturer, Marble Flooring Tiles, Granite & Marble Slabs, Premium Natural Stone, Marble for Interior & Exterior, Customized Stone Solutions" />
        <meta name="author" content="HS Global Export" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://www.hsglobalexport.com${location.pathname}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://www.hsglobalexport.com${location.pathname}`} />
        <meta property="og:site_name" content="HS Global Export" />
        <meta property="og:title" content="Best Marble & Granite Company at USA, UK and Across Worldwide - Hs Global Export" />
        <meta property="og:description" content="Explore our range of premium granite stones, tiles, marble & slabs at Marble Centre. Discover high-quality imported marble, crafted to perfection for various application needs. Custom Order." />
        <meta property="og:image" content="https://www.hsglobalexport.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`https://www.hsglobalexport.com${location.pathname}`} />
        <meta name="twitter:title" content="Best Marble & Granite Company at USA, UK and Across Worldwide - Hs Global Export" />
        <meta name="twitter:description" content="Explore our range of premium granite stones, tiles, marble & slabs at Marble Centre. Discover high-quality imported marble, crafted to perfection for various application needs. Custom Order." />
        <meta name="twitter:image" content="https://www.hsglobalexport.com/og-image.jpg" />
      </Helmet>

      <div className="min-h-screen bg-[#FAF8F5]">

        {/* ── Page header + desktop category tabs ── */}
        <div className="bg-white border-b border-gray-100 shrink-0">

          {/* Desktop category pill bar */}
          <nav
            aria-label="Product categories"
            className="hidden md:block max-w-[1680px] mx-auto px-4 sm:px-6 xl:px-8"
          >
            <div className="relative border-t border-gray-100 py-3">
              {/* Left fade */}
              <div
                className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"
                style={{ opacity: tabCanScrollLeft ? 1 : 0, transition: "opacity 0.2s" }}
              />
              <div
                ref={tabScrollRef}
                className="flex items-center gap-1.5 overflow-x-auto px-1"
                style={{ scrollbarWidth: "none" }}
              >
                {[{ category: "" }, ...normalizedCats].map((cat) => (
                  <button
                    key={cat.category || "all"}
                    onClick={() => handleCategory(cat.category)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap capitalize shrink-0 transition-all duration-150 ${
                      activeCategory === cat.category
                        ? "bg-gray-900 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {cat.category ? cat.category.replace(/-/g, " ") : "All"}
                  </button>
                ))}
              </div>
              {/* Right fade */}
              <div
                className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"
                style={{ opacity: tabCanScrollRight ? 1 : 0, transition: "opacity 0.2s" }}
              />
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

          {/* Subcategory row — when subcategories available */}
          {displaySubcategories.length > 0 && (
            <div
              className="bg-white border-b border-gray-100 px-3 py-2 overflow-x-auto"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="flex gap-2 min-w-max">
                <button
                  onClick={() => handleSubcategory("")}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    !activeSubcategory
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {displaySubcategories.map((sub) => (
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

          {/* Cross-category filter row — when a shared subcategory is selected */}
          {isCrossMode && (
            <div
              className="bg-white border-b border-gray-100 px-3 py-2 overflow-x-auto"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="flex gap-2 min-w-max">
                {(["", "furniture", "handicraft"] as const).map((cf) => (
                  <button
                    key={cf || "all"}
                    onClick={() => handleCrossFilter(cf)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      crossCategoryFilter === cf
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cf === "" ? "All" : cf === "furniture" ? "Marble Furniture" : "Handicraft"}
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
              ref={sidebarRef}
              data-lenis-prevent
              className="hidden md:flex flex-col w-52 xl:w-60 shrink-0 sticky overflow-y-auto overscroll-contain"
              style={{
                top: "calc(var(--itsbits-header-offset, 0px) + 24px)",
                maxHeight: "calc(100vh - var(--itsbits-header-offset, 0px) - 48px)",
                scrollbarWidth: "thin",
                scrollbarColor: "#e2e8f0 transparent",
              }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Filters</span>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                )}
              </div>

              {/* Subcategories — scrollable within a fixed-height container */}
              {displaySubcategories.length > 0 && (
                <div className="mb-5 pb-5 border-b border-gray-100">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">
                    {activeCategory ? activeCategory.replace(/-/g, " ") : "Subcategory"}
                  </p>
                  <nav
                    className="space-y-0.5"
                    style={{
                      maxHeight: "230px",
                      overflowY: "auto",
                      scrollbarWidth: "thin",
                      scrollbarColor: "#e2e8f0 transparent",
                    }}
                  >
                    <button
                      onClick={() => handleSubcategory("")}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                        !activeSubcategory
                          ? "bg-gray-100 text-gray-900 font-medium"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      All
                    </button>
                    {displaySubcategories.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => handleSubcategory(sub)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                          activeSubcategory === sub
                            ? "bg-gray-900 text-white font-medium"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        {sub.replace(/-/g, " ")}
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              {/* Cross-category filter — shown when a shared subcategory is active */}
              {isCrossMode && (
                <div className="mb-5 pb-5 border-b border-gray-100">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">
                    Category
                  </p>
                  <nav className="space-y-0.5">
                    {(["", "furniture", "handicraft"] as const).map((cf) => (
                      <button
                        key={cf || "all"}
                        onClick={() => handleCrossFilter(cf)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                          crossCategoryFilter === cf
                            ? "bg-gray-900 text-white font-medium"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        {cf === "" ? "All" : cf === "furniture" ? "Marble Furniture" : "Handicraft"}
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              {/* Category list — shown when nothing is selected */}
              {!activeCategory && normalizedCats.length > 0 && (
                <div className="mb-5 pb-5 border-b border-gray-100">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">
                    Browse
                  </p>
                  <nav className="space-y-0.5">
                    {normalizedCats.map((cat) => (
                      <button
                        key={cat.category}
                        onClick={() => handleCategory(cat.category)}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm capitalize text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
                      >
                        <span>{cat.category.replace(/-/g, " ")}</span>
                        <span className="text-xs text-gray-300 group-hover:text-gray-400 transition-colors tabular-nums">
                          {cat.count}
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>
              )}

            </aside>

            {/* ── Product grid area ── */}
            <div
              ref={gridRef}
              data-lenis-prevent
              className="flex-1 min-w-0"
            >

              {/* Desktop toolbar */}
              <div className="hidden md:flex items-center justify-between mb-5 gap-4">
                {/* Breadcrumb */}
                <p className="text-sm text-gray-500 flex items-center gap-1 flex-wrap">
                  <button
                    onClick={() => handleCategory("")}
                    className={`transition-colors ${!activeCategory && !activeSubcategory ? "text-gray-900 font-semibold" : "hover:text-gray-900"}`}
                  >
                    All Products
                  </button>
                  {activeCategory && (
                    <>
                      <span className="text-gray-300">/</span>
                      <button
                        onClick={() => { setActiveSubcategory(""); setCrossCategoryFilter(""); setPage(1); setVisibleProducts([]); }}
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
                      <span className={`capitalize transition-colors ${isCrossMode && crossCategoryFilter ? "hover:text-gray-900 cursor-pointer" : "text-gray-900 font-semibold"}`}
                        onClick={isCrossMode && crossCategoryFilter ? () => handleCrossFilter("") : undefined}
                      >
                        {activeSubcategory.replace(/-/g, " ")}
                      </span>
                    </>
                  )}
                  {isCrossMode && crossCategoryFilter && (
                    <>
                      <span className="text-gray-300">/</span>
                      <span className="text-gray-900 font-semibold capitalize">
                        {crossCategoryFilter === "furniture" ? "Marble Furniture" : "Handicraft"}
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
