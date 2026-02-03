import { Star, ThumbsUp, User, CheckCircle, Clock } from 'lucide-react';
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
      <div className="space-y-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-md border-2 border-gray-200 p-6 md:p-8 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-4">
                <div className="h-5 bg-gray-200 rounded-lg w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border-2 border-gray-200 p-12 md:p-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Reviews Yet</h3>
          <p className="text-gray-600 text-lg">Be the first to share your experience with this product!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {reviews.map((review, index) => (
        <div 
          key={review._id} 
          className="bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-gray-200 hover:border-blue-300 p-6 md:p-8 transition-all duration-300 group"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start gap-4 mb-5">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {review.userName.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-bold text-gray-900 text-lg">{review.userName}</h4>
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full shadow-sm">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {review.title && (
                <h5 className="font-bold text-gray-900 mb-3 text-lg">{review.title}</h5>
              )}
              
              <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-5 bg-gray-50 p-4 rounded-xl border border-gray-200">
                {review.comment}
              </p>

              <div className="flex items-center gap-4 pt-4 border-t-2 border-gray-100">
                <button
                  onClick={() => handleHelpful(review._id)}
                  disabled={helpfulClicks.has(review._id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    helpfulClicks.has(review._id)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200 hover:border-blue-300'
                  } disabled:cursor-default`}
                >
                  <ThumbsUp className={`w-4 h-4 ${helpfulClicks.has(review._id) ? 'fill-current' : ''}`} />
                  <span>
                    {helpfulClicks.has(review._id) ? 'Helpful!' : 'Helpful'}
                    {review.helpful > 0 && ` (${review.helpful + (helpfulClicks.has(review._id) ? 1 : 0)})`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
