import { Star, ThumbsUp, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface Review {
  _id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  helpful: number;
  verified: boolean;
}

interface ReviewListProps {
  reviews: Review[];
  loading: boolean;
}

export const ReviewList = ({ reviews, loading }: ReviewListProps) => {
  const [helpfulClicks, setHelpfulClicks] = useState<Set<string>>(new Set());

  const handleHelpful = async (reviewId: string) => {
    if (helpfulClicks.has(reviewId)) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });

      if (response.ok) {
        setHelpfulClicks(new Set(helpfulClicks).add(reviewId));
      }
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-[#e2e8f0] p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#e2e8f0] rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#e2e8f0] w-1/3"></div>
                <div className="h-3 bg-[#e2e8f0] w-full"></div>
                <div className="h-3 bg-[#e2e8f0] w-4/5"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white border border-[#e2e8f0] p-8 text-center">
        <Star className="w-12 h-12 text-[#94a3b8] mx-auto mb-3" />
        <h3 className="text-xl font-['Playfair_Display'] font-semibold text-[#2a251f] mb-2">No Reviews Yet</h3>
        <p className="text-[#64748b] text-sm">Be the first to share your experience with this product.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review, index) => (
        <div 
          key={review._id} 
          className="bg-white hover:bg-[#f8fafc] border border-[#e2e8f0] p-4 transition-colors duration-200"
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#111827] flex items-center justify-center text-[#f8fafc] font-semibold text-sm">
                {review.userName.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-[#2a251f] text-sm">{review.userName}</h4>
                    {review.verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#e6f2eb] text-[#24523e] text-xs font-medium rounded">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                    <div className="flex items-center gap-2 text-xs text-[#64748b]">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span>•</span>
                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Title */}
              {review.title && (
                <h5 className="font-semibold text-[#2b2722] mb-2 text-sm">{review.title}</h5>
              )}
              
              {/* Comment */}
              <p className="text-[#334155] text-sm leading-relaxed whitespace-pre-line mb-3">
                {review.comment}
              </p>

              {/* Helpful Button */}
              <button
                onClick={() => handleHelpful(review._id)}
                disabled={helpfulClicks.has(review._id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  helpfulClicks.has(review._id)
                    ? 'bg-[#111827] text-[#f8fafc]'
                    : 'bg-[#f1f5f9] text-[#334155] hover:bg-[#e2e8f0]'
                } disabled:cursor-default`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${helpfulClicks.has(review._id) ? 'fill-current' : ''}`} />
                <span>
                  {helpfulClicks.has(review._id) ? 'Helpful!' : 'Helpful'}
                  {review.helpful > 0 && ` (${review.helpful + (helpfulClicks.has(review._id) ? 1 : 0)})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
