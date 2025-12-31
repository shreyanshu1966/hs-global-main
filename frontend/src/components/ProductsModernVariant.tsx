import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { TopTabsNav } from "./Navigation/TopTabsNav";
import { ProductCard } from "./ProductCard";
import { categories, Subcategory, Product } from "../data/products";
import { useTranslation } from "react-i18next";
import { loadImageUrls } from "../data/slabs.loader";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getCloudinaryUrl } from '@/utils/cloudinary';
import { getRootImageUrl } from '../utils/rootCloudinary';

gsap.registerPlugin(ScrollTrigger);

export const ProductsModernVariant: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const hasRestoredScrollRef = useRef(false);

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

  const [activeCategory, setActiveCategory] = useState<string>("furniture");
  const [activeSection, setActiveSection] = useState<string>("alaska");
  const programmaticScrollRef = useRef(false);
  const userInteractedRef = useRef(false);

  // OPTIMIZED: Track if slabs images have been preloaded
  const [slabsPreloaded, setSlabsPreloaded] = useState(false);
  const preloadingRef = useRef(false);
  const anticipatoryPreloadRef = useRef(false);

  // Animation Ref
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero Animation
    if (heroTitleRef.current && heroSubtitleRef.current) {
      gsap.fromTo(heroTitleRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.45 });
      gsap.fromTo(heroSubtitleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.08 });
    }

    // Sections Animation handled below in filtered list render (or useEffect if dynamic list changes)
  }, { scope: containerRef });


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


  // Gallery preview using Cloudinary URLs
  const galleryFiles = import.meta.glob('/public/gallery/**/*.{webp,jpg,jpeg,png}', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

  const [galleryPreview, setGalleryPreview] = useState<string[]>([]);
  useEffect(() => {
    const keys = Object.keys(galleryFiles);
    if (!keys.length) return;

    // Get random 6 images
    const shuffled = [...keys].sort(() => Math.random() - 0.5);
    const slice = shuffled.slice(0, 6);

    // Convert to Cloudinary URLs
    const cloudinaryUrls = slice.map(absPath => {
      // Remove leading slash and 'public' to get relative path (e.g., /public/gallery/... -> gallery/...)
      const rel = absPath.replace(/^\/public\//, '').replace(/^\//, '');
      return getCloudinaryUrl(rel);
    });

    setGalleryPreview(cloudinaryUrls);
  }, []);

  const allSubcategories = useMemo(() => {
    const out: { id: string; name: string; products: Product[] }[] = [];
    const extract = (subs: Subcategory[]) => {
      subs.forEach((s) => {
        if (s.products) out.push({ id: s.id, name: s.name, products: s.products });
        if (s.subcategories) extract(s.subcategories);
      });
    };
    categories.forEach((c) => extract(c.subcategories));
    return out;
  }, []);

  const getOrderedSubcategoryIds = useCallback((categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return [];
    const ids: string[] = [];
    const recurse = (subs: Subcategory[]) => {
      subs.forEach((s) => {
        if (s.products) ids.push(s.id);
        if (s.subcategories) recurse(s.subcategories);
      });
    };
    recurse(category.subcategories);
    return ids;
  }, []);

  const orderedIds = useMemo(
    () => getOrderedSubcategoryIds(activeCategory),
    [activeCategory, getOrderedSubcategoryIds]
  );

  const categoryFilteredSubcategories = useMemo(
    () =>
      allSubcategories
        .filter((s) => orderedIds.includes(s.id))
        .sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id)),
    [allSubcategories, orderedIds]
  );

  // OPTIMIZED: Anticipatory preloading - start loading ONLY first images of slabs after 3 seconds on furniture
  useEffect(() => {
    if (activeCategory === 'furniture' && !slabsPreloaded && !anticipatoryPreloadRef.current) {
      anticipatoryPreloadRef.current = true;

      // Wait 3 seconds, then preload slabs in background
      const anticipatoryTimeout = setTimeout(() => {
        if (!preloadingRef.current && !slabsPreloaded) {
          preloadingRef.current = true;

          const slabsCategory = categories.find(c => c.id === 'slabs');
          if (slabsCategory) {
            const firstProducts: Product[] = [];
            const extractProducts = (subs: Subcategory[], limit: number) => {
              for (const sub of subs) {
                if (firstProducts.length >= limit) break;
                if (sub.products) {
                  firstProducts.push(...sub.products.slice(0, limit - firstProducts.length));
                }
                if (sub.subcategories) {
                  extractProducts(sub.subcategories, limit);
                }
              }
            };

            extractProducts(slabsCategory.subcategories, 16); // Increased to 16 since we're only loading 1 image per product

            // Preload ONLY first (stand) image of each product
            const imagePaths = firstProducts
              .map(p => (p.images && p.images[0]) || null)
              .filter(Boolean) as string[];

            if (imagePaths.length > 0) {
              loadImageUrls(imagePaths)
                .then(() => {
                  setSlabsPreloaded(true);
                })
                .catch(() => {
                  // Silent fail for anticipatory loading
                })
                .finally(() => {
                  preloadingRef.current = false;
                });
            } else {
              preloadingRef.current = false;
            }
          } else {
            preloadingRef.current = false;
          }
        }
      }, 3000); // Start preloading after 3 seconds

      return () => clearTimeout(anticipatoryTimeout);
    }
  }, [activeCategory, slabsPreloaded]);

  // OPTIMIZED: Preload first 12 slab images when category switches to slabs OR on initial mount if slabs is active
  useEffect(() => {
    if (activeCategory === 'slabs' && !slabsPreloaded && !preloadingRef.current) {
      preloadingRef.current = true;

      // Small delay to prevent blocking UI
      const preloadTimeout = setTimeout(() => {
        const slabsCategory = categories.find(c => c.id === 'slabs');
        if (slabsCategory) {
          const firstProducts: Product[] = [];
          const extractProducts = (subs: Subcategory[], limit: number) => {
            for (const sub of subs) {
              if (firstProducts.length >= limit) break;
              if (sub.products) {
                firstProducts.push(...sub.products.slice(0, limit - firstProducts.length));
              }
              if (sub.subcategories) {
                extractProducts(sub.subcategories, limit);
              }
            }
          };

          extractProducts(slabsCategory.subcategories, 12);

          // Preload first image of each product
          const imagePaths = firstProducts
            .map(p => (p.images && p.images[0]) || null)
            .filter(Boolean) as string[];

          if (imagePaths.length > 0) {
            loadImageUrls(imagePaths)
              .then(() => {
                setSlabsPreloaded(true);
              })
              .catch(err => {
                console.error('[Preload] Error loading slab images:', err);
              })
              .finally(() => {
                preloadingRef.current = false;
              });
          } else {
            preloadingRef.current = false;
          }
        } else {
          preloadingRef.current = false;
        }
      }, 100); // Small delay to let UI render first

      return () => clearTimeout(preloadTimeout);
    }
  }, [activeCategory, slabsPreloaded]);

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
      setActiveSection(sectionId);

      setTimeout(() => {
        programmaticScrollRef.current = false;
      }, 700);
    },
    [navDims.height]
  );

  // Memoize category ID sets for faster O(1) lookups
  const furnitureIds = useMemo(() => new Set(getOrderedSubcategoryIds("furniture")), [getOrderedSubcategoryIds]);
  const slabsIds = useMemo(() => new Set(getOrderedSubcategoryIds("slabs")), [getOrderedSubcategoryIds]);

  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: "-120px 0px -40px 0px",
      threshold: 0.35,
    };

    let rafScheduled = false;
    let latestSection: string | null = null;

    const observer = new IntersectionObserver((entries) => {
      if (programmaticScrollRef.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          latestSection = entry.target.id;
        }
      });

      if (!rafScheduled && latestSection) {
        rafScheduled = true;
        requestAnimationFrame(() => {
          if (latestSection && !userInteractedRef.current) {
            setActiveSection(latestSection);

            // Use memoized Sets for O(1) lookup instead of O(n) array.includes()
            const belongsToFurniture = furnitureIds.has(latestSection);
            if (belongsToFurniture && activeCategory !== "furniture") {
              setActiveCategory("furniture");
            } else if (slabsIds.has(latestSection) && activeCategory !== "slabs") {
              setActiveCategory("slabs");
            }
          }
          rafScheduled = false;
          latestSection = null;
        });
      }
    }, observerOptions);

    requestAnimationFrame(() => {
      Object.values(sectionRefs.current).forEach((el) => {
        if (el) observer.observe(el);
      });
    });

    return () => observer.disconnect();
  }, [activeCategory, furnitureIds, slabsIds]);



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
    const heroUrl = getRootImageUrl("products-hero.webp");
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
      <section ref={heroRef} className="relative h-[80vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `url('${getRootImageUrl("products-hero.webp") || "/products-hero.webp"}')`,
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 md:px-6">
            <h1
              ref={heroTitleRef}
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4"
              style={{ opacity: 0 }}
            >
              {t("product.hero_title")}
            </h1>
            <p
              ref={heroSubtitleRef}
              className="text-white/90 text-lg md:text-xl lg:text-2xl max-w-3xl"
              style={{ opacity: 0 }}
            >
              {t("product.hero_subtitle")}
            </p>
          </div>
        </div>
      </section>

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

      <TopTabsNav
        activeSection={activeSection}
        onSectionClick={scrollToSection}
        onMeasure={handleMeasure}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* OPTIMIZED: Show minimal loading indicator for slabs */}
      {activeCategory === 'slabs' && !slabsPreloaded && preloadingRef.current && (
        <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2 border border-gray-200">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-black"></div>
          <span className="text-sm text-gray-600">Loading images...</span>
        </div>
      )}

      <div className="pt-6 md:pt-8" id="products">
        <div className="container mx-auto px-4 md:px-6">
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
                style={{ opacity: 0 }} // Initial state for GSAP
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
                      key={product.id}
                      product={product}
                      variant="modern"
                      index={index}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
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