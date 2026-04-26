import { useEffect, useState } from 'react';
import { useHorizontalCarousel } from './useHorizontalCarousel';

interface CollectionCard {
  title: string;
  link: string;
  image: string;
}

interface InteriorDesignersProps {
  sectionTitle?: string;
  cards?: CollectionCard[];
}

const InteriorDesigners = ({ sectionTitle = '', cards: cardsProp = [] }: InteriorDesignersProps) => {
  const { trackRef, canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useHorizontalCarousel(0.85);
  const [isCenteredLayout, setIsCenteredLayout] = useState(false);

  const designers = cardsProp;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) {
      return;
    }

    const updateCenterState = () => {
      const overflow = el.scrollWidth - el.clientWidth;
      setIsCenteredLayout(overflow <= 16);
    };

    updateCenterState();

    const resizeObserver = new ResizeObserver(() => updateCenterState());
    resizeObserver.observe(el);
    window.addEventListener('resize', updateCenterState);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateCenterState);
    };
  }, [trackRef, designers.length]);

  return (
    <section className="itsbits-collections-section">
      <div className="itsbits-section-header itsbits-carousel-header">
        <h2 className="dibs-section-title itsbits-collections-title itsbits-collections-title-base">
          {sectionTitle}
        </h2>
      </div>

      <div className="itsbits-section-rail itsbits-carousel-rail">
        <div className="relative">
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="itsbits-arrow itsbits-arrow-left hidden md:flex"
            aria-label="Previous collections"
          >
            <svg width="30" height="30" viewBox="0 0 40 40" fill="currentColor">
              <path d="m22.762 32-9.828-12 9.828-12 2.477 2.014L17.069 20l8.17 9.986L22.762 32Z" />
            </svg>
          </button>

          <div className="itsbits-rail-shell">
            <div ref={trackRef} className={`itsbits-track itsbits-track-standard overflow-x-auto scroll-smooth ${isCenteredLayout ? 'justify-center' : ''}`}>
              {designers.map((designer, i) => (
                <a
                  key={i}
                  href={designer.link}
                  className="group itsbits-rail-item itsbits-collections-card itsbits-track-item-no-shrink"
                >
                  <div className="itsbits-collections-image itsbits-collections-image-base">
                    <img
                      src={designer.image}
                      alt={designer.title}
                      className="itsbits-collections-image-media group-hover:opacity-90 transition-opacity duration-300"
                    />
                  </div>
                  <span className="itsbits-collections-name itsbits-collections-name-base group-hover:underline underline-offset-4">
                    {designer.title}
                  </span>
                </a>
              ))}
            </div>
            <div className="itsbits-swipe-cue md:hidden" aria-hidden="true">Swipe</div>
          </div>

          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="itsbits-arrow itsbits-arrow-right hidden md:flex"
            aria-label="Next collections"
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

export default InteriorDesigners;
