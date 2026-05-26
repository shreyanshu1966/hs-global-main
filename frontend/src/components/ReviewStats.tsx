import { Star } from 'lucide-react';

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: { 5: number; 4: number; 3: number; 2: number; 1: number };
}

interface ReviewStatsProps {
  stats: ReviewStats;
  loading: boolean;
}

export const ReviewStats = ({ stats, loading }: ReviewStatsProps) => {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-6 bg-white rounded-2xl border border-[#f0f0f0]">
        <div className="flex items-center gap-4">
          <div className="h-14 w-16 bg-gray-100 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-3 bg-gray-100 rounded" />
        ))}
      </div>
    );
  }

  if (stats.totalReviews === 0) return null;

  const pct = (n: number) =>
    stats.totalReviews > 0 ? Math.round((n / stats.totalReviews) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6 shadow-sm">
      {/* Big number + stars */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#f3f4f6]">
        <div className="text-center">
          <p className="text-5xl font-bold text-[#111] leading-none mb-1">
            {stats.averageRating.toFixed(1)}
          </p>
          <p className="text-[11px] text-[#9ca3af] uppercase tracking-wide">out of 5</p>
        </div>
        <div>
          <div className="flex gap-0.5 mb-1.5">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(stats.averageRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-[#e5e7eb]'
                }`}
              />
            ))}
          </div>
          <p className="text-[12px] text-[#6b7280]">
            {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="space-y-2.5">
        {([5, 4, 3, 2, 1] as const).map(rating => {
          const count = stats.ratingBreakdown[rating];
          const width = pct(count);
          return (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-8 shrink-0">
                <span className="text-[12px] font-medium text-[#374151]">{rating}</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              </div>
              <div className="flex-1 bg-[#f3f4f6] rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-700"
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className="text-[11px] text-[#9ca3af] w-6 text-right shrink-0">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
