const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/fieldOptionController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Admin form fetches saved custom values for a dropdown field
router.get('/:fieldKey', authMiddleware, adminMiddleware, ctrl.listFieldOptions);

// Admin form saves a new custom value when user types one
router.post('/', authMiddleware, adminMiddleware, ctrl.saveFieldOption);

module.exports = router;
