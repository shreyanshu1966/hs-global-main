'use client';
import Image from 'next/image';

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
  title = '',
  body = '',
  ctaText = '',
  link = '',
  image = '',
  fallbackImage = '',
  imageAlt = '',
}: FeaturedBannerProps) => {
  return (
    <a href={link} className="itsbits-featured-link">
      <div className="itsbits-featured-wrap itsbits-featured-section">
        
        {/* Image Side */}
        <div className="itsbits-featured-image-wrap relative">
          {(image || fallbackImage) && (
            <Image
              fill
              src={image || fallbackImage}
              alt={imageAlt}
              className="itsbits-featured-image object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
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
