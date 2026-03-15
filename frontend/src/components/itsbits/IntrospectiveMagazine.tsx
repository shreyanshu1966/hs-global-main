const IntrospectiveMagazine = () => {
  return (
    <section className="itsbits-section-rail itsbits-journal-section">
      
      {/* Header */}
      <div className="itsbits-journal-header">
        <h2 className="dibs-section-title itsbits-journal-heading">
          <span className="itsbits-journal-heading-em">HS Global</span>
          <span> Journal</span>
        </h2>
      </div>

      {/* spacer */}
      <div />

      {/* Grid */}
      <div className="itsbits-journal-grid itsbits-journal-grid-gap">
        
        {/* Article 1 */}
        <a href="/about" className="group itsbits-journal-article-link">
          {/* Image container 67.36% landscape */}
          <div className="itsbits-journal-landscape itsbits-journal-media-wrap">
            <img 
              src="/about-hero.webp" 
              alt="About HS Global"
              className="itsbits-journal-media group-hover:scale-105 transition-transform duration-500"
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
          </div>
          <h3 className="itsbits-journal-title itsbits-journal-title-base">
            Inside HS Global: How Our Craft and Sourcing Teams Deliver Premium Natural Stone Worldwide
          </h3>
          <div className="itsbits-journal-link itsbits-journal-link-base">
            Read Story
          </div>
        </a>

        {/* Article 2 */}
        <a href="/services" className="group itsbits-journal-article-link">
          {/* Image container 137.26% portrait */}
          <div className="itsbits-journal-portrait itsbits-journal-media-wrap">
            <img 
              src="/services-hero.webp" 
              alt="HS Global Services"
              className="itsbits-journal-media group-hover:scale-105 transition-transform duration-500"
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
          </div>
          <div className="itsbits-journal-portrait-copy">
            <h3 className="itsbits-journal-title itsbits-journal-title-base">
              End-to-End Services: Quarry Selection, Precision Fabrication, QA, and Export Logistics
            </h3>
            <div className="itsbits-journal-link itsbits-journal-link-base">
              Explore Services
            </div>
          </div>
        </a>

      </div>
    </section>
  );
};

export default IntrospectiveMagazine;
