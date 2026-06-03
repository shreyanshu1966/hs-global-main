import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { Search, X, CheckCircle2 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { getResponsiveImage } from '../utils/responsive-image-helper';
import { GalleryItem, GalleryModal } from '../components/GalleryModal';

const galleryFiles = import.meta.glob(
  '../../public/gallery/**/*.{webp,jpg,jpeg,png}',
  { query: '?url', import: 'default', eager: true }
) as Record<string, string>;

const toTitle = (s: string) =>
  decodeURIComponent(s.replace(/\+/g, ' '))
    .replace(/[/_-]+/g, ' ').trim().replace(/\s+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

const toSlug = (s: string) =>
  decodeURIComponent(s.replace(/\+/g, ' '))
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const buildGallery = () => {
  type Item = { id: string; title: string; category: string; image: string; code: string };
  const interim: { path: string; title: string; category: string; image: string }[] = [];

  Object.entries(galleryFiles).forEach(([absPath, url]) => {
    const rel = absPath.replace(/^..\/..\/public\//, '').replace(/^\//, '');
    const parts = rel.split('/').filter(Boolean);
    const idx = parts.indexOf('gallery');
    if (idx === -1 || !parts[idx + 1]) return;
    const category = toTitle(parts[idx + 1]);
    const file = parts[parts.length - 1];
    const base = toTitle(file.replace(/\.(webp|jpg|jpeg|png)$/i, ''));
    const responsiveUrl = getResponsiveImage(rel, 'mobile') || (url as string);
    interim.push({ path: rel, title: base, category, image: responsiveUrl });
  });

  const byCat = new Map<string, { idx: number; list: Item[] }>();
  interim.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));

  const items: Item[] = interim.map(({ path, title, category, image }) => {
    const id = toSlug(path);
    if (!byCat.has(category)) byCat.set(category, { idx: 1, list: [] });
    const entry = byCat.get(category)!;
    const code = `HS${category.slice(0, 2).toUpperCase()}${String(entry.idx).padStart(3, '0')}`;
    entry.idx += 1;
    const item: Item = { id, title, category, image, code };
    entry.list.push(item);
    return item;
  });

  const cats = Array.from(new Set(items.map(i => i.category))).sort();
  return { items, cats: ['All', ...cats] };
};

// ── Icons ────────────────────────────────────────────────────────────────────

const GridIcon3 = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <rect x="1" y="1" width="5" height="5" rx="0.5" /><rect x="7.5" y="1" width="5" height="5" rx="0.5" /><rect x="14" y="1" width="5" height="5" rx="0.5" />
    <rect x="1" y="7.5" width="5" height="5" rx="0.5" /><rect x="7.5" y="7.5" width="5" height="5" rx="0.5" /><rect x="14" y="7.5" width="5" height="5" rx="0.5" />
    <rect x="1" y="14" width="5" height="5" rx="0.5" /><rect x="7.5" y="14" width="5" height="5" rx="0.5" /><rect x="14" y="14" width="5" height="5" rx="0.5" />
  </svg>
);

const GridIcon2 = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <rect x="1" y="1" width="8.5" height="8.5" rx="0.5" /><rect x="10.5" y="1" width="8.5" height="8.5" rx="0.5" />
    <rect x="1" y="10.5" width="8.5" height="8.5" rx="0.5" /><rect x="10.5" y="10.5" width="8.5" height="8.5" rx="0.5" />
  </svg>
);

const WAIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M20.52 3.48A11.94 11.94 0 0012.06 0C5.55 0 .29 5.27.29 11.78c0 2.08.54 4.11 1.58 5.91L0 24l6.47-1.83a11.6 11.6 0 005.59 1.49h.01c6.51 0 11.78-5.26 11.78-11.77 0-3.15-1.23-6.11-3.33-8.41zM12.07 21.3h-.01a9.5 9.5 0 01-4.84-1.32l-.35-.2-3.84 1.09 1.03-3.74-.23-.38a9.5 9.5 0 01-1.46-5.11c0-5.25 4.28-9.53 9.54-9.53 2.55 0 4.95.99 6.75 2.79a9.45 9.45 0 012.79 6.74c0 5.25-4.28 9.53-9.54 9.53zm5.5-7.1c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.06 2.9 1.2 3.1.15.2 2.08 3.17 5.04 4.45.7.3 1.24.48 1.66.62.7.22 1.34.19 1.85.12.56-.08 1.77-.72 2.02-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
  </svg>
);

// ── Main component ────────────────────────────────────────────────────────────

const Gallery = memo(() => {
  const { items: allItems, cats } = useMemo(() => buildGallery(), []);

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchActive, setSearchActive]     = useState(false);
  const [searchQuery, setSearchQuery]       = useState('');
  const [colCount, setColCount]             = useState<3 | 2>(3);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems]   = useState<Set<string>>(new Set());

  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [currentItem, setCurrentItem]   = useState<GalleryItem | null>(null);
  const [modalList, setModalList]       = useState<GalleryItem[]>([]);
  const [modalIndex, setModalIndex]     = useState(-1);

  const [visibleCount, setVisibleCount] = useState(48);
  const [sentinelRef, setSentinelRef]   = useState<HTMLDivElement | null>(null);

  const tabsScrollRef   = useRef<HTMLDivElement>(null);
  const activeTabRef    = useRef<HTMLButtonElement | null>(null);
  const longPressTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired  = useRef(false);
  const searchInputRef  = useRef<HTMLInputElement>(null);

  // ── Derived data ───────────────────────────────────────────────────────────

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = { All: allItems.length };
    allItems.forEach(i => { c[i.category] = (c[i.category] || 0) + 1; });
    return c;
  }, [allItems]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const base = activeCategory === 'All' ? allItems : allItems.filter(i => i.category === activeCategory);
    if (!q) return base;
    // When searching, ignore activeCategory and search across everything
    return allItems.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.code.toLowerCase().includes(q)
    );
  }, [allItems, activeCategory, searchQuery]);

  const groupedItems = useMemo(() => {
    const q = searchQuery.trim();
    if (q || activeCategory !== 'All') {
      const label = q ? `Results for "${q}"` : activeCategory;
      return [{ category: label, items: filteredItems }];
    }
    const map = new Map<string, GalleryItem[]>();
    cats.forEach(c => { if (c !== 'All') map.set(c, []); });
    filteredItems.forEach(i => map.get(i.category)?.push(i));
    return Array.from(map.entries())
      .filter(([, its]) => its.length > 0)
      .map(([category, items]) => ({ category, items }));
  }, [filteredItems, activeCategory, cats, searchQuery]);

  // ── Effects ────────────────────────────────────────────────────────────────

  // Scroll active tab into view
  useEffect(() => {
    const tab = activeTabRef.current;
    const container = tabsScrollRef.current;
    if (!tab || !container) return;
    const left = tab.offsetLeft - container.offsetWidth / 2 + tab.offsetWidth / 2;
    container.scrollTo({ left, behavior: 'smooth' });
  }, [activeCategory]);

  useEffect(() => { setVisibleCount(48); }, [activeCategory, searchQuery]);

  useEffect(() => {
    if (!sentinelRef) return;
    const obs = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting))
        setVisibleCount(c => Math.min(c + 48, filteredItems.length));
    }, { rootMargin: '800px' });
    obs.observe(sentinelRef);
    return () => obs.disconnect();
  }, [sentinelRef, filteredItems.length]);

  useEffect(() => {
    if (searchActive) setTimeout(() => searchInputRef.current?.focus(), 60);
  }, [searchActive]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const startLongPress = (id: string) => () => {
    longPressFired.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      setIsSelectionMode(true);
      setSelectedItems(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    }, 480);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  };

  const handleItemClick = useCallback((id: string) => {
    if (longPressFired.current) { longPressFired.current = false; return; }
    if (isSelectionMode) {
      setSelectedItems(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
      return;
    }
    const item = allItems.find(i => i.id === id);
    if (!item) return;
    const list = allItems.filter(i => i.category === item.category);
    const idx  = list.findIndex(i => i.id === item.id);
    setModalList(list);
    setModalIndex(idx);
    setCurrentItem(item);
    setIsModalOpen(true);
  }, [allItems, isSelectionMode]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setCurrentItem(null), 300);
  }, []);

  const exitSelection = () => { setIsSelectionMode(false); setSelectedItems(new Set()); };

  const bulkWhatsApp = () => {
    const codes = Array.from(selectedItems)
      .map(id => allItems.find(i => i.id === id)?.code)
      .filter(Boolean);
    const text = `Hi, I'm interested in the following products:\n${codes.join(', ')}`;
    window.open(`https://wa.me/918107115116?text=${encodeURIComponent(text)}`, '_blank');
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  // Mutable counter for "All" view infinite scroll across groups
  let totalRendered = 0;

  return (
    <div className="min-h-screen bg-black pt-16 md:pt-20">
      <Helmet>
        <title>Best Luxury &amp; Imported Marble Stones Gallery - Hs Global Export</title>
        <meta name="description" content="HS Global Export presents a premium gallery of luxury and imported marble stones, offering high-quality natural stone collections crafted for elegant residential and commercial applications worldwide." />
        <meta name="keywords" content="Best Luxury Marble Stones, Imported Marble Gallery, Luxury Marble Gallery, Premium Marble Stones, Italian Marble Supplier, Imported Marble Exporter, Marble Stone Gallery, High-End Marble Collection, Natural Stone Gallery, Marble Showroom Exporter, Luxury Stone Supplier, Marble Slabs Gallery, Premium Imported Marble, HS Global Export, Global Marble Exporter, Luxury Italian Marble, Marble Exporter Worldwide, Granite & Tiles Supplier, Marble Tiles Manufacturer, Premium Granite Supplier, Marble Export USA, Marble Export UK, Natural Stone Exporter, Luxury Marble Supplier, Italian Marble Export, Global Marble & Granite Supply" />
        <meta name="author" content="HS Global Export" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.hsglobalexport.com/gallery" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.hsglobalexport.com/gallery" />
        <meta property="og:title" content="Best Luxury & Imported Marble Stones Gallery - Hs Global Export" />
        <meta property="og:description" content="HS Global Export presents a premium gallery of luxury and imported marble stones." />
        <meta property="og:image" content="https://www.hsglobalexport.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* ── App Bar ──────────────────────────────────────────────────────────── */}
      <div
        className={`sticky z-30 h-12 flex items-center transition-colors duration-200 ${
          isSelectionMode ? 'bg-blue-700' : 'bg-neutral-950/96 backdrop-blur-md'
        }`}
        style={{ top: '64px' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {searchActive ? (
            <motion.div key="search"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="flex items-center gap-2 w-full px-3"
            >
              <button
                onClick={() => { setSearchActive(false); setSearchQuery(''); }}
                className="p-1.5 text-white/70 hover:text-white shrink-0"
                aria-label="Close search"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search photos, categories, codes…"
                className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1.5 text-white/40 hover:text-white shrink-0">
                  <X size={15} />
                </button>
              )}
            </motion.div>
          ) : isSelectionMode ? (
            <motion.div key="select"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="flex items-center w-full px-4"
            >
              <button onClick={exitSelection} className="text-sm font-medium text-white/80 hover:text-white mr-4">
                Cancel
              </button>
              <span className="flex-1 text-sm font-semibold text-white">
                {selectedItems.size > 0 ? `${selectedItems.size} selected` : 'Select items'}
              </span>
              {selectedItems.size > 0 && (
                <button onClick={() => setSelectedItems(new Set())} className="text-xs text-white/50 hover:text-white">
                  Clear all
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div key="default"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="flex items-center w-full px-4"
            >
              <h1 className="flex-1 text-[15px] font-semibold text-white tracking-wide">Gallery</h1>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setSearchActive(true)}
                  className="w-9 h-9 flex items-center justify-center text-white/65 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Search"
                >
                  <Search size={19} />
                </button>
                <button
                  onClick={() => setIsSelectionMode(true)}
                  className="w-9 h-9 flex items-center justify-center text-white/65 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Select"
                >
                  <CheckCircle2 size={19} />
                </button>
                <button
                  onClick={() => setColCount(c => c === 3 ? 2 : 3)}
                  className="w-9 h-9 flex items-center justify-center text-white/65 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Toggle grid size"
                >
                  {colCount === 3 ? <GridIcon2 /> : <GridIcon3 />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Category Tab Strip ───────────────────────────────────────────────── */}
      {!searchActive && (
        <div
          className="sticky z-20 bg-neutral-950/96 backdrop-blur-md border-b border-white/[0.07]"
          style={{ top: '112px' }}
        >
          <div
            ref={tabsScrollRef}
            className="flex gap-1 px-3 py-2 overflow-x-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
          >
            {cats.map(cat => {
              const active = cat === activeCategory;
              return (
                <button
                  key={cat}
                  ref={active ? activeTabRef : null}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                    active
                      ? 'bg-white text-black'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {cat}
                  <span className={`text-[10px] ${active ? 'text-black/40' : 'text-white/20'}`}>
                    {categoryCounts[cat] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Gallery Grid ─────────────────────────────────────────────────────── */}
      <div className="pb-28">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-white/25">
            <Search size={40} strokeWidth={1} />
            <p className="text-sm">No photos found</p>
          </div>
        ) : (
          <>
            {groupedItems.map(group => (
              <div key={group.category}>
                {/* Section header — shown in All view or search */}
                {(activeCategory === 'All' || searchQuery.trim()) && (
                  <div
                    className="sticky z-10 px-3 py-1.5 bg-black/95 backdrop-blur-sm"
                    style={{ top: searchActive ? '64px' : '156px' }}
                  >
                    <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.12em]">
                      {group.category}
                    </span>
                    <span className="ml-2 text-[10px] text-white/20">{group.items.length}</span>
                  </div>
                )}

                {/* Square grid */}
                <div
                  className={`grid gap-[2px] ${
                    colCount === 3
                      ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6'
                      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                  }`}
                >
                  {group.items.map(item => {
                    if (activeCategory === 'All' && !searchQuery.trim()) {
                      totalRendered++;
                      if (totalRendered > visibleCount) return null;
                    }

                    const isSelected = selectedItems.has(item.id);

                    return (
                      <motion.div
                        layoutId={`gallery-item-${item.id}`}
                        key={item.id}
                        className="relative aspect-square overflow-hidden bg-neutral-900 cursor-pointer select-none"
                        onClick={() => handleItemClick(item.id)}
                        onTouchStart={startLongPress(item.id)}
                        onTouchEnd={cancelLongPress}
                        onTouchMove={cancelLongPress}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className={`w-full h-full object-cover transition-all duration-200 ${
                            isSelected ? 'scale-[0.86] rounded-sm' : ''
                          }`}
                          loading="lazy"
                        />

                        {/* Selection overlay */}
                        <AnimatePresence>
                          {isSelectionMode && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.1 }}
                              className={`absolute inset-0 transition-colors duration-150 ${
                                isSelected ? 'bg-blue-500/30' : 'bg-black/10'
                              }`}
                            >
                              {/* Checkmark */}
                              <div
                                className={`absolute bottom-1.5 left-1.5 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-150 ${
                                  isSelected
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'border-white/75 bg-black/30'
                                }`}
                              >
                                {isSelected && (
                                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="1,4 3.5,6.5 9,1" />
                                  </svg>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Infinite scroll sentinel */}
            {activeCategory === 'All' && !searchQuery.trim() && visibleCount < filteredItems.length && (
              <div ref={setSentinelRef} className="h-4" aria-hidden />
            )}
          </>
        )}
      </div>

      {/* ── Selection Action Bar ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed bottom-0 inset-x-0 z-50"
          >
            <div className="m-3 mb-4 rounded-2xl bg-neutral-900 border border-white/10 shadow-2xl p-4">
              {selectedItems.size > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                    </p>
                    <p className="text-xs text-white/35 mt-0.5">Send all codes via WhatsApp</p>
                  </div>
                  <button
                    onClick={bulkWhatsApp}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-xl font-semibold text-sm shrink-0 active:scale-95 transition-transform"
                  >
                    <WAIcon /> Inquire
                  </button>
                </div>
              ) : (
                <p className="text-sm text-white/35 text-center">
                  Tap to select · Long-press to start
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
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
