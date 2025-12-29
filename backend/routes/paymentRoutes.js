const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Mounted at /api
// Both routes require authentication since we need user info for orders
router.post('/create-order', authMiddleware, paymentController.createOrder);
router.post('/verify-payment', paymentController.verifyPayment);

module.exports = router;
