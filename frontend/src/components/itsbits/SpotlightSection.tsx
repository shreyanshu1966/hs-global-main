import { useHorizontalCarousel } from './useHorizontalCarousel';

const SpotlightSection = () => {
  const { trackRef, canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useHorizontalCarousel(0.9);

  const cards = [
    { title: 'Italian Marble Excellence', sub: 'Browse Slab Collections', img: '/marble-solutions.webp' },
    { title: 'Premium Granite Program', sub: 'Explore Granite Range', img: '/granite-solutions.webp' },
    { title: 'Luxury Furniture Craft', sub: 'View Furniture Pieces', img: '/service.webp' },
    { title: 'Global Export Network', sub: 'See Delivery Capability', img: '/export.webp' },
    { title: 'Tailored Fabrication', sub: 'Review Custom Services', img: '/services-custom-fabrication.png' },
    { title: 'Project Gallery', sub: 'Discover Completed Works', img: '/gallery-hero.webp' },
  ];

  return (
    <section className="w-full itsbits-section-rail itsbits-spotlight-section">
      <h2 className="dibs-section-title text-center itsbits-spotlight-title">
        HS Global Spotlight
      </h2>

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
          <div ref={trackRef} className="itsbits-track itsbits-track-tight overflow-x-auto scroll-smooth">
            {cards.map((item, i) => (
              <div 
                key={i} 
                className="shrink-0 cursor-pointer group itsbits-spotlight-item"
              >
                <div className="itsbits-spotlight-image-wrap">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    className="w-full group-hover:opacity-90 transition-opacity duration-200"
                    onError={(e) => {
                      // Fallback to placeholder if local image is missing
                      e.currentTarget.src = `https://placehold.co/400x400/e8e6dd/888?text=Spotlight+${i+1}`;
                    }}
                  />
                </div>
                <div className="dibs-header-medium text-[#222] itsbits-spotlight-item-title">
                  {item.title}
                </div>
                <div className="dibs-body-light text-[#222] group-hover:underline underline-offset-4 itsbits-spotlight-item-subtitle">
                  {item.sub}
                </div>
              </div>
            ))}
          </div>
          <div className="itsbits-swipe-cue md:hidden" aria-hidden="true">Swipe</div>
        </div>

        {/* Right arrow button */}
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
    </section>
  );
};

export default SpotlightSection;
