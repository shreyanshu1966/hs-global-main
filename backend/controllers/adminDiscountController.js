const Discount = require('../models/Discount');
const Product = require('../models/Product');

// Get all discounts with pagination and filters
const getAllDiscounts = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            status = '', 
            type = ''
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Build filter object
        const filter = {};
        
        if (search) {
            filter.$or = [
                { code: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (status) {
            const now = new Date();
            if (status === 'active') {
                filter.isActive = true;
                filter.startDate = { $lte: now };
                filter.endDate = { $gte: now };
            } else if (status === 'expired') {
                filter.$or = [
                    { endDate: { $lt: now } },
                    { isActive: false }
                ];
            } else if (status === 'scheduled') {
                filter.isActive = true;
                filter.startDate = { $gt: now };
            }
        }
        
        if (type) {
            filter.type = type;
        }

        const discounts = await Discount.find(filter)
            .populate('applicableProducts', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Discount.countDocuments(filter);
        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            discounts,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: total,
                itemsPerPage: parseInt(limit),
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });
    } catch (error) {
        console.error('Error fetching discounts:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create a new discount
const createDiscount = async (req, res) => {
    try {
        const {
            code,
            description,
            type,
            value,
            maxDiscount,
            minOrderAmount,
            usageLimit,
            usagePerUser,
            applicableCategories,
            applicableProducts,
            startDate,
            endDate
        } = req.body;

        // Validation
        if (!code || !description || !type || !value || !startDate || !endDate) {
            return res.status(400).json({
                error: 'Code, description, type, value, start date, and end date are required'
            });
        }

        if (type === 'percentage' && (value < 0 || value > 100)) {
            return res.status(400).json({
                error: 'Percentage value must be between 0 and 100'
            });
        }

        if (type === 'fixed' && value < 0) {
            return res.status(400).json({
                error: 'Fixed value must be positive'
            });
        }

        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({
                error: 'End date must be after start date'
            });
        }

        // Check if code already exists
        const existingDiscount = await Discount.findOne({ 
            code: code.toUpperCase() 
        });
        
        if (existingDiscount) {
            return res.status(400).json({
                error: 'Discount code already exists'
            });
        }

        const discount = new Discount({
            code: code.toUpperCase(),
            description,
            type,
            value,
            maxDiscount: type === 'percentage' ? maxDiscount : null,
            minOrderAmount: minOrderAmount || 0,
            usageLimit,
            usagePerUser: usagePerUser || 1,
            applicableCategories: applicableCategories || [],
            applicableProducts: applicableProducts || [],
            startDate,
            endDate
        });

        const savedDiscount = await discount.save();
        
        // Populate the response
        const populatedDiscount = await Discount.findById(savedDiscount._id)
            .populate('applicableProducts', 'name');

        res.status(201).json({
            message: 'Discount created successfully',
            discount: populatedDiscount
        });
    } catch (error) {
        console.error('Error creating discount:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                error: 'Discount code already exists'
            });
        }
        res.status(500).json({ error: error.message });
    }
};

// Update a discount
const updateDiscount = async (req, res) => {
    try {
        const { discountId } = req.params;
        const updates = req.body;

        // Don't allow updating the code if it's different and already exists
        if (updates.code) {
            const existingDiscount = await Discount.findOne({
                code: updates.code.toUpperCase(),
                _id: { $ne: discountId }
            });
            
            if (existingDiscount) {
                return res.status(400).json({
                    error: 'Discount code already exists'
                });
            }
            updates.code = updates.code.toUpperCase();
        }

        // Validation for type and value
        if (updates.type === 'percentage' && updates.value && (updates.value < 0 || updates.value > 100)) {
            return res.status(400).json({
                error: 'Percentage value must be between 0 and 100'
            });
        }

        if (updates.type === 'fixed' && updates.value && updates.value < 0) {
            return res.status(400).json({
                error: 'Fixed value must be positive'
            });
        }

        // Date validation
        if (updates.startDate && updates.endDate && new Date(updates.startDate) >= new Date(updates.endDate)) {
            return res.status(400).json({
                error: 'End date must be after start date'
            });
        }

        const discount = await Discount.findByIdAndUpdate(
            discountId,
            { $set: updates },
            { new: true, runValidators: true }
        ).populate('applicableProducts', 'name');

        if (!discount) {
            return res.status(404).json({ error: 'Discount not found' });
        }

        res.json({
            message: 'Discount updated successfully',
            discount
        });
    } catch (error) {
        console.error('Error updating discount:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete a discount
const deleteDiscount = async (req, res) => {
    try {
        const { discountId } = req.params;

        const discount = await Discount.findByIdAndDelete(discountId);

        if (!discount) {
            return res.status(404).json({ error: 'Discount not found' });
        }

        res.json({
            message: 'Discount deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting discount:', error);
        res.status(500).json({ error: error.message });
    }
};

// Toggle discount active status
const toggleDiscountStatus = async (req, res) => {
    try {
        const { discountId } = req.params;

        const discount = await Discount.findById(discountId);

        if (!discount) {
            return res.status(404).json({ error: 'Discount not found' });
        }

        discount.isActive = !discount.isActive;
        await discount.save();

        const populatedDiscount = await Discount.findById(discountId)
            .populate('applicableProducts', 'name');

        res.json({
            message: `Discount ${discount.isActive ? 'activated' : 'deactivated'} successfully`,
            discount: populatedDiscount
        });
    } catch (error) {
        console.error('Error toggling discount status:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get discount analytics
const getDiscountAnalytics = async (req, res) => {
    try {
        const totalDiscounts = await Discount.countDocuments();
        
        const now = new Date();
        const activeDiscounts = await Discount.countDocuments({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        });

        const expiredDiscounts = await Discount.countDocuments({
            $or: [
                { endDate: { $lt: now } },
                { isActive: false }
            ]
        });

        const scheduledDiscounts = await Discount.countDocuments({
            isActive: true,
            startDate: { $gt: now }
        });

        // Usage statistics
        const usageStats = await Discount.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsage: { $sum: '$usedCount' },
                    averageUsage: { $avg: '$usedCount' }
                }
            }
        ]);

        // Top performing discounts
        const topDiscounts = await Discount.find({})
            .sort({ usedCount: -1 })
            .limit(5)
            .select('code description usedCount type value');

        // Discount types distribution
        const typeDistribution = await Discount.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            overview: {
                total: totalDiscounts,
                active: activeDiscounts,
                expired: expiredDiscounts,
                scheduled: scheduledDiscounts
            },
            usage: {
                total: usageStats.length > 0 ? usageStats[0].totalUsage : 0,
                average: usageStats.length > 0 ? Math.round(usageStats[0].averageUsage * 100) / 100 : 0
            },
            topPerforming: topDiscounts,
            typeDistribution
        });
    } catch (error) {
        console.error('Error fetching discount analytics:', error);
        res.status(500).json({ error: error.message });
    }
};

// Validate discount code (for checkout)
const validateDiscount = async (req, res) => {
    try {
        const { code, orderAmount, userId, products } = req.body;

        if (!code || !orderAmount || !userId) {
            return res.status(400).json({
                error: 'Code, order amount, and user ID are required'
            });
        }

        const discount = await Discount.findOne({ code: code.toUpperCase() });

        if (!discount) {
            return res.status(404).json({
                error: 'Invalid discount code'
            });
        }

        // Check if discount is valid
        if (!discount.isValid) {
            return res.status(400).json({
                error: 'Discount code is not currently valid'
            });
        }

        // Check if user can use this discount
        if (!discount.canUserUse(userId)) {
            return res.status(400).json({
                error: 'You have already used this discount code'
            });
        }

        // Calculate discount amount
        const discountAmount = discount.calculateDiscount(orderAmount, products);

        if (discountAmount === 0) {
            return res.status(400).json({
                error: 'This discount is not applicable to your order'
            });
        }

        res.json({
            valid: true,
            discount: {
                code: discount.code,
                description: discount.description,
                type: discount.type,
                value: discount.value,
                discountAmount,
                finalAmount: orderAmount - discountAmount
            }
        });
    } catch (error) {
        console.error('Error validating discount:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    toggleDiscountStatus,
    getDiscountAnalytics,
    validateDiscount
};