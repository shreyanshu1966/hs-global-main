import { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { X, Share2 } from 'lucide-react';

export type GalleryItem = {
  id: string;
  title: string;
  category: string;
  image: string;
  code: string;
};

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentItem: GalleryItem | null;
  modalList: GalleryItem[];
  modalIndex: number;
  setModalIndex: (index: number) => void;
  setCurrentItem: (item: GalleryItem) => void;
}

const WAIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M20.52 3.48A11.94 11.94 0 0012.06 0C5.55 0 .29 5.27.29 11.78c0 2.08.54 4.11 1.58 5.91L0 24l6.47-1.83a11.6 11.6 0 005.59 1.49h.01c6.51 0 11.78-5.26 11.78-11.77 0-3.15-1.23-6.11-3.33-8.41zM12.07 21.3h-.01a9.5 9.5 0 01-4.84-1.32l-.35-.2-3.84 1.09 1.03-3.74-.23-.38a9.5 9.5 0 01-1.46-5.11c0-5.25 4.28-9.53 9.54-9.53 2.55 0 4.95.99 6.75 2.79a9.45 9.45 0 012.79 6.74c0 5.25-4.28 9.53-9.54 9.53zm5.5-7.1c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.06 2.9 1.2 3.1.15.2 2.08 3.17 5.04 4.45.7.3 1.24.48 1.66.62.7.22 1.34.19 1.85.12.56-.08 1.77-.72 2.02-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
  </svg>
);

export const GalleryModal = ({
  isOpen,
  onClose,
  currentItem,
  modalList,
  modalIndex,
  setModalIndex,
  setCurrentItem,
}: GalleryModalProps) => {
  const [SwiperComponents, setSwiperComponents] = useState<{ Swiper: any; SwiperSlide: any } | null>(null);
  const swiperRef = useRef<any>(null);
  const [titleExpanded, setTitleExpanded] = useState(false);

  const allCategoryItems = useMemo(() => {
    if (!currentItem) return [];
    return modalList.filter(i => i.category === currentItem.category);
  }, [modalList, currentItem]);

  // Reset title expansion when item changes
  useEffect(() => { setTitleExpanded(false); }, [currentItem?.id]);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${sbw}px`;
    return () => {
      document.body.style.overflow = prev;
      document.body.style.paddingRight = prevPad;
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowRight') {
        const next = (modalIndex + 1) % modalList.length;
        setModalIndex(next); setCurrentItem(modalList[next]);
      } else if (e.key === 'ArrowLeft') {
        const prev = (modalIndex - 1 + modalList.length) % modalList.length;
        setModalIndex(prev); setCurrentItem(modalList[prev]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, modalIndex, modalList, onClose, setModalIndex, setCurrentItem]);

  // Lazy-load Swiper
  useEffect(() => {
    if (!isOpen || SwiperComponents) return;
    (async () => {
      await import('swiper/css');
      const mod = await import('swiper/react');
      setSwiperComponents({ Swiper: mod.Swiper, SwiperSlide: mod.SwiperSlide });
    })();
  }, [isOpen, SwiperComponents]);

  // Sync Swiper position to current item
  useEffect(() => {
    if (!swiperRef.current || !currentItem) return;
    const idx = allCategoryItems.findIndex(i => i.id === currentItem.id);
    if (idx >= 0) swiperRef.current.slideTo(idx, 240);
  }, [currentItem, allCategoryItems]);

  const goNext = () => {
    const next = (modalIndex + 1) % modalList.length;
    setModalIndex(next); setCurrentItem(modalList[next]);
  };

  const goPrev = () => {
    const prev = (modalIndex - 1 + modalList.length) % modalList.length;
    setModalIndex(prev); setCurrentItem(modalList[prev]);
  };

  // Drag-to-swipe / pull-down
  const onDragEnd = (_e: any, { offset, velocity }: any) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -8000)      { goNext(); return; }
    if (swipe > 8000)       { goPrev(); return; }
    if (offset.y > 90 && Math.abs(velocity.y) > 150) { onClose(); }
  };

  // Web Share API
  const handleShare = async () => {
    if (!currentItem) return;
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: `${currentItem.category} — ${currentItem.code}`,
          text: `Check out this product from HS Global: ${currentItem.code}`,
          url: window.location.href,
        });
        return;
      } catch {
        // cancelled or not supported — fall through to WA
      }
    }
    const text = `Hi, I'm interested in ${currentItem.code} from the ${currentItem.category} gallery.`;
    window.open(`https://wa.me/918107115116?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!isOpen || !currentItem) return null;

  const waUrl = `https://wa.me/918107115116?text=${encodeURIComponent(
    `Hi, I'm interested in code ${currentItem.code} from the ${currentItem.category} gallery. Image: ${currentItem.image}`
  )}`;

  const pageLabel = modalList.length > 1
    ? `${modalIndex + 1} / ${modalList.length}`
    : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2147483000]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black"
          onClick={onClose}
        />

        {/* Viewer panel */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            layoutId={`gallery-item-${currentItem.id}`}
            className="relative w-full h-full md:w-[96vw] md:max-w-5xl md:max-h-[94vh] md:mx-auto bg-[#0a0a0a] md:rounded-2xl md:border md:border-white/10 shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* ── Top Bar ────────────────────────────────────────────────── */}
            <div className="absolute top-0 inset-x-0 z-30 flex items-center gap-2 p-3 bg-gradient-to-b from-black/80 via-black/25 to-transparent pointer-events-auto">
              {/* Close */}
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white/80 border border-white/12 hover:bg-white hover:text-black transition-all shrink-0"
                aria-label="Close"
              >
                <X size={15} />
              </button>

              {/* Category + counter */}
              <div className="flex-1 min-w-0 px-2">
                <p className="text-[12px] font-medium text-white/90 leading-tight truncate tracking-wide">{currentItem.category}</p>
                {pageLabel && (
                  <p className="text-[10px] text-white/35 leading-tight mt-0.5 tabular-nums">{pageLabel}</p>
                )}
              </div>

              {/* Share */}
              <button
                onClick={handleShare}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white/80 border border-white/12 hover:bg-white hover:text-black transition-all shrink-0"
                aria-label="Share"
              >
                <Share2 size={14} />
              </button>

              {/* WhatsApp */}
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#25D366] text-white hover:bg-[#1fba5b] transition-colors shrink-0"
                aria-label="Inquire on WhatsApp"
              >
                <WAIcon />
              </a>
            </div>

            {/* ── Main Image ─────────────────────────────────────────────── */}
            <div className="flex-1 min-h-0 relative bg-[#0a0a0a]">
              <TransformWrapper
                initialScale={1}
                minScale={1}
                maxScale={4}
                centerOnInit
                doubleClick={{ disabled: false, step: 2 }}
                wheel={{ wheelDisabled: false }}
              >
                {({ state }) => (
                  <TransformComponent
                    wrapperClass="!w-full !h-full"
                    contentClass="!w-full !h-full flex items-center justify-center"
                  >
                    <motion.img
                      drag={state.scale <= 1 ? 'y' : false}
                      dragConstraints={{ top: 0, bottom: 0 }}
                      onDragEnd={onDragEnd}
                      src={currentItem.image}
                      alt={currentItem.title}
                      className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
                    />
                  </TransformComponent>
                )}
              </TransformWrapper>

              {/* Left / Right tap zones */}
              {modalList.length > 1 && (
                <>
                  <div
                    className="absolute inset-y-0 left-0 w-[15%] z-10 cursor-pointer flex items-center justify-start opacity-0 hover:opacity-100 transition-opacity pl-3"
                    onClick={goPrev}
                  >
                    <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </div>
                  </div>
                  <div
                    className="absolute inset-y-0 right-0 w-[15%] z-10 cursor-pointer flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity pr-3"
                    onClick={goNext}
                  >
                    <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ── Bottom Panel ───────────────────────────────────────────── */}
            <div className="shrink-0 bg-[#0c0c0c] border-t border-white/[0.05]">
              {/* Thumbnail strip */}
              <div className="px-3 pt-3 pb-1">
                <p className="text-[10px] tracking-[0.18em] uppercase text-white/25 mb-2.5 font-medium">
                  More · <span className="text-white/45 normal-case tracking-normal">{currentItem.category}</span>
                </p>
                {SwiperComponents ? (
                  <SwiperComponents.Swiper
                    onSwiper={(s: any) => { swiperRef.current = s; }}
                    spaceBetween={6}
                    slidesPerView={4.5}
                    breakpoints={{
                      480:  { slidesPerView: 5.5,  spaceBetween: 7  },
                      640:  { slidesPerView: 7,    spaceBetween: 8  },
                      768:  { slidesPerView: 8.5,  spaceBetween: 8  },
                      1024: { slidesPerView: 10.5, spaceBetween: 8  },
                    }}
                  >
                    {allCategoryItems.map(rel => {
                      const active = rel.id === currentItem.id;
                      return (
                        <SwiperComponents.SwiperSlide key={rel.id}>
                          <button
                            onClick={() => {
                              const idx = modalList.findIndex(i => i.id === rel.id);
                              if (idx >= 0) setModalIndex(idx);
                              setCurrentItem(rel);
                            }}
                            className={`block w-full overflow-hidden rounded-md transition-all ${
                              active
                                ? 'ring-2 ring-white ring-offset-1 ring-offset-[#0d0d0d]'
                                : 'opacity-45 hover:opacity-80'
                            }`}
                          >
                            <div className="aspect-square bg-neutral-800">
                              <img
                                src={rel.image}
                                alt={rel.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </button>
                        </SwiperComponents.SwiperSlide>
                      );
                    })}
                  </SwiperComponents.Swiper>
                ) : (
                  <div className="h-12 flex items-center">
                    <span className="text-xs text-white/20">Loading…</span>
                  </div>
                )}
              </div>

              {/* Info strip: code · title */}
              <div className="flex items-start sm:items-center gap-3 px-4 py-3 border-t border-white/[0.04]">
                <span className="text-[11px] font-mono font-semibold text-white/80 shrink-0 bg-white/[0.07] px-2.5 py-1 rounded-md tracking-wider mt-px sm:mt-0">
                  {currentItem.code}
                </span>
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className={`text-[11px] text-white/32 ${titleExpanded ? 'whitespace-normal break-words' : 'truncate'}`}>
                    {currentItem.title}
                  </span>
                  {currentItem.title.length > 20 && (
                    <button
                      onClick={() => setTitleExpanded(p => !p)}
                      className="sm:hidden self-start text-[10px] text-white/40 active:text-white/70 transition-colors"
                    >
                      {titleExpanded ? 'See less' : 'See more'}
                    </button>
                  )}
                </div>
                {pageLabel && (
                  <span className="text-[10px] text-white/22 shrink-0 ml-auto tabular-nums mt-px sm:mt-0">{pageLabel}</span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
