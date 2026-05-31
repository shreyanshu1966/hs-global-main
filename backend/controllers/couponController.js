const Coupon = require('../models/Coupon');

/**
 * Validate a coupon code (no side effects)
 * POST /api/coupons/validate
 */
exports.validateCoupon = async (req, res) => {
    try {
        const { code, cartTotalUSD, userId } = req.body;

        if (!code || typeof code !== 'string') {
            return res.status(400).json({ ok: false, message: 'Coupon code is required' });
        }

        const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ ok: false, message: 'Invalid coupon code' });
        }

        const total = parseFloat(cartTotalUSD) || 0;
        const result = coupon.isValid(total, userId);

        if (!result.valid) {
            return res.status(400).json({ ok: false, message: result.message });
        }

        const discountAmountUSD = coupon.calculateDiscount(total);
        const finalTotalUSD = parseFloat((total - discountAmountUSD).toFixed(2));

        res.json({
            ok: true,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmountUSD: parseFloat(discountAmountUSD.toFixed(2)),
            finalTotalUSD,
            message: coupon.discountType === 'percentage'
                ? `${coupon.discountValue}% off applied`
                : `$${coupon.discountValue.toFixed(2)} off applied`
        });
    } catch (error) {
        console.error('Coupon validation error:', error);
        res.status(500).json({ ok: false, message: 'Failed to validate coupon' });
    }
};

// ─── Admin CRUD ───────────────────────────────────────────────────────────────

exports.listCoupons = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const filter = {};
        if (req.query.active === 'true') filter.isActive = true;
        if (req.query.active === 'false') filter.isActive = false;

        const [coupons, total] = await Promise.all([
            Coupon.find(filter)
                .select('-usageLog')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Coupon.countDocuments(filter)
        ]);

        res.json({ ok: true, coupons, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('List coupons error:', error);
        res.status(500).json({ ok: false, message: 'Failed to list coupons' });
    }
};

exports.createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderAmount, maxUses, perUserLimit, startDate, endDate, isActive } = req.body;

        if (!code || !discountType || discountValue == null) {
            return res.status(400).json({ ok: false, message: 'code, discountType and discountValue are required' });
        }

        if (!['percentage', 'fixed'].includes(discountType)) {
            return res.status(400).json({ ok: false, message: 'discountType must be percentage or fixed' });
        }

        if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
            return res.status(400).json({ ok: false, message: 'Percentage discount must be between 1 and 100' });
        }

        const coupon = await Coupon.create({
            code: code.trim().toUpperCase(),
            discountType,
            discountValue,
            minOrderAmount: minOrderAmount || 0,
            maxUses: maxUses || null,
            perUserLimit: perUserLimit ?? 1,
            startDate: startDate || null,
            endDate: endDate || null,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json({ ok: true, coupon });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ ok: false, message: 'Coupon code already exists' });
        }
        console.error('Create coupon error:', error);
        res.status(500).json({ ok: false, message: 'Failed to create coupon' });
    }
};

exports.updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const allowed = ['discountType', 'discountValue', 'minOrderAmount', 'maxUses', 'perUserLimit', 'startDate', 'endDate', 'isActive'];
        const updates = {};
        allowed.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const coupon = await Coupon.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-usageLog');

        if (!coupon) return res.status(404).json({ ok: false, message: 'Coupon not found' });

        res.json({ ok: true, coupon });
    } catch (error) {
        console.error('Update coupon error:', error);
        res.status(500).json({ ok: false, message: 'Failed to update coupon' });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) return res.status(404).json({ ok: false, message: 'Coupon not found' });
        res.json({ ok: true, message: 'Coupon deleted' });
    } catch (error) {
        console.error('Delete coupon error:', error);
        res.status(500).json({ ok: false, message: 'Failed to delete coupon' });
    }
};

exports.getCouponUsage = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id).populate('usageLog.userId', 'name email');
        if (!coupon) return res.status(404).json({ ok: false, message: 'Coupon not found' });
        res.json({ ok: true, usageLog: coupon.usageLog, usedCount: coupon.usedCount });
    } catch (error) {
        console.error('Get coupon usage error:', error);
        res.status(500).json({ ok: false, message: 'Failed to get coupon usage' });
    }
};
