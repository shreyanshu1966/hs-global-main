const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

/**
 * Razorpay Webhook Endpoint
 * This endpoint receives payment status updates from Razorpay
 * No authentication required - verified via webhook signature
 * 
 * Configure this URL in Razorpay Dashboard:
 * https://dashboard.razorpay.com/app/webhooks
 * 
 * Webhook URL: https://yourdomain.com/api/webhooks/razorpay
 */
router.post('/razorpay', webhookController.handleRazorpayWebhook);

module.exports = router;
