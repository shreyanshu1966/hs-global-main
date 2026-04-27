import { useEffect, useMemo, useState, useCallback, memo, useRef } from "react";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, CheckCircle2, Circle, LayoutGrid, CheckSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getResponsiveImage } from '../utils/responsive-image-helper';
import { GalleryItem, GalleryModal } from '../components/GalleryModal';

gsap.registerPlugin(ScrollTrigger);

// Dynamically import all images from public/gallery to get the file structure
const galleryFiles = import.meta.glob('../../public/gallery/**/*.{webp,jpg,jpeg,png}', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

const toTitle = (s: string) => decodeURIComponent(s.replace(/\+/g, ' ')).replace(/[/_-]+/g, ' ').trim().replace(/\s+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const toSlug = (s: string) => decodeURIComponent(s.replace(/\+/g, ' ')).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const buildGallery = () => {
  type Item = { id: string; title: string; category: string; image: string; code: string };
  const interim: { path: string; title: string; category: string; image: string }[] = [];
  Object.entries(galleryFiles).forEach(([absPath, url]) => {
    const rel = absPath.replace(/^..\/..\/public\//, '').replace(/^\//, '');
    const parts = rel.split('/').filter(Boolean); // [gallery, Category, ...path, file]
    const idx = parts.indexOf('gallery');
    if (idx === -1 || !parts[idx + 1]) return;
    const category = toTitle(parts[idx + 1]);
    const file = parts[parts.length - 1];
    const base = toTitle(file.replace(/\.(webp|jpg|jpeg|png)$/i, ''));
    const responsiveUrl = getResponsiveImage(rel, 'mobile') || url as string;
    interim.push({ path: rel, title: base, category, image: responsiveUrl });
  });
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
  const cats = Array.from(new Set(items.map(i => i.category))).sort();
  return { items, cats: ['All', ...cats] };
};


const Gallery = memo(() => {
  useEffect(() => {
    const heroUrl = getResponsiveImage('gallery-hero.webp', 'large');
    if (heroUrl) {
      const img = new Image();
      img.src = heroUrl;
    }
  }, []);
  const { items: allItems, cats } = useMemo(() => buildGallery(), []);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  
  // Mobile Gallery Features State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [gridLayout, setGridLayout] = useState<'bento' | 'square'>('bento');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<GalleryItem | null>(null);
  const [modalList, setModalList] = useState<GalleryItem[]>([]);
  const [modalIndex, setModalIndex] = useState<number>(-1);
  const [visibleCount, setVisibleCount] = useState(16);
  const [sentinelRef, setSentinelRef] = useState<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  const containerRef = useRef<HTMLDivElement>(null);
  const filterContainerRef = useRef<HTMLDivElement>(null);

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

  const relatedItems = useMemo(() => {
    if (!currentItem) return [] as GalleryItem[];
    return allItems.filter(i => i.category === currentItem.category && i.id !== currentItem.id);
  }, [allItems, currentItem]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allItems.length };
    allItems.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [allItems]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allItems.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSearch = !q || item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [allItems, activeCategory, searchQuery]);

  // Group items if we're in "All" view to show sticky headers
  const groupedItems = useMemo(() => {
    if (activeCategory !== "All" || searchQuery.trim() !== "") {
      return [{ category: activeCategory, items: filteredItems }];
    }
    const map = new Map<string, GalleryItem[]>();
    cats.forEach(c => { if(c !== 'All') map.set(c, []) });
    filteredItems.forEach(item => {
      map.get(item.category)?.push(item);
    });
    return Array.from(map.entries())
      .filter(([_, items]) => items.length > 0)
      .map(([category, items]) => ({ category, items }));
  }, [filteredItems, activeCategory, cats, searchQuery]);

  useEffect(() => {
    setVisibleCount(16);
  }, [activeCategory, searchQuery]);

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
    if (isSelectionMode) {
      setSelectedItems(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      return;
    }
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
    setTimeout(() => setCurrentItem(null), 300);
  }, []);



  // Removed custom observer in favor of Framer Motion

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) setSelectedItems(new Set()); // Clear on exit
  };

  const handleBulkWhatsApp = () => {
    if (selectedItems.size === 0) return;
    const codes = Array.from(selectedItems).map(id => allItems.find(i => i.id === id)?.code).filter(Boolean);
    const text = `Hi, I'm interested in the following products:\n${codes.join(', ')}`;
    window.open(`https://wa.me/918107115116?text=${encodeURIComponent(text)}`, '_blank');
  };



  return (
    <div ref={containerRef} className="min-h-screen bg-[radial-gradient(circle_at_5%_0%,#f5f5f4_0%,#ffffff_50%)]">
      <Helmet>
        <title>Best Luxury & Imported Marble Stones Gallery - Hs Global Export</title>
      </Helmet>

      <section className="pt-28 md:pt-36 pb-14 md:pb-20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-[22rem]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search photos..."
                className="pl-10 pr-4 py-3 w-full rounded-xl border border-black/20 bg-white/85 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => setGridLayout(prev => prev === 'bento' ? 'square' : 'bento')}
                className="flex items-center justify-center w-12 h-12 rounded-xl border border-black/20 bg-white/85 backdrop-blur-sm text-black hover:bg-black hover:text-white transition-colors"
                title="Toggle Grid Layout"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={toggleSelectionMode}
                className={`flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                  isSelectionMode ? 'bg-black text-white border-black' : 'border-black/20 bg-white/85 backdrop-blur-sm text-black hover:bg-black hover:text-white'
                }`}
              >
                <CheckSquare className="w-4 h-4" /> 
                {isSelectionMode ? 'Cancel Selection' : 'Select'}
              </button>
              <button
                onClick={() => setShowFilters((s) => !s)}
                className="flex items-center justify-center w-12 h-12 rounded-xl border border-black/20 bg-white/85 backdrop-blur-sm text-black hover:bg-black hover:text-white transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            ref={filterContainerRef}
            className="mb-8 p-4 rounded-2xl border border-black/15 bg-white/75 backdrop-blur-sm"
            style={{ display: showFilters ? 'block' : 'none', opacity: showFilters ? 1 : 0 }}
          >
            <div className="flex flex-wrap gap-2">
              {cats.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full border text-sm transition-all ${activeCategory === cat ? 'bg-black text-white border-black shadow-[0_8px_20px_rgba(0,0,0,0.15)]' : 'bg-white/90 text-black border-black/20 hover:bg-black hover:text-white hover:border-black'}`}
                >
                  {cat} <span className="opacity-75">({categoryCounts[cat] || 0})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bulk Action Bar */}
          <AnimatePresence>
            {isSelectionMode && selectedItems.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 bg-black text-white rounded-full shadow-2xl"
              >
                <span className="font-medium whitespace-nowrap">{selectedItems.size} Selected</span>
                <div className="w-[1px] h-6 bg-white/20"></div>
                <button 
                  onClick={handleBulkWhatsApp}
                  className="font-semibold text-green-400 hover:text-green-300 transition-colors whitespace-nowrap"
                >
                  Inquire via WhatsApp
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grouped / Bento Gallery Grid */}
          {filteredItems.length > 0 ? (
            <div className="space-y-8">
              {groupedItems.map((group) => {
                let itemsRendered = 0;
                
                return (
                  <div key={group.category} className="relative">
                    {activeCategory === "All" && !searchQuery && (
                      <div className="sticky top-20 z-10 mb-4 bg-white/80 backdrop-blur-xl px-4 py-2 rounded-lg border border-black/10 inline-block shadow-sm">
                        <h2 className="text-lg font-bold text-black uppercase tracking-widest">{group.category}</h2>
                      </div>
                    )}
                    <div
                      className={`grid ${gridLayout === 'square' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 auto-rows-auto gap-4' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 auto-rows-[180px] gap-2 md:gap-3'}`}
                      style={{ gridAutoFlow: gridLayout === 'bento' ? 'dense' : 'row' }}
                    >
                      {group.items.map((item, index) => {
                        itemsRendered++;
                        if (itemsRendered > visibleCount && activeCategory === "All") return null;

                        const getBentoClass = (idx: number) => {
                          if (gridLayout === 'square') return 'col-span-1 aspect-square';
                          const hash = (idx * 7 + 3) % 17;
                          if (hash === 0 || hash === 8) return 'col-span-2 row-span-2';
                          if (hash === 1 || hash === 9 || hash === 13) return 'col-span-1 row-span-2';
                          if (hash === 2 || hash === 10 || hash === 14) return 'col-span-2 row-span-1';
                          if (hash === 3 || hash === 11) return 'md:col-span-2 col-span-1 row-span-2';
                          if (hash === 4 || hash === 12) return 'md:col-span-3 col-span-2 row-span-1';
                          return 'col-span-1 row-span-1';
                        };

                        const isSelected = selectedItems.has(item.id);

                        return (
                          <motion.div
                            layoutId={`gallery-item-${item.id}`}
                            key={item.id}
                            className={`group relative overflow-hidden rounded-2xl border ${isSelected ? 'border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.5)]' : 'border-black/15'} bg-white/90 shadow-[0_4px_24px_rgba(0,0,0,0.05)] cursor-pointer ${getBentoClass(index)}`}
                            onClick={() => handleItemClick(item.id)}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "100px" }}
                            transition={{ duration: 0.4, delay: (index % 16) * 0.03 }}
                          >
                            <div className="w-full h-full bg-white relative">
                              {isSelectionMode && (
                                <div className="absolute top-2 left-2 z-[3]">
                                  {isSelected ? (
                                    <CheckCircle2 className="w-6 h-6 text-blue-500 fill-white" />
                                  ) : (
                                    <Circle className="w-6 h-6 text-white/80 fill-black/20" />
                                  )}
                                </div>
                              )}
                              {!isSelectionMode && (
                                <div className="absolute top-2 left-2 z-[1]">
                                  <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-black text-white border border-black group-hover:bg-white group-hover:text-black transition-colors">
                                    {item.category}
                                  </span>
                                </div>
                              )}

                              <img
                                src={item.image}
                                alt={item.title}
                                className={`w-full h-full object-cover transition-transform duration-700 ease-out ${!isSelectionMode && 'group-hover:scale-110'} ${isSelected && 'scale-95 rounded-xl opacity-90'}`}
                                loading="lazy"
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {visibleCount < filteredItems.length && (
                <div ref={setSentinelRef} className="h-2" aria-hidden />
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

      {/* Full Screen Modal */}
      <GalleryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentItem={currentItem}
        modalList={modalList}
        modalIndex={modalIndex}
        setModalIndex={setModalIndex}
        setCurrentItem={setCurrentItem}
      />
    </div>
  );
});

export default Gallery;
