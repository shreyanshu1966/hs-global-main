import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { Heading } from '../ui/Typography';
import { Button } from '../ui/Button';
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
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const { user } = useAuth();

    return (
        <div ref={reviewsRef} className="max-w-6xl mx-auto space-y-10">
            <div className="text-center space-y-6">
                <Heading level={2} serif className="text-[#26221c]">Customer Reviews</Heading>
                <div className="h-px w-24 bg-[#837255] mx-auto"></div>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Stats */}
                <div className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
                    <ReviewStats stats={reviewStats} loading={reviewsLoading} />
                </div>

                {/* List & Form */}
                <div className="lg:col-span-2 space-y-10">
                    <div>
                        <ReviewList reviews={showAllReviews ? reviews : reviews.slice(0, 2)} loading={reviewsLoading} />

                        {reviews.length > 2 && (
                            <div className="mt-8">
                                <Button
                                    variant="text"
                                    onClick={() => setShowAllReviews(!showAllReviews)}
                                    className="flex items-center gap-2 group text-xs uppercase tracking-[0.09em] text-[#4f473c]"
                                >
                                    {showAllReviews ? 'Show Less' : `Show More (${reviews.length - 2})`}
                                    {showAllReviews ? (
                                        <ChevronUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="pt-8 border-t border-[#e2e8f0]">
                        <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="w-full flex items-center justify-between p-6 bg-white border border-[#e2e8f0] hover:border-[#2B2B2B] transition-colors group"
                        >
                            <h3 className="text-xl font-serif text-[#2B2B2B] flex items-center gap-3">
                                <MessageCircle className="w-5 h-5 text-[#475569]" />
                                Write a Review
                            </h3>
                            <ChevronDown className={`w-5 h-5 text-[#6B6B6B] group-hover:text-[#2B2B2B] transition-transform duration-300 ${showReviewForm ? 'rotate-180' : ''}`} />
                        </button>

                        {showReviewForm && (
                            <div className="mt-6">
                                {user ? (
                                    <ReviewForm productId={product.id} onReviewSubmitted={onReviewSubmitted} />
                                ) : (
                                    <div className="bg-white border border-[#e2e8f0] p-8 text-center space-y-6">
                                        <p className="text-[#6B6B6B] font-sans">Please sign in to write a review</p>
                                        <Link to="/login">
                                            <Button variant="secondary" className="px-8 border-[#cbd5e1] bg-[#f1f5f9] hover:bg-[#e2e8f0]">
                                                Sign In
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
