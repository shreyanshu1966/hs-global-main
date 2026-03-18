import { useMemo } from 'react';
import { useHorizontalCarousel } from './useHorizontalCarousel';

type GalleryItem = {
  id: string;
  title: string;
  image: string;
  href: string;
};

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

const buildGalleryItems = (): GalleryItem[] => {
  const entries = Object.entries(galleryFiles)
    .map(([path, url]) => {
      const parts = path.split('/').filter(Boolean);
      const fileName = parts[parts.length - 1] || '';
      const category = parts[parts.length - 2] || 'Gallery';
      const title = `${toTitle(category)} - ${toTitle(fileName)}`;

      return {
        id: path,
        title,
        image: url,
        href: '/gallery',
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  return entries;
};

const fallbackItems: GalleryItem[] = [
  {
    id: 'fallback-gallery-1',
    title: 'Project Gallery',
    image: '/gallery-hero.webp',
    href: '/gallery',
  },
  {
    id: 'fallback-gallery-2',
    title: 'Stone Craft Showcase',
    image: '/marble-solutions.webp',
    href: '/gallery',
  },
  {
    id: 'fallback-gallery-3',
    title: 'Furniture Gallery',
    image: '/service.webp',
    href: '/gallery',
  },
];

const GalleryImageCarousel = () => {
  const { trackRef, canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useHorizontalCarousel(0.88);

  const items = useMemo(() => {
    const galleryItems = buildGalleryItems();
    return galleryItems.length > 0 ? galleryItems.slice(0, 18) : fallbackItems;
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
              {items.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="group itsbits-rail-item itsbits-track-item-no-shrink block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="relative aspect-[4/3] bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-1 text-sm font-semibold text-slate-900 group-hover:underline">{item.title}</p>
                  </div>
                </a>
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
    </section>
  );
};

export default GalleryImageCarousel;
