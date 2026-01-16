const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.post('/submit', quotationController.submitQuotationRequest);

// Admin routes
router.get('/', protect, adminOnly, quotationController.getAllQuotations);
router.get('/stats', protect, adminOnly, quotationController.getQuotationStats);
router.get('/:id', protect, adminOnly, quotationController.getQuotationById);
router.patch('/:id', protect, adminOnly, quotationController.updateQuotationStatus);
router.delete('/:id', protect, adminOnly, quotationController.deleteQuotation);

module.exports = router;
