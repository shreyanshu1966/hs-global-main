const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All routes require authentication
router.get('/my-orders', authMiddleware, orderController.getUserOrders);
router.get('/orders/:orderId', authMiddleware, orderController.getOrderById);
router.get('/order-stats', authMiddleware, orderController.getOrderStats);

// Admin route (for future use)
router.put('/orders/:orderId/delivery', authMiddleware, orderController.updateDeliveryStatus);

module.exports = router;
