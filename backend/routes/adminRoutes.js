const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const {
    getAnalytics,
    getAllUsers,
    getAllOrders,
    updateOrderStatus,
    updateUserRole,
    deleteUser
} = require('../controllers/adminController');

// All routes require authentication and admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

// Analytics
router.get('/analytics', getAnalytics);

// Users
router.get('/users', getAllUsers);
router.put('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteUser);

// Orders
router.get('/orders', getAllOrders);
router.put('/orders/:orderId', updateOrderStatus);

module.exports = router;
