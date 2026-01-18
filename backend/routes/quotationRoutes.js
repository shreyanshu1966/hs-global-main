const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.post('/submit', quotationController.submitQuotationRequest);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, quotationController.getAllQuotations);
router.get('/stats', authMiddleware, adminMiddleware, quotationController.getQuotationStats);
router.get('/:id', authMiddleware, adminMiddleware, quotationController.getQuotationById);
router.patch('/:id', authMiddleware, adminMiddleware, quotationController.updateQuotationStatus);
router.delete('/:id', authMiddleware, adminMiddleware, quotationController.deleteQuotation);

module.exports = router;
