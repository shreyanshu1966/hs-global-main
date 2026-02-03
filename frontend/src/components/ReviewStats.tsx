import { Star } from 'lucide-react';

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ReviewStatsProps {
  stats: ReviewStats;
  loading: boolean;
}

export const ReviewStats = ({ stats, loading }: ReviewStatsProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center space-x-8">
          <div className="text-center">
            <div className="h-16 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </div>
          <div className="flex-1 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (stats.totalReviews === 0) {
    return null;
  }

  const getPercentage = (count: number) => {
    return stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Overall Rating */}
        <div className="text-center md:border-r border-gray-200">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= Math.round(stats.averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-gray-600">
            Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Rating Breakdown */}
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-12">
                <span className="text-sm font-medium text-gray-700">{rating}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-yellow-400 h-full transition-all duration-500"
                  style={{ width: `${getPercentage(stats.ratingBreakdown[rating as keyof typeof stats.ratingBreakdown])}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">
                {stats.ratingBreakdown[rating as keyof typeof stats.ratingBreakdown]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
