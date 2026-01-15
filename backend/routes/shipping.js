const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');

/**
 * POST /api/shipping/estimate
 * Get shipping cost estimate for checkout
 * Body: { items: [], destination: { country, city, state, postalCode } }
 */
router.post('/estimate', shippingController.getShippingEstimate);

/**
 * GET /api/shipping/rates
 * Get available shipping rates by region
 */
router.get('/rates', shippingController.getShippingRates);

module.exports = router;
