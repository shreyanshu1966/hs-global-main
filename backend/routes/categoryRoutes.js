const express = require('express');
const router = express.Router();
const {
    getAllCustomCategories,
    getCustomSubcategories,
    addCustomSubcategory,
    deleteCustomSubcategory,
    updateCustomSubcategory
} = require('../controllers/categoryController');

// Get all custom categories with their subcategories
router.get('/custom', getAllCustomCategories);

// Get custom subcategories for a specific category
router.get('/custom/:categoryId', getCustomSubcategories);

// Add a custom subcategory
router.post('/custom/subcategory', addCustomSubcategory);

// Delete a custom subcategory
router.delete('/custom/:categoryId/subcategory/:subcategoryId', deleteCustomSubcategory);

// Update a custom subcategory
router.put('/custom/:categoryId/subcategory/:subcategoryId', updateCustomSubcategory);

module.exports = router;