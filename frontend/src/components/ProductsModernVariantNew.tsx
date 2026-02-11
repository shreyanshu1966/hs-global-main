import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { TopTabsNav } from "./Navigation/TopTabsNav";
import { ProductCard } from "./ProductCard";
import { ProductSkeleton } from "./ProductSkeleton";
import { Product } from "../services/productService";
import { useProducts, useCategories } from "../hooks/useProducts";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getCloudinaryUrl } from '@/utils/cloudinary';
import { getResponsiveImage, getSrcSet } from '../utils/responsive-image-helper';
import { Search as SearchIcon, X } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const programmaticScrollRef = useRef(false);
  const userInteractedRef = useRef(false);

  // Animation Ref
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero Animation
    if (heroTitleRef.current && heroSubtitleRef.current) {
      gsap.fromTo(heroTitleRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.45 });
      gsap.fromTo(heroSubtitleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.08 });
    }
  }, { scope: containerRef });

  // Section animation
  const animateSection = useCallback((el: HTMLElement) => {
    if (!el) return;
    const heading = el.querySelector('h2');
    const divider = el.querySelector('.divider-line');

    if (heading) {
      gsap.fromTo(heading,
        { opacity: 0, y: 20 },
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

  useEffect(() => {
    const mark = () => (userInteractedRef.current = true);
    window.addEventListener("scroll", mark, { passive: true });
    window.addEventListener("mousedown", mark);
    window.addEventListener("touchstart", mark, { passive: true });
    return () => {
      window.removeEventListener("scroll", mark);
      window.removeEventListener("mousedown", mark);
      window.removeEventListener("touchstart", mark);
    };
  }, []);

  // Sync activeCategory with URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search || "");
    const catParam = (params.get("cat") || "").toLowerCase();
    if ((catParam === "furniture" || catParam === "slabs") && catParam !== activeCategory) {
      setActiveCategory(catParam);
    }
  }, [location.search, activeCategory]);

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
  const { categories: dbCategories, loading: categoriesLoading } = useCategories();
  const {
    products: allProducts,
    loading: productsLoading,
    error: productsError,
    pagination,
    refetch
  } = useProducts({
    category: activeCategory,
    limit: 1000 // Get all products for the category
  });

  // Refresh ScrollTrigger when products load to ensure sticky positioning is correct
  useEffect(() => {
    if (!productsLoading && allProducts.length > 0) {
      // Small delay to ensure DOM is rendered
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [productsLoading, allProducts, activeCategory]);

  // Group products by subcategory with filtering
  const subcategorizedProducts = useMemo(() => {
    const grouped: { [subcategory: string]: Product[] } = {};

    const filtered = allProducts.filter(p => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term)) ||
        p.subcategory.toLowerCase().includes(term);
    });

    filtered.forEach(product => {
      const sub = product.subcategory;
      if (!grouped[sub]) {
        grouped[sub] = [];
      }
      grouped[sub].push(product);
    });

    const result = Object.entries(grouped).map(([subcategory, products]) => ({
      id: subcategory.toLowerCase().replace(/\s+/g, '-'),
      name: subcategory,
      products: products
    }));

    // If searching, keep original order or just return what we have
    // If NOT searching, we might want to ensure specific order if needed, but for now specific order logic 
    // was relying on pre-defined IDs which we don't have hardcoded anymore.
    // The previous implementation mapped "orderedIds", let's see how that was derived.
    return result;

  }, [allProducts, searchTerm]);

  const categoryFilteredSubcategories = subcategorizedProducts;
  const orderedIds = useMemo(() => subcategorizedProducts.map(sub => sub.id), [subcategorizedProducts]);

  // Reset activeSection to first section when category changes
  useEffect(() => {
    const firstSectionId = orderedIds[0];
    if (firstSectionId && activeSection !== firstSectionId) {
      setActiveSection(firstSectionId);
    }
  }, [activeCategory, orderedIds, activeSection]);

  const handleMeasure = useCallback((d: { height: number; top: number; offsetTop: number }) => {
    setNavDims((prev) => {
      if (prev.height === d.height && prev.top === d.top && prev.offsetTop === d.offsetTop)
        return prev;
      return d;
    });
  }, []);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      programmaticScrollRef.current = true;
      const el = sectionRefs.current[sectionId];
      if (!el) {
        programmaticScrollRef.current = false;
        return;
      }
      const offset = (navDims.height || 80) + 16;
      const targetTop = window.scrollY + el.getBoundingClientRect().top - offset;
      window.scrollTo({ top: targetTop, behavior: "smooth" });

      setTimeout(() => {
        programmaticScrollRef.current = false;
      }, 1000);
    },
    [navDims]
  );

  // Update active section on scroll
  useEffect(() => {
    if (!userInteractedRef.current || orderedIds.length === 0) return;

    const checkVisibility = () => {
      if (programmaticScrollRef.current) return;

      const offset = (navDims.height || 80) + 50;
      let closestSection = "";
      let minDistance = Infinity;

      orderedIds.forEach((id) => {
        const el = sectionRefs.current[id];
        if (el) {
          const rect = el.getBoundingClientRect();
          const distanceFromTop = Math.abs(rect.top - offset);
          if (rect.top <= offset && rect.bottom > offset) {
            closestSection = id;
            minDistance = 0;
          } else if (minDistance > 0 && distanceFromTop < minDistance) {
            closestSection = id;
            minDistance = distanceFromTop;
          }
        }
      });

      if (closestSection && closestSection !== activeSection) {
        setActiveSection(closestSection);
      }
    };

    const handleScroll = () => {
      if (!programmaticScrollRef.current) {
        checkVisibility();
      }
    };

    const debouncedScroll = (() => {
      let ticking = false;
      return () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      };
    })();

    window.addEventListener("scroll", debouncedScroll, { passive: true });
    checkVisibility(); // Initial check

    return () => window.removeEventListener("scroll", debouncedScroll);
  }, [navDims, orderedIds, activeSection]);

  const tabOptions = [
    { id: "furniture", label: "Furniture", href: "/products?cat=furniture" },
    { id: "slabs", label: "Slabs", href: "/products?cat=slabs" },
  ];

  const navOptions = useMemo(() => {
    return categoryFilteredSubcategories.map((sub) => ({
      id: sub.id,
      label: sub.name,
    }));
  }, [categoryFilteredSubcategories]);

  const handleCategoryChange = useCallback((categoryId: string) => {
    sessionStorage.setItem("scrollY", window.scrollY.toString());
    setActiveCategory(categoryId);
  }, []);

  const handleSectionClick = useCallback(
    (sectionId: string) => {
      setActiveSection(sectionId);
      scrollToSection(sectionId);
    },
    [scrollToSection]
  );

  // Loading & Error states handled inline for better UX

  return (
    <div ref={containerRef} className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex flex-col justify-center px-[clamp(1.5rem,4vw,6rem)] overflow-hidden">
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
            <h1 ref={heroTitleRef} className="text-[clamp(3.5rem,13vw,14vw)] leading-[0.85] font-serif tracking-tighter text-black">
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

      {/* Customization Banner */}
      <section className="bg-amber-50 border-y border-amber-200">
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
              {t("product.customization_title")}
            </h2>
            <p className="text-gray-700">{t("product.customization_text")}</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/contact"
              className="px-5 py-2 rounded-lg bg-black text-white border-2 border-black hover:bg-white hover:text-black font-semibold transition-colors"
            >
              {t("product.customization_button_1")}
            </a>
            <a
              href="/gallery"
              className="px-5 py-2 rounded-lg bg-white text-black border-2 border-black hover:bg-black hover:text-white font-semibold transition-colors"
            >
              {t("product.customization_button_2")}
            </a>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <TopTabsNav
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        activeSection={activeSection}
        onSectionClick={handleSectionClick}
        onMeasure={handleMeasure}
      />

      {/* Section Navigation & Search */}
      {navOptions.length > 0 && (
        <div className="sticky bg-white border-b border-gray-200 z-30 transition-all duration-300"
          style={{ top: `${navDims.height || 0}px` }}>
          <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex space-x-6 overflow-x-auto py-4 scrollbar-hide flex-1">
              {navOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSectionClick(option.id)}
                  className={`whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${activeSection === option.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Search Input inline */}
            <div className="hidden md:flex items-center ml-4 relative">
              <SearchIcon className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-8 py-1.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-48 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 p-0.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          {/* Mobile Search */}
          <div className="md:hidden px-4 pb-3 border-t border-gray-100 pt-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="pt-6 md:pt-8" id="products">
        <div className="container mx-auto px-4 md:px-6">
          {productsLoading && !subcategorizedProducts.length ? (
            <div className="space-y-12 animate-pulse">
              {[1, 2].map(i => (
                <div key={i} className="mb-12">
                  <div className="h-8 w-48 bg-gray-200 rounded mb-8 mx-auto md:mx-0" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(j => (
                      <ProductSkeleton key={j} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : productsError ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{productsError}</p>
              <button onClick={() => refetch()} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Retry</button>
            </div>
          ) : (
            <div className="space-y-16 md:space-y-24 py-6 md:py-8">
              {categoryFilteredSubcategories.length > 0 ? (
                categoryFilteredSubcategories.map((subcategory, index) => (
                  <section
                    key={subcategory.id}
                    id={subcategory.id}
                    ref={(el) => {
                      sectionRefs.current[subcategory.id] = el;
                      if (el) animateSection(el);
                    }}
                    className="scroll-mt-32"
                  >
                    <div className="mb-8 md:mb-12 text-center">
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-4 md:mb-6 tracking-wide">
                        {subcategory.name}
                      </h2>
                      <div className="w-16 md:w-24 h-px bg-amber-500 mx-auto divider-line" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {subcategory.products.map((product, productIndex) => (
                        <ProductCard
                          key={product.productId}
                          product={{
                            ...product,
                            images: product.images || [product.image],
                            available: product.available ?? true,
                            hasVideo: product.hasVideo ?? false
                          }}
                          variant="modern"
                          index={productIndex}
                        />
                      ))}
                    </div>
                  </section>
                ))
              ) : (
                <div className="text-center py-24">
                  <div className="bg-gray-50 rounded-full p-6 inline-block mb-4">
                    <SearchIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    We couldn't find any products matching "{searchTerm}". Try adjusting your search or category.
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    Clear search filter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Gallery CTA Section */}
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