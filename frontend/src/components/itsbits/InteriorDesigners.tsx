import { useHorizontalCarousel } from './useHorizontalCarousel';

const InteriorDesigners = () => {
  const { trackRef, canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useHorizontalCarousel(0.85);

  const designers = [
    { name: 'Marble Coffee Tables', link: '/products?cat=furniture#coffee-table', img: '/marble-solutions.webp' },
    { name: 'Marble Console Tables', link: '/products?cat=furniture#console-table', img: '/granite-solutions.webp' },
    { name: 'Luxury Marble Furniture', link: '/products?cat=furniture', img: '/service.webp' },
    { name: 'Project Gallery', link: '/gallery', img: '/gallery-hero.webp' },
    { name: 'Talk to HS Global Team', link: '/contact', img: '/export.webp' },
  ];

  return (
    <section className="itsbits-section-rail itsbits-collections-section">
      <h2 className="dibs-section-title itsbits-collections-title itsbits-collections-title-base">
        Explore HS Global Collections
      </h2>

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
          <div ref={trackRef} className="itsbits-track itsbits-track-standard overflow-x-auto scroll-smooth">
          {designers.map((designer, i) => (
            <a
              key={i}
              href={designer.link}
              className="group itsbits-rail-item itsbits-collections-card"
            >
              <div className="itsbits-collections-image itsbits-collections-image-base">
                <img
                  src={designer.img}
                  alt={designer.name}
                  className="itsbits-collections-image-media group-hover:opacity-90 transition-opacity duration-300"
                  onError={(e) => {
                    e.currentTarget.src = `https://placehold.co/400x500/e2e2e2/333?text=Designer+${i + 1}`;
                  }}
                />
              </div>
              <span className="itsbits-collections-name itsbits-collections-name-base group-hover:underline underline-offset-4">
                {designer.name}
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
    </section>
  );
};

export default InteriorDesigners;
