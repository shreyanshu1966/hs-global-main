const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public route - Submit contact form
router.post('/submit', contactController.submitContactForm);

// Admin routes - Require authentication and admin role
router.get('/', authMiddleware, adminMiddleware, contactController.getAllContacts);
router.get('/stats', authMiddleware, adminMiddleware, contactController.getContactStats);
router.get('/:id', authMiddleware, adminMiddleware, contactController.getContactById);
router.patch('/:id', authMiddleware, adminMiddleware, contactController.updateContactStatus);
router.delete('/:id', authMiddleware, adminMiddleware, contactController.deleteContact);

module.exports = router;
