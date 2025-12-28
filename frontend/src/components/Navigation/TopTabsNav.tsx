import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { categories, Subcategory } from '../../data/products';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface TopTabsNavProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  onMeasure?: (dims: { height: number; top: number; offsetTop: number }) => void;
  forceFixed?: boolean;
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export const TopTabsNav: React.FC<TopTabsNavProps> = ({
  activeSection,
  onSectionClick,
  onMeasure,
  forceFixed,
  activeCategory,
  onCategoryChange,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const subNavRef = useRef<HTMLDivElement | null>(null);
  const programmaticScrollRef = useRef(false);
  const categoryChangeInProgressRef = useRef(false);
  const [selectedChildren, setSelectedChildren] = useState<Record<string, string>>({});
  const [expandedParentId, setExpandedParentId] = useState<string | null>(null);

  const { contextSafe } = useGSAP({ scope: rootRef });

  useGSAP(() => {
    gsap.fromTo(rootRef.current, { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' });
  }, []); // Run once on mount

  const activeCategoryObj = useMemo(() =>
    categories.find(c => c.id === activeCategory),
    [activeCategory]
  );

  useEffect(() => {
    setExpandedParentId(null);
  }, [activeCategory]);

  const firstLevelSubs = useMemo(() => {
    if (!activeCategoryObj) return [] as Array<{ id: string; name: string; hasChildren: boolean; hasProducts: boolean; children: Subcategory[] }>;

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

  useEffect(() => {
    const parentInfo = childToParent[activeSection];
    if (parentInfo) {
      setSelectedChildren(prev => ({
        ...prev,
        [parentInfo.parentId]: activeSection
      }));
    }
  }, [activeSection, childToParent]);

  // Report dimensions to parent (ResizeObserver + resize)
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

  const handleSubcategoryClick = (subcategory: typeof firstLevelSubs[0]) => {
    // Set programmatic scroll flag to prevent scroll listener interference
    programmaticScrollRef.current = true;

    if (!subcategory.hasChildren) {
      onSectionClick(subcategory.id);

      setTimeout(() => {
        const el = document.getElementById(subcategory.id);
        if (el) {
          const navH = rootRef.current ? rootRef.current.getBoundingClientRect().height : 96;
          const offset = navH + 16;
          const targetTop = window.scrollY + el.getBoundingClientRect().top - offset;
          window.scrollTo({ top: targetTop, behavior: 'smooth' });

          // Clear flag after scroll animation completes
          setTimeout(() => {
            programmaticScrollRef.current = false;
          }, 1000);
        } else {
          programmaticScrollRef.current = false;
        }
      }, 50);

      // Sync URL hash
      window.history.replaceState(null, '', `#${subcategory.id}`);
      setExpandedParentId(null);
      return;
    }

    programmaticScrollRef.current = false;
    setExpandedParentId(prev => (prev === subcategory.id ? null : subcategory.id));
  };

  const onLabelClick = (subcategory: typeof firstLevelSubs[0]) => {
    if (!subcategory.hasChildren) handleSubcategoryClick(subcategory);
  };

  const handleChildSelection = (parentId: string, childId: string) => {
    programmaticScrollRef.current = true;

    setSelectedChildren(prev => ({ ...prev, [parentId]: childId }));
    onSectionClick(childId);
    setExpandedParentId(null);

    window.history.replaceState(null, '', `#${childId}`);

    // Scroll to the child section
    setTimeout(() => {
      const el = document.getElementById(childId);
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

  // FIXED: Handle category change with proper navigation
  const handleCategoryChange = (categoryId: string) => {
    if (categoryChangeInProgressRef.current) return;
    if (categoryId === activeCategory) return;

    categoryChangeInProgressRef.current = true;
    programmaticScrollRef.current = true;

    // Clear scroll restoration flag
    sessionStorage.removeItem('scrollY');

    // Change category
    onCategoryChange(categoryId);
    setExpandedParentId(null);

    // Update URL
    const url = new URL(window.location.href);
    url.search = `?cat=${categoryId}`;
    url.hash = '';
    window.history.replaceState(null, '', url.toString());

    // Wait for React to update, then navigate to first section
    setTimeout(() => {
      const targetCategory = categories.find(c => c.id === categoryId);
      if (targetCategory?.subcategories?.[0]) {
        const firstSection = targetCategory.subcategories[0];
        const firstSectionId = firstSection.id;

        // Update active section
        onSectionClick(firstSectionId);

        // Scroll to first section
        setTimeout(() => {
          const el = document.getElementById(firstSectionId);
          if (el) {
            const navH = rootRef.current ? rootRef.current.getBoundingClientRect().height : 96;
            const offset = navH + 16;
            const targetTop = window.scrollY + el.getBoundingClientRect().top - offset;

            window.scrollTo({
              top: Math.max(0, targetTop),
              behavior: 'smooth'
            });

            // Clear flags after animation
            setTimeout(() => {
              programmaticScrollRef.current = false;
              categoryChangeInProgressRef.current = false;
            }, 1000);
          } else {
            programmaticScrollRef.current = false;
            categoryChangeInProgressRef.current = false;
          }
        }, 100);
      } else {
        programmaticScrollRef.current = false;
        categoryChangeInProgressRef.current = false;
      }
    }, 50);
  };

  const getDisplayName = (subcategory: typeof firstLevelSubs[0]) => {
    const selectedChildId = selectedChildren[subcategory.id];
    if (selectedChildId && subcategory.hasChildren) {
      const selectedChild = subcategory.children.find(child => child.id === selectedChildId);
      if (selectedChild) {
        return `${subcategory.name} > ${selectedChild.name}`;
      }
    }
    return subcategory.name;
  };

  const handleMouseEnter = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, { scale: 1.02, duration: 0.2 });
  });

  const handleMouseLeave = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, { scale: 1, duration: 0.2 });
  });

  const handleMouseDown = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, { scale: 0.98, duration: 0.1 });
  });

  const handleMouseUp = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, { scale: 1.02, duration: 0.1 });
  });


  return (
    <div
      ref={rootRef}
      className={`${forceFixed ? 'fixed top-0 left-0 right-0' : 'sticky top-0'
        } z-40 border-b transition-all duration-300 ${forceFixed ? 'bg-white/70 supports-[backdrop-filter]:bg-white/50 backdrop-blur-md border-gray-200/70 shadow-sm' : 'bg-transparent backdrop-blur-0 border-transparent shadow-none'}`}
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Main Categories */}
        <div className="flex justify-center py-3 md:py-4">
          <div className="inline-flex items-center gap-1 md:gap-2 bg-white rounded-full p-1 shadow-inner border-2 border-black">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                disabled={categoryChangeInProgressRef.current}
                className={`px-3 md:px-6 py-2 rounded-full text-sm md:text-base font-semibold tracking-wide transition-all duration-300 disabled:opacity-50 ${activeCategory === category.id
                    ? 'bg-black text-white border-2 border-black'
                    : 'text-black hover:text-white hover:bg-black border-2 border-transparent hover:border-black'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategories */}
        {firstLevelSubs.length > 0 && (
          <div className="pb-3 md:pb-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="relative flex-1 overflow-hidden">
                <div
                  ref={subNavRef}
                  className="overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 pb-2"
                >
                  <div className="flex flex-nowrap gap-2 px-1 md:flex-nowrap md:justify-start">
                    {firstLevelSubs.map((subcategory) => {
                      const isActive =
                        activeSection === subcategory.id ||
                        subcategory.children?.some(child => child.id === activeSection);
                      return (
                        <div key={subcategory.id} className="relative flex-shrink-0">
                          <button
                            onClick={() => handleSubcategoryClick(subcategory)}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            className={`px-3 md:px-4 py-2 md:py-2 text-sm md:text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap border-2 backdrop-blur flex items-center gap-2 min-w-[8rem] max-w-[12rem] ${isActive
                                ? 'bg-black text-white border-black shadow-md'
                                : 'text-black border-black hover:text-white hover:bg-black bg-white'
                              }`}
                          >
                            <span
                              className="truncate max-w-[200px] md:max-w-none"
                              onClick={() => onLabelClick(subcategory)}
                            >
                              {getDisplayName(subcategory)}
                            </span>
                            {subcategory.hasChildren && (
                              <ChevronDown
                                className={`h-3 w-3 md:h-4 md:w-4 transition-transform ${expandedParentId === subcategory.id ? 'rotate-180' : ''
                                  }`}
                              />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inline expanded children */}
      {expandedParentId && activeCategoryObj && (
        <div className="border-t border-black/10 bg-white">
          <div className="container mx-auto px-4 md:px-6 py-2 md:py-3">
            {firstLevelSubs
              .filter(s => s.id === expandedParentId)
              .map(parent => (
                <div key={parent.id} className="flex flex-wrap gap-2 mt-2">
                  {parent.children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => handleChildSelection(parent.id, child.id)}
                      className="px-3 py-1.5 rounded-full border-2 border-black bg-white text-black hover:bg-black hover:text-white text-sm md:text-base min-w-[100px] text-center"
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};