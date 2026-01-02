import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Grid3x3, X, Search } from 'lucide-react';
import { SearchModal } from '../SearchModal';
import { categories, Subcategory } from '../../data/products';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface TopTabsNavProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  onMeasure?: (dims: { height: number; top: number; offsetTop: number }) => void;
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export const TopTabsNav: React.FC<TopTabsNavProps> = ({
  activeSection,
  onSectionClick,
  onMeasure,
  activeCategory,
  onCategoryChange,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const programmaticScrollRef = useRef(false);
  const categoryChangeInProgressRef = useRef(false);

  // State management
  const [selectedChildren, setSelectedChildren] = useState<Record<string, string>>({});
  const [expandedParentId, setExpandedParentId] = useState<string | null>(null);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { contextSafe } = useGSAP({ scope: rootRef });

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initial animation
  useGSAP(() => {
    gsap.fromTo(
      rootRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
  }, []);

  // Get active category object
  const activeCategoryObj = useMemo(
    () => categories.find(c => c.id === activeCategory),
    [activeCategory]
  );

  // Reset expanded state on category change
  useEffect(() => {
    setExpandedParentId(null);
    setShowMegaMenu(false);
  }, [activeCategory]);

  // Build first level subcategories
  const firstLevelSubs = useMemo(() => {
    if (!activeCategoryObj) return [] as Array<{
      id: string;
      name: string;
      hasChildren: boolean;
      hasProducts: boolean;
      children: Subcategory[];
    }>;

    return activeCategoryObj.subcategories.map((s) => {
      const normalizedId = (s.id || '').trim().toLowerCase();
      const isConsolidated = ['marble', 'onyx', 'sandstone', 'travertine'].includes(normalizedId);
      let hasChildren = Array.isArray(s.subcategories) && s.subcategories.length > 0;

      if (activeCategory === 'slabs' && isConsolidated) {
        hasChildren = false;
      }

      const hasProducts = Array.isArray(s.products) && s.products.length > 0;

      return {
        id: s.id,
        name: s.name,
        hasChildren,
        hasProducts,
        children: s.subcategories || []
      };
    });
  }, [activeCategoryObj, activeCategory]);

  // Build child to parent mapping
  const childToParent = useMemo(() => {
    const map: Record<string, { parentId: string; parentName: string }> = {};
    const walk = (subs: Subcategory[], parentId?: string, parentName?: string) => {
      subs.forEach((s) => {
        if (parentId && parentName) {
          map[s.id] = { parentId, parentName };
        }
        if (s.subcategories) {
          walk(s.subcategories, s.id, s.name);
        }
      });
    };
    if (activeCategoryObj) {
      walk(activeCategoryObj.subcategories);
    }
    return map;
  }, [activeCategoryObj]);

  // Sync selected children with active section
  useEffect(() => {
    const parentInfo = childToParent[activeSection];
    if (parentInfo) {
      setSelectedChildren(prev => ({
        ...prev,
        [parentInfo.parentId]: activeSection
      }));
    }
  }, [activeSection, childToParent]);

  // Report dimensions to parent
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const report = () => {
      const rect = el.getBoundingClientRect();
      const topStr = getComputedStyle(el).top;
      const top = parseFloat(topStr) || 0;
      const offsetTop = rect.top + window.scrollY;
      onMeasure?.({ height: rect.height, top, offsetTop });
    };

    const ro = new ResizeObserver(() => report());
    ro.observe(el);
    window.addEventListener('resize', report);
    report();

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', report);
    };
  }, [onMeasure]);

  // Handle subcategory click
  const handleSubcategoryClick = (subcategory: typeof firstLevelSubs[0]) => {
    programmaticScrollRef.current = true;

    if (!subcategory.hasChildren) {
      onSectionClick(subcategory.id);
      scrollToSection(subcategory.id);
      setExpandedParentId(null);
      setShowMegaMenu(false);
      return;
    }

    // On mobile, always show in mega menu
    if (isMobile) {
      setExpandedParentId(prev => (prev === subcategory.id ? null : subcategory.id));
    } else {
      programmaticScrollRef.current = false;
      setExpandedParentId(prev => (prev === subcategory.id ? null : subcategory.id));
    }
  };

  // Handle child selection
  const handleChildSelection = (parentId: string, childId: string) => {
    programmaticScrollRef.current = true;
    setSelectedChildren(prev => ({ ...prev, [parentId]: childId }));
    onSectionClick(childId);
    setExpandedParentId(null);
    setShowMegaMenu(false);
    window.history.replaceState(null, '', `#${childId}`);
    scrollToSection(childId);
  };

  // Scroll to section helper
  const scrollToSection = (sectionId: string) => {
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        const navH = rootRef.current ? rootRef.current.getBoundingClientRect().height : 96;
        const offset = navH + 16;
        const targetTop = window.scrollY + el.getBoundingClientRect().top - offset;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });

        setTimeout(() => {
          programmaticScrollRef.current = false;
        }, 1000);
      } else {
        programmaticScrollRef.current = false;
      }
    }, 50);
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    if (categoryChangeInProgressRef.current || categoryId === activeCategory) return;

    categoryChangeInProgressRef.current = true;
    programmaticScrollRef.current = true;
    sessionStorage.removeItem('scrollY');

    onCategoryChange(categoryId);
    setExpandedParentId(null);
    setShowMegaMenu(false);

    const url = new URL(window.location.href);
    url.search = `?cat=${categoryId}`;
    url.hash = '';
    window.history.replaceState(null, '', url.toString());

    setTimeout(() => {
      const targetCategory = categories.find(c => c.id === categoryId);
      if (targetCategory?.subcategories?.[0]) {
        const firstSectionId = targetCategory.subcategories[0].id;
        onSectionClick(firstSectionId);
        scrollToSection(firstSectionId);

        setTimeout(() => {
          categoryChangeInProgressRef.current = false;
        }, 1000);
      } else {
        programmaticScrollRef.current = false;
        categoryChangeInProgressRef.current = false;
      }
    }, 50);
  };

  // Get display name for subcategory
  const getDisplayName = (subcategory: typeof firstLevelSubs[0]) => {
    const selectedChildId = selectedChildren[subcategory.id];
    if (selectedChildId && subcategory.hasChildren) {
      const selectedChild = subcategory.children.find(child => child.id === selectedChildId);
      if (selectedChild) {
        return `${subcategory.name} › ${selectedChild.name}`;
      }
    }
    return subcategory.name;
  };

  // GSAP animations (desktop only)
  const handleMouseEnter = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isMobile) {
      gsap.to(e.currentTarget, { scale: 1.02, duration: 0.2, ease: 'power2.out' });
    }
  });

  const handleMouseLeave = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isMobile) {
      gsap.to(e.currentTarget, { scale: 1, duration: 0.2, ease: 'power2.out' });
    }
  });

  return (
    <div
      ref={rootRef}
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm touch-manipulation"
    >
      <div className="container mx-auto px-3 sm:px-4">
        {/* Top Bar: Categories + Mega Menu Toggle */}
        <div className="flex items-center justify-between py-2.5 sm:py-3 md:py-4 gap-2 sm:gap-4">
          {/* Category Switcher */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="inline-flex items-center gap-0.5 sm:gap-1 bg-gray-100 rounded-full p-0.5 sm:p-1 shadow-sm">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  disabled={categoryChangeInProgressRef.current}
                  className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm md:text-base font-semibold tracking-wide transition-all duration-300 disabled:opacity-50 active:scale-95 ${activeCategory === category.id
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-700 hover:text-black hover:bg-white'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 sm:p-2.5 rounded-full hover:bg-gray-100 active:scale-95 transition-all duration-300"
              aria-label="Search products"
            >
              <Search className="h-5 w-5 text-gray-700" />
            </button>

            {/* Mega Menu Toggle */}
            <button
              onClick={() => setShowMegaMenu(!showMegaMenu)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black text-white hover:bg-gray-800 active:scale-95 transition-all duration-300 shadow-md text-xs sm:text-sm"
              aria-label="Toggle navigation menu"
            >
              {showMegaMenu ? (
                <>
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline font-medium">Close</span>
                </>
              ) : (
                <>
                  <Grid3x3 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline font-medium">All</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Access Subcategories Bar (Desktop Only) */}
        {!isMobile && firstLevelSubs.length > 0 && !showMegaMenu && (
          <div className="pb-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
            <div className="flex items-center gap-2 min-w-max">
              {firstLevelSubs.slice(0, 6).map((subcategory) => {
                const isActive =
                  activeSection === subcategory.id ||
                  subcategory.children?.some(child => child.id === activeSection);

                return (
                  <button
                    key={subcategory.id}
                    onClick={() => handleSubcategoryClick(subcategory)}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap border flex items-center gap-2 ${isActive
                      ? 'bg-black text-white border-black shadow-md'
                      : 'text-gray-700 border-gray-300 hover:border-black hover:bg-gray-50'
                      }`}
                  >
                    <span>{getDisplayName(subcategory)}</span>
                    {subcategory.hasChildren && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${expandedParentId === subcategory.id ? 'rotate-180' : ''
                          }`}
                      />
                    )}
                  </button>
                );
              })}
              {firstLevelSubs.length > 6 && (
                <button
                  onClick={() => setShowMegaMenu(true)}
                  className="px-4 py-2 text-sm font-medium rounded-full text-gray-600 hover:text-black hover:bg-gray-100 transition-all duration-300"
                >
                  +{firstLevelSubs.length - 6} more
                </button>
              )}
            </div>
          </div>
        )}

        {/* Inline Expanded Children (Desktop) */}
        {!isMobile && expandedParentId && !showMegaMenu && (
          <div className="pb-3 border-t border-gray-200 pt-3 animate-fadeIn">
            {firstLevelSubs
              .filter(s => s.id === expandedParentId)
              .map(parent => (
                <div key={parent.id} className="flex flex-wrap gap-2">
                  {parent.children.map(child => {
                    const isActive = activeSection === child.id;
                    return (
                      <button
                        key={child.id}
                        onClick={() => handleChildSelection(parent.id, child.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive
                          ? 'bg-gray-900 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {child.name}
                      </button>
                    );
                  })}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Mega Menu Overlay - Mobile Optimized */}
      {showMegaMenu && (
        <div
          className={`absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-2xl animate-slideDown z-50 ${isMobile ? 'fixed' : ''
            }`}
        >
          <div className={`container mx-auto px-3 sm:px-4 py-4 sm:py-6 ${isMobile ? 'max-h-[calc(100vh-80px)]' : 'max-h-[70vh]'
            } overflow-y-auto custom-scrollbar`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {firstLevelSubs.map((subcategory) => {
                const isActive =
                  activeSection === subcategory.id ||
                  subcategory.children?.some(child => child.id === activeSection);
                const isExpanded = expandedParentId === subcategory.id;

                return (
                  <div
                    key={subcategory.id}
                    className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-300 ${isActive
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                  >
                    {/* Parent Category */}
                    <button
                      onClick={() => handleSubcategoryClick(subcategory)}
                      className="w-full text-left active:scale-98 transition-transform"
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 pr-2">
                          {subcategory.name}
                        </h3>
                        {subcategory.hasChildren && (
                          <ChevronDown
                            className={`h-5 w-5 text-gray-600 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''
                              }`}
                          />
                        )}
                      </div>
                    </button>

                    {/* Children - Show when expanded on mobile, always show on desktop */}
                    {subcategory.hasChildren && (isMobile ? isExpanded : true) && (
                      <div className="space-y-1 pl-2 border-l-2 border-gray-300 animate-fadeIn">
                        {subcategory.children.map(child => {
                          const isChildActive = activeSection === child.id;
                          return (
                            <button
                              key={child.id}
                              onClick={() => handleChildSelection(subcategory.id, child.id)}
                              className={`w-full text-left px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 active:scale-98 ${isChildActive
                                ? 'bg-black text-white'
                                : 'text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                                }`}
                            >
                              {child.name}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Direct Link for No Children */}
                    {!subcategory.hasChildren && (
                      <p className="text-xs sm:text-sm text-gray-500">
                        Tap to view {subcategory.name.toLowerCase()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mega Menu Backdrop */}
      {showMegaMenu && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setShowMegaMenu(false)}
        />
      )}

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};