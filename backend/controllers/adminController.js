const User = require('../models/User');
const Order = require('../models/Order');

// Get analytics data
const getAnalytics = async (req, res) => {
    try {
        // Total users
        const totalUsers = await User.countDocuments();
        const verifiedUsers = await User.countDocuments({ emailVerified: true });
        const adminUsers = await User.countDocuments({ role: 'admin' });

        // Total orders
        const totalOrders = await Order.countDocuments();
        const paidOrders = await Order.countDocuments({ status: 'paid' });
        const failedOrders = await Order.countDocuments({ status: 'failed' });
        const pendingOrders = await Order.countDocuments({ status: 'created' });

        // Revenue calculation
        const revenueData = await Order.aggregate([
            { $match: { status: 'paid' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' }
                }
            }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        // Orders by delivery status
        const deliveryStatusCounts = await Order.aggregate([
            { $match: { status: 'paid' } },
            {
                $group: {
                    _id: '$deliveryStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Recent orders (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentOrders = await Order.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // Recent users (last 7 days)
        const recentUsers = await User.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // Monthly revenue (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = await Order.aggregate([
            {
                $match: {
                    status: 'paid',
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({
            ok: true,
            analytics: {
                users: {
                    total: totalUsers,
                    verified: verifiedUsers,
                    admins: adminUsers,
                    recent: recentUsers
                },
                orders: {
                    total: totalOrders,
                    paid: paidOrders,
                    failed: failedOrders,
                    pending: pendingOrders,
                    recent: recentOrders,
                    deliveryStatus: deliveryStatusCounts
                },
                revenue: {
                    total: totalRevenue,
                    monthly: monthlyRevenue
                }
            }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch analytics data'
        });
    }
};

// Get all users with pagination
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const role = req.query.role || '';

        const skip = (page - 1) * limit;

        // Build query
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) {
            query.role = role;
        }

        const users = await User.find(query)
            .select('-password -emailVerificationToken -passwordResetToken')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('orders');

        const total = await User.countDocuments(query);

        res.json({
            ok: true,
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch users'
        });
    }
};

// Get all orders with pagination
const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || '';
        const deliveryStatus = req.query.deliveryStatus || '';
        const search = req.query.search || '';

        const skip = (page - 1) * limit;

        // Build query
        const query = {};
        if (status) {
            query.status = status;
        }
        if (deliveryStatus) {
            query.deliveryStatus = deliveryStatus;
        }
        if (search) {
            query.$or = [
                { orderId: { $regex: search, $options: 'i' } },
                { 'customer.email': { $regex: search, $options: 'i' } },
                { 'customer.name': { $regex: search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name email phone');

        const total = await Order.countDocuments(query);

        res.json({
            ok: true,
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch orders'
        });
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { deliveryStatus, trackingNumber, notes } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                ok: false,
                error: 'Order not found'
            });
        }

        if (deliveryStatus) {
            order.deliveryStatus = deliveryStatus;
        }
        if (trackingNumber !== undefined) {
            order.trackingNumber = trackingNumber;
        }
        if (notes !== undefined) {
            order.notes = notes;
        }

        await order.save();

        res.json({
            ok: true,
            message: 'Order updated successfully',
            order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to update order status'
        });
    }
};

// Update user role
const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                ok: false,
                error: 'Invalid role. Must be "user" or "admin"'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                ok: false,
                error: 'User not found'
            });
        }

        user.role = role;
        await user.save();

        res.json({
            ok: true,
            message: 'User role updated successfully',
            user: user.toPublicJSON()
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to update user role'
        });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                ok: false,
                error: 'User not found'
            });
        }

        // Prevent deleting yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                ok: false,
                error: 'Cannot delete your own account'
            });
        }

        await User.findByIdAndDelete(userId);

        res.json({
            ok: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to delete user'
        });
    }
};

module.exports = {
    getAnalytics,
    getAllUsers,
    getAllOrders,
    updateOrderStatus,
    updateUserRole,
    deleteUser
};
