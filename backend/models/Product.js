const mongoose = require('mongoose');

// Sub-schemas for better organization
const furnitureSpecsSchema = new mongoose.Schema({
    product: String,
    type: String,
    shape: String,
    material: String,
    size: String,
    surfaceFinish: String,
    delivery: String,
    height: String,
    colorName: String,
    packagingDetails: String,
    location: String,
    etsyUrl: String
}, { _id: false });

const slabSpecsSchema = new mongoose.Schema({
    finish: String,
    thickness: String,
    origin: String,
    material: String,
    application: String
}, { _id: false });

const productSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['furniture', 'slabs'],
        trim: true
    },
    subcategory: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    images: [{
        type: String
    }],
    sortedImages: [{
        type: String
    }],
    priceINR: {
        type: Number,
        min: 0
    },
    
    // Discount fields
    discount: {
        enabled: {
            type: Boolean,
            default: false
        },
        percentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        startDate: {
            type: Date,
            default: null
        },
        endDate: {
            type: Date,
            default: null
        },
        description: {
            type: String,
            default: ''
        }
    },
    
    available: {
        type: Boolean,
        default: true
    },
    hasVideo: {
        type: Boolean,
        default: false
    },
    videoUrl: {
        type: String,
        default: null
    },
    videoFilename: {
        type: String,
        default: null
    },
    videoSize: {
        type: Number,
        default: null
    },
    videoUploadedAt: {
        type: Date,
        default: null
    },
    // Furniture specific fields
    furnitureSpecs: furnitureSpecsSchema,
    // Slab specific fields
    slabSpecs: slabSpecsSchema,
    // SEO fields
    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String],
    
    // Analytics
    viewCount: {
        type: Number,
        default: 0
    },
    addToCartCount: {
        type: Number,
        default: 0
    },
    
    // Review Statistics
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    
    // Status
    status: {
        type: String,
        enum: ['active', 'inactive', 'draft'],
        default: 'active'
    },
    
    // Metadata
    featured: {
        type: Boolean,
        default: false
    },
    tags: [String],
    weight: Number, // For shipping calculations
    dimensions: {
        length: Number,
        width: Number,
        height: Number,
        unit: {
            type: String,
            default: 'cm'
        }
    }
}, {
    timestamps: true
});

// Indexes for better performance
productSchema.index({ category: 1, subcategory: 1 });
// productId index created by unique: true option
productSchema.index({ status: 1 });
productSchema.index({ featured: -1, createdAt: -1 });
productSchema.index({ name: 'text', description: 'text' }); // Text search
productSchema.index({ priceINR: 1 });
productSchema.index({ available: 1 });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
    if (!this.priceINR) return 'Price on Request';
    return `₹${this.priceINR.toLocaleString('en-IN')}`;
});

// Instance method to increment view count
productSchema.methods.incrementView = function() {
    this.viewCount = (this.viewCount || 0) + 1;
    return this.save();
};

// Instance method to increment add to cart count
productSchema.methods.incrementAddToCart = function() {
    this.addToCartCount = (this.addToCartCount || 0) + 1;
    return this.save();
};

// Instance method to check if discount is currently active
productSchema.methods.isDiscountActive = function() {
    if (!this.discount || !this.discount.enabled || !this.discount.percentage) {
        return false;
    }
    
    const now = new Date();
    
    // Check start date if exists
    if (this.discount.startDate && now < this.discount.startDate) {
        return false;
    }
    
    // Check end date if exists
    if (this.discount.endDate && now > this.discount.endDate) {
        return false;
    }
    
    return true;
};

// Instance method to get the final price (with discount if active)
productSchema.methods.getFinalPrice = function() {
    if (!this.priceINR) {
        return null;
    }
    
    if (this.isDiscountActive()) {
        const discountAmount = (this.priceINR * this.discount.percentage) / 100;
        return Math.round(this.priceINR - discountAmount);
    }
    
    return this.priceINR;
};

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
    return this.getFinalPrice();
});

// Virtual for discount amount
productSchema.virtual('discountAmount').get(function() {
    if (!this.priceINR || !this.isDiscountActive()) {
        return 0;
    }
    return Math.round((this.priceINR * this.discount.percentage) / 100);
});

// Static method to get active discounted products
productSchema.statics.getByCategory = function(category) {
    return this.find({ category, status: 'active', available: true })
        .sort({ featured: -1, createdAt: -1 });
};

// Static method to get featured products
productSchema.statics.getFeatured = function(limit = 10) {
    return this.find({ featured: true, status: 'active', available: true })
        .limit(limit)
        .sort({ createdAt: -1 });
};

// Static method for search
productSchema.statics.search = function(query, filters = {}) {
    const searchQuery = {
        status: 'active',
        available: true,
        ...filters,
        $text: { $search: query }
    };
    
    return this.find(searchQuery, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } });
};

// Static method to get all subcategories for a category
productSchema.statics.getSubcategoriesByCategory = function(category) {
    return this.distinct('subcategory', { 
        category,
        status: { $in: ['active', 'inactive', 'draft'] }
    });
};

// Static method to get predefined subcategories
productSchema.statics.getPredefinedSubcategories = function(category) {
    const furniture = [
        'tables', 'coffee-table', 'console-table', 'dining-table', 'side-table',
        'wash-basins', 'pedestal', 'countertop', 'sculptures', 'benches',
        'planters', 'fountains', 'fireplace', 'columns', 'urns', 'other'
    ];
    
    const slabs = [
        'granite', 'marble', 'quartzite', 'onyx', 'limestone',
        'travertine', 'sandstone', 'slate', 'other'
    ];
    
    return category === 'furniture' ? furniture : slabs;
};

module.exports = mongoose.model('Product', productSchema);