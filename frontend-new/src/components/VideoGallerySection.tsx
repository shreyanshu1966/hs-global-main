'use client';
import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { buildVideoGallery, type VideoGalleryItem } from '../utils/videoGalleryData';
import { VideoGalleryModal } from './VideoGalleryModal';

export const VideoGallerySection = () => {
  const { items: allItems, cats } = useMemo(() => buildVideoGallery(), []);
  const [activeCategory, setActiveCategory] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<VideoGalleryItem | null>(null);
  const [modalList, setModalList] = useState<VideoGalleryItem[]>([]);
  const [modalIndex, setModalIndex] = useState(-1);

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = { All: allItems.length };
    allItems.forEach(i => { c[i.category] = (c[i.category] || 0) + 1; });
    return c;
  }, [allItems]);

  const filteredItems = useMemo(
    () => activeCategory === 'All' ? allItems : allItems.filter(i => i.category === activeCategory),
    [allItems, activeCategory]
  );

  const handleItemClick = useCallback((item: VideoGalleryItem) => {
    const list = allItems.filter(i => i.category === item.category);
    const idx = list.findIndex(i => i.id === item.id);
    setModalList(list);
    setModalIndex(idx);
    setCurrentItem(item);
    setIsModalOpen(true);
  }, [allItems]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setCurrentItem(null), 300);
  }, []);

  if (allItems.length === 0) return null;

  return (
    <div className="pb-32">
      {/* Category tabs */}
      <div className="flex items-stretch h-11 border-b border-white/[0.06] sticky z-20 bg-[#0a0a0a]" style={{ top: 'var(--itsbits-header-offset)' }}>
        <div
          className="flex-1 flex items-stretch gap-0 overflow-x-auto px-5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        >
          {cats.map(cat => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
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
                    layoutId="active-video-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-[2px] px-[2px] pt-[2px] grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filteredItems.map(item => (
          <motion.div
            key={item.id}
            layoutId={`video-item-${item.id}`}
            className="group relative overflow-hidden cursor-pointer select-none bg-neutral-900"
            onClick={() => handleItemClick(item)}
          >
            <div className="aspect-square relative overflow-hidden">
              <img
                src={item.posterUrl}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.045] will-change-transform"
                loading="lazy"
              />

              {/* Play affordance */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/15 group-hover:bg-black/30 transition-colors">
                <div className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play size={16} className="text-white ml-0.5" fill="currentColor" />
                </div>
              </div>

              {/* Hover info overlay — desktop only */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden sm:block">
                <div className="absolute bottom-3 left-3.5 right-3.5">
                  <p className="text-[9px] tracking-[0.22em] uppercase text-white/48 mb-0.5 truncate">
                    {item.category}
                  </p>
                  <p className="text-[12px] font-semibold text-white tracking-wide truncate">
                    {item.title}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <VideoGalleryModal
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
};
