import ProductCard from './ProductCard';
import { useHorizontalCarousel } from './useHorizontalCarousel';
import { useEffect, useState } from 'react';
import { fetchItsbitsProducts, ItsbitsCardItem, parseCategoryFromLink } from './productData';

type CarouselSourceType = 'category' | 'tag' | 'manual';

interface ProductCarouselProps {
  title: string;
  viewAllLink: string;
  sourceType?: CarouselSourceType;
  manualProductIds?: string[];
  sourceCategory?: string;
  sourceSubcategory?: string;
  sourceTag?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const ProductCarousel = ({
  title,
  viewAllLink,
  sourceType = 'category',
  manualProductIds = [],
  sourceCategory,
  sourceSubcategory,
  sourceTag,
  limit = 0,
  sortBy = '',
  sortOrder = 'desc',
}: ProductCarouselProps) => {
  const { trackRef, canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useHorizontalCarousel(0.88);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<ItsbitsCardItem[]>([]);
  const manualIdsKey = manualProductIds.join('|');

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);

    const loadProducts = async () => {
      try {
        const category = sourceCategory || parseCategoryFromLink(viewAllLink);
        const shouldPreferFeatured = viewAllLink === '/gallery' || /favorites?/i.test(title);

        let items = await fetchItsbitsProducts({
          limit,
          category: sourceType === 'category' ? category : undefined,
          subcategory: sourceType === 'category' ? sourceSubcategory : undefined,
          tag: sourceType === 'tag' ? sourceTag : undefined,
          productIds: sourceType === 'manual' ? manualProductIds : undefined,
          featured: shouldPreferFeatured,
          sortBy: shouldPreferFeatured ? 'viewCount' : sortBy,
          sortOrder,
        });

        if (items.length === 0 && category) {
          items = await fetchItsbitsProducts({
            limit,
            category,
            sortBy: 'createdAt',
            sortOrder: 'desc',
          });
        }

        if (!isActive) {
          return;
        }

        setProducts(items);
      } catch (error) {
        console.error(`Failed to load product carousel for ${title}:`, error);
        if (isActive) {
          setProducts([]);
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
  }, [title, viewAllLink, sourceType, manualIdsKey, sourceCategory, sourceSubcategory, sourceTag, limit, sortBy, sortOrder]);

  return (
    <section>
      {/* Header Row */}
      <div className="itsbits-section-header itsbits-carousel-header">
        <h2 className="dibs-section-title">
          {title}
        </h2>
        <a 
          href={viewAllLink} 
          className="itsbits-carousel-link"
        >
          <span>View More</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M8 5l8 7-8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

      {/* Product Track */}
      <div className="itsbits-section-rail itsbits-carousel-rail">
        <div className="relative">
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="itsbits-arrow itsbits-arrow-left hidden md:flex"
            aria-label={`Previous ${title}`}
          >
            <svg width="30" height="30" viewBox="0 0 40 40" fill="currentColor">
              <path d="m22.762 32-9.828-12 9.828-12 2.477 2.014L17.069 20l8.17 9.986L22.762 32Z" />
            </svg>
          </button>

          <div className="itsbits-rail-shell">
            <div ref={trackRef} className="itsbits-track itsbits-track-standard overflow-x-auto scroll-smooth">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="itsbits-rail-item itsbits-track-item-no-shrink">
                      <div className="dibs-skeleton" style={{ width: '100%', aspectRatio: '4 / 5', marginBottom: '10px' }} />
                      <div className="dibs-skeleton" style={{ width: '88%', height: '18px', marginBottom: '6px' }} />
                      <div className="dibs-skeleton" style={{ width: '72%', height: '18px', marginBottom: '6px' }} />
                      <div className="dibs-skeleton" style={{ width: '40%', height: '18px' }} />
                    </div>
                  ))
                : products.map((p) => (
                    <div key={p.id} className="itsbits-rail-item itsbits-track-item-no-shrink">
                      <ProductCard
                        id={String(p.id)}
                        image={p.image}
                        title={p.title}
                        designer={p.designer}
                        price={p.price}
                        originalPrice={p.originalPrice}
                        priceUSD={p.priceUSD}
                        originalPriceUSD={p.originalPriceUSD}
                        priceLabel={p.priceLabel}
                        productLink={p.href}
                        averageRating={p.averageRating}
                        totalReviews={p.totalReviews}
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
            aria-label={`Next ${title}`}
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

export default ProductCarousel;
