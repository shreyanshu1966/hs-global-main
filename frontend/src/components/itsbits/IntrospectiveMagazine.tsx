interface JournalArticle {
  title: string;
  image: string;
  link: string;
  ctaText: string;
  imageAlt: string;
  layout: 'landscape' | 'portrait';
}

interface IntrospectiveMagazineProps {
  titlePrefix?: string;
  titleSuffix?: string;
  articles?: JournalArticle[];
}

const IntrospectiveMagazine = ({
  titlePrefix = 'HS Global',
  titleSuffix = 'Journal',
  articles = [
    {
      title: 'Inside HS Global: How Our Craft and Sourcing Teams Deliver Premium Natural Stone Worldwide',
      image: '/about-hero.webp',
      link: '/about',
      ctaText: 'Read Story',
      imageAlt: 'About HS Global',
      layout: 'landscape',
    },
    {
      title: 'End-to-End Services: Quarry Selection, Precision Fabrication, QA, and Export Logistics',
      image: '/services-hero.webp',
      link: '/services',
      ctaText: 'Explore Services',
      imageAlt: 'HS Global Services',
      layout: 'portrait',
    },
  ],
}: IntrospectiveMagazineProps) => {
  const first = articles[0];
  const second = articles[1];

  return (
    <section className="itsbits-section-rail itsbits-journal-section">
      
      {/* Header */}
      <div className="itsbits-journal-header">
        <h2 className="dibs-section-title itsbits-journal-heading">
          <span className="itsbits-journal-heading-em">{titlePrefix}</span>
          <span> {titleSuffix}</span>
        </h2>
      </div>

      {/* spacer */}
      <div />

      {/* Grid */}
      <div className="itsbits-journal-grid itsbits-journal-grid-gap">
        
        {first && (
        <a href={first.link} className="group itsbits-journal-article-link">
          {/* Image container 67.36% landscape */}
          <div className={`${first.layout === 'portrait' ? 'itsbits-journal-portrait' : 'itsbits-journal-landscape'} itsbits-journal-media-wrap`}>
            <img 
              src={first.image}
              alt={first.imageAlt || first.title}
              className="itsbits-journal-media group-hover:scale-105 transition-transform duration-500"
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
          </div>
          <h3 className="itsbits-journal-title itsbits-journal-title-base">
            {first.title}
          </h3>
          <div className="itsbits-journal-link itsbits-journal-link-base">
            {first.ctaText}
          </div>
        </a>
        )}

        {second && (
        <a href={second.link} className="group itsbits-journal-article-link">
          {/* Image container 137.26% portrait */}
          <div className={`${second.layout === 'portrait' ? 'itsbits-journal-portrait' : 'itsbits-journal-landscape'} itsbits-journal-media-wrap`}>
            <img 
              src={second.image}
              alt={second.imageAlt || second.title}
              className="itsbits-journal-media group-hover:scale-105 transition-transform duration-500"
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
          </div>
          <div className="itsbits-journal-portrait-copy">
            <h3 className="itsbits-journal-title itsbits-journal-title-base">
              {second.title}
            </h3>
            <div className="itsbits-journal-link itsbits-journal-link-base">
              {second.ctaText}
            </div>
          </div>
        </a>
        )}

      </div>
    </section>
  );
};

export default IntrospectiveMagazine;
