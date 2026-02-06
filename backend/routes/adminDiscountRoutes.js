const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const {
    getAllDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    toggleDiscountStatus,
    getDiscountAnalytics,
    validateDiscount
} = require('../controllers/adminDiscountController');

// All routes require authentication and admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

// Analytics
router.get('/analytics', getDiscountAnalytics);

// CRUD operations
router.get('/', getAllDiscounts);
router.post('/', createDiscount);
router.put('/:discountId', updateDiscount);
router.delete('/:discountId', deleteDiscount);
router.put('/:discountId/toggle-status', toggleDiscountStatus);

// Public validation endpoint (used in checkout)
router.post('/validate', validateDiscount);

module.exports = router;