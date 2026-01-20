const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

/**
 * PayPal Webhook Endpoint
 * This endpoint receives payment status updates from PayPal
 * No authentication required - verified via webhook signature
 * 
 * Configure this URL in PayPal Dashboard:
 * https://developer.paypal.com/dashboard/webhooks
 * 
 * Webhook URL: https://yourdomain.com/api/webhooks/paypal
 */
router.post('/paypal', webhookController.handlePayPalWebhook);

module.exports = router;
