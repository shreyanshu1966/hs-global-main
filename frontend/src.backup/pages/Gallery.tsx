import { useEffect, useMemo, useState, useCallback, memo, useRef } from "react";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Dynamically import all images from public/gallery (kept in public)
const galleryFiles = import.meta.glob('../../public/gallery/**/*.{webp,jpg,jpeg,png}', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

const toTitle = (s: string) => decodeURIComponent(s.replace(/\+/g, ' ')).replace(/[\/_-]+/g, ' ').trim().replace(/\s+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const toSlug = (s: string) => decodeURIComponent(s.replace(/\+/g, ' ')).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const buildGallery = () => {
  type Item = { id: string; title: string; category: string; image: string; code: string };
  const interim: { path: string; title: string; category: string; image: string }[] = [];
  Object.entries(galleryFiles).forEach(([absPath, url]) => {
    const rel = absPath.replace(/^(\.\.\/)*public\//, '');
    const parts = rel.split('/').filter(Boolean); // [gallery, Category, ...path, file]
    const idx = parts.indexOf('gallery');
    if (idx === -1 || !parts[idx + 1]) return;
    const category = toTitle(parts[idx + 1]);
    const file = parts[parts.length - 1];
    const base = toTitle(file.replace(/\.(webp|jpg|jpeg|png)$/i, ''));
    const id = toSlug(rel);
    interim.push({ path: rel, title: base, category, image: url.replace(/^\/public/, '') });
  });
  // Assign stable codes per category: HS + first two letters of category + 3-digit index
  const byCat = new Map<string, { idx: number; list: Item[] }>();
  interim.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
  const items: Item[] = interim.map(({ path, title, category, image }) => {
    const id = toSlug(path);
    const key = category;
    if (!byCat.has(key)) byCat.set(key, { idx: 1, list: [] });
    const entry = byCat.get(key)!;
    const prefix = `HS${key.slice(0, 2).toUpperCase()}`;
    const code = `${prefix}${String(entry.idx).padStart(3, '0')}`;
    entry.idx += 1;
    const item: Item = { id, title, category, image, code };
    entry.list.push(item);
    return item;
  });
  // Categories set
  const cats = Array.from(new Set(items.map(i => i.category))).sort();
  return { items, cats: ['All', ...cats] };
};

type GalleryItem = { id: string; title: string; category: string; image: string; code: string };

const Gallery = memo(() => {
  // Preload hero image and ensure fixed background CSS exists (align with other pages)
  useEffect(() => {
    const img = new Image();
    img.src = '/gallery-hero.webp';
    const style = document.createElement('style');
    style.textContent = `.fixed-bg{background-attachment:fixed !important;background-size:cover !important;background-position:center !important;background-repeat:no-repeat !important}`;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const { items: allItems, cats } = useMemo(() => buildGallery(), []);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<GalleryItem | null>(null);
  const [modalList, setModalList] = useState<GalleryItem[]>([]);
  const [modalIndex, setModalIndex] = useState<number>(-1);
  const [swiperRef, setSwiperRef] = useState<any>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [visibleCount, setVisibleCount] = useState(16);
  const [sentinelRef, setSentinelRef] = useState<HTMLDivElement | null>(null);
  const [SwiperComponents, setSwiperComponents] = useState<{ Swiper: any; SwiperSlide: any } | null>(null);
  const { t } = useTranslation();

  // Animation Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const filterContainerRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const modalBackdropRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // GSAP Animations
  useGSAP(() => {
    // Hero Animation
    if (heroTitleRef.current && heroSubtitleRef.current) {
      gsap.fromTo(heroTitleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45 });
      gsap.fromTo(heroSubtitleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.05 });
    }
  }, { scope: containerRef });

  // Filter Animation
  useGSAP(() => {
    if (showFilters && filterContainerRef.current) {
      gsap.fromTo(filterContainerRef.current,
        { opacity: 0, y: -10, display: 'none' },
        { opacity: 1, y: 0, display: 'block', duration: 0.25 }
      );
    } else if (!showFilters && filterContainerRef.current) {
      gsap.to(filterContainerRef.current,
        { opacity: 0, y: -10, display: 'none', duration: 0.25 }
      );
    }
  }, [showFilters]);

  // Modal Animation Logic
  const [isModalRendered, setIsModalRendered] = useState(false);

  useEffect(() => {
    if (isModalOpen) setIsModalRendered(true);
  }, [isModalOpen]);

  useGSAP(() => {
    if (isModalOpen && isModalRendered && modalContentRef.current && modalBackdropRef.current) {
      gsap.fromTo(modalBackdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(modalContentRef.current, { opacity: 0, scale: 0.98, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power2.out" });
    } else if (!isModalOpen && isModalRendered && modalContentRef.current && modalBackdropRef.current) {
      gsap.to(modalBackdropRef.current, { opacity: 0, duration: 0.2 });
      gsap.to(modalContentRef.current, {
        opacity: 0,
        scale: 0.98,
        y: 10,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => setIsModalRendered(false)
      });
    }
  }, [isModalOpen, isModalRendered]);


  const relatedItems = useMemo(() => {
    if (!currentItem) return [] as GalleryItem[];
    return allItems.filter(i => i.category === currentItem.category && i.id !== currentItem.id);
  }, [allItems, currentItem]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allItems.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSearch = !q || item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [allItems, activeCategory, searchQuery]);

  // Reset list window when filters/search change
  useEffect(() => {
    setVisibleCount(16);
  }, [activeCategory, searchQuery]);

  // Infinite scroll via intersection observer on a sentinel
  useEffect(() => {
    if (!sentinelRef) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        setVisibleCount((c) => Math.min(c + 16, filteredItems.length));
      }
    }, { rootMargin: '600px 0px' });
    obs.observe(sentinelRef);
    return () => obs.disconnect();
  }, [sentinelRef, filteredItems.length]);

  const handleItemClick = (id: string) => {
    const item = allItems.find(i => i.id === id) || null;
    if (!item) return;
    const list = allItems.filter(i => i.category === item.category);
    const idx = list.findIndex(i => i.id === item.id);
    setModalList(list);
    setModalIndex(idx);
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    // delay clearing to allow exit animation if needed
    setTimeout(() => setCurrentItem(null), 300); // Increased slightly for GSAP out duration
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    if (isModalOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, closeModal]);

  // Lazy-load Swiper only when modal opens
  useEffect(() => {
    if (!isModalOpen || SwiperComponents) return;
    (async () => {
      await import("swiper/css");
      const mod = await import("swiper/react");
      setSwiperComponents({ Swiper: mod.Swiper, SwiperSlide: mod.SwiperSlide });
    })();
  }, [isModalOpen, SwiperComponents]);

  // Arrow key navigation through related items inside modal
  useEffect(() => {
    if (!isModalOpen || !currentItem) return;
    const handler = (e: KeyboardEvent) => {
      if (!currentItem || modalList.length === 0) return;
      if (e.key === 'ArrowRight') {
        const nextIndex = (modalIndex + 1) % modalList.length;
        setModalIndex(nextIndex);
        setCurrentItem(modalList[nextIndex]);
      } else if (e.key === 'ArrowLeft') {
        const prevIndex = (modalIndex - 1 + modalList.length) % modalList.length;
        setModalIndex(prevIndex);
        setCurrentItem(modalList[prevIndex]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isModalOpen, currentItem, modalList, modalIndex]);

  // Optimized: Use IntersectionObserver instead of GSAP ScrollTrigger for gallery items
  // This is much more efficient for large grids
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Create a single observer for all gallery items
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const delay = (parseInt(target.dataset.index || '0') % 16) * 0.03; // Reduced delay

            setTimeout(() => {
              gsap.to(target, {
                opacity: 1,
                y: 0,
                duration: 0.25,
                ease: "power2.out",
              });
            }, delay * 1000);

            // Disconnect after animating
            observerRef.current?.unobserve(target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "100px", // Start animation earlier
      }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const attachObserver = useCallback((el: HTMLElement | null, index: number) => {
    if (el && observerRef.current) {
      el.dataset.index = String(index);
      observerRef.current.observe(el);
    }
  }, []);


  return (
    <div ref={containerRef} className="min-h-screen bg-white">
      {/* Hero matching Products/About/Services style */}
      <section className="relative h-[80vh] overflow-hidden">
        <div
          className="fixed-bg absolute inset-0"
          style={{
            backgroundImage: "url('/gallery-hero.jpg')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 md:px-6">
            <h1
              ref={heroTitleRef}
              className="text-4xl md:text-6xl font-light text-white"
              style={{ opacity: 0 }}
            >
              {t('gallery.hero_title')}
            </h1>
            <p
              ref={heroSubtitleRef}
              className="mt-3 text-white/90 text-lg md:text-xl max-w-2xl"
              style={{ opacity: 0 }}
            >
              {t('gallery.hero_subtitle')}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search photos..."
                className="pl-10 pr-4 py-2 w-full rounded-lg border-2 border-black focus:outline-none focus:ring-0 focus:border-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" /> {t('gallery.filters')}
            </button>
          </div>

          <div
            ref={filterContainerRef}
            className="mb-8 p-4 rounded-2xl border-2 border-black bg-white"
            style={{ display: showFilters ? 'block' : 'none', opacity: showFilters ? 1 : 0 }}
          >
            <div className="flex flex-wrap gap-2">
              {cats.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full border-2 transition-all ${activeCategory === cat ? 'bg-black text-white border-black' : 'bg-white text-black border-black hover:bg-black hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Gallery Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredItems.slice(0, visibleCount).map((item, index) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl border-2 border-black bg-white cursor-pointer"
                  onClick={() => handleItemClick(item.id)}
                  ref={(el) => attachObserver(el, index)}
                  style={{ opacity: 0, transform: 'translateY(20px)' }}
                >
                  <div className="w-full h-64 md:h-72 bg-white relative">
                    {/* Category tag */}
                    <div className="absolute top-3 left-3 z-[1]">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black text-white border border-black group-hover:bg-white group-hover:text-black transition-colors">
                        {item.category}
                      </span>
                    </div>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
              {/* Sentinel to trigger loading more */}
              {visibleCount < filteredItems.length && (
                <div ref={setSentinelRef} className="col-span-full h-2" aria-hidden />
              )}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div
                className="inline-block px-6 py-4 rounded-xl border-2 border-black bg-white text-black"
                style={{ opacity: 0, transform: 'translateY(10px)' }}
                ref={(el) => { if (el) gsap.to(el, { opacity: 1, y: 0, duration: 0.2 }); }}
              >
                {t('gallery.no_items')}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {isModalRendered && currentItem && (
        <div
          className="fixed inset-0 z-[2147483000]"
          ref={modalContainerRef}
        >
          <div
            ref={modalBackdropRef}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
            style={{ opacity: 0 }}
          />
          <div className="absolute inset-0 flex items-center justify-center p-3 md:p-4">
            <div
              ref={modalContentRef}
              className="relative w-[96vw] max-w-5xl max-h-[90vh] mx-auto bg-white/70 backdrop-blur-xl rounded-2xl border-2 border-black shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col"
              style={{ opacity: 0, transform: 'scale(0.98) translateY(10px)' }}
            >
              {/* Close */}
              <button
                onClick={closeModal}
                className="absolute right-3 top-3 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-black bg-white/80 backdrop-blur-md text-black hover:bg-black hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              {/* WhatsApp */}
              {currentItem && (
                <a
                  href={`https://wa.me/918107115116?text=${encodeURIComponent(
                    `Hi, I'm interested in code ${currentItem.code} from the ${currentItem.category} gallery. Image: ${currentItem.image}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-14 top-3 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#25D366] text-white hover:bg-white hover:text-[#25D366] transition-colors shadow"
                  aria-label="WhatsApp Inquiry"
                  title="WhatsApp Inquiry"
                >
                  {/* Simple WhatsApp glyph */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                    <path d="M20.52 3.48A11.94 11.94 0 0012.06 0C5.55 0 .29 5.27.29 11.78c0 2.08.54 4.11 1.58 5.91L0 24l6.47-1.83a11.6 11.6 0 005.59 1.49h.01c6.51 0 11.78-5.26 11.78-11.77 0-3.15-1.23-6.11-3.33-8.41zM12.07 21.3h-.01a9.5 9.5 0 01-4.84-1.32l-.35-.2-3.84 1.09 1.03-3.74-.23-.38a9.5 9.5 0 01-1.46-5.11c0-5.25 4.28-9.53 9.54-9.53 2.55 0 4.95.99 6.75 2.79a9.45 9.45 0 012.79 6.74c0 5.25-4.28 9.53-9.54 9.53zm5.5-7.1c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.06 2.9 1.2 3.1.15.2 2.08 3.17 5.04 4.45.7.3 1.24.48 1.66.62.7.22 1.34.19 1.85.12.56-.08 1.77-.72 2.02-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
                  </svg>
                </a>
              )}

              {/* Main image + code */}
              <div className="w-full flex-1 min-h-0 p-2 md:p-3">
                {/* Ensure a stable viewport-based height so image can fully fit without cropping */}
                <div className="w-full h-[62vh] md:h-[70vh]">
                  <div className="mt-0 text-center text-sm font-semibold text-black">Code: {currentItem.code}</div>
                  <img
                    src={currentItem.image}
                    alt={currentItem.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Related slider */}
              <div className="p-2 md:p-3 border-t-2 border-black bg-white/80 backdrop-blur-md shrink-0 relative">
                <div className="mb-2 md:mb-3 text-sm font-semibold text-black">{t('gallery.more_from')} {currentItem.category}</div>
                {SwiperComponents ? (
                  <SwiperComponents.Swiper
                    spaceBetween={12}
                    slidesPerView={2.2}
                    breakpoints={{
                      640: { slidesPerView: 3.2, spaceBetween: 14 },
                      768: { slidesPerView: 4.2, spaceBetween: 16 },
                      1024: { slidesPerView: 5.2, spaceBetween: 16 },
                    }}
                    onSwiper={(sw: any) => {
                      setSwiperRef(sw);
                      setCanPrev(!sw.isBeginning);
                      setCanNext(!sw.isEnd);
                    }}
                    onSlideChange={(sw: any) => {
                      setCanPrev(!sw.isBeginning);
                      setCanNext(!sw.isEnd);
                    }}
                    onReachBeginning={() => setCanPrev(false)}
                    onReachEnd={() => setCanNext(false)}
                  >
                    {relatedItems.map((rel) => (
                      <SwiperComponents.SwiperSlide key={rel.id}>
                        <button
                          onClick={() => setCurrentItem(rel)}
                          className="block w-full overflow-hidden rounded-xl border-2 border-black bg-white hover:opacity-90 transition"
                        >
                          <div className="w-full" style={{ aspectRatio: "4 / 3" }}>
                            <img
                              src={rel.image}
                              alt={rel.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </button>
                      </SwiperComponents.SwiperSlide>
                    ))}
                  </SwiperComponents.Swiper>
                ) : (
                  <div className="text-sm text-gray-600">{t('gallery.loading')}</div>
                )}
                {/* Side slider buttons */}
                {canPrev && (
                  <button
                    onClick={() => swiperRef && swiperRef.slidePrev()}
                    className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-black bg-white/80 backdrop-blur-md text-black hover:bg-black hover:text-white transition-colors"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                {canNext && (
                  <button
                    onClick={() => swiperRef && swiperRef.slideNext()}
                    className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-black bg-white/80 backdrop-blur-md text-black hover:bg-black hover:text-white transition-colors"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default Gallery;
