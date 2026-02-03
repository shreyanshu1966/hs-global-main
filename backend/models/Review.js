const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        ref: 'Product',
        index: true
    },
    userName: {
        type: String,
        required: true,
        trim: true
    },
    userEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxLength: 2000
    },
    verified: {
        type: Boolean,
        default: false
    },
    helpful: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Indexes for better performance
reviewSchema.index({ productId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ userEmail: 1 });
reviewSchema.index({ rating: -1 });

// Virtual for formatted date
reviewSchema.virtual('formattedDate').get(function() {
    return this.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Static method to get approved reviews for a product
reviewSchema.statics.getApprovedReviews = function(productId, limit = 10, skip = 0) {
    return this.find({ productId, status: 'approved' })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
};

// Static method to get review statistics for a product
reviewSchema.statics.getProductStats = async function(productId) {
    const stats = await this.aggregate([
        { $match: { productId, status: 'approved' } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
                ratingDistribution: {
                    $push: '$rating'
                }
            }
        }
    ]);

    if (stats.length === 0) {
        return {
            averageRating: 0,
            totalReviews: 0,
            ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        };
    }

    // Calculate rating breakdown
    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    stats[0].ratingDistribution.forEach(rating => {
        ratingBreakdown[rating] = (ratingBreakdown[rating] || 0) + 1;
    });

    return {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews,
        ratingBreakdown
    };
};

// Static method to check if user can review a product
reviewSchema.statics.canUserReview = async function(productId, userEmail) {
    const existingReview = await this.findOne({ productId, userEmail });
    return !existingReview;
};

module.exports = mongoose.model('Review', reviewSchema);
