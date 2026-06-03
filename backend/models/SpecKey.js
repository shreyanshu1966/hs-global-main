const mongoose = require('mongoose');

const specKeySchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('SpecKey', specKeySchema);
