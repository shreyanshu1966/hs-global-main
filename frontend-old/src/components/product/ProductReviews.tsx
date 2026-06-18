import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp, PenLine } from 'lucide-react';
import { ReviewStats } from '../ReviewStats';
import { ReviewList } from '../ReviewList';
import { ReviewForm } from '../ReviewForm';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface ProductReviewsProps {
  product: any;
  reviewStats: any;
  reviews: any[];
  reviewsLoading: boolean;
  onReviewSubmitted: () => void;
  reviewsRef: React.RefObject<HTMLDivElement>;
}

export function ProductReviews({
  product,
  reviewStats,
  reviews,
  reviewsLoading,
  onReviewSubmitted,
  reviewsRef,
}: ProductReviewsProps) {
  const [showAll, setShowAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  const visibleReviews = showAll ? reviews : reviews.slice(0, 3);
  const hasReviews = reviewStats.totalReviews > 0;

  return (
    <div ref={reviewsRef} className="max-w-5xl mx-auto">

      {/* Section header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-[22px] md:text-[28px] font-serif text-[#111] leading-tight">
            Customer Reviews
          </h2>
          {hasReviews && (
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(reviewStats.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-[#e5e7eb]'}`} />
                ))}
              </div>
              <span className="text-[13px] text-[#6b7280]">
                {reviewStats.averageRating.toFixed(1)} · {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Write a review CTA */}
        <button
          onClick={() => setShowForm(v => !v)}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-[#111] text-white text-[12px] font-semibold uppercase tracking-[0.06em] rounded-xl hover:bg-[#333] transition-colors"
        >
          <PenLine className="w-3.5 h-3.5" />
          Write a Review
        </button>
      </div>

      {/* Review form (inline, toggled) */}
      {showForm && (
        <div className="mb-8 bg-[#fafafa] rounded-2xl border border-[#f0f0f0] p-6">
          {user ? (
            <ReviewForm
              productId={product.id || product._id || product.productId}
              onReviewSubmitted={() => { onReviewSubmitted(); setShowForm(false); }}
            />
          ) : (
            <div className="text-center py-8 space-y-4">
              <p className="text-[14px] text-[#6b7280]">Please sign in to write a review</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#111] text-white text-[12px] font-semibold uppercase tracking-[0.06em] rounded-xl hover:bg-[#333] transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Mobile write-review button */}
      <button
        onClick={() => setShowForm(v => !v)}
        className="sm:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#111] text-white text-[12px] font-semibold uppercase tracking-[0.06em] rounded-xl hover:bg-[#333] transition-colors mb-8"
      >
        <PenLine className="w-3.5 h-3.5" />
        Write a Review
      </button>

      {/* Content: stats + list */}
      {(hasReviews || reviewsLoading) && (
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Stats panel */}
          <div className="lg:sticky lg:top-8 h-fit">
            <ReviewStats stats={reviewStats} loading={reviewsLoading} />
          </div>

          {/* Review list */}
          <div>
            <ReviewList reviews={visibleReviews} loading={reviewsLoading} />

            {reviews.length > 3 && !reviewsLoading && (
              <button
                onClick={() => setShowAll(v => !v)}
                className="mt-5 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#555] hover:text-[#111] transition-colors"
              >
                {showAll ? (
                  <><ChevronUp className="w-4 h-4" /> Show Less</>
                ) : (
                  <><ChevronDown className="w-4 h-4" /> Show {reviews.length - 3} More</>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasReviews && !reviewsLoading && (
        <ReviewList reviews={[]} loading={false} />
      )}
    </div>
  );
}
