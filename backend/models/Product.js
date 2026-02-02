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
    available: {
        type: Boolean,
        default: true
    },
    hasVideo: {
        type: Boolean,
        default: false
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

// Static method to get products by category
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