const mongoose = require('mongoose');

const specKeySchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }
}, { timestamps: true });

specKeySchema.index({ label: 1 });

module.exports = mongoose.model('SpecKey', specKeySchema);
