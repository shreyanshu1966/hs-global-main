const mongoose = require('mongoose');

const fieldOptionSchema = new mongoose.Schema({
    fieldKey: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    value: {
        type: String,
        required: true,
        trim: true,
    },
}, { timestamps: true });

fieldOptionSchema.index({ fieldKey: 1, value: 1 }, { unique: true });

module.exports = mongoose.model('FieldOption', fieldOptionSchema);
