'use client';
import { useNavigate } from 'react-router-dom';

interface SimilarProductsProps {
  similarProducts: any[];
}

export function SimilarProducts({ similarProducts }: SimilarProductsProps) {
  const navigate = useNavigate();

  if (!similarProducts || similarProducts.length === 0) return null;

  const getProductId = (p: any): string =>
    p.productId || p._id || p.id || '';

  const getImage = (p: any): string =>
    (p.images && p.images[0]) || p.image || '/demo2.webp';

  const getName = (p: any): string => p.name || '';

  return (
    <section className="sp-section">
      <div className="sp-header">
        <span className="sp-eyebrow">Similar Items</span>
      </div>

      <div className="sp-track-wrap">
        <div className="sp-track">
          {similarProducts.map((p, i) => {
            const pid = getProductId(p);
            return (
              <button
                key={pid || `sim-${i}`}
                className="sp-card"
                onClick={() => navigate(`/product/${pid}`)}
                aria-label={getName(p)}
              >
                <div className="sp-card-img-wrap">
                  <img
                    src={getImage(p)}
                    alt={getName(p)}
                    className="sp-card-img"
                    loading="lazy"
                    draggable={false}
                  />
                  <div className="sp-card-veil">
                    <span className="sp-card-name">{getName(p)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        /* ── Section shell ── */
        .sp-section {
          background: #f0ebe3;
          border-bottom: 1px solid #ddd5c8;
          padding: 22px 0 26px;
        }

        /* ── Header row ── */
        .sp-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 36px 16px;
        }
        .sp-eyebrow {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #9b8570;
        }
        .sp-header::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #d8cfc4;
        }

        /* ── Scrollable track ── */
        .sp-track-wrap {
          padding: 0 36px;
          overflow: hidden;
        }
        .sp-track {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding-bottom: 4px;
        }
        .sp-track::-webkit-scrollbar { display: none; }

        /* ── Card ── */
        .sp-card {
          flex-shrink: 0;
          width: 148px;
          scroll-snap-align: start;
          border: none;
          padding: 0;
          background: transparent;
          cursor: pointer;
          outline: none;
          border-radius: 0;
        }
        .sp-card:focus-visible .sp-card-img-wrap {
          box-shadow: 0 0 0 2px #9b8570;
        }

        /* ── Image wrapper ── */
        .sp-card-img-wrap {
          position: relative;
          width: 148px;
          height: 192px;
          overflow: hidden;
          background: #ddd5c8;
        }

        .sp-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform;
        }
        .sp-card:hover .sp-card-img {
          transform: scale(1.07);
        }

        /* ── Name veil ── */
        .sp-card-veil {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(15, 10, 5, 0.78) 0%,
            rgba(15, 10, 5, 0.18) 48%,
            transparent 70%
          );
          display: flex;
          align-items: flex-end;
          padding: 14px 12px;
          opacity: 0;
          transform: translateY(6px);
          transition:
            opacity 0.3s ease,
            transform 0.3s ease;
        }
        .sp-card:hover .sp-card-veil {
          opacity: 1;
          transform: translateY(0);
        }

        .sp-card-name {
          font-size: 11.5px;
          font-weight: 500;
          color: #f5f0ea;
          line-height: 1.4;
          letter-spacing: 0.01em;
          text-align: left;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .sp-header { padding: 0 20px 14px; }
          .sp-track-wrap { padding: 0 20px; }
          .sp-card { width: 120px; }
          .sp-card-img-wrap { width: 120px; height: 158px; }
        }
      `}</style>
    </section>
  );
}
