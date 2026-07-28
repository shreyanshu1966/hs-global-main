'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2 } from 'lucide-react';
import type { VideoGalleryItem } from '../utils/videoGalleryData';

interface VideoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentItem: VideoGalleryItem | null;
  modalList: VideoGalleryItem[];
  modalIndex: number;
  setModalIndex: (index: number) => void;
  setCurrentItem: (item: VideoGalleryItem) => void;
}

const WAIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M20.52 3.48A11.94 11.94 0 0012.06 0C5.55 0 .29 5.27.29 11.78c0 2.08.54 4.11 1.58 5.91L0 24l6.47-1.83a11.6 11.6 0 005.59 1.49h.01c6.51 0 11.78-5.26 11.78-11.77 0-3.15-1.23-6.11-3.33-8.41zM12.07 21.3h-.01a9.5 9.5 0 01-4.84-1.32l-.35-.2-3.84 1.09 1.03-3.74-.23-.38a9.5 9.5 0 01-1.46-5.11c0-5.25 4.28-9.53 9.54-9.53 2.55 0 4.95.99 6.75 2.79a9.45 9.45 0 012.79 6.74c0 5.25-4.28 9.53-9.54 9.53zm5.5-7.1c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.06 2.9 1.2 3.1.15.2 2.08 3.17 5.04 4.45.7.3 1.24.48 1.66.62.7.22 1.34.19 1.85.12.56-.08 1.77-.72 2.02-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
  </svg>
);

export const VideoGalleryModal = ({
  isOpen,
  onClose,
  currentItem,
  modalList,
  modalIndex,
  setModalIndex,
  setCurrentItem,
}: VideoGalleryModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const goNext = () => {
    const next = (modalIndex + 1) % modalList.length;
    setModalIndex(next); setCurrentItem(modalList[next]);
  };

  const goPrev = () => {
    const prev = (modalIndex - 1 + modalList.length) % modalList.length;
    setModalIndex(prev); setCurrentItem(modalList[prev]);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, modalIndex, modalList]);

  // Autoplay (muted) when the active video changes
  useEffect(() => {
    if (!isOpen || !videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
  }, [isOpen, currentItem?.id]);

  const handleShare = async () => {
    if (!currentItem) return;
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: `${currentItem.category} — ${currentItem.title}`,
          text: `Check out this video from HS Global: ${currentItem.title}`,
          url: currentItem.videoUrl,
        });
        return;
      } catch {
        // cancelled or not supported — fall through to WA
      }
    }
    const text = `Hi, I'm interested in the "${currentItem.title}" video from the ${currentItem.category} gallery.`;
    window.open(`https://wa.me/918107115116?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!isOpen || !currentItem) return null;

  const waUrl = `https://wa.me/918107115116?text=${encodeURIComponent(
    `Hi, I'm interested in "${currentItem.title}" from the ${currentItem.category} video gallery.`
  )}`;

  const pageLabel = modalList.length > 1
    ? `${modalIndex + 1} / ${modalList.length}`
    : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2147483000]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black"
          onClick={onClose}
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            layoutId={`video-item-${currentItem.id}`}
            className="relative w-full h-full md:w-[96vw] md:max-w-4xl md:max-h-[94vh] md:mx-auto bg-[#0a0a0a] md:rounded-2xl md:border md:border-white/10 shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="absolute top-0 inset-x-0 z-30 flex items-center gap-2 p-3 bg-gradient-to-b from-black/80 via-black/25 to-transparent pointer-events-auto">
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white/80 border border-white/12 hover:bg-white hover:text-black transition-all shrink-0"
                aria-label="Close"
              >
                <X size={15} />
              </button>

              <div className="flex-1 min-w-0 px-2">
                <p className="text-[12px] font-medium text-white/90 leading-tight truncate tracking-wide">{currentItem.category}</p>
                {pageLabel && (
                  <p className="text-[10px] text-white/35 leading-tight mt-0.5 tabular-nums">{pageLabel}</p>
                )}
              </div>

              <button
                onClick={handleShare}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white/80 border border-white/12 hover:bg-white hover:text-black transition-all shrink-0"
                aria-label="Share"
              >
                <Share2 size={14} />
              </button>

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

            {/* Video player */}
            <div className="flex-1 min-h-0 relative bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                key={currentItem.id}
                src={currentItem.videoUrl}
                poster={currentItem.posterUrl}
                controls
                playsInline
                muted
                loop
                preload="auto"
                className="w-full h-full object-contain"
              />

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

            {/* Info strip */}
            <div className="shrink-0 bg-[#0c0c0c] border-t border-white/[0.05] flex items-center gap-3 px-4 py-3">
              <span className="text-[11px] text-white/60 truncate">{currentItem.title}</span>
              {pageLabel && (
                <span className="text-[10px] text-white/22 shrink-0 ml-auto tabular-nums">{pageLabel}</span>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
