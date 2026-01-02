const Currency = require('../models/Currency');

// Cache duration: 24 hours in milliseconds
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const EXTERNAL_API_URL = 'https://api.currencyapi.com/v3/latest';

exports.getRates = async (req, res) => {
    try {
        // 1. Check DB for existing rates
        let currencyDoc = await Currency.findOne({ base: 'INR' });
        const now = Date.now();

        // 2. Check if cache is valid (exists and is fresh - less than 24 hours old)
        if (currencyDoc && (now - currencyDoc.lastUpdated.getTime() < CACHE_DURATION)) {
            console.log('✅ [Currency] Serving from cache');
            return res.json({
                ok: true,
                source: 'cache',
                rates: currencyDoc.rates,
                base: 'INR',
                lastUpdated: currencyDoc.lastUpdated
            });
        }

        // 3. If cache is stale or missing, fetch from external API
        console.log('🔄 [Currency] Cache stale or missing. Fetching fresh rates...');
        const apiKey = process.env.CURRENCY_API_KEY;

        if (!apiKey) {
            console.error('❌ CURRENCY_API_KEY is missing in .env');
            // If we have stale data, return it with a warning
            if (currencyDoc) {
                return res.json({
                    ok: true,
                    source: 'stale_cache_fallback',
                    rates: currencyDoc.rates,
                    base: 'INR',
                    lastUpdated: currencyDoc.lastUpdated
                });
            }
            // Final fallback to hardcoded rates
            return res.json({
                ok: true,
                source: 'hardcoded_fallback',
                rates: getHardcodedRates(),
                base: 'INR'
            });
        }

        // Fetch from external API with INR as base
        const response = await fetch(`${EXTERNAL_API_URL}?apikey=${apiKey}&base_currency=INR`);
        const data = await response.json();

        if (!data || !data.data) {
            throw new Error('Invalid response from Currency API');
        }

        // 4. Normalize data - convert to our format (1 INR = X currency)
        const rates = {};
        Object.entries(data.data).forEach(([code, info]) => {
            rates[code] = info.value;
        });

        // Ensure INR is always 1 (base currency)
        rates.INR = 1;

        // 5. Update or Create in DB
        if (currencyDoc) {
            currencyDoc.rates = rates;
            currencyDoc.lastUpdated = now;
            await currencyDoc.save();
            console.log('✅ [Currency] Updated existing rates in DB');
        } else {
            currencyDoc = await Currency.create({
                base: 'INR',
                rates: rates,
                lastUpdated: now
            });
            console.log('✅ [Currency] Created new rates in DB');
        }

        return res.json({
            ok: true,
            source: 'api',
            rates: rates,
            base: 'INR',
            lastUpdated: new Date(now)
        });

    } catch (error) {
        console.error('❌ [Currency] Failed to fetch rates:', error);

        // Fallback to stale cache if available
        const fallback = await Currency.findOne({ base: 'INR' });
        if (fallback) {
            console.log('⚠️ [Currency] Using stale cache due to error');
            return res.json({
                ok: true,
                source: 'stale_error_fallback',
                rates: fallback.rates,
                base: 'INR',
                lastUpdated: fallback.lastUpdated
            });
        }

        // Final fallback to hardcoded rates if DB is empty
        console.log('⚠️ [Currency] Using hardcoded fallback');
        res.json({
            ok: true,
            source: 'hardcoded_fallback',
            rates: getHardcodedRates(),
            base: 'INR'
        });
    }
};

// Hardcoded fallback rates (1 INR = X currency)
function getHardcodedRates() {
    return {
        USD: 0.012,    // 1 INR = 0.012 USD (~83 INR per USD)
        INR: 1,        // Base currency
        EUR: 0.011,    // 1 INR = 0.011 EUR
        GBP: 0.0095,   // 1 INR = 0.0095 GBP
        AED: 0.044,    // 1 INR = 0.044 AED
        SAR: 0.045,    // 1 INR = 0.045 SAR
        AUD: 0.018,    // 1 INR = 0.018 AUD
        CAD: 0.016,    // 1 INR = 0.016 CAD
        SGD: 0.016,    // 1 INR = 0.016 SGD
        JPY: 1.8,      // 1 INR = 1.8 JPY
    };
}
