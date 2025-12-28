const Currency = require('../models/Currency');

// Cache duration: 24 hours in milliseconds
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const EXTERNAL_API_URL = 'https://api.currencyapi.com/v3/latest';

exports.getRates = async (req, res) => {
    try {
        // 1. Check DB for existing rates
        let currencyDoc = await Currency.findOne({ base: 'USD' });
        const now = Date.now();

        // 2. Check if cache is valid (exists and is fresh)
        if (currencyDoc && (now - currencyDoc.lastUpdated.getTime() < CACHE_DURATION)) {
            return res.json({
                ok: true,
                source: 'cache',
                data: currencyDoc.rates
            });
        }

        // 3. If cache is stale or missing, fetch from external API
        console.log('🔄 Cache stale or missing. Fetching fresh rates...');
        const apiKey = process.env.CURRENCY_API_KEY;

        if (!apiKey) {
            console.error('❌ CURRENCY_API_KEY is missing in .env');
            // If we have stale data, return it with a warning even if expired, better than failing
            if (currencyDoc) {
                return res.json({ ok: true, source: 'stale_cache_fallback', data: currencyDoc.rates });
            }
            return res.status(500).json({ ok: false, error: 'Server configuration error' });
        }

        const response = await fetch(`${EXTERNAL_API_URL}?apikey=${apiKey}&base_currency=USD`);
        const data = await response.json();

        if (!data || !data.data) {
            throw new Error('Invalid response from Currency API');
        }

        // 4. Normalize data
        const rates = {};
        Object.entries(data.data).forEach(([code, info]) => {
            rates[code] = info.value;
        });

        // 5. Update or Create in DB
        if (currencyDoc) {
            currencyDoc.rates = rates;
            currencyDoc.lastUpdated = now;
            await currencyDoc.save();
        } else {
            currencyDoc = await Currency.create({
                base: 'USD',
                rates: rates,
                lastUpdated: now
            });
        }

        return res.json({
            ok: true,
            source: 'api',
            data: rates
        });

    } catch (error) {
        console.error('Failed to fetch currency rates:', error);
        // Fallback to stale cache if available
        const fallback = await Currency.findOne({ base: 'USD' });
        if (fallback) {
            return res.json({ ok: true, source: 'stale_error_fallback', data: fallback.rates });
        }

        // Final fallback to hardcoded rates if DB is empty too
        const hardcoded = {
            USD: 1, INR: 83.50, EUR: 0.92, GBP: 0.79, AED: 3.67,
            SAR: 3.75, AUD: 1.52, CAD: 1.36, SGD: 1.34, JPY: 149.5
        };
        res.json({ ok: true, source: 'hardcoded_fallback', data: hardcoded });
    }
};
