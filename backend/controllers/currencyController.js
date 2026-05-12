const Currency = require('../models/Currency');

// Cache duration: 24 hours in milliseconds
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const EXTERNAL_API_URL = 'https://api.currencyapi.com/v3/latest';

exports.getRates = async (req, res) => {
    try {
        // 1. Check DB for existing rates
        let currencyDoc = await Currency.findOne({ base: 'USD' });
        const now = Date.now();

        // 2. Check if cache is valid (exists and is fresh - less than 24 hours old)
        if (currencyDoc && (now - currencyDoc.lastUpdated.getTime() < CACHE_DURATION)) {
            console.log('✅ [Currency] Serving from cache');
            return res.json({
                ok: true,
                source: 'cache',
                rates: currencyDoc.rates,
                base: 'USD',
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
                    base: 'USD',
                    lastUpdated: currencyDoc.lastUpdated
                });
            }
            // Final fallback to hardcoded rates
            return res.json({
                ok: true,
                source: 'hardcoded_fallback',
                rates: getHardcodedRates(),
                base: 'USD'
            });
        }

        // Fetch from external API with USD as base
        const response = await fetch(`${EXTERNAL_API_URL}?apikey=${apiKey}&base_currency=USD`);
        const data = await response.json();

        if (!data || !data.data) {
            throw new Error('Invalid response from Currency API');
        }

        // 4. Normalize data - convert to our format (1 USD = X currency)
        const rates = {};
        Object.entries(data.data).forEach(([code, info]) => {
            rates[code] = info.value;
        });

        // Ensure USD is always 1 (base currency)
        rates.USD = 1;

        // 5. Update or Create in DB
        if (currencyDoc) {
            currencyDoc.rates = rates;
            currencyDoc.lastUpdated = now;
            await currencyDoc.save();
            console.log('✅ [Currency] Updated existing rates in DB');
        } else {
            currencyDoc = await Currency.create({
                base: 'USD',
                rates: rates,
                lastUpdated: now
            });
            console.log('✅ [Currency] Created new rates in DB');
        }

        return res.json({
            ok: true,
            source: 'api',
            rates: rates,
            base: 'USD',
            lastUpdated: new Date(now)
        });

    } catch (error) {
        console.error('❌ [Currency] Failed to fetch rates:', error);

        // Fallback to stale cache if available
        const fallback = await Currency.findOne({ base: 'USD' });
        if (fallback) {
            console.log('⚠️ [Currency] Using stale cache due to error');
            return res.json({
                ok: true,
                source: 'stale_error_fallback',
                rates: fallback.rates,
                base: 'USD',
                lastUpdated: fallback.lastUpdated
            });
        }

        // Final fallback to hardcoded rates if DB is empty
        console.log('⚠️ [Currency] Using hardcoded fallback');
        res.json({
            ok: true,
            source: 'hardcoded_fallback',
            rates: getHardcodedRates(),
            base: 'USD'
        });
    }
};

// Hardcoded fallback rates (1 USD = X currency)
function getHardcodedRates() {
    return {
        USD: 1,        // Base currency
        INR: 83.5,     // 1 USD = 83.5 INR
        EUR: 0.92,     // 1 USD = 0.92 EUR
        GBP: 0.79,     // 1 USD = 0.79 GBP
        AED: 3.67,     // 1 USD = 3.67 AED
        SAR: 3.75,     // 1 USD = 3.75 SAR
        AUD: 1.53,     // 1 USD = 1.53 AUD
        CAD: 1.36,     // 1 USD = 1.36 CAD
        SGD: 1.34,     // 1 USD = 1.34 SGD
        JPY: 149.5,    // 1 USD = 149.5 JPY
    };
}
