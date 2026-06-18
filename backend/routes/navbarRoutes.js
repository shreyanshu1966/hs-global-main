const express = require('express');
const router = express.Router();
const { getAllNavbarConfigs, saveNavbarConfig } = require('../controllers/navbarController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const publicCache = (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=60');
    next();
};

// Public — Header reads this on every page load
router.get('/config', publicCache, getAllNavbarConfigs);

// Admin — replace full config for a category
router.put('/config/:categoryId', authMiddleware, adminMiddleware, saveNavbarConfig);

module.exports = router;
