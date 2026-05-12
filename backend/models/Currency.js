const mongoose = require('mongoose');

const currencySchema = new mongoose.Schema({
    base: {
        type: String,
        default: 'USD',
        unique: true
    },
    rates: {
        type: Map,
        of: Number
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Currency', currencySchema);
