const shippingService = require('../services/shippingService');

/**
 * Get shipping estimate for checkout
 */
exports.getShippingEstimate = async (req, res) => {
    try {
        const { items, destination, serviceType } = req.body;

        // Validate input
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                ok: false,
                error: 'Cart items are required'
            });
        }

        if (!destination || !destination.country) {
            return res.status(400).json({
                ok: false,
                error: 'Destination country is required'
            });
        }

        // Validate serviceType if provided
        if (serviceType && !['ocean', 'air'].includes(serviceType)) {
            return res.status(400).json({
                ok: false,
                error: 'Service type must be either "ocean" or "air"'
            });
        }

        // Get shipping estimate
        const estimate = await shippingService.getShippingEstimate({
            items,
            destination,
            serviceType: serviceType || 'ocean' // Default to ocean freight
        });

        res.json({
            ok: true,
            shipping: {
                cost: estimate.chargeAmount,
                currency: estimate.currency,
                transitDays: estimate.transitDays,
                provider: estimate.provider,
                serviceType: estimate.serviceType,
                carrierName: estimate.carrierName,
                isFallback: estimate.isFallback,
                breakdown: estimate.breakdown,
                weight: estimate.weight,
                volume: estimate.volume,
                allQuotes: estimate.allQuotes // Include all available quotes if from Freightos
            }
        });

    } catch (error) {
        console.error('Shipping estimate error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to calculate shipping cost'
        });
    }
};

/**
 * Get shipping rates for all available regions (for reference)
 */
exports.getShippingRates = async (req, res) => {
    try {
        // Return available regions and their base rates
        const regions = {
            'India': { base: 50, transitDays: '3-7' },
            'USA': { base: 500, transitDays: '15-25' },
            'Canada': { base: 550, transitDays: '15-25' },
            'United Kingdom': { base: 600, transitDays: '12-20' },
            'Europe': { base: 600, transitDays: '12-20' },
            'United Arab Emirates': { base: 400, transitDays: '7-14' },
            'Middle East': { base: 400, transitDays: '7-14' },
            'Australia': { base: 700, transitDays: '18-28' },
            'Singapore': { base: 450, transitDays: '10-18' },
            'Asia': { base: 450, transitDays: '10-18' }
        };

        res.json({
            ok: true,
            regions,
            note: 'Base rates in USD. Actual cost depends on weight and volume.'
        });

    } catch (error) {
        console.error('Get shipping rates error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to get shipping rates'
        });
    }
};
