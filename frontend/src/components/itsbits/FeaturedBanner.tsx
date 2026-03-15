interface FeaturedBannerProps {
  title?: string;
  body?: string;
  ctaText?: string;
  link?: string;
  image?: string;
  fallbackImage?: string;
  imageAlt?: string;
}

const FeaturedBanner = ({
  title = 'Build Your Signature Stone Collection',
  body = 'From concept and cutting to export logistics, HS Global delivers premium marble and granite solutions for architects, designers, and global buyers.',
  ctaText = 'Start Your Project',
  link = '/contact',
  image = '/banner4.webp',
  fallbackImage = '/banner.webp',
  imageAlt = 'HS Global Export Services',
}: FeaturedBannerProps) => {
  return (
    <a href={link} className="itsbits-featured-link">
      <div className="itsbits-featured-wrap itsbits-featured-section">
        
        {/* Image Side */}
        <div className="itsbits-featured-image-wrap">
          <img 
            src={image}
            alt={imageAlt}
            className="itsbits-featured-image"
            onError={(e) => {
              e.currentTarget.src = fallbackImage;
            }}
          />
        </div>

        {/* Text Side */}
        <div className="itsbits-featured-copy">
          <h2 className="itsbits-featured-title itsbits-featured-title-reset">
            {title}
          </h2>
          <p className="itsbits-featured-body itsbits-featured-body-spacing">
            {body}
          </p>
          <div>
            <span className="itsbits-featured-cta">
              {ctaText}
            </span>
          </div>
        </div>

      </div>
    </a>
  );
};

export default FeaturedBanner;
