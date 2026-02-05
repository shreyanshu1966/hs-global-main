const Review = require('../models/Review');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { limit = 10, skip = 0, status = 'approved' } = req.query;

        const reviews = await Review.find({ productId, status })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Review.countDocuments({ productId, status });

        res.json({
            success: true,
            reviews,
            total,
            hasMore: total > parseInt(skip) + reviews.length
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: error.message
        });
    }
};

// Get review statistics for a product
exports.getProductReviewStats = async (req, res) => {
    try {
        const { productId } = req.params;

        const stats = await Review.getProductStats(productId);

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching review stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch review statistics',
            error: error.message
        });
    }
};

// Create a new review
exports.createReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { userName, userEmail, rating, title, comment } = req.body;

        // Validate required fields
        if (!userName || !userEmail || !rating || !title || !comment) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if product exists (productId can be either the custom productId or MongoDB _id)
        let product;
        if (mongoose.Types.ObjectId.isValid(productId) && /^[0-9a-fA-F]{24}$/.test(productId)) {
            // If it's a valid ObjectId format, search by both
            product = await Product.findOne({
                $or: [
                    { productId: productId },
                    { _id: productId }
                ]
            });
        } else {
            // Otherwise, only search by productId field
            product = await Product.findOne({ productId: productId });
        }
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Use the product's actual productId for consistency
        const actualProductId = product.productId;

        // Check if user has already reviewed this product
        const canReview = await Review.canUserReview(actualProductId, userEmail);
        if (!canReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }

        // Create review
        const review = new Review({
            productId: actualProductId,
            userName,
            userEmail,
            rating,
            title,
            comment,
            status: 'pending' // Reviews need approval
        });

        await review.save();

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully and is pending approval',
            review
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create review',
            error: error.message
        });
    }
};

// Update review (admin only)
exports.updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const updates = req.body;

        const review = await Review.findByIdAndUpdate(
            reviewId,
            updates,
            { new: true, runValidators: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.json({
            success: true,
            message: 'Review updated successfully',
            review
        });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update review',
            error: error.message
        });
    }
};

// Delete review (admin only)
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findByIdAndDelete(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete review',
            error: error.message
        });
    }
};

// Approve review (admin only)
exports.approveReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findByIdAndUpdate(
            reviewId,
            { status: 'approved' },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.json({
            success: true,
            message: 'Review approved successfully',
            review
        });
    } catch (error) {
        console.error('Error approving review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve review',
            error: error.message
        });
    }
};

// Reject review (admin only)
exports.rejectReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findByIdAndUpdate(
            reviewId,
            { status: 'rejected' },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.json({
            success: true,
            message: 'Review rejected successfully',
            review
        });
    } catch (error) {
        console.error('Error rejecting review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject review',
            error: error.message
        });
    }
};

// Get all reviews (admin only)
exports.getAllReviews = async (req, res) => {
    try {
        const { status, limit = 50, skip = 0 } = req.query;

        const filter = status ? { status } : {};

        const reviews = await Review.find(filter)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .lean();

        // Manually fetch product details for each review
        const reviewsWithProducts = await Promise.all(
            reviews.map(async (review) => {
                const product = await Product.findOne({ productId: review.productId })
                    .select('name image productId')
                    .lean();
                
                return {
                    ...review,
                    product: product || null
                };
            })
        );

        const total = await Review.countDocuments(filter);

        res.json({
            success: true,
            reviews: reviewsWithProducts,
            total,
            hasMore: total > parseInt(skip) + reviewsWithProducts.length
        });
    } catch (error) {
        console.error('Error fetching all reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: error.message
        });
    }
};

// Mark review as helpful
exports.markHelpful = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findByIdAndUpdate(
            reviewId,
            { $inc: { helpful: 1 } },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.json({
            success: true,
            helpful: review.helpful
        });
    } catch (error) {
        console.error('Error marking review helpful:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark review as helpful',
            error: error.message
        });
    }
};
