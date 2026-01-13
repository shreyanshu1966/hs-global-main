const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Mounted at /api
// Both routes require authentication since we need user info for orders
router.post('/create-order', authMiddleware, paymentController.createOrder);
router.post('/capture-payment', paymentController.capturePayment);

module.exports = router;
