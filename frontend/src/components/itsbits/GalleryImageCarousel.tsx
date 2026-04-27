import { useMemo, useState } from 'react';
import { useHorizontalCarousel } from './useHorizontalCarousel';
import { GalleryItem, GalleryModal } from '../GalleryModal';


const galleryFiles = import.meta.glob('../../../public/gallery/**/*.{webp,jpg,jpeg,png}', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const toTitle = (value: string) =>
  decodeURIComponent(value)
    .replace(/\.[^/.]+$/, '')
    .replace(/[\/_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const toSlug = (value: string) =>
  decodeURIComponent(value.replace(/\+/g, ' '))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const buildGalleryItems = (): GalleryItem[] => {
  const interim: { path: string; title: string; category: string; image: string }[] = [];

  Object.entries(galleryFiles).forEach(([path, url]) => {
    const relativePath = path.replace(/^..\/..\/public\//, '').replace(/^\//, '');
    const parts = relativePath.split('/').filter(Boolean);
    const galleryIndex = parts.indexOf('gallery');
    if (galleryIndex === -1 || !parts[galleryIndex + 1]) {
      return;
    }

    const category = toTitle(parts[galleryIndex + 1]);
    const fileName = parts[parts.length - 1] || '';
    const title = toTitle(fileName);

    interim.push({
      path: relativePath,
      title,
      category,
      image: url,
    });
  });

  const categoryIndex = new Map<string, number>();

  return interim
    .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title))
    .map((entry) => {
      const nextIndex = (categoryIndex.get(entry.category) || 0) + 1;
      categoryIndex.set(entry.category, nextIndex);

      const code = `HS${entry.category.slice(0, 2).toUpperCase()}${String(nextIndex).padStart(3, '0')}`;

      return {
        id: toSlug(entry.path),
        title: entry.title,
        category: entry.category,
        code,
        image: entry.image,
      };
    });
};


const GalleryImageCarousel = () => {
  const { trackRef, canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useHorizontalCarousel(0.88);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [modalIndex, setModalIndex] = useState<number>(-1);

  const items = useMemo(() => {
    const galleryItems = buildGalleryItems();
    return galleryItems.slice(0, 18);
  }, []);

  return (
    <section>
      <div className="itsbits-section-header itsbits-carousel-header">
        <h2 className="dibs-section-title">Gallery Highlights</h2>
        <a href="/gallery" className="itsbits-carousel-link">
          <span>View Gallery</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M8 5l8 7-8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

      <div className="itsbits-section-rail itsbits-carousel-rail">
        <div className="relative">
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="itsbits-arrow itsbits-arrow-left hidden md:flex"
            aria-label="Previous gallery items"
          >
            <svg width="30" height="30" viewBox="0 0 40 40" fill="currentColor">
              <path d="m22.762 32-9.828-12 9.828-12 2.477 2.014L17.069 20l8.17 9.986L22.762 32Z" />
            </svg>
          </button>

          <div className="itsbits-rail-shell">
            <div ref={trackRef} className="itsbits-track itsbits-track-standard overflow-x-auto scroll-smooth">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setModalIndex(index);
                    setSelectedImage(item);
                  }}
                  className="group itsbits-rail-item itsbits-track-item-no-shrink block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  aria-label={`View gallery item ${item.code}`}
                >
                  <div className="relative aspect-[4/3] bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </button>
              ))}
            </div>
            <div className="itsbits-swipe-cue md:hidden" aria-hidden="true">Swipe</div>
          </div>

          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="itsbits-arrow itsbits-arrow-right hidden md:flex"
            aria-label="Next gallery items"
          >
            <svg width="30" height="30" viewBox="0 0 40 40" fill="currentColor">
              <path d="m17.238 32-2.476-2.014L22.934 20l-8.172-9.986L17.238 8l9.828 12-9.828 12Z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Modal */}
      <GalleryModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        currentItem={selectedImage}
        modalList={items}
        modalIndex={modalIndex}
        setModalIndex={setModalIndex}
        setCurrentItem={setSelectedImage}
      />
    </section>
  );
};

export default GalleryImageCarousel;
