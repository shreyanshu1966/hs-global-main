import { useMemo, useState } from 'react';
import { useHorizontalCarousel } from './useHorizontalCarousel';

type GalleryItem = {
  id: string;
  title: string;
  category: string;
  code: string;
  image: string;
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

const getAbsoluteImageUrl = (imageUrl: string): string => {
  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
  }

  return imageUrl;
};

const getWhatsAppHref = (item: GalleryItem): string => {
  const imageUrl = getAbsoluteImageUrl(item.image);
  const message = `Hi, I'm interested in code ${item.code} from the ${item.category} gallery. Image ID: ${item.id}. Image: ${imageUrl}`;
  return `https://wa.me/918107115116?text=${encodeURIComponent(message)}`;
};

const GalleryImageCarousel = () => {
  const { trackRef, canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useHorizontalCarousel(0.88);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

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
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedImage(item)}
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
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 sm:p-6" 
          onClick={() => setSelectedImage(null)}
          aria-modal="true"
          role="dialog"
        >
          <div 
            className="relative flex flex-col w-fit max-w-[95vw] md:max-w-5xl max-h-[90vh] sm:max-h-[95vh] bg-white rounded-lg overflow-hidden shadow-2xl" 
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-3 sm:p-4 border-b shrink-0">
              <div>
                <p className="font-semibold text-gray-900">{selectedImage.category} • Code: {selectedImage.code}</p>
              </div>
              <button 
                onClick={() => setSelectedImage(null)} 
                className="p-1.5 ml-4 sm:ml-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                aria-label="Close modal"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            {/* Image Area */}
            <div className="bg-slate-50 flex justify-center items-center p-2 sm:p-4 overflow-hidden">
              <img 
                src={selectedImage.image} 
                alt={selectedImage.title} 
                className="max-w-full max-h-[55vh] md:max-h-[70vh] w-auto h-auto object-contain block drop-shadow-sm" 
              />
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600 order-2 sm:order-1 text-center sm:text-left">
                Like this design? Contact us for a quote or custom requirements.
              </p>
              <a 
                href={getWhatsAppHref(selectedImage)} 
                target="_blank" 
                rel="noreferrer" 
                className="order-1 sm:order-2 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-full font-medium transition-colors w-full sm:w-auto justify-center"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                Inquire on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GalleryImageCarousel;
