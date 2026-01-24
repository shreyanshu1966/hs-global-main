const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    }, // Internal order ID
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, // Reference to User who placed the order
    paymentId: {
        type: String
    }, // PayPal Capture ID
    paypalOrderId: {
        type: String
    }, // PayPal Order ID
    amount: {
        type: Number,
        required: true
    }, // Original amount in original currency
    currency: {
        type: String,
        default: 'USD'
    }, // Currency used for payment
    status: {
        type: String,
        enum: [
            'payment_pending',    // Order created, awaiting payment
            'approved',          // PayPal payment approved, not captured
            'paid',             // Payment successfully captured
            'payment_failed',   // Payment failed but can retry
            'capture_error',    // Error during payment capture
            'permanently_failed', // Too many failures, no retry
            'expired',          // Payment not completed in time
            'abandoned',        // Failed orders left unresolved
            'cancelled',        // Order cancelled by user/admin
            'refunded',         // Payment refunded
            'reversed'          // Payment reversed/disputed
        ],
        default: 'payment_pending'
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    // Enhanced payment tracking
    paymentDetails: {
        captureId: String,
        capturedAt: Date,
        captureAmount: Number,
        captureCurrency: String,
        paypalStatus: String,
        paypalFeeAmount: Number,
        netAmount: Number,
        pendingSince: Date,
        failedAt: Date,
        reasonCode: String,
        errorCode: String,
        errorMessage: String,
        processingTime: Number,
        webhookSource: Boolean,
        failureDetails: mongoose.Schema.Types.Mixed,
        failureCount: Number  // Track number of failures
    },
    // Security and validation fields
    riskLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'LOW'
    },
    validationDetails: {
        clientIP: String,
        userAgent: String,
        timestamp: Date
    },
    // Enhanced payment failure tracking
    failureReason: String,
    failureCount: { type: Number, default: 0 },
    retryCount: { type: Number, default: 0 },
    attemptCount: { type: Number, default: 0 },
    lastRetryAt: Date,
    lastErrorAt: Date,
    expiresAt: Date,
    permanentlyFailedAt: Date,
    expiredAt: Date,
    abandonedAt: Date,
    approvedAt: Date,
    paidAt: Date,
    failedAt: Date,
    voidedAt: Date,
    refundedAt: Date,
    reversedAt: Date,
    refundId: String,
    refundAmount: Number,
    lastWebhookEvent: String,
    items: [{
        productId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        priceINR: Number, // Original price in INR for audit trail
        image: String,
        category: String
    }],
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
        fullAddress: String
    },
    customer: {
        name: String,
        email: String,
        phone: String
    },
    receipt: {
        type: String
    },
    trackingNumber: {
        type: String
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Enhanced indexes for better performance and cleanup queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ paypalOrderId: 1 });
orderSchema.index({ paymentId: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ status: 1, expiresAt: 1 }); // For cleanup queries
orderSchema.index({ status: 1, lastErrorAt: 1 }); // For abandoned orders
orderSchema.index({ 'validationDetails.clientIP': 1, createdAt: -1 });
orderSchema.index({ failureCount: 1, status: 1 }); // For retry logic

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
    return Date.now() - this.createdAt.getTime();
});

// Method to check if order is expired
orderSchema.methods.isExpired = function() {
    if (this.status === 'paid') return false;
    if (this.expiresAt) return Date.now() > this.expiresAt.getTime();
    const expiryTime = 30 * 60 * 1000; // 30 minutes default
    return Date.now() - this.createdAt.getTime() > expiryTime;
};

// Method to check if order can be retried
orderSchema.methods.canRetry = function() {
    const retryableStatuses = ['payment_failed', 'capture_error', 'expired'];
    return retryableStatuses.includes(this.status) && (this.failureCount || 0) < 3;
};

// Method to check if order is in final state
orderSchema.methods.isFinalState = function() {
    const finalStates = ['paid', 'permanently_failed', 'cancelled', 'refunded', 'reversed', 'abandoned'];
    return finalStates.includes(this.status);
};

// Method to get payment status summary
orderSchema.methods.getPaymentSummary = function() {
    return {
        orderId: this.orderId,
        status: this.status,
        amount: this.amount,
        currency: this.currency,
        paymentId: this.paymentId,
        riskLevel: this.riskLevel,
        isExpired: this.isExpired(),
        createdAt: this.createdAt,
        lastUpdated: this.updatedAt
    };
};

module.exports = mongoose.model('Order', orderSchema);
