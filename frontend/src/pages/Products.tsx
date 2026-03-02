import React, { useState, useEffect, useCallback, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

import { useProducts, useCategories } from "../hooks/useProducts";
import { ProductCard } from "../components/cards/ProductCard";
import { ProductCardSkeleton } from "../components/cards/ProductCardSkeleton";
import { FilterSidebar } from "../components/filters/FilterSidebar";
import { FilterDrawer } from "../components/filters/FilterDrawer";
import { SortDropdown } from "../components/filters/SortDropdown";

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Parse initial query params
  const queryParams = new URLSearchParams(location.search);
  const locationState = location.state as { target?: string } | null;
  const hashTarget = location.hash ? location.hash.substring(1) : "";

  const initialCategory = queryParams.get("category") || queryParams.get("cat") || "";
  const initialSubcategory = queryParams.get("subcategory") || locationState?.target || hashTarget || "";
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
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
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
    setPage(1);
  }, []);

  const handleSubcategoryChange = useCallback((sub: string) => {
    setActiveSubcategory(sub);
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

  return (
    <>
      <Helmet>
        <title>Premium Granite & Marble Products | HS Global Export</title>
        <meta name="description" content="Explore our extensive collection of premium granite, marble, sandstone, and natural stone products." />
        <link rel="canonical" href="https://hsglobalexport.com/products" />
      </Helmet>

      {/* Main Page Layout */}
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        {/* Header / Hero Section */}
        <div className="bg-white border-b border-gray-200 py-12 px-4 shadow-sm mb-8">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4 capitalize">
              {activeSubcategory
                ? activeSubcategory.replace(/-/g, ' ')
                : activeCategory
                  ? activeCategory.replace(/-/g, ' ')
                  : 'All Collection'}
            </h1>
            <p className="text-gray-500 text-lg">
              Discover unparalleled luxury in our curated selection of premium stone surfaces and bespoke furniture.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Desktop Sidebar Filter */}
            <div className="hidden lg:block w-72 shrink-0">
              <div
                ref={filterSidebarRef}
                onWheel={handleSidebarWheel}
                className="sticky top-24 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain"
              >
                <FilterSidebar
                  categories={categories}
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

            {/* Mobile Filter Drawer */}
            <FilterDrawer
              isOpen={isFilterDrawerOpen}
              onClose={() => setIsFilterDrawerOpen(false)}
              categories={categories}
              activeCategory={activeCategory}
              activeSubcategory={activeSubcategory}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onCategoryChange={handleCategoryChange}
              onSubcategoryChange={handleSubcategoryChange}
              onPriceChange={handlePriceChange}
              onClearFilters={clearFilters}
            />

            {/* Main Product Grid Area */}
            <div className="flex-1">

              {/* Toolbar: Filter Button (Mobile) & Sort Dropdown */}
              <div className="sticky top-20 lg:top-24 z-30 flex flex-col sm:flex-row items-center justify-between bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-md border border-gray-100 mb-6 gap-4">
                <div className="flex items-center justify-between w-full sm:w-auto">
                  <button
                    onClick={() => setIsFilterDrawerOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filters {activeCategory || minPrice || maxPrice ? '(Active)' : ''}</span>
                  </button>
                  <span className="text-sm text-gray-500 block sm:hidden">
                    {totalItems} Results
                  </span>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                  <span className="text-sm text-gray-500 hidden sm:block">
                    Showing <span className="font-medium text-gray-900">{products.length}</span> of <span className="font-medium text-gray-900">{totalItems}</span>
                  </span>
                  <SortDropdown
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSortChange={handleSortChange}
                  />
                </div>
              </div>

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
