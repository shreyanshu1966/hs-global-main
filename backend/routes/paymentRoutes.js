const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Mounted at /api
// Payment lifecycle routes
router.post('/create-order', authMiddleware, paymentController.createOrder);
router.post('/capture-payment', paymentController.capturePayment);
router.post('/retry-payment', authMiddleware, paymentController.retryPayment);

// Payment status and information routes
router.get('/payment-status/:paypalOrderId', paymentController.getPaymentStatus);
router.get('/order/:orderId', paymentController.getOrderDetails);

// Webhooks and callbacks
router.post('/payment-callback', paymentController.paymentCallback);

// Admin/maintenance routes
router.post('/cleanup-orders', paymentController.cleanupExpiredOrders);

module.exports = router;
