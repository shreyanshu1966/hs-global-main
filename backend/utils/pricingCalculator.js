/**
 * Calculates the effective price in INR for a product in a given region.
 * Falls back to base priceINR if no regional pricing is configured.
 *
 * @param {Object} product - Mongoose product document or plain object
 * @param {string} region - One of: 'UAE', 'Europe', 'India', 'USA', 'UK', 'default'
 * @param {number} [overrideBaseINR] - Use this instead of product.priceINR as the
 *   pre-adjustment base (e.g. a selected variant's own price).
 * @returns {number} Effective price in INR
 */
function getRegionalPriceINR(product, region, overrideBaseINR) {
    const base = overrideBaseINR != null ? overrideBaseINR : product.priceINR;
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

/**
 * Resolves the base price (and selected-variant info) to use for a cart line,
 * given the product it belongs to and whichever variant selector the client
 * sent. Mirrors the matching logic in ProductInfo.tsx's `selectedVariant` memo
 * so the price shown on the PDP and the price charged at checkout agree.
 *
 * @param {Object} product - Mongoose Product document
 * @param {{ variantSku?: string, variantAttributes?: Record<string,string> }} selector
 * @returns {{ baseINR: number|null, selectedVariant: {attributes: Object, sku: string|null, compareAtPriceINR: number|null}|null }}
 *   baseINR is null when the product is configurable but no available variant
 *   matches the selector — callers should treat this as a rejected line item.
 */
function resolveItemBasePrice(product, { variantSku, variantAttributes } = {}) {
    if (product.productType !== 'configurable') {
        return { baseINR: product.priceINR, selectedVariant: null };
    }

    const variants = Array.isArray(product.variants) ? product.variants : [];
    const toPlainAttrs = (attrs) => (attrs instanceof Map ? Object.fromEntries(attrs) : (attrs || {}));

    let match = null;
    if (variantSku) {
        match = variants.find(v => v.sku && v.sku === variantSku) || null;
    }
    if (!match && variantAttributes && typeof variantAttributes === 'object') {
        const wanted = Object.entries(variantAttributes);
        if (wanted.length > 0) {
            match = variants.find(v => {
                const attrs = toPlainAttrs(v.attributes);
                return wanted.every(([k, val]) => attrs[k] === val);
            }) || null;
        }
    }

    if (!match || match.available === false) {
        return { baseINR: null, selectedVariant: null };
    }

    return {
        baseINR: match.priceINR ?? product.priceINR,
        selectedVariant: {
            attributes: toPlainAttrs(match.attributes),
            sku: match.sku || null,
            compareAtPriceINR: match.compareAtPriceINR ?? null,
        },
    };
}

module.exports = { getRegionalPriceINR, getLiveINRRate, resolveItemBasePrice };
