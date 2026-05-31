const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public / user-facing
router.post('/validate', couponController.validateCoupon);

// Admin only
router.get('/', authMiddleware, adminMiddleware, couponController.listCoupons);
router.post('/', authMiddleware, adminMiddleware, couponController.createCoupon);
router.patch('/:id', authMiddleware, adminMiddleware, couponController.updateCoupon);
router.delete('/:id', authMiddleware, adminMiddleware, couponController.deleteCoupon);
router.get('/:id/usage', authMiddleware, adminMiddleware, couponController.getCouponUsage);

module.exports = router;
