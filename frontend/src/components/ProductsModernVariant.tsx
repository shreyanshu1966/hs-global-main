import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { TopTabsNav } from "./Navigation/TopTabsNav";
import { ProductCard } from "./ProductCard";
import { Product } from "../services/productService";
import { useProducts } from "../hooks/useProducts";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getCloudinaryUrl } from '@/utils/cloudinary';
// @ts-expect-error - responsive-image-helper.jsx lacks TypeScript declarations
import { getResponsiveImage, getSrcSet } from '../utils/responsive-image-helper';

gsap.registerPlugin(ScrollTrigger);

export const ProductsModernVariant: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  // Parallax for Hero
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);

  const hasRestoredScrollRef = useRef(false);

  // Initialize activeCategory based on URL parameters
  const getInitialCategory = useCallback(() => {
    const params = new URLSearchParams(location.search || "");
    const catParam = (params.get("cat") || "").toLowerCase();
    if (catParam === "furniture" || catParam === "slabs") {
      return catParam;
    }
    return "furniture"; // Default fallback
  }, [location.search]);

  useEffect(() => {
    if (!hasRestoredScrollRef.current) {
      const savedY = sessionStorage.getItem("scrollY");
      if (savedY) {
        const scrollTimeout = setTimeout(() => {
          window.scrollTo(0, parseInt(savedY, 10));
          sessionStorage.removeItem("scrollY");
          hasRestoredScrollRef.current = true;
        }, 100);

        return () => clearTimeout(scrollTimeout);
      } else {
        // No saved scroll position, ensure we start at top
        window.scrollTo(0, 0);
      }
      hasRestoredScrollRef.current = true;
    }
  }, []);

  const heroRef = useRef<HTMLElement | null>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [navDims, setNavDims] = useState<{ height: number; top: number; offsetTop?: number }>({
    height: 0,
    top: 0,
    offsetTop: 0,
  });

  const [activeCategory, setActiveCategory] = useState<string>(getInitialCategory());
  const [activeSection, setActiveSection] = useState<string>("tables");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const programmaticScrollRef = useRef<boolean>(false);
  const userInteractedRef = useRef<boolean>(false);
  const lastScrollYRef = useRef<number>(0);
  const scrollVelocityRef = useRef<number>(0);
  const scrollDirectionRef = useRef<'up' | 'down'>('down');
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Animation Ref
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useGSAP(() => {
    // Hero Animation
    if (heroTitleRef.current && heroSubtitleRef.current) {
      gsap.fromTo(heroTitleRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.45 });
      gsap.fromTo(heroSubtitleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.08 });
    }

    // Sections Animation handled below in filtered list render (or useEffect if dynamic list changes)
  }, { scope: containerRef });


  /**
   * Track user interaction and scroll behavior
   * Aggressively clears programmatic flags on ANY user input
   */
  useEffect(() => {
    const markUserInteraction = () => {
      userInteractedRef.current = true;
    };
    
    // Track scroll velocity and direction for smarter decisions
    let scrollTimeout: NodeJS.Timeout;
    const handleUserScroll = () => {
      markUserInteraction();
      
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollYRef.current;
      
      scrollVelocityRef.current = Math.abs(diff);
      scrollDirectionRef.current = diff > 0 ? 'down' : 'up';
      lastScrollYRef.current = currentScrollY;
      
      // AGGRESSIVE: Clear programmatic flag immediately on user scroll
      programmaticScrollRef.current = false;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        scrollVelocityRef.current = 0;
      }, 150);
    };

    // Handler to immediately clear programmatic scroll on ANY manual input
    const clearProgrammaticScroll = () => {
      programmaticScrollRef.current = false;
    };
    
    // Attach event listeners
    window.addEventListener("scroll", handleUserScroll, { passive: true });
    window.addEventListener("mousedown", clearProgrammaticScroll, { passive: true });
    window.addEventListener("touchstart", clearProgrammaticScroll, { passive: true });
    window.addEventListener("wheel", clearProgrammaticScroll, { passive: true });
    window.addEventListener("touchmove", clearProgrammaticScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleUserScroll);
      window.removeEventListener("mousedown", clearProgrammaticScroll);
      window.removeEventListener("touchstart", clearProgrammaticScroll);
      window.removeEventListener("wheel", clearProgrammaticScroll);
      window.removeEventListener("touchmove", clearProgrammaticScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Sync activeCategory with URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search || "");
    const catParam = (params.get("cat") || "").toLowerCase();
    if (catParam === "furniture" || catParam === "slabs") {
      setActiveCategory(catParam);
    }
  }, [location.search]);


  // Gallery preview using Cloudinary URLs
  const galleryFiles = import.meta.glob('../../public/gallery/**/*.{webp,jpg,jpeg,png}', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

  const [galleryPreview, setGalleryPreview] = useState<string[]>([]);
  useEffect(() => {
    const keys = Object.keys(galleryFiles);
    if (!keys.length) return;

    // Get random 6 images
    const shuffled = [...keys].sort(() => Math.random() - 0.5);
    const slice = shuffled.slice(0, 6);

    // Convert to Cloudinary URLs
    const cloudinaryUrls = slice.map(absPath => {
      // Remove relative path prefix to get path starting from gallery
      const rel = absPath.replace(/^..\/..\/public\//, '').replace(/^\//, '');
      return getCloudinaryUrl(rel);
    });

    setGalleryPreview(cloudinaryUrls);
  }, []);

  // Fetch products from API
  const {
    products: allProducts,
    loading: productsLoading,
    error: productsError
  } = useProducts({
    category: activeCategory,
    limit: 1000 // Get all products for the category
  });

  // Group products by subcategory
  const subcategorizedProducts = useMemo(() => {
    const grouped: { [subcategory: string]: Product[] } = {};

    allProducts.forEach(product => {
      const sub = product.subcategory || 'Uncategorized';
      if (!grouped[sub]) {
        grouped[sub] = [];
      }
      grouped[sub].push(product);
    });

    return Object.entries(grouped).map(([subcategory, products]) => ({
      id: subcategory.toLowerCase().replace(/\s+/g, '-'),
      name: subcategory,
      products: products
    }));
  }, [allProducts]);

  const categoryFilteredSubcategories = subcategorizedProducts;
  const orderedIds = subcategorizedProducts.map(sub => sub.id);

  // Create a map of all subcategories for product lookup
  const allSubcategories = subcategorizedProducts;

  // Reset activeSection to first section when category changes - NO AUTO SCROLL
  useEffect(() => {
    if (orderedIds.length > 0) {
      const firstSectionId = orderedIds[0];
      setActiveSection(firstSectionId);
      // Disabled automatic scrolling when category changes
    }
  }, [activeCategory, orderedIds]);

  // OPTIMIZED: Preloading disabled - images load on demand with lazy loading
  // This improves initial page load performance

  // Image preloading removed - using lazy loading for better performance

  const handleMeasure = useCallback((d: { height: number; top: number; offsetTop: number }) => {
    setNavDims((prev) => {
      if (prev.height === d.height && prev.top === d.top && prev.offsetTop === d.offsetTop)
        return prev;
      return d;
    });
  }, []);

  /**
   * Programmatic scroll to section with mobile optimization
   * Professional practices:
   * - Mobile-specific offset calculations
   * - Flag management to prevent observer conflicts
   * - Proper cleanup with timeout
   */
  const scrollToSection = useCallback(
    (sectionId: string) => {
      programmaticScrollRef.current = true;
      const el = sectionRefs.current[sectionId];
      
      if (!el) {
        programmaticScrollRef.current = false;
        return;
      }
      
      const isMobileDevice = window.innerWidth < 768;
      // Mobile needs extra offset to account for browser UI elements
      const offset = isMobileDevice ? (navDims.height || 80) + 32 : (navDims.height || 80) + 16;
      const targetTop = window.scrollY + el.getBoundingClientRect().top - offset;
      
      window.scrollTo({ top: targetTop, behavior: "smooth" });
      setActiveSection(sectionId);

      // Clear programmatic flag after smooth scroll completes
      setTimeout(() => {
        programmaticScrollRef.current = false;
      }, 700);
    },
    [navDims.height]
  );

  // Helper function to get ordered subcategory IDs for a category
  const getOrderedSubcategoryIds = useCallback((categoryId: string) => {
    // Since we're already filtering by activeCategory in the useProducts hook,
    // we just return the orderedIds when the category matches
    if (categoryId === activeCategory) {
      return orderedIds;
    }
    return [];
  }, [activeCategory, orderedIds]);

  // Memoize category ID sets for faster O(1) lookups
  const furnitureIds = useMemo(() => new Set(getOrderedSubcategoryIds("furniture")), [getOrderedSubcategoryIds]);
  const slabsIds = useMemo(() => new Set(getOrderedSubcategoryIds("slabs")), [getOrderedSubcategoryIds]);

  /**
   * IntersectionObserver - Mobile optimized (no hero checks on mobile)
   */
  useEffect(() => {
    const isMobileDevice = window.innerWidth < 768;
    
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: isMobileDevice ? "-80px 0px -60px 0px" : "-140px 0px -60px 0px",
      threshold: [0, 0.25, 0.5, 0.75],
    };

    let rafScheduled = false;
    let latestSection: string | null = null;

    const observer = new IntersectionObserver((entries) => {
      // GUARD 1: Skip if programmatic scroll is in progress
      if (programmaticScrollRef.current) return;
      
      // GUARD 2 (Desktop only): Hero area check
      if (!isMobileDevice) {
        const scrollY = window.scrollY;
        const heroHeight = heroRef.current?.offsetHeight || 600;
        
        if (scrollY < heroHeight * 0.8) {
          if (!rafScheduled) {
            rafScheduled = true;
            requestAnimationFrame(() => {
              setActiveSection('');
              rafScheduled = false;
            });
          }
          return;
        }
      }

      // Process intersections with max visibility detection
      let maxVisibility = 0;
      let mostVisibleSection: string | null = null;
      
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > maxVisibility) {
          maxVisibility = entry.intersectionRatio;
          mostVisibleSection = entry.target.id;
        }
      });

      if (mostVisibleSection) {
        latestSection = mostVisibleSection;
      }

      // RAF batching with most visible section
      if (!rafScheduled && latestSection) {
        rafScheduled = true;
        requestAnimationFrame(() => {
          if (latestSection && !userInteractedRef.current) {
            setActiveSection(latestSection);
          }
          rafScheduled = false;
          latestSection = null;
        });
      }
    }, observerOptions);

    observerRef.current = observer;

    // Observe all sections
    requestAnimationFrame(() => {
      Object.values(sectionRefs.current).forEach((el) => {
        if (el) observer.observe(el);
      });
    });

    return () => {
      observer.disconnect();
    };
  }, [activeCategory, furnitureIds, slabsIds]);

  // Refresh ScrollTrigger when products load or change to ensure sticky nav works correctly
  useEffect(() => {
    if (!productsLoading && allProducts.length > 0) {
      // Small delay to ensure DOM is rendered
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [productsLoading, allProducts, activeCategory]);



  useEffect(() => {
    const savedY = sessionStorage.getItem("scrollY");
    if (savedY) return;

    if (programmaticScrollRef.current) return;

    const validSlabIds = new Set(["marble", "granite", "sandstone", "onyx", "travertine"]);

    const navigateToHashOrState = () => {
      programmaticScrollRef.current = true;

      const state = (location.state as any) || {};
      const rawState = (state?.target as string | undefined) || "";
      const params = new URLSearchParams(location.search || "");
      const catParam = (params.get("cat") || "").toLowerCase();
      const rawHash = (window.location.hash || "").replace(/^#/, "").trim().toLowerCase();
      const raw = (rawState || rawHash).toLowerCase();

      if (catParam === "furniture" || catParam === "slabs") {
        if (activeCategory !== catParam) setActiveCategory(catParam);
      }

      const attemptScrollTo = (targetId: string, maxFrames = 60) =>
        new Promise<boolean>((resolve) => {
          let attempts = 0;
          const tryTick = () => {
            const el = sectionRefs.current[targetId];
            if (el) {
              scrollToSection(targetId);
              resolve(true);
              return;
            }
            if (attempts++ < maxFrames) requestAnimationFrame(tryTick);
            else {
              programmaticScrollRef.current = false;
              resolve(false);
            }
          };
          requestAnimationFrame(tryTick);
        });

      (async () => {
        const targetProduct = (state?.targetProduct as string | undefined) || "";
        if (targetProduct) {
          const pn = targetProduct.toLowerCase().trim();
          const match = allSubcategories.find((s) =>
            (s.products || []).some((p) => p.name.toLowerCase() === pn)
          );
          if (match) {
            await attemptScrollTo(match.id, 30);
            programmaticScrollRef.current = false;
            return;
          }
        }

        if (raw) {
          if (validSlabIds.has(raw)) {
            if (activeCategory !== "slabs") setActiveCategory("slabs");
            await attemptScrollTo(raw, 40);
            programmaticScrollRef.current = false;
            return;
          }

          if (activeCategory !== "furniture") setActiveCategory("furniture");
          const success = await attemptScrollTo(raw, 40);
          if (success) {
            programmaticScrollRef.current = false;
            return;
          }

          // Try slabs if furniture failed
          if (activeCategory !== "slabs") setActiveCategory("slabs");
          await attemptScrollTo(raw, 60);
        }

        programmaticScrollRef.current = false;
      })();
    };

    navigateToHashOrState();
    const onHash = () => navigateToHashOrState();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [location.state, location.search, activeCategory, allSubcategories, scrollToSection]);


  useEffect(() => {
    const savedY = sessionStorage.getItem("scrollY");
    if (savedY) return;

    if ((window.location.hash || "").length > 1) return;
    const state = (location.state as any) || {};
    if (state?.target || state?.targetProduct) return;
    const firstId = categoryFilteredSubcategories[0]?.id;
    if (!firstId) return;

    programmaticScrollRef.current = true;
    let attempts = 0;
    const tick = () => {
      const el = sectionRefs.current[firstId];
      if (el) {
        scrollToSection(firstId);
        return;
      }
      if (attempts++ < 60) requestAnimationFrame(tick);
      else programmaticScrollRef.current = false;
    };
    requestAnimationFrame(() => requestAnimationFrame(tick));
  }, [categoryFilteredSubcategories, location.state, scrollToSection]);

  // Preload hero image only
  useEffect(() => {
    const heroUrl = getResponsiveImage("products-hero.webp", "large");
    if (heroUrl) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = heroUrl;
      document.head.appendChild(link);

      return () => {
        try {
          document.head.removeChild(link);
        } catch { }
      };
    }
  }, []);

  const clearHash = useCallback(() => {
    const url = new URL(window.location.href);
    url.hash = "";
    window.history.replaceState(null, "", url.toString());
  }, []);

  const handleCategoryChange = useCallback(
    (newCategory: string) => {
      clearHash();
      const url = new URL(window.location.href);
      url.search = `?cat=${newCategory}`;
      window.history.replaceState(null, "", url.toString());
      setActiveCategory(newCategory);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [clearHash]
  );

  // Section entrance animation hook
  const animateSection = useCallback((el: HTMLElement) => {
    if (!el) return;
    const title = el.querySelector('h2');
    const divider = el.querySelector('.divider-line');

    if (title) {
      gsap.fromTo(title,
        { opacity: 0, y: -20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          scrollTrigger: {
            trigger: el,
            start: "top bottom-=100",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
    if (divider) {
      gsap.fromTo(divider,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.3,
          delay: 0.05,
          scrollTrigger: {
            trigger: el,
            start: "top bottom-=100",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    gsap.fromTo(el,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.35,
        scrollTrigger: {
          trigger: el,
          start: "top bottom-=100"
        }
      }
    );

  }, []);

  // Gallery item animation
  const animateGalleryItem = useCallback((el: HTMLElement, index: number) => {
    if (!el) return;
    gsap.fromTo(el,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.28,
        delay: index * 0.03,
        scrollTrigger: {
          trigger: el,
          start: "top bottom-=50",
          once: true
        }
      }
    );
  }, []);


  return (
    <div ref={containerRef} className="min-h-screen bg-white">
      {/* Hero Section - Hidden on Mobile */}
      {!isMobile && (
      <section ref={heroRef} className="relative min-h-[100svh] flex flex-col justify-center px-[clamp(1.5rem,4vw,6rem)] overflow-hidden">
        <motion.div
          style={{ y: y1, opacity: opacityHero }}
          className="absolute top-0 right-0 w-[80vw] h-full opacity-10 pointer-events-none"
        >
          <img
            src={getResponsiveImage("products-hero.webp", "large") || "/products-hero.webp"}
            srcSet={getSrcSet("products-hero.webp")}
            sizes="80vw"
            className="w-full h-full object-cover filter grayscale contrast-125"
            alt="HS Global Products"
            loading="lazy"
          />
        </motion.div>

        <div className="relative z-10 max-w-[90vw]">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="block text-[clamp(0.625rem,1.2vw,0.875rem)] tracking-[0.3em] uppercase mb-[clamp(1rem,2vw,1.5rem)] text-gray-400">
              {t("product.hero_subtitle") || "Curated Collection"}
            </span>
            <h1 className="text-[clamp(3.5rem,13vw,14vw)] leading-[0.85] font-serif tracking-tighter text-black">
              Timeless <br />
              <span className="ml-[8vw] italic font-light text-gray-400">Material</span> <br />
              <span className="text-amber-900/80">Elegance</span>.
            </h1>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-[clamp(2rem,4vw,3rem)] left-[clamp(1.5rem,4vw,6rem)] flex items-center gap-[clamp(0.75rem,2vw,1rem)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <div className="h-[1px] w-[clamp(3rem,8vw,6rem)] bg-gray-300"></div>
          <p className="text-[clamp(0.625rem,1vw,0.75rem)] uppercase tracking-widest text-gray-400">Scroll to Explore</p>
        </motion.div>
      </section>
      )}

      <TopTabsNav
        activeSection={activeSection}
        onSectionClick={scrollToSection}
        onMeasure={handleMeasure}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <div className="pt-6 md:pt-8" id="products">
        <div className="container mx-auto px-4 md:px-6">
          {/* Error State with Retry */}
          {productsError && (
            <div className="text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-600 text-lg font-semibold mb-2">
                  {productsError.includes('fetch') ? 'Connection Error' : 'Error Loading Products'}
                </p>
                <p className="text-gray-600 mb-6">
                  {productsError.includes('fetch') 
                    ? 'Please check your internet connection and try again.'
                    : productsError}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          
          {/* Loading Skeleton */}
          {productsLoading && !productsError && (
            <div className="space-y-16 md:space-y-24 py-6 md:py-8">
              {[1, 2, 3].map((section) => (
                <section key={section} className="scroll-mt-32">
                  <div className="mb-8">
                    <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse mb-3" />
                    <div className="h-4 w-96 max-w-full bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                      <div key={item} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                        <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
                        <div className="p-4 space-y-3">
                          <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                          <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
                          <div className="flex items-center justify-between pt-4">
                            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
                            <div className="h-10 bg-gray-200 rounded w-1/4 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
          
          {/* Empty State */}
          {!productsLoading && !productsError && categoryFilteredSubcategories.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg">No products found in this category.</p>
            </div>
          )}
          
          {/* Products Grid */}
          {!productsLoading && !productsError && categoryFilteredSubcategories.length > 0 && (
          <div className="space-y-16 md:space-y-24 py-6 md:py-8">
            {categoryFilteredSubcategories.map((subcategory) => (
              <section
                key={subcategory.id}
                id={subcategory.id}
                ref={(el) => {
                  sectionRefs.current[subcategory.id] = el;
                  if (el) animateSection(el); // Animate on ref assignment / update
                }}
                className="scroll-mt-32"
              >
                <div className="mb-8 md:mb-12 text-center">
                  <h2
                    className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-4 md:mb-6 tracking-wide"
                  >
                    {subcategory.name}
                  </h2>
                  <div
                    className="w-16 md:w-24 h-px bg-amber-500 mx-auto divider-line"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {subcategory.products.map((product, index) => (
                    <ProductCard
                      key={product._id || product.productId}
                      product={product}
                      variant="modern"
                      index={index}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
          )}
        </div>
      </div>

      <section id="gallery-cta" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-4xl font-light text-gray-800">
                {t("product.gallery_title")}
              </h2>
              <a href="/gallery" className="text-amber-600 hover:text-amber-700 font-semibold">
                {t("product.gallery_viewall")}
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryPreview.map((src, idx) => (
                <a
                  key={src}
                  href="/gallery"
                  className="relative block overflow-hidden rounded-lg shadow-sm bg-white"
                  ref={(el) => el && animateGalleryItem(el, idx)}
                  style={{ opacity: 0 }}
                >
                  <img
                    src={src}
                    alt="Gallery"
                    className="w-full h-40 md:h-48 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};