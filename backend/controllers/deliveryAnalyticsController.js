const DeliveryCheckAnalytics = require('../models/DeliveryCheckAnalytics');

// POST /api/delivery-analytics/track  — public, fire-and-forget from frontend
const trackDeliveryCheck = async (req, res) => {
    try {
        const { countryCode, countryName, postalCode, productId, result } = req.body;

        if (!countryCode || !countryName || !result) {
            return res.status(400).json({ ok: false, error: 'countryCode, countryName and result are required' });
        }

        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
            || req.socket?.remoteAddress
            || '';

        await DeliveryCheckAnalytics.create({
            countryCode: countryCode.toUpperCase(),
            countryName,
            postalCode: postalCode || '',
            productId:  productId  || '',
            result,
            ipAddress:  ip,
        });

        res.status(201).json({ ok: true });
    } catch (err) {
        console.error('deliveryAnalytics track error:', err.message);
        res.status(500).json({ ok: false, error: 'Failed to save' });
    }
};

// GET /api/admin/delivery-analytics  — admin only
const getDeliveryAnalytics = async (req, res) => {
    try {
        const { page = 1, limit = 50, country, productId } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {};
        if (country)   filter.countryCode = country.toUpperCase();
        if (productId) filter.productId = productId;

        const [records, total, byCountry, byResult] = await Promise.all([
            DeliveryCheckAnalytics.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),

            DeliveryCheckAnalytics.countDocuments(filter),

            // Group by country — total checks + how many available
            DeliveryCheckAnalytics.aggregate([
                { $match: filter },
                { $group: {
                    _id: { countryCode: '$countryCode', countryName: '$countryName' },
                    total:     { $sum: 1 },
                    available: { $sum: { $cond: [{ $eq: ['$result', 'available'] }, 1, 0] } },
                }},
                { $sort: { total: -1 } },
                { $limit: 50 },
            ]),

            DeliveryCheckAnalytics.aggregate([
                { $match: filter },
                { $group: { _id: '$result', count: { $sum: 1 } } },
            ]),
        ]);

        res.json({
            ok: true,
            data: {
                records,
                total,
                byCountry: byCountry.map(c => ({
                    countryCode: c._id.countryCode,
                    countryName: c._id.countryName,
                    total:       c.total,
                    available:   c.available,
                    unavailable: c.total - c.available,
                })),
                byResult: Object.fromEntries(byResult.map(r => [r._id, r.count])),
            },
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / parseInt(limit)),
                count: records.length,
                totalItems: total,
            },
        });
    } catch (err) {
        console.error('deliveryAnalytics get error:', err.message);
        res.status(500).json({ ok: false, error: 'Failed to fetch analytics' });
    }
};

module.exports = { trackDeliveryCheck, getDeliveryAnalytics };
