const FeaturedBanner = () => {
  return (
    <a href="/contact" className="itsbits-featured-link">
      <div className="itsbits-featured-wrap itsbits-featured-section">
        
        {/* Image Side */}
        <div className="itsbits-featured-image-wrap">
          <img 
            src="/banner4.webp" 
            alt="HS Global Export Services"
            className="itsbits-featured-image"
            onError={(e) => {
              e.currentTarget.src = '/banner.webp';
            }}
          />
        </div>

        {/* Text Side */}
        <div className="itsbits-featured-copy">
          <h2 className="itsbits-featured-title itsbits-featured-title-reset">
            Build Your Signature Stone Collection
          </h2>
          <p className="itsbits-featured-body itsbits-featured-body-spacing">
            From concept and cutting to export logistics, HS Global delivers premium marble and granite solutions for architects, designers, and global buyers.
          </p>
          <div>
            <span className="itsbits-featured-cta">
              Start Your Project
            </span>
          </div>
        </div>

      </div>
    </a>
  );
};

export default FeaturedBanner;
