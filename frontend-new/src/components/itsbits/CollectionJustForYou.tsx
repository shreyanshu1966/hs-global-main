'use client';
import ProductCard from './ProductCard';
import { useHorizontalCarousel } from './useHorizontalCarousel';
import { useEffect, useState } from 'react';
import { fetchItsbitsProducts, ItsbitsCardItem } from './productData';

interface CollectionJustForYouProps {
  title?: string;
  subtitle?: string;
  viewMoreText?: string;
  viewMoreLink?: string;
}

const CollectionJustForYou = ({
  title = '',
  subtitle = '',
  viewMoreText = '',
  viewMoreLink = '',
}: CollectionJustForYouProps) => {
  const { trackRef, canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useHorizontalCarousel(0.88);
  const [picks, setPicks] = useState<ItsbitsCardItem[]>([]);

  useEffect(() => {
    let isActive = true;

    const loadPicks = async () => {
      try {
        let items = await fetchItsbitsProducts({
          limit: 10,
          featured: true,
          sortBy: 'viewCount',
          sortOrder: 'desc',
          marbleFurnitureOnly: true,
        });

        if (items.length === 0) {
          items = await fetchItsbitsProducts({
            limit: 10,
            sortBy: 'viewCount',
            sortOrder: 'desc',
            marbleFurnitureOnly: true,
          });
        }

        if (!isActive) {
          return;
        }

        setPicks(items);
      } catch (error) {
        console.error('Failed to load personalized picks:', error);
        if (isActive) {
          setPicks([]);
        }
      }
    };

    loadPicks();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="itsbits-personalized-wrap">
      <div className="itsbits-personalized-inner">
        <div className="itsbits-personalized-header">
          <h2 className="itsbits-personalized-title">
            {title}
          </h2>
          <p className="itsbits-personalized-subtitle">{subtitle}</p>
          <a href={viewMoreLink} className="itsbits-personalized-link">{viewMoreText}</a>
        </div>

        <div className="relative">
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="itsbits-arrow itsbits-arrow-left hidden md:flex"
            aria-label="Previous picks"
          >
            <svg width="30" height="30" viewBox="0 0 40 40" fill="currentColor">
              <path d="m22.762 32-9.828-12 9.828-12 2.477 2.014L17.069 20l8.17 9.986L22.762 32Z" />
            </svg>
          </button>

          <div className="itsbits-rail-shell">
            <div ref={trackRef} className="itsbits-track itsbits-track-standard overflow-x-auto scroll-smooth">
              {picks.map((item) => (
                <div key={item.id} className="itsbits-personalized-item itsbits-track-item-no-shrink">
                  <ProductCard
                    id={String(item.id)}
                    image={item.image}
                    title={item.title}
                    designer={item.designer}
                    price={item.price}
                    originalPrice={item.originalPrice}
                    priceUSD={item.priceUSD}
                    originalPriceUSD={item.originalPriceUSD}
                    priceLabel={item.priceLabel}
                    productLink={item.href}
                    averageRating={item.averageRating}
                    totalReviews={item.totalReviews}
                    regionalPricing={item.regionalPricing}
                    discount={item.discount}
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
            aria-label="Next picks"
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

export default CollectionJustForYou;
