const express = require('express');
const router = express.Router();
const leadCaptureController = require('../controllers/leadCaptureController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.post('/submit', leadCaptureController.submitLeadCapture);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, leadCaptureController.getAllLeadCaptures);
router.get('/stats', authMiddleware, adminMiddleware, leadCaptureController.getLeadCaptureStats);
router.get('/:id', authMiddleware, adminMiddleware, leadCaptureController.getLeadCaptureById);
router.patch('/:id', authMiddleware, adminMiddleware, leadCaptureController.updateLeadCaptureStatus);
router.delete('/:id', authMiddleware, adminMiddleware, leadCaptureController.deleteLeadCapture);

module.exports = router;
