const express = require('express');
const router = express.Router();
const {
    getAllCustomCategories,
    getCustomSubcategories,
    addCustomSubcategory,
    deleteCustomSubcategory,
    updateCustomSubcategory
} = require('../controllers/categoryController');

const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const publicCache = (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=60');
    next();
};

// Public routes - no authentication required for viewing categories
router.get('/custom', publicCache, getAllCustomCategories);
router.get('/custom/:categoryId', publicCache, getCustomSubcategories);

// Admin routes - require authentication and admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

// Add a custom subcategory
router.post('/custom/subcategory', addCustomSubcategory);

// Delete a custom subcategory
router.delete('/custom/:categoryId/subcategory/:subcategoryId', deleteCustomSubcategory);

// Update a custom subcategory
router.put('/custom/:categoryId/subcategory/:subcategoryId', updateCustomSubcategory);

module.exports = router;