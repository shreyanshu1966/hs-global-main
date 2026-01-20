const mongoose = require('mongoose');

const leadCaptureSchema = new mongoose.Schema({
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
    countryCode: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    clientType: {
        type: String,
        required: true,
        enum: ['personal', 'client']
    },
    services: [{
        type: String,
        required: true
    }],
    message: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'converted', 'archived'],
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
    contactedAt: {
        type: Date
    },
    contactedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for faster queries
leadCaptureSchema.index({ status: 1, createdAt: -1 });
leadCaptureSchema.index({ email: 1 });
leadCaptureSchema.index({ phone: 1 });

module.exports = mongoose.model('LeadCapture', leadCaptureSchema);
