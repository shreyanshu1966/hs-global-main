import { Star, ThumbsUp, BadgeCheck } from 'lucide-react';
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

// Deterministic avatar colour from first char
const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-cyan-100 text-cyan-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
];
const avatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const RATING_LABEL: Record<number, string> = {
  5: 'Excellent',
  4: 'Great',
  3: 'Good',
  2: 'Fair',
  1: 'Poor',
};

export const ReviewList = ({ reviews, loading }: ReviewListProps) => {
  const [helpfulClicks, setHelpfulClicks] = useState<Set<string>>(new Set());

  const handleHelpful = async (id: string) => {
    if (helpfulClicks.has(id)) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/${id}/helpful`, { method: 'POST' });
      if (res.ok) setHelpfulClicks(prev => new Set(prev).add(id));
    } catch {}
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-[#f0f0f0] p-5 animate-pulse">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-4/5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-[#fafafa] rounded-2xl border border-[#f0f0f0] py-12 px-6 text-center">
        <div className="flex justify-center gap-1 mb-3">
          {[1,2,3,4,5].map(s => <Star key={s} className="w-6 h-6 text-[#e5e7eb]" />)}
        </div>
        <h3 className="text-[15px] font-semibold text-[#111] mb-1">No Reviews Yet</h3>
        <p className="text-[13px] text-[#9ca3af]">Be the first to share your experience.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map(review => {
        const voted = helpfulClicks.has(review._id);
        const helpfulCount = review.helpful + (voted ? 1 : 0);
        return (
          <div key={review._id} className="bg-white rounded-2xl border border-[#f0f0f0] p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex gap-3">
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] shrink-0 ${avatarColor(review.userName)}`}>
                {review.userName.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                {/* Top row: name + date */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-semibold text-[#111]">{review.userName}</span>
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
                        <BadgeCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#9ca3af] shrink-0 whitespace-nowrap">{formatDate(review.createdAt)}</span>
                </div>

                {/* Stars + label */}
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-[#e5e7eb]'}`} />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-[#6b7280]">{RATING_LABEL[review.rating] || ''}</span>
                </div>

                {/* Title */}
                {review.title && (
                  <p className="text-[13px] font-semibold text-[#111] mb-1.5">{review.title}</p>
                )}

                {/* Comment */}
                <p className="text-[13px] text-[#4b5563] leading-relaxed mb-3 whitespace-pre-line">{review.comment}</p>

                {/* Helpful */}
                <button
                  onClick={() => handleHelpful(review._id)}
                  disabled={voted}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                    voted
                      ? 'bg-[#111] text-white'
                      : 'bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]'
                  } disabled:cursor-default`}
                >
                  <ThumbsUp className={`w-3 h-3 ${voted ? 'fill-current' : ''}`} />
                  {voted ? 'Helpful!' : 'Helpful'}
                  {helpfulCount > 0 && <span className="opacity-70">({helpfulCount})</span>}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
