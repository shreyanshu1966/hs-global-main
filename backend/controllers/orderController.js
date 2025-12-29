const Order = require('../models/Order');
const User = require('../models/User');

// Get all orders for the logged-in user
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            ok: true,
            orders,
            count: orders.length
        });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch orders'
        });
    }
};

// Get a specific order by ID
exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({
            orderId,
            userId: req.user._id
        }).lean();

        if (!order) {
            return res.status(404).json({
                ok: false,
                error: 'Order not found'
            });
        }

        res.json({ ok: true, order });
    } catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch order details'
        });
    }
};

// Update delivery status (Admin only - for future use)
exports.updateDeliveryStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { deliveryStatus, trackingNumber } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(deliveryStatus)) {
            return res.status(400).json({
                ok: false,
                error: 'Invalid delivery status'
            });
        }

        const updateData = { deliveryStatus };
        if (trackingNumber) {
            updateData.trackingNumber = trackingNumber;
        }

        const order = await Order.findOneAndUpdate(
            { orderId },
            updateData,
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                ok: false,
                error: 'Order not found'
            });
        }

        res.json({
            ok: true,
            message: 'Delivery status updated successfully',
            order
        });
    } catch (error) {
        console.error('Update delivery status error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to update delivery status'
        });
    }
};

// Get order statistics for user
exports.getOrderStats = async (req, res) => {
    try {
        const stats = await Order.aggregate([
            { $match: { userId: req.user._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        const deliveryStats = await Order.aggregate([
            { $match: { userId: req.user._id, status: 'paid' } },
            {
                $group: {
                    _id: '$deliveryStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            ok: true,
            paymentStats: stats,
            deliveryStats
        });
    } catch (error) {
        console.error('Get order stats error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch order statistics'
        });
    }
};
