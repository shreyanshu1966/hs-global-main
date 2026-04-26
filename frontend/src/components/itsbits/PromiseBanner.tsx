interface PromiseItem {
  icon: string;
  text: string;
}

interface PromiseBannerProps {
  titlePrefix?: string;
  titleHighlight?: string;
  body?: string;
  ctaText?: string;
  ctaLink?: string;
  items?: PromiseItem[];
}

const PromiseBanner = ({
  titlePrefix = '',
  titleHighlight = '',
  body = '',
  ctaText = '',
  ctaLink = '',
  items = [],
}: PromiseBannerProps) => {

  return (
    <section className="itsbits-promise-wrap">
      
      {/* Left Text Block */}
      <div className="itsbits-promise-copy itsbits-promise-copy-base">
        <h2 className="itsbits-promise-title itsbits-promise-title-base">
          {titlePrefix} <span className="itsbits-promise-title-em">{titleHighlight}</span>
        </h2>
        <p className="itsbits-promise-body itsbits-promise-body-base">
          {body}
        </p>
        <a href={ctaLink} className="itsbits-promise-link hover:opacity-70 transition-opacity">
          {ctaText}
        </a>
      </div>

      {/* Right Grid */}
      <div className="itsbits-promise-grid itsbits-promise-grid-base">
        {items.map((p, i) => (
          <div key={i} className="itsbits-promise-item itsbits-promise-item-base">
            <svg width="24" height="24" viewBox="0 0 24 24" className="itsbits-promise-icon">
              <path d={p.icon} />
            </svg>
            <span className="itsbits-promise-item-text itsbits-promise-item-text-base">
              {p.text}
            </span>
          </div>
        ))}
      </div>
      
    </section>
  );
};

export default PromiseBanner;
