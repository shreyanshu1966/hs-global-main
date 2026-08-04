/**
 * Calculates the effective price in INR for a product in a given region.
 * Falls back to base priceINR if no regional pricing is configured.
 *
 * @param {Object} product - Mongoose product document or plain object
 * @param {string} region - One of: 'UAE', 'Europe', 'India', 'USA', 'UK', 'default'
 * @returns {number} Effective price in INR
 */
function getRegionalPriceINR(product, region) {
    const base = product.priceINR;
    if (!base || base <= 0) return base || 0;
    if (!region || region === 'default') return base;

    const rp = product.regionalPricing?.[region];
    if (!rp || !rp.enabled) return base;

    const { adjustmentType, adjustmentValue } = rp;
    if (!adjustmentValue) return base;

    let adjusted;
    if (adjustmentType === 'percentage') {
        adjusted = base * (1 + adjustmentValue / 100);
    } else {
        // fixed: value added in INR
        adjusted = base + adjustmentValue;
    }

    // Never let price go below 0
    return Math.max(0, Math.round(adjusted * 100) / 100);
}

/**
 * Fetches the current cached USD->INR rate, for the one place a live rate is
 * still needed: converting the canonical INR total to USD at PayPal charge
 * time. Falls back to the same hardcoded rate the currency controller uses.
 *
 * @returns {Promise<number>} 1 USD = X INR
 */
async function getLiveINRRate() {
    const Currency = require('../models/Currency');
    try {
        const currencyDoc = await Currency.findOne({ base: 'USD' });
        // `rates` is a Mongoose Map — use .get(), dot access silently returns undefined
        const inrRate = currencyDoc?.rates?.get?.('INR');
        if (inrRate) return inrRate;
    } catch {
        // fall through to hardcoded fallback below
    }
    return 83.5;
}

module.exports = { getRegionalPriceINR, getLiveINRRate };
