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
  titlePrefix = '',
  titleSuffix = '',
  articles = [],
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
          <div className="itsbits-journal-landscape itsbits-journal-media-wrap">
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
          <div className="itsbits-journal-landscape itsbits-journal-media-wrap">
            <img 
              src={second.image}
              alt={second.imageAlt || second.title}
              className="itsbits-journal-media group-hover:scale-105 transition-transform duration-500"
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
          </div>
          <h3 className="itsbits-journal-title itsbits-journal-title-base">
            {second.title}
          </h3>
          <div className="itsbits-journal-link itsbits-journal-link-base">
            {second.ctaText}
          </div>
        </a>
        )}

      </div>
    </section>
  );
};

export default IntrospectiveMagazine;
