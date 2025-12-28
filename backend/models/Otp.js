const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true
    },
    code: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        // MongoDB will automatically delete documents where 'expiresAt' < current time
        // However, standard TTL indexes often work on a 'createdAt' field + seconds.
        // But using 'expires' on a Date field works if the value IS the expiration date, 
        // effectively making the document expire at that specific time.
        // Actually, 'expires: 0' on a Date field means "expire at the time specified in this field".
        expires: 0
    },
    attempts: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Otp', otpSchema);
