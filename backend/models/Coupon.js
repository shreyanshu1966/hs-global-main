const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    minOrderAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    maxUses: {
        type: Number,
        default: null // null = unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    perUserLimit: {
        type: Number,
        default: 1
    },
    startDate: {
        type: Date,
        default: null
    },
    endDate: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usageLog: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        orderId: { type: String },
        usedAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

couponSchema.index({ isActive: 1 });

couponSchema.methods.isValid = function (cartTotalUSD, userId) {
    if (!this.isActive) return { valid: false, message: 'Coupon is inactive' };

    const now = new Date();
    if (this.startDate && now < this.startDate) return { valid: false, message: 'Coupon is not yet active' };
    if (this.endDate && now > this.endDate) return { valid: false, message: 'Coupon has expired' };

    if (this.maxUses !== null && this.usedCount >= this.maxUses) {
        return { valid: false, message: 'Coupon usage limit reached' };
    }

    if (cartTotalUSD < this.minOrderAmount) {
        return {
            valid: false,
            message: `Minimum order amount of $${this.minOrderAmount.toFixed(2)} required`
        };
    }

    if (userId && this.perUserLimit > 0) {
        const userUses = this.usageLog.filter(
            entry => entry.userId && entry.userId.toString() === userId.toString()
        ).length;
        if (userUses >= this.perUserLimit) {
            return { valid: false, message: 'You have already used this coupon' };
        }
    }

    return { valid: true };
};

couponSchema.methods.calculateDiscount = function (cartTotalUSD) {
    if (this.discountType === 'percentage') {
        return Math.round((cartTotalUSD * this.discountValue / 100) * 100) / 100;
    }
    return Math.min(this.discountValue, cartTotalUSD);
};

module.exports = mongoose.model('Coupon', couponSchema);
