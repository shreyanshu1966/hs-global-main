/**
 * Calculates the effective price in USD for a product in a given region.
 * Falls back to base priceUSD if no regional pricing is configured.
 *
 * @param {Object} product - Mongoose product document or plain object
 * @param {string} region - One of: 'UAE', 'Europe', 'India', 'USA', 'UK', 'default'
 * @returns {number} Effective price in USD
 */
function getRegionalPriceUSD(product, region) {
    const base = product.priceUSD;
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
        // fixed: value added in USD
        adjusted = base + adjustmentValue;
    }

    // Never let price go below 0
    return Math.max(0, Math.round(adjusted * 100) / 100);
}

module.exports = { getRegionalPriceUSD };
