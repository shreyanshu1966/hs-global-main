const mongoose = require('mongoose');

// Sub-schemas for better organization
const furnitureSpecsSchema = new mongoose.Schema({
    type: String,
    shape: String,
    material: String,
    size: String,
    surfaceFinish: String,
    colorName: String,
    height: String,
    location: String,
    packagingDetails: String
}, { _id: false });

const slabSpecsSchema = new mongoose.Schema({
    finish: String,
    thickness: String,
    origin: String,
    material: String,
    application: String
}, { _id: false });

// Custom specification schema
const customSpecSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    value: String,
    type: {
        type: String,
        enum: ['text', 'number', 'select', 'textarea'],
        default: 'text'
    },
    options: [String], // For select type fields
    order: {
        type: Number,
        default: 0
    }
}, { _id: false });

// Image processing schema
const imageProcessingSchema = new mongoose.Schema({
    originalUrl: String,
    processedUrl: String,
    thumbnailUrl: String,
    webpUrl: String,
    cropData: {
        x: Number,
        y: Number,
        width: Number,
        height: Number,
        rotation: Number
    },
    altText: String,
    caption: String
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
        enum: ['furniture', 'handicraft', 'leather'],
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
    subDescription: {
        type: String,
        trim: true,
        maxlength: [160, 'Sub description cannot exceed 160 characters'],
        default: ''
    },
    productCode: {
        type: String,
        trim: true,
        default: ''
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
    priceUSD: {
        type: Number,
        min: 0
    },

    // Discount fields with enhanced validation
    discount: {
        enabled: {
            type: Boolean,
            default: false
        },
        percentage: {
            type: Number,
            min: [0, 'Discount percentage cannot be negative'],
            max: [100, 'Discount percentage cannot exceed 100'],
            default: 0,
            validate: {
                validator: function(value) {
                    // If discount is enabled, percentage must be > 0
                    if (this.discount?.enabled && value <= 0) {
                        return false;
                    }
                    return true;
                },
                message: 'Discount percentage must be greater than 0 when discount is enabled'
            }
        },
        startDate: {
            type: Date,
            default: null,
            validate: {
                validator: function(value) {
                    if (!value) return true; // startDate is optional
                    // If both dates exist, startDate must be before endDate
                    if (this.discount?.endDate && value >= this.discount.endDate) {
                        return false;
                    }
                    return true;
                },
                message: 'Discount start date must be before end date'
            }
        },
        endDate: {
            type: Date,
            default: null,
            validate: {
                validator: function(value) {
                    if (!value) return true; // endDate is optional
                    // If both dates exist, endDate must be after startDate
                    if (this.discount?.startDate && value <= this.discount.startDate) {
                        return false;
                    }
                    return true;
                },
                message: 'Discount end date must be after start date'
            }
        },
        description: {
            type: String,
            default: '',
            maxlength: [200, 'Discount description cannot exceed 200 characters']
        },
        // Auto-disable tracking
        autoDisabledAt: {
            type: Date,
            default: null
        },
        // Discount history
        createdAt: {
            type: Date,
            default: null
        },
        lastModified: {
            type: Date,
            default: null
        }
    },

    available: {
        type: Boolean,
        default: true
    },
    similarProducts: [{
        type: String,
        trim: true
    }],
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
    // Custom specifications (for additional product-specific attributes)
    customSpecs: [customSpecSchema],

    // Enhanced Image Management
    imageProcessing: [imageProcessingSchema],
    imageMetadata: {
        totalSize: Number,
        lastOptimized: Date,
        cropVersions: [{
            name: String,
            url: String,
            aspectRatio: String,
            dimensions: {
                width: Number,
                height: Number
            }
        }]
    },
    // SEO fields
    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String],
    // Enhanced SEO fields for complete optimization
    seo: {
        metaTitle: String,        // Custom meta title (50-60 chars)
        metaDescription: String,  // Custom meta description (150-160 chars)
        keywords: [String],       // SEO keywords array
        h1Tag: String,           // Custom H1 tag for product page
        ogTitle: String,         // Open Graph title
        ogDescription: String,   // Open Graph description
        ogImage: String,         // Open Graph image URL
        twitterTitle: String,    // Twitter card title
        twitterDescription: String, // Twitter card description
        twitterImage: String,    // Twitter card image
        canonicalUrl: String,    // Canonical URL for the product
        slug: String            // URL-friendly slug
    },

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
    },

    // Enhanced Ecommerce Features
    inventory: {
        trackStock: {
            type: Boolean,
            default: false
        },
        stockQuantity: {
            type: Number,
            default: 0
        },
        lowStockThreshold: {
            type: Number,
            default: 5
        },
        reservedQuantity: {
            type: Number,
            default: 0
        }
    },

    shipping: {
        requiresShipping: {
            type: Boolean,
            default: true
        },
        shippingClass: {
            type: String,
            enum: ['standard', 'heavy', 'fragile', 'oversized', 'white-glove'],
            default: 'standard'
        },
        handlingTime: {
            type: String,
            default: '2-3 business days'
        },
        freeShippingThreshold: Number,
        shippingNotes: String
    },

    productType: {
        type: String,
        enum: ['simple', 'configurable', 'custom-order'],
        default: 'simple'
    },

    // Product variants (for configurable products)
    variants: [{
        name: String,
        options: [String],
        priceModifier: Number, // Price difference from base price
        stockQuantity: Number,
        sku: String,
        images: [String]
    }],

    // Manufacturing and sourcing
    manufacturing: {
        isCustomMade: {
            type: Boolean,
            default: false
        },
        leadTime: String,
        minimumOrder: {
            type: Number,
            default: 1
        },
        supplier: String,
        artisan: String,
        countryOfOrigin: String
    }
}, {
    timestamps: true
});

// Pre-save hook to manage discount timestamps and validation
productSchema.pre('save', async function() {
    // Track discount changes
    if (this.isModified('discount')) {
        // Set createdAt if discount is being enabled for the first time
        if (this.discount.enabled && !this.discount.createdAt) {
            this.discount.createdAt = new Date();
        }
        
        // Always update lastModified when discount changes
        if (this.discount.enabled) {
            this.discount.lastModified = new Date();
        }
        
        // Validate date ranges
        if (this.discount.enabled) {
            if (this.discount.percentage <= 0) {
                throw new Error('Discount percentage must be greater than 0 when enabled');
            }
            
            if (this.discount.startDate && this.discount.endDate) {
                if (new Date(this.discount.startDate) >= new Date(this.discount.endDate)) {
                    throw new Error('Discount start date must be before end date');
                }
            }
        }
    }
});

// Indexes for better performance
productSchema.index({ category: 1, subcategory: 1 });
// productId index created by unique: true option
productSchema.index({ status: 1 });
productSchema.index({ featured: -1, createdAt: -1 });
productSchema.index({ name: 'text', description: 'text' }); // Text search
productSchema.index({ priceUSD: 1 });
productSchema.index({ available: 1 });
// Discount indexes for analytics and queries
productSchema.index({ 'discount.enabled': 1, 'discount.endDate': 1 });
productSchema.index({ 'discount.enabled': 1, 'discount.startDate': 1 });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function () {
    if (!this.priceUSD) return 'Price on Request';
    return `$${this.priceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
});

// Instance method to increment view count
productSchema.methods.incrementView = function () {
    return this.constructor.updateOne({ _id: this._id }, { $inc: { viewCount: 1 } });
};

productSchema.methods.incrementAddToCart = function () {
    return this.constructor.updateOne({ _id: this._id }, { $inc: { addToCartCount: 1 } });
};

// Instance method to check if discount is currently active
productSchema.methods.isDiscountActive = function () {
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

// Instance method to get discount status with details
productSchema.methods.getDiscountStatus = function () {
    if (!this.discount || !this.discount.enabled || !this.discount.percentage) {
        return { status: 'none', message: 'No discount configured' };
    }

    const now = new Date();
    const startDate = this.discount.startDate ? new Date(this.discount.startDate) : null;
    const endDate = this.discount.endDate ? new Date(this.discount.endDate) : null;

    // Check if scheduled (future start date)
    if (startDate && now < startDate) {
        const daysUntilStart = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
        return {
            status: 'scheduled',
            message: `Discount starts in ${daysUntilStart} day(s)`,
            startsIn: daysUntilStart,
            startDate: startDate
        };
    }

    // Check if expired
    if (endDate && now > endDate) {
        const daysExpired = Math.ceil((now - endDate) / (1000 * 60 * 60 * 24));
        return {
            status: 'expired',
            message: `Discount expired ${daysExpired} day(s) ago`,
            expiredDays: daysExpired,
            endDate: endDate
        };
    }

    // Active discount
    if (endDate) {
        const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        const hoursRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60));
        
        return {
            status: 'active',
            message: daysRemaining <= 3 
                ? `Discount ending in ${hoursRemaining} hour(s)!` 
                : `Discount active for ${daysRemaining} more day(s)`,
            daysRemaining: daysRemaining,
            hoursRemaining: hoursRemaining,
            endDate: endDate,
            isExpiringSoon: daysRemaining <= 3
        };
    }

    // Active without end date
    return {
        status: 'active',
        message: 'Discount active (no expiration)',
        isPermanent: true
    };
};

// Instance method to auto-disable expired discounts
productSchema.methods.checkAndDisableExpiredDiscount = async function () {
    const status = this.getDiscountStatus();
    
    if (status.status === 'expired' && this.discount.enabled) {
        this.discount.enabled = false;
        this.discount.autoDisabledAt = new Date();
        await this.save();
        return true; // Discount was disabled
    }
    
    return false; // No change
};

// Instance method to get the final price (with discount if active)
productSchema.methods.getFinalPrice = function () {
    if (!this.priceUSD) {
        return null;
    }

    if (this.isDiscountActive()) {
        const discountAmount = (this.priceUSD * this.discount.percentage) / 100;
        return Math.round((this.priceUSD - discountAmount) * 100) / 100;
    }

    return this.priceUSD;
};

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function () {
    return this.getFinalPrice();
});

// Virtual for discount amount
productSchema.virtual('discountAmount').get(function () {
    if (!this.priceUSD || !this.isDiscountActive()) {
        return 0;
    }
    return Math.round((this.priceUSD * this.discount.percentage) * 100) / 10000;
});

// Static method to get active discounted products
productSchema.statics.getByCategory = function (category) {
    return this.find({ category, status: 'active', available: true })
        .sort({ featured: -1, createdAt: -1 });
};

// Static method to get featured products
productSchema.statics.getFeatured = function (limit = 10) {
    return this.find({ featured: true, status: 'active', available: true })
        .limit(limit)
        .sort({ createdAt: -1 });
};

// Static method to get discount analytics
productSchema.statics.getDiscountAnalytics = async function () {
    const now = new Date();
    
    const [totalProducts, totalWithDiscounts, active, scheduled, expired, stats] = await Promise.all([
        // Total products in database
        this.countDocuments({}),
        
        // Total products with discount enabled
        this.countDocuments({ 'discount.enabled': true }),
        
        // Active discounts
        this.countDocuments({
            'discount.enabled': true,
            'discount.percentage': { $gt: 0 },
            $or: [
                { 'discount.startDate': null, 'discount.endDate': null },
                { 'discount.startDate': null, 'discount.endDate': { $gte: now } },
                { 'discount.startDate': { $lte: now }, 'discount.endDate': null },
                { 'discount.startDate': { $lte: now }, 'discount.endDate': { $gte: now } }
            ]
        }),
        
        // Scheduled discounts (future start date)
        this.countDocuments({
            'discount.enabled': true,
            'discount.startDate': { $gt: now }
        }),
        
        // Expired discounts (past end date but still enabled)
        this.countDocuments({
            'discount.enabled': true,
            'discount.endDate': { $lt: now }
        }),
        
        // Average discount percentage
        this.aggregate([
            { 
                $match: { 
                    'discount.enabled': true,
                    'discount.percentage': { $gt: 0 }
                } 
            },
            {
                $group: {
                    _id: null,
                    avgPercentage: { $avg: '$discount.percentage' },
                    maxPercentage: { $max: '$discount.percentage' },
                    minPercentage: { $min: '$discount.percentage' }
                }
            }
        ])
    ]);
    
    return {
        totalProducts,              // Total products in database
        total: totalWithDiscounts,  // Total with discount enabled
        active,
        scheduled,
        expired,
        needsCleanup: expired, // Products with expired discounts still enabled
        avgPercentage: stats[0]?.avgPercentage || 0,
        maxPercentage: stats[0]?.maxPercentage || 0,
        minPercentage: stats[0]?.minPercentage || 0
    };
};

// Static method to auto-disable all expired discounts
productSchema.statics.disableExpiredDiscounts = async function () {
    const now = new Date();
    
    const result = await this.updateMany(
        {
            'discount.enabled': true,
            'discount.endDate': { $lt: now }
        },
        {
            $set: {
                'discount.enabled': false,
                'discount.autoDisabledAt': now
            }
        }
    );
    
    return result.modifiedCount;
};

// Static method to get expiring soon discounts
productSchema.statics.getExpiringSoonDiscounts = function (days = 3) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return this.find({
        'discount.enabled': true,
        'discount.endDate': {
            $gte: now,
            $lte: futureDate
        }
    }).select('productId name discount priceUSD');
};

// Static method for search
productSchema.statics.search = function (query, filters = {}) {
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
productSchema.statics.getSubcategoriesByCategory = function (category) {
    return this.distinct('subcategory', {
        category,
        status: { $in: ['active', 'inactive', 'draft'] }
    });
};

// Static method to get predefined subcategories
productSchema.statics.getPredefinedSubcategories = function (category) {
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