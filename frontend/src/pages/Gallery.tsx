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
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
    <rect x="1" y="1" width="5" height="5" rx="0.5" /><rect x="7.5" y="1" width="5" height="5" rx="0.5" /><rect x="14" y="1" width="5" height="5" rx="0.5" />
    <rect x="1" y="7.5" width="5" height="5" rx="0.5" /><rect x="7.5" y="7.5" width="5" height="5" rx="0.5" /><rect x="14" y="7.5" width="5" height="5" rx="0.5" />
    <rect x="1" y="14" width="5" height="5" rx="0.5" /><rect x="7.5" y="14" width="5" height="5" rx="0.5" /><rect x="14" y="14" width="5" height="5" rx="0.5" />
  </svg>
);

const GridIcon2 = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
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

  const [quickView, setQuickView] = useState<{
    item: GalleryItem;
    x: number; y: number;
    origin: string;
  } | null>(null);

  const tabsScrollRef  = useRef<HTMLDivElement>(null);
  const activeTabRef   = useRef<HTMLButtonElement | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const stickyBarRef   = useRef<HTMLDivElement>(null);
  const qvHovered      = useRef(false);
  const qvLeaveTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const qvShowTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    if (isSelectionMode) setQuickView(null);
  }, [isSelectionMode]);

  // Sync sticky bar top with the bottom-nav hide/show animation on desktop.
  // On mobile the nav never exists so we skip adjustment (md = 768px).
  useEffect(() => {
    let ticking = false;
    let lastY = window.scrollY;
    let navVisible = true;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastY;

        let next = navVisible;
        if (currentY < 90)   next = true;
        else if (delta > 8)  next = false;
        else if (delta < -6) next = true;

        if (next !== navVisible) {
          navVisible = next;
          if (stickyBarRef.current && window.innerWidth >= 768) {
            stickyBarRef.current.style.top = navVisible
              ? 'var(--itsbits-header-offset)'
              : 'var(--itsbits-header-top-height)';
          }
        }

        lastY = currentY;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Quick-view helpers ─────────────────────────────────────────────────────

  const openQuickView = useCallback((item: GalleryItem, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const cardW = 360;
    const cardH = 400;
    const gap   = 10;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let x: number;
    let originX: string;
    if (rect.right + cardW + gap < vw) { x = rect.right + gap; originX = 'left'; }
    else                               { x = rect.left - cardW - gap; originX = 'right'; }
    x = Math.max(8, Math.min(x, vw - cardW - 8));

    let y = rect.top;
    if (y + cardH > vh - 8) y = vh - cardH - 8;
    if (y < 8) y = 8;

    setQuickView({ item, x, y, origin: `${originX} top` });
  }, []);

  const handleQVEnter = useCallback((item: GalleryItem, el: HTMLElement) => {
    if (isSelectionMode || window.innerWidth < 768) return;
    if (qvLeaveTimer.current) { clearTimeout(qvLeaveTimer.current); qvLeaveTimer.current = null; }
    qvShowTimer.current = setTimeout(() => openQuickView(item, el), 260);
  }, [isSelectionMode, openQuickView]);

  const handleQVLeave = useCallback(() => {
    if (qvShowTimer.current) { clearTimeout(qvShowTimer.current); qvShowTimer.current = null; }
    qvLeaveTimer.current = setTimeout(() => {
      if (!qvHovered.current) setQuickView(null);
    }, 140);
  }, []);

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
    setQuickView(null);
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

  let totalRendered = 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
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

      {/* ── Editorial Hero ──────────────────────────────────────────────────── */}
      {!searchActive && (
        <section className="px-5 sm:px-8 lg:px-12 pt-10 pb-8 md:pt-14 md:pb-10">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="text-[10px] tracking-[0.4em] uppercase text-white/25 mb-5 font-medium"
          >
            HS Global Export
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.07 }}
            className="font-bold text-white leading-none tracking-[-0.025em] mb-6"
            style={{ fontSize: 'clamp(54px, 10.5vw, 118px)' }}
          >
            Gallery
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex items-center gap-4 text-[13px] text-white/28 font-light"
          >
            <span>{allItems.length} works</span>
            <span className="inline-block w-7 h-px bg-white/12" />
            <span>{cats.length - 1} collections</span>
          </motion.div>
        </section>
      )}

      {/* ── Sticky Control Bar ──────────────────────────────────────────────── */}
      <div
        ref={stickyBarRef}
        className={`sticky z-30 ${
          isSelectionMode
            ? 'bg-blue-950/97 border-b border-blue-800/40'
            : 'bg-[#0a0a0a] border-b border-white/[0.06]'
        }`}
        style={{
          top: 'var(--itsbits-header-offset)',
          transition: 'top 0.35s cubic-bezier(0.22,0.61,0.36,1), background-color 0.2s, border-color 0.2s',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {searchActive ? (
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="flex items-center gap-3 h-11 px-4"
            >
              <button
                onClick={() => { setSearchActive(false); setSearchQuery(''); }}
                className="text-white/45 hover:text-white transition-colors shrink-0"
                aria-label="Close search"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search stone, category, code…"
                className="flex-1 bg-transparent text-[13px] text-white placeholder-white/22 outline-none tracking-wide"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-white/30 hover:text-white transition-colors shrink-0">
                  <X size={14} />
                </button>
              )}
            </motion.div>
          ) : isSelectionMode ? (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="flex items-center h-11 px-5"
            >
              <button onClick={exitSelection} className="text-[13px] text-white/60 hover:text-white mr-5 transition-colors">
                Cancel
              </button>
              <span className="flex-1 text-[13px] font-medium text-white">
                {selectedItems.size > 0 ? `${selectedItems.size} selected` : 'Select items'}
              </span>
              {selectedItems.size > 0 && (
                <button onClick={() => setSelectedItems(new Set())} className="text-[11px] text-white/35 hover:text-white transition-colors">
                  Clear
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="flex items-stretch h-11"
            >
              {/* Scrollable category tabs */}
              <div
                ref={tabsScrollRef}
                className="flex-1 flex items-stretch gap-0 overflow-x-auto px-5"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
              >
                {cats.map(cat => {
                  const active = cat === activeCategory;
                  return (
                    <button
                      key={cat}
                      ref={active ? activeTabRef : null}
                      onClick={() => setActiveCategory(cat)}
                      className={`relative shrink-0 flex items-center gap-1.5 mr-5 text-[12px] tracking-[0.04em] whitespace-nowrap transition-colors duration-150 ${
                        active ? 'text-white' : 'text-white/50 hover:text-white/80'
                      }`}
                    >
                      {cat}
                      <span className={`text-[9px] tabular-nums transition-colors duration-150 ${active ? 'text-white/55' : 'text-white/30'}`}>
                        {categoryCounts[cat] ?? 0}
                      </span>
                      {active && (
                        <motion.span
                          layoutId="active-tab-underline"
                          className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white rounded-full"
                          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action icons */}
              <div className="flex items-center shrink-0 border-l border-white/[0.12] px-2 gap-0">
                <button
                  onClick={() => setSearchActive(true)}
                  className="w-9 h-9 flex items-center justify-center text-white/55 hover:text-white transition-colors"
                  aria-label="Search"
                >
                  <Search size={16} />
                </button>
                <button
                  onClick={() => setIsSelectionMode(true)}
                  className="w-9 h-9 flex items-center justify-center text-white/55 hover:text-white transition-colors"
                  aria-label="Select"
                >
                  <CheckCircle2 size={16} />
                </button>
                <button
                  onClick={() => setColCount(c => c === 3 ? 2 : 3)}
                  className="w-9 h-9 flex items-center justify-center text-white/55 hover:text-white transition-colors"
                  aria-label="Toggle grid"
                >
                  {colCount === 3 ? <GridIcon2 /> : <GridIcon3 />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Gallery ─────────────────────────────────────────────────────────── */}
      <div className="pb-32">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-white/20">
            <Search size={34} strokeWidth={1} />
            <p className="text-[13px] tracking-wide">No results found</p>
          </div>
        ) : (
          <>
            {groupedItems.map(group => (
              <div key={group.category}>

                {/* Section header — All view or search */}
                {(activeCategory === 'All' || searchQuery.trim()) && (
                  <div className="flex items-center justify-between px-5 sm:px-7 pt-10 pb-4 border-b border-white/[0.05]">
                    <h2 className="text-[10px] tracking-[0.22em] uppercase font-medium text-white/30">
                      {group.category}
                    </h2>
                    <span className="text-[10px] tabular-nums text-white/15">{group.items.length}</span>
                  </div>
                )}

                {/* Uniform grid */}
                <div
                  className={`grid gap-[2px] px-[2px] pt-[2px] ${
                    colCount === 3
                      ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7'
                      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                  }`}
                >
                  {group.items.map((item) => {
                    if (activeCategory === 'All' && !searchQuery.trim()) {
                      totalRendered++;
                      if (totalRendered > visibleCount) return null;
                    }

                    const isSelected = selectedItems.has(item.id);

                    return (
                      <motion.div
                        key={item.id}
                        layoutId={`gallery-item-${item.id}`}
                        className="group relative overflow-hidden cursor-pointer select-none bg-neutral-900"
                        onClick={() => handleItemClick(item.id)}
                        onMouseEnter={(e) => handleQVEnter(item, e.currentTarget)}
                        onMouseLeave={handleQVLeave}
                        onTouchStart={startLongPress(item.id)}
                        onTouchEnd={cancelLongPress}
                        onTouchMove={cancelLongPress}
                      >
                        <div className="aspect-square relative overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.045] will-change-transform ${
                              isSelected ? 'scale-[0.88]' : ''
                            }`}
                            loading="lazy"
                          />

                          {/* Hover info overlay — desktop only */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden sm:block">
                            <div className="absolute bottom-3 left-3.5 right-3.5">
                              <p className="text-[9px] tracking-[0.22em] uppercase text-white/48 mb-0.5 truncate">
                                {item.category}
                              </p>
                              <p className="text-[12px] font-semibold text-white font-mono tracking-wide">
                                {item.code}
                              </p>
                            </div>
                          </div>

                          {/* Selection overlay */}
                          <AnimatePresence>
                            {isSelectionMode && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.1 }}
                                className={`absolute inset-0 transition-colors duration-150 ${
                                  isSelected ? 'bg-blue-400/20' : 'bg-black/8'
                                }`}
                              >
                                <div
                                  className={`absolute bottom-2 left-2 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-150 ${
                                    isSelected
                                      ? 'bg-white border-white'
                                      : 'border-white/55 bg-black/30'
                                  }`}
                                >
                                  {isSelected && (
                                    <svg width="9" height="7" viewBox="0 0 10 8" fill="none" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="1,4 3.5,6.5 9,1" />
                                    </svg>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
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
            <div className="mx-3 mb-4 rounded-2xl bg-[#111111] border border-white/[0.07] shadow-2xl p-4">
              {selectedItems.size > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-white">
                      {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                    </p>
                    <p className="text-[11px] text-white/28 mt-0.5">Send inquiry via WhatsApp</p>
                  </div>
                  <button
                    onClick={bulkWhatsApp}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-xl font-medium text-[13px] shrink-0 active:scale-95 transition-transform"
                  >
                    <WAIcon /> Inquire
                  </button>
                </div>
              ) : (
                <p className="text-[12px] text-white/22 text-center tracking-wide">
                  Tap items to select · Long-press to start
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quick View ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {quickView && !isModalOpen && (
          <motion.div
            key={quickView.item.id}
            initial={{ scale: 0.72, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.72, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 0.8 }}
            className="fixed z-[9999] pointer-events-auto cursor-pointer"
            style={{ left: quickView.x, top: quickView.y, width: 360, transformOrigin: quickView.origin }}
            onMouseEnter={() => {
              qvHovered.current = true;
              if (qvLeaveTimer.current) { clearTimeout(qvLeaveTimer.current); qvLeaveTimer.current = null; }
            }}
            onMouseLeave={() => {
              qvHovered.current = false;
              setQuickView(null);
            }}
            onClick={() => {
              const it = quickView.item;
              setQuickView(null);
              const list = allItems.filter(i => i.category === it.category);
              setModalList(list);
              setModalIndex(list.findIndex(i => i.id === it.id));
              setCurrentItem(it);
              setIsModalOpen(true);
            }}
          >
            <div className="bg-[#111111] rounded-2xl overflow-hidden shadow-[0_28px_56px_rgba(0,0,0,0.65)] border border-white/[0.09]">
              <div className="aspect-[4/3] overflow-hidden bg-neutral-900">
                <img
                  src={quickView.item.image}
                  alt={quickView.item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-4 py-3.5 flex items-center gap-3">
                <span className="text-[11px] font-mono font-semibold text-white/85 bg-white/[0.08] px-2.5 py-1.5 rounded-md tracking-wider shrink-0">
                  {quickView.item.code}
                </span>
                <span className="text-[12px] text-white/45 truncate">{quickView.item.category}</span>
                <svg className="ml-auto shrink-0 text-white/20" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </div>
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
