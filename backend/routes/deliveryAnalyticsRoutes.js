const express = require('express');
const router = express.Router();
const { trackDeliveryCheck, getDeliveryAnalytics } = require('../controllers/deliveryAnalyticsController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public — frontend fires this on every delivery check
router.post('/track', trackDeliveryCheck);

// Admin — view all collected data
router.get('/', authMiddleware, adminMiddleware, getDeliveryAnalytics);

module.exports = router;
