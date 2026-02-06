const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    // For percentage type, maximum discount amount
    maxDiscount: {
        type: Number,
        default: null
    },
    minOrderAmount: {
        type: Number,
        default: 0
    },
    usageLimit: {
        type: Number,
        default: null // null means unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    usagePerUser: {
        type: Number,
        default: 1 // How many times one user can use this discount
    },
    applicableCategories: [{
        type: String
    }],
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    // Track which users have used this discount and how many times
    userUsage: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        usageCount: {
            type: Number,
            default: 1
        },
        lastUsed: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for faster queries
discountSchema.index({ code: 1 });
discountSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Virtual for checking if discount is currently valid
discountSchema.virtual('isValid').get(function() {
    const now = new Date();
    return this.isActive && 
           now >= this.startDate && 
           now <= this.endDate &&
           (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// Method to check if a user can use this discount
discountSchema.methods.canUserUse = function(userId) {
    if (!this.isValid) return false;
    
    const userUsage = this.userUsage.find(usage => 
        usage.userId.toString() === userId.toString()
    );
    
    if (!userUsage) return true;
    
    return userUsage.usageCount < this.usagePerUser;
};

// Method to calculate discount for an order
discountSchema.methods.calculateDiscount = function(orderAmount, products = []) {
    if (!this.isValid) return 0;
    
    // Check minimum order amount
    if (orderAmount < this.minOrderAmount) return 0;
    
    // If specific categories or products are defined, check eligibility
    if (this.applicableCategories.length > 0 || this.applicableProducts.length > 0) {
        // This would need product information to validate
        // For now, assume it's applicable
    }
    
    let discount = 0;
    
    if (this.type === 'percentage') {
        discount = (orderAmount * this.value) / 100;
        if (this.maxDiscount && discount > this.maxDiscount) {
            discount = this.maxDiscount;
        }
    } else if (this.type === 'fixed') {
        discount = this.value;
        // Fixed discount can't be more than order amount
        if (discount > orderAmount) {
            discount = orderAmount;
        }
    }
    
    return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

// Method to mark discount as used
discountSchema.methods.markAsUsed = function(userId) {
    this.usedCount += 1;
    
    const userUsageIndex = this.userUsage.findIndex(usage => 
        usage.userId.toString() === userId.toString()
    );
    
    if (userUsageIndex >= 0) {
        this.userUsage[userUsageIndex].usageCount += 1;
        this.userUsage[userUsageIndex].lastUsed = new Date();
    } else {
        this.userUsage.push({
            userId: userId,
            usageCount: 1,
            lastUsed: new Date()
        });
    }
};

module.exports = mongoose.model('Discount', discountSchema);