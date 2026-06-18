'use client';
import { useEffect, useState } from 'react';
import { useHorizontalCarousel } from './useHorizontalCarousel';

interface SpotlightCard {
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

interface SpotlightSectionProps {
  sectionTitle?: string;
  cards?: SpotlightCard[];
}

const SpotlightSection = ({ sectionTitle = '', cards: cardsProp = [] }: SpotlightSectionProps) => {
  const { trackRef, canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useHorizontalCarousel(0.9);
  const [isCenteredLayout, setIsCenteredLayout] = useState(false);

  const cards = cardsProp;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) {
      return;
    }

    const updateCenterState = () => {
      const overflow = el.scrollWidth - el.clientWidth;
      // Treat tiny sub-pixel overflows as non-scroll layouts to keep cards visually centered.
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
  }, [trackRef, cards.length]);

  return (
    <section className="itsbits-spotlight-section">
      <div className="itsbits-section-header itsbits-carousel-header">
        <h2 className="dibs-section-title itsbits-spotlight-title">
          {sectionTitle}
        </h2>
      </div>

      <div className="itsbits-section-rail itsbits-carousel-rail">
        <div className="relative">
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="itsbits-arrow itsbits-arrow-left hidden md:flex"
            aria-label="Previous spotlight"
          >
            <svg width="24" height="24" fill="currentColor">
              <path d="m13.657 19.2 1.486-1.208L10.24 12l4.903-5.992L13.657 4.8 7.76 12l5.897 7.2Z" />
            </svg>
          </button>

          <div className="itsbits-rail-shell">
            <div ref={trackRef} className={`itsbits-track itsbits-track-tight overflow-x-auto scroll-smooth ${isCenteredLayout ? 'justify-center' : ''}`}>
              {cards.map((item, i) => (
                <a
                  key={i}
                  href={item.link || ''}
                  className="itsbits-track-item-no-shrink cursor-pointer group itsbits-spotlight-item"
                >
                  <div className="itsbits-spotlight-image-wrap">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full group-hover:opacity-90 transition-opacity duration-200"
                    />
                  </div>
                  <div className="dibs-header-medium text-[#222] itsbits-spotlight-item-title">
                    {item.title}
                  </div>
                  <div className="dibs-body-light text-[#222] group-hover:underline underline-offset-4 itsbits-spotlight-item-subtitle">
                    {item.subtitle}
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
            aria-label="Next"
          >
            <svg width="24" height="24" fill="currentColor">
              <path d="m10.343 19.2-1.486-1.208L13.76 12 8.857 6.008 10.343 4.8 16.24 12l-5.897 7.2Z" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default SpotlightSection;
