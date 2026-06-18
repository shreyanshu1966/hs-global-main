'use client';
import { useState } from 'react';
import { Star, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

export const ReviewForm = ({ productId, onReviewSubmitted }: ReviewFormProps) => {
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    rating: 0,
    title: '',
    comment: ''
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/product/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      setSuccess(true);
      setFormData({
        userName: '',
        userEmail: '',
        rating: 0,
        title: '',
        comment: ''
      });
      
      setTimeout(() => {
        setSuccess(false);
        onReviewSubmitted();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-[#e2e8f0] p-6 md:p-8">
      {success && (
        <div className="mb-6 p-5 bg-[#ebf4ee] border border-[#afceb7] flex items-start gap-3 animate-slideDown">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-green-900 mb-1 uppercase tracking-[0.08em] text-xs">Review Submitted</h4>
            <p className="text-green-800">Thank you! Your review will be published after approval.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-5 bg-[#f8ebea] border border-[#d8b0ae] flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-red-900 mb-1 uppercase tracking-[0.08em] text-xs">Error</h4>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div className="bg-[#f8fafc] p-5 border border-[#e2e8f0]">
          <label className="block text-sm font-semibold uppercase tracking-[0.09em] text-[#2b2722] mb-3">
            Rate Your Experience *
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, rating: star })}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none transition-all duration-200 hover:scale-125 active:scale-95"
              >
                <Star
                  className={`w-10 h-10 transition-all duration-200 ${
                    star <= (hoveredRating || formData.rating)
                      ? 'fill-[#f59e0b] text-[#f59e0b]'
                      : 'text-[#cbd5e1] hover:text-[#94a3b8]'
                  }`}
                />
              </button>
            ))}
            {formData.rating > 0 && (
              <span className="ml-3 px-3 py-1 bg-[#f1f5f9] text-[#334155] rounded text-xs font-semibold uppercase tracking-[0.07em]">
                {formData.rating} {formData.rating === 5 ? '⭐ Excellent!' : formData.rating === 4 ? '👍 Great!' : formData.rating === 3 ? '😊 Good' : formData.rating === 2 ? '😐 Fair' : '😟 Poor'}
              </span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Name */}
          <div>
            <label htmlFor="userName" className="block text-xs font-semibold uppercase tracking-[0.09em] text-[#2b2722] mb-2">
              Your Name *
            </label>
            <input
              type="text"
              id="userName"
              required
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="w-full px-4 py-3 border border-[#cbd5e1] bg-white focus:outline-none focus:border-[#2b2722] transition-all"
              placeholder="Enter your name"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="userEmail" className="block text-xs font-semibold uppercase tracking-[0.09em] text-[#2b2722] mb-2">
              Your Email *
            </label>
            <input
              type="email"
              id="userEmail"
              required
              value={formData.userEmail}
              onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
              className="w-full px-4 py-3 border border-[#cbd5e1] bg-white focus:outline-none focus:border-[#2b2722] transition-all"
              placeholder="your@email.com"
            />
            <p className="mt-1.5 text-xs text-[#64748b] flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Your email will not be published
            </p>
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-[0.09em] text-[#2b2722] mb-2">
            Review Title *
          </label>
          <input
            type="text"
            id="title"
            required
            maxLength={200}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border border-[#cbd5e1] bg-white focus:outline-none focus:border-[#2b2722] transition-all"
            placeholder="Sum up your experience in a few words"
          />
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-xs font-semibold uppercase tracking-[0.09em] text-[#2b2722] mb-2">
            Your Review *
          </label>
          <textarea
            id="comment"
            required
            maxLength={2000}
            rows={6}
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            className="w-full px-4 py-3 border border-[#cbd5e1] bg-white focus:outline-none focus:border-[#2b2722] transition-all resize-none"
            placeholder="Share your detailed thoughts about this product..."
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-[#64748b]">Be specific and honest to help others</p>
            <p className={`text-xs font-medium ${formData.comment.length > 1900 ? 'text-red-600' : 'text-[#64748b]'}`}>
              {formData.comment.length}/2000
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || formData.rating === 0}
          className="w-full bg-[#1f1c18] text-[#f8fafc] py-4 px-6 font-semibold uppercase tracking-[0.09em] hover:bg-[#353029] transition-all duration-300 disabled:bg-[#94a3b8] disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              Submit Review
            </>
          )}
        </button>
      </form>
    </div>
  );
};
