const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    mobile: {
        type: String,
        required: true,
        trim: true
    },
    productName: {
        type: String,
        required: true
    },
    finish: {
        type: String,
        required: true
    },
    thickness: {
        type: String,
        required: true
    },
    requirement: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['new', 'quoted', 'contacted', 'archived'],
        default: 'new'
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    adminNotes: {
        type: String
    },
    quotedPrice: {
        type: Number
    },
    quotedAt: {
        type: Date
    },
    quotedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for faster queries
quotationSchema.index({ status: 1, createdAt: -1 });
quotationSchema.index({ email: 1 });
quotationSchema.index({ mobile: 1 });

module.exports = mongoose.model('Quotation', quotationSchema);
