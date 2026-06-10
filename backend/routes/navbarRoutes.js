const express = require('express');
const router = express.Router();
const { getAllNavbarConfigs, saveNavbarConfig } = require('../controllers/navbarController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public — Header reads this on every page load
router.get('/config', getAllNavbarConfigs);

// Admin — replace full config for a category
router.put('/config/:categoryId', authMiddleware, adminMiddleware, saveNavbarConfig);

module.exports = router;
