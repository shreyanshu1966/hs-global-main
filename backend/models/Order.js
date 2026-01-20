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
        enum: ['created', 'paid', 'failed'],
        default: 'created'
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
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

// Index for faster queries
orderSchema.index({ userId: 1, createdAt: -1 });
// orderId has unique: true above, so no need for explicit index

module.exports = mongoose.model('Order', orderSchema);
