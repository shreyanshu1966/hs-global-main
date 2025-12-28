const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    }, // Razorpay Order ID (e.g., order_DaZ...)
    paymentId: {
        type: String
    }, // Razorpay Payment ID (e.g., pay_DaZ...)
    amount: {
        type: Number,
        required: true
    }, // Amount in smallest currency unit (e.g., paise)
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['created', 'paid', 'failed'],
        default: 'created'
    },
    receipt: {
        type: String
    },
    customer: {
        name: String,
        email: String,
        phone: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
