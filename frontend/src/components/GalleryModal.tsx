import { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

export const GalleryModal = ({
  isOpen,
  onClose,
  currentItem,
  modalList,
  modalIndex,
  setModalIndex,
  setCurrentItem,
}: GalleryModalProps) => {
  const { t } = useTranslation();
  const [SwiperComponents, setSwiperComponents] = useState<{ Swiper: any; SwiperSlide: any } | null>(null);
  const swiperRef = useRef<any>(null);

  const allCategoryItems = useMemo(() => {
    if (!currentItem) return [];
    return modalList.filter((i) => i.category === currentItem.category);
  }, [modalList, currentItem]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      const originalPaddingRight = window.getComputedStyle(document.body).paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      return () => {
        document.body.style.overflow = originalStyle;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || SwiperComponents) return;
    (async () => {
      await import('swiper/css');
      const mod = await import('swiper/react');
      setSwiperComponents({ Swiper: mod.Swiper, SwiperSlide: mod.SwiperSlide });
    })();
  }, [isOpen, SwiperComponents]);

  useEffect(() => {
    if (!swiperRef.current || !currentItem) return;
    const idx = allCategoryItems.findIndex((i) => i.id === currentItem.id);
    if (idx >= 0) swiperRef.current.slideTo(idx, 280);
  }, [currentItem, allCategoryItems]);

  useEffect(() => {
    if (!isOpen || !currentItem) return;
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
  }, [isOpen, currentItem, modalList, modalIndex, setCurrentItem, setModalIndex]);

  const swipeHandlers = {
    onDragEnd: (e: any, { offset, velocity }: any) => {
      const swipe = Math.abs(offset.x) * velocity.x;
      if (swipe < -10000) {
        // swipe left -> next
        const nextIndex = (modalIndex + 1) % modalList.length;
        setModalIndex(nextIndex);
        setCurrentItem(modalList[nextIndex]);
      } else if (swipe > 10000) {
        // swipe right -> prev
        const prevIndex = (modalIndex - 1 + modalList.length) % modalList.length;
        setModalIndex(prevIndex);
        setCurrentItem(modalList[prevIndex]);
      } else if (offset.y > 100 && Math.abs(velocity.y) > 200) {
        // pull down -> close
        onClose();
      }
    },
  };

  if (!isOpen || !currentItem) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2147483000]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="absolute inset-0 flex items-center justify-center p-0 md:p-4 pointer-events-none">
          <motion.div
            layoutId={`gallery-item-${currentItem.id}`}
            className="relative w-full h-full md:w-[96vw] md:max-w-5xl md:max-h-[90vh] md:mx-auto bg-black md:bg-white/10 md:backdrop-blur-xl md:rounded-2xl md:border md:border-white/20 shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Actions */}
            <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/50 to-transparent">
              <div className="text-white drop-shadow-md">
                <div className="text-sm font-semibold opacity-90">{currentItem.category}</div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={`https://wa.me/918107115116?text=${encodeURIComponent(
                    `Hi, I'm interested in code ${currentItem.code} from the ${currentItem.category} gallery. Image: ${currentItem.image}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366] text-white hover:bg-white hover:text-[#25D366] transition-colors shadow"
                  aria-label="WhatsApp Inquiry"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                    <path d="M20.52 3.48A11.94 11.94 0 0012.06 0C5.55 0 .29 5.27.29 11.78c0 2.08.54 4.11 1.58 5.91L0 24l6.47-1.83a11.6 11.6 0 005.59 1.49h.01c6.51 0 11.78-5.26 11.78-11.77 0-3.15-1.23-6.11-3.33-8.41zM12.07 21.3h-.01a9.5 9.5 0 01-4.84-1.32l-.35-.2-3.84 1.09 1.03-3.74-.23-.38a9.5 9.5 0 01-1.46-5.11c0-5.25 4.28-9.53 9.54-9.53 2.55 0 4.95.99 6.75 2.79a9.45 9.45 0 012.79 6.74c0 5.25-4.28 9.53-9.54 9.53zm5.5-7.1c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.06 2.9 1.2 3.1.15.2 2.08 3.17 5.04 4.45.7.3 1.24.48 1.66.62.7.22 1.34.19 1.85.12.56-.08 1.77-.72 2.02-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
                  </svg>
                </a>
                <button
                  onClick={onClose}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main image with Pinch to Zoom and Swipe */}
            <div className="w-full flex-1 min-h-0 bg-[#111] relative">
              <TransformWrapper
                initialScale={1}
                minScale={1}
                maxScale={4}
                centerOnInit
                doubleClick={{ disabled: false, step: 2 }}
                wheel={{ wheelDisabled: false }}
              >
                {() => (
                  <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                    <motion.img
                      drag="y"
                      dragConstraints={{ top: 0, bottom: 0 }}
                      onDragEnd={swipeHandlers.onDragEnd}
                      src={currentItem.image}
                      alt={currentItem.title}
                      className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
                    />
                  </TransformComponent>
                )}
              </TransformWrapper>
              
              {/* Invisible swipe areas for left/right */}
              <div 
                className="absolute inset-y-0 left-0 w-1/5 z-10 cursor-pointer flex items-center justify-start opacity-0 hover:opacity-100 transition-opacity px-4" 
                onClick={() => {
                  const prevIndex = (modalIndex - 1 + modalList.length) % modalList.length;
                  setModalIndex(prevIndex);
                  setCurrentItem(modalList[prevIndex]);
                }}
              >
                 <ChevronLeft className="w-8 h-8 text-white drop-shadow-md" />
              </div>
              <div 
                className="absolute inset-y-0 right-0 w-1/5 z-10 cursor-pointer flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity px-4" 
                onClick={() => {
                  const nextIndex = (modalIndex + 1) % modalList.length;
                  setModalIndex(nextIndex);
                  setCurrentItem(modalList[nextIndex]);
                }}
              >
                 <ChevronRight className="w-8 h-8 text-white drop-shadow-md" />
              </div>
            </div>

            {/* Thumbnail slider */}
            <div className="p-3 md:p-4 bg-[#111] border-t border-white/10 shrink-0 relative">
              <div className="mb-2 md:mb-3 text-sm font-medium text-white/70">
                {t('gallery.more_from')} <span className="text-white">{currentItem.category}</span>
              </div>
              {SwiperComponents ? (
                <SwiperComponents.Swiper
                  onSwiper={(swiper: any) => { swiperRef.current = swiper; }}
                  spaceBetween={12}
                  slidesPerView={3.5}
                  breakpoints={{
                    640: { slidesPerView: 4.5, spaceBetween: 14 },
                    768: { slidesPerView: 5.5, spaceBetween: 16 },
                    1024: { slidesPerView: 7.5, spaceBetween: 16 },
                  }}
                >
                  {allCategoryItems.map((rel) => {
                    const isActive = rel.id === currentItem.id;
                    return (
                      <SwiperComponents.SwiperSlide key={rel.id}>
                        <button
                          onClick={() => {
                            const idx = modalList.findIndex((i) => i.id === rel.id);
                            if (idx >= 0) setModalIndex(idx);
                            setCurrentItem(rel);
                          }}
                          className={`block w-full overflow-hidden rounded-lg border-2 transition bg-black ${
                            isActive
                              ? 'border-white ring-2 ring-white/60'
                              : 'border-white/10 hover:border-white/50'
                          }`}
                          aria-current={isActive ? 'true' : undefined}
                        >
                          <div className="w-full" style={{ aspectRatio: '1 / 1' }}>
                            <img
                              src={rel.image}
                              alt={rel.title}
                              className={`w-full h-full object-cover transition-opacity ${isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                            />
                          </div>
                        </button>
                      </SwiperComponents.SwiperSlide>
                    );
                  })}
                </SwiperComponents.Swiper>
              ) : (
                <div className="text-sm text-white/30">{t('gallery.loading')}</div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
