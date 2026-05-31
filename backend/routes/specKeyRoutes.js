const express = require('express');
const router = express.Router();
const specKeyController = require('../controllers/specKeyController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public — editor fetches all saved keys for autocomplete
router.get('/', specKeyController.listSpecKeys);

// Admin — manual key management
router.post('/', authMiddleware, adminMiddleware, specKeyController.createSpecKey);
router.delete('/:id', authMiddleware, adminMiddleware, specKeyController.deleteSpecKey);

module.exports = router;
