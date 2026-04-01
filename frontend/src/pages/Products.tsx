import React, { useState, useEffect, useCallback, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Filter, ChevronLeft, ChevronRight, ArrowUpDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useProducts, useCategories } from "../hooks/useProducts";
import { ProductCard } from "../components/cards/ProductCard";
import { ProductCardSkeleton } from "../components/cards/ProductCardSkeleton";
import { FilterSidebar } from "../components/filters/FilterSidebar";
import { SortDropdown, SORT_OPTIONS, getSortOptionLabel } from "../components/filters/SortDropdown";

const normalizeFilterValue = (value: string) => value.toLowerCase().trim().replace(/\s+/g, "-");

const toCanonicalSubcategory = (value: string) => {
  return normalizeFilterValue(value || "");
};

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Parse initial query params
  const queryParams = new URLSearchParams(location.search);
  const locationState = location.state as { target?: string } | null;
  const hashTarget = location.hash ? location.hash.substring(1) : "";

  const initialCategory = queryParams.get("category") || "furniture";
  const rawInitialSubcategory = queryParams.get("subcategory") || locationState?.target || hashTarget || "";
  const initialSubcategory = toCanonicalSubcategory(rawInitialSubcategory);
  const initialMinPrice = queryParams.get("minPrice") ? Number(queryParams.get("minPrice")) : undefined;
  const initialMaxPrice = queryParams.get("maxPrice") ? Number(queryParams.get("maxPrice")) : undefined;

  // Filter & Sort State
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeSubcategory, setActiveSubcategory] = useState(initialSubcategory);
  const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice);

  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const limit = 12; // Items per page

  // UI State
  const [isMobilePriceFilterOpen, setIsMobilePriceFilterOpen] = useState(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);
  const filterSidebarRef = useRef<HTMLDivElement>(null);

  // Trap scroll inside the sidebar so it doesn't propagate to the page
  const handleSidebarWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const el = filterSidebarRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const atTop = scrollTop === 0 && e.deltaY < 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight && e.deltaY > 0;
    if (!atTop && !atBottom) {
      // Still has room to scroll — let the sidebar scroll, block the page
      e.stopPropagation();
    }
    // If at boundary, let both the sidebar and page receive the event naturally
  }, []);

  // Fetch Categories
  const { categories } = useCategories();

  const filteredCategories = categories.map(cat => ({
    ...cat,
    subcategories: Array.from(new Set(cat.subcategories.map(sub => toCanonicalSubcategory(sub)).filter(Boolean))).sort((a, b) => a.localeCompare(b))
  })).sort((a, b) => a.category.localeCompare(b.category));

  const furnitureCategoryData = filteredCategories.find((cat) => cat.category === "furniture") || filteredCategories[0];
  const mobileSubcategoryChips = ["", ...(furnitureCategoryData?.subcategories || [])];

  // Fetch Products
  const { products, loading, error, pagination } = useProducts({
    category: activeCategory,
    subcategory: activeSubcategory,
    sortBy,
    sortOrder,
    page,
    limit,
    minPrice,
    maxPrice
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (activeSubcategory) params.set("subcategory", activeSubcategory);
    if (minPrice) params.set("minPrice", String(minPrice));
    if (maxPrice) params.set("maxPrice", String(maxPrice));

    navigate({ search: params.toString() }, { replace: true });

    // Always reset to top when changing filters
    window.scrollTo(0, 0);
  }, [activeCategory, activeSubcategory, minPrice, maxPrice, navigate]);

  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
    setActiveSubcategory("");
    setPage(1);
  }, []);

  const handleSubcategoryChange = useCallback((sub: string) => {
    setActiveSubcategory(toCanonicalSubcategory(sub));
    setPage(1);
  }, []);

  const handlePriceChange = useCallback((min?: number, max?: number) => {
    setMinPrice(min);
    setMaxPrice(max);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((newSortBy: string, newSortOrder: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setActiveCategory("");
    setActiveSubcategory("");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setPage(1);
  }, []);

  const totalItems = pagination?.totalItems || 0;
  const totalPages = pagination?.total || 1;
  const sortLabel = getSortOptionLabel(sortBy, sortOrder);
  const activeFilterCount = [activeCategory, activeSubcategory, minPrice, maxPrice].filter(Boolean).length;

  return (
    <>
      <Helmet>
        <title>Best Luxury & Imported Marble Stones at Marble, Granite Centre International</title>
        <meta name="description" content="Best Marble & Granite Company at USA, UK and Across wold wide - Hs Global Export" />
        <meta name="keywords" content="Premium Granite Stones, Marble Tiles Supplier, Imported Marble, Marble Slabs Manufacturer, Granite Tiles Exporter, High Quality Marble, Natural Stone Supplier, Custom Marble Orders, Granite Slabs Supplier, Luxury Marble Stones, Marble Centre, Stone Tiles Manufacturer, Marble Flooring Tiles, Granite & Marble Slabs, Premium Natural Stone, Marble for Interior & Exterior, Customized Stone Solutions" />
        <meta name="author" content="HS Global Export" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.hsglobalexport.com/products" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.hsglobalexport.com/products" />
        <meta property="og:site_name" content="HS Global Export" />
        <meta property="og:title" content="Best Luxury & Imported Marble Stones at Marble, Granite Centre International" />
        <meta property="og:description" content="Best Marble & Granite Company at USA, UK and Across wold wide - Hs Global Export" />
        <meta property="og:image" content="https://www.hsglobalexport.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="HS Global Export - Products" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.hsglobalexport.com/products" />
        <meta name="twitter:title" content="Best Luxury & Imported Marble Stones at Marble, Granite Centre International" />
        <meta name="twitter:description" content="Best Marble & Granite Company at USA, UK and Across wold wide - Hs Global Export" />
        <meta name="twitter:image" content="https://www.hsglobalexport.com/og-image.jpg" />
        <meta name="twitter:image:alt" content="HS Global Export - Products" />
      </Helmet>

      {/* Main Page Layout */}
      <div className="min-h-screen bg-gray-50 pb-16">

        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 xl:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-6 xl:gap-8">

            {/* Desktop Sidebar Filter */}
            <div className="hidden lg:block w-72 shrink-0">
              <div
                ref={filterSidebarRef}
                onWheel={handleSidebarWheel}
                className="sticky top-40 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-h-[calc(100vh-10rem)] overflow-y-auto overscroll-contain"
              >
                <FilterSidebar
                  categories={filteredCategories}
                  activeCategory={activeCategory}
                  activeSubcategory={activeSubcategory}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onCategoryChange={handleCategoryChange}
                  onSubcategoryChange={handleSubcategoryChange}
                  onPriceChange={handlePriceChange}
                  onClearFilters={clearFilters}
                />
              </div>
            </div>

            {/* Main Product Grid Area */}
            <div className="flex-1">

              {/* Mobile Sticky Subcategory Chips */}
              <div className="lg:hidden sticky top-[calc(var(--itsbits-header-offset)+8px)] z-30 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-gray-100 mb-3">
                <div
                  className="px-3 pt-3 pb-2 overflow-x-auto [&::-webkit-scrollbar]:hidden"
                  style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
                >
                  <div className="flex items-center gap-2 min-w-max">
                    {mobileSubcategoryChips.map((subcategory) => (
                      <button
                        key={subcategory || "all-subcategories"}
                        onClick={() => {
                          setActiveCategory(furnitureCategoryData?.category || "furniture");
                          if (!subcategory) {
                            setActiveSubcategory("");
                          } else {
                            setActiveSubcategory((prev) => (prev === subcategory ? "" : subcategory));
                          }
                          setPage(1);
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
                          (!subcategory && !activeSubcategory) || activeSubcategory === subcategory
                            ? "bg-amber-600 border-amber-600 text-white"
                            : "bg-white border-gray-200 text-gray-700"
                        }`}
                        aria-label={subcategory ? `Switch to ${subcategory.replace(/-/g, " ")} subcategory` : "Show all subcategories"}
                      >
                        {subcategory ? subcategory.replace(/-/g, ' ') : 'All'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Filter/Sort Actions */}
              <div className="lg:hidden bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-gray-100 mb-6">
                <div className="grid grid-cols-2 gap-2 p-3 pt-1 border-t border-gray-100">
                  <button
                    onClick={() => setIsMobilePriceFilterOpen((prev) => !prev)}
                    className="flex items-center justify-center gap-2 h-11 border border-gray-200 rounded-lg text-gray-700 bg-white"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}</span>
                  </button>
                  <button
                    onClick={() => setIsSortSheetOpen(true)}
                    className="flex items-center justify-center gap-2 h-11 border border-gray-200 rounded-lg text-gray-700 bg-white"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    <span className="truncate max-w-[140px]">{sortLabel}</span>
                  </button>
                </div>
                <div className="px-3 pb-3 text-xs text-gray-500">{totalItems} results</div>

                <AnimatePresence>
                  {isMobilePriceFilterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="px-3 pb-3"
                    >
                      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4">
                        <FilterSidebar
                          categories={filteredCategories}
                          activeCategory={activeCategory}
                          activeSubcategory={activeSubcategory}
                          hideCategorySelection
                          minPrice={minPrice}
                          maxPrice={maxPrice}
                          onCategoryChange={handleCategoryChange}
                          onSubcategoryChange={handleSubcategoryChange}
                          onPriceChange={handlePriceChange}
                          onClearFilters={clearFilters}
                        />
                        <button
                          onClick={() => setIsMobilePriceFilterOpen(false)}
                          className="w-full mt-3 h-10 rounded-lg bg-amber-600 text-white text-sm font-medium"
                        >
                          Apply Price Filter
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop Toolbar */}
              <div className="hidden lg:flex sticky top-40 z-30 items-center justify-between bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-md border border-gray-100 mb-6 gap-4">
                <span className="text-sm text-gray-500">
                  Showing <span className="font-medium text-gray-900">{products.length}</span> of <span className="font-medium text-gray-900">{totalItems}</span>
                </span>
                <SortDropdown
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSortChange={handleSortChange}
                />
              </div>

              {/* Mobile Sort Bottom Sheet */}
              <AnimatePresence>
                {isSortSheetOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsSortSheetOpen(false)}
                      className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    />
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 220 }}
                      className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl p-5 lg:hidden"
                    >
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Sort by</h3>
                      <div className="space-y-2 max-h-[60vh] overflow-y-auto pb-2">
                        {SORT_OPTIONS.map((option) => {
                          const selected = option.sortBy === sortBy && option.sortOrder === sortOrder;
                          return (
                            <button
                              key={`${option.sortBy}-${option.sortOrder}`}
                              onClick={() => {
                                handleSortChange(option.sortBy, option.sortOrder);
                                setIsSortSheetOpen(false);
                              }}
                              className={`w-full h-12 px-4 rounded-lg flex items-center justify-between text-sm border ${
                                selected
                                  ? "border-amber-500 bg-amber-50 text-amber-700 font-medium"
                                  : "border-gray-200 text-gray-700"
                              }`}
                            >
                              <span>{option.label}</span>
                              {selected && <Check className="w-4 h-4" />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center my-12">
                  <p className="text-red-600 font-medium">Failed to load products: {error}</p>
                  <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Try Again
                  </button>
                </div>
              )}

              {/* Loading Skeleton */}
              {loading && !error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
                >
                  {Array.from({ length: limit }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </motion.div>
              )}

              {/* Empty State */}
              {!loading && !error && products.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Filter className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    We couldn't find any products matching your current filters. Try adjusting your category or price range.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    aria-label="Clear all filters"
                  >
                    Clear All Filters
                  </button>
                </motion.div>
              )}

              {/* Products Grid */}
              {!loading && !error && products.length > 0 && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ staggerChildren: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
                  >
                    {products.map((product, index) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-12 gap-2" role="navigation" aria-label="Pagination Navigation">
                      <button
                        aria-label="Previous page"
                        disabled={page === 1}
                        onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 400); }}
                        className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-amber-500"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="px-4 py-2 text-sm font-medium text-gray-700" aria-live="polite">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        aria-label="Next page"
                        disabled={page === totalPages}
                        onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 400); }}
                        className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-amber-500"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Products;
