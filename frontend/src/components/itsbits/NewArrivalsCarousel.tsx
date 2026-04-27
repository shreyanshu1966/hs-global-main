import ProductCard from './ProductCard';
import { useHorizontalCarousel } from './useHorizontalCarousel';
import { useEffect, useState } from 'react';
import { fetchItsbitsProducts, ItsbitsCardItem } from './productData';

interface NewArrivalsCarouselProps {
  headingTitle?: string;
  ctaText?: string;
  ctaLink?: string;
  sourceType?: 'category' | 'tag' | 'manual';
  manualProductIds?: string[];
  tag?: string;
  limit?: number;
  category?: string;
  featured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  marbleFurnitureOnly?: boolean;
}

const NewArrivalsCarousel = ({
  headingTitle = '',
  ctaText = '',
  ctaLink = '',
  sourceType = 'category',
  manualProductIds = [],
  tag = '',
  limit = 0,
  category = '',
  featured = false,
  sortBy = '',
  sortOrder = 'desc',
  marbleFurnitureOnly = false,
}: NewArrivalsCarouselProps) => {
  const { trackRef, canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useHorizontalCarousel(0.82);
  const [newArrivals, setNewArrivals] = useState<ItsbitsCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const manualIdsKey = manualProductIds.join('|');

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);

    const loadProducts = async () => {
      try {
        const products = await fetchItsbitsProducts({
          limit,
          category: sourceType === 'category' ? category || undefined : undefined,
          tag: sourceType === 'tag' ? tag : undefined,
          productIds: sourceType === 'manual' ? manualProductIds : undefined,
          featured,
          sortBy,
          sortOrder,
          marbleFurnitureOnly,
        });

        if (!isActive) {
          return;
        }

        setNewArrivals(products);
      } catch (error) {
        console.error('Failed to load HS Global highlights:', error);
        if (isActive) {
          setNewArrivals([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isActive = false;
    };
  }, [sourceType, manualIdsKey, tag, limit, category, featured, sortBy, sortOrder, marbleFurnitureOnly]);

  return (
    <section className="w-full mx-auto itsbits-section-rail">
      <div className="flex items-start w-full itsbits-highlight-grid">
        
        {/* Left Title Block */}
        <div className="itsbits-highlight-copy flex-shrink-0 flex flex-col justify-start mt-2">
          <h2 className="itsbits-highlight-title">
            {headingTitle}
          </h2>
          <a href={ctaLink} className="itsbits-highlight-cta hover:opacity-70 transition-opacity">
            {ctaText}
          </a>
        </div>

        {/* Carousel Area */}
        <div className="flex-1 min-w-0 flex items-center itsbits-carousel-row w-full">
          <div className="relative flex-1 min-w-0 w-full">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="itsbits-arrow itsbits-arrow-left hidden md:flex"
              aria-label="Previous highlights"
            >
              <svg width="30" height="30" viewBox="0 0 40 40" fill="currentColor">
                <path d="m22.762 32-9.828-12 9.828-12 2.477 2.014L17.069 20l8.17 9.986L22.762 32Z" />
              </svg>
            </button>

            {/* Product Grid / Track */}
            <div className="flex-1 overflow-hidden itsbits-rail-shell">
            <div ref={trackRef} className="itsbits-track overflow-x-auto scroll-smooth itsbits-track-standard">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={`highlight-skeleton-${i}`} className="shrink-0 flex flex-col itsbits-rail-item">
                      <div className="dibs-skeleton" style={{ width: '100%', aspectRatio: '4 / 5', marginBottom: '10px' }} />
                      <div className="dibs-skeleton" style={{ width: '88%', height: '18px', marginBottom: '6px' }} />
                      <div className="dibs-skeleton" style={{ width: '72%', height: '18px' }} />
                    </div>
                  ))
                : newArrivals.map((item) => (
                    <div 
                      key={item.id} 
                      className="shrink-0 flex flex-col itsbits-rail-item"
                    >
                      <ProductCard 
                        id={String(item.id)}
                        image={item.image} 
                        title={item.title} 
                        designer={item.designer} 
                        price={item.price} 
                        originalPrice={item.originalPrice}
                        priceINR={item.priceINR}
                        originalPriceINR={item.originalPriceINR}
                        priceLabel={item.priceLabel}
                        productLink={item.href}
                        showPrice={false}
                        averageRating={item.averageRating}
                        totalReviews={item.totalReviews}
                      />
                    </div>
                  ))}
            </div>
            <div className="itsbits-swipe-cue md:hidden" aria-hidden="true">Swipe</div>
            </div>

            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="itsbits-arrow itsbits-arrow-right hidden md:flex"
              aria-label="Next highlights"
            >
              <svg width="30" height="30" viewBox="0 0 40 40" fill="currentColor">
                <path d="m17.238 32-2.476-2.014L22.934 20l-8.172-9.986L17.238 8l9.828 12-9.828 12Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrivalsCarousel;
