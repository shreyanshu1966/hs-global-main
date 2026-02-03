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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reviews/product/${productId}`, {
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
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-gray-200 p-6 md:p-8">
      {success && (
        <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl flex items-start gap-3 shadow-md animate-slideDown">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-green-900 mb-1">Review Submitted!</h4>
            <p className="text-green-800">Thank you! Your review will be published after approval.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl flex items-start gap-3 shadow-md">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-red-900 mb-1">Error</h4>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div className="bg-white p-5 rounded-xl border-2 border-gray-200">
          <label className="block text-base font-bold text-gray-900 mb-3">
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
                      ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                />
              </button>
            ))}
            {formData.rating > 0 && (
              <span className="ml-3 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                {formData.rating} {formData.rating === 5 ? '⭐ Excellent!' : formData.rating === 4 ? '👍 Great!' : formData.rating === 3 ? '😊 Good' : formData.rating === 2 ? '😐 Fair' : '😟 Poor'}
              </span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Name */}
          <div>
            <label htmlFor="userName" className="block text-sm font-bold text-gray-900 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              id="userName"
              required
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Enter your name"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="userEmail" className="block text-sm font-bold text-gray-900 mb-2">
              Your Email *
            </label>
            <input
              type="email"
              id="userEmail"
              required
              value={formData.userEmail}
              onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="your@email.com"
            />
            <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Your email will not be published
            </p>
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-bold text-gray-900 mb-2">
            Review Title *
          </label>
          <input
            type="text"
            id="title"
            required
            maxLength={200}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Sum up your experience in a few words"
          />
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-bold text-gray-900 mb-2">
            Your Review *
          </label>
          <textarea
            id="comment"
            required
            maxLength={2000}
            rows={6}
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            placeholder="Share your detailed thoughts about this product..."
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-gray-500">Be specific and honest to help others</p>
            <p className={`text-xs font-medium ${formData.comment.length > 1900 ? 'text-red-600' : 'text-gray-500'}`}>
              {formData.comment.length}/2000
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || formData.rating === 0}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group"
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
