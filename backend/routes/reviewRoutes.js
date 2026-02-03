const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/product/:productId/stats', reviewController.getProductReviewStats);
router.post('/product/:productId', reviewController.createReview);
router.post('/:reviewId/helpful', reviewController.markHelpful);

// Admin routes
router.get('/admin/all', authMiddleware, adminMiddleware, reviewController.getAllReviews);
router.put('/admin/:reviewId', authMiddleware, adminMiddleware, reviewController.updateReview);
router.delete('/admin/:reviewId', authMiddleware, adminMiddleware, reviewController.deleteReview);
router.put('/admin/:reviewId/approve', authMiddleware, adminMiddleware, reviewController.approveReview);
router.put('/admin/:reviewId/reject', authMiddleware, adminMiddleware, reviewController.rejectReview);

module.exports = router;
