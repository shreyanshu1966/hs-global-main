const Category = require('../models/Category');

// Get all custom subcategories for all categories
const getAllCustomCategories = async (req, res) => {
    try {
        const customCategories = await Category.getAllCategoriesWithCustom();
        
        res.json({
            success: true,
            data: customCategories
        });
    } catch (error) {
        console.error('Error fetching custom categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch custom categories',
            error: error.message
        });
    }
};

// Get custom subcategories for a specific category
const getCustomSubcategories = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const customSubcategories = await Category.getCustomSubcategories(categoryId);
        
        res.json({
            success: true,
            data: customSubcategories
        });
    } catch (error) {
        console.error('Error fetching custom subcategories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch custom subcategories',
            error: error.message
        });
    }
};

// Add a custom subcategory
const addCustomSubcategory = async (req, res) => {
    try {
        const { categoryId, categoryName, subcategoryName } = req.body;
        
        // Validate required fields
        if (!categoryId || !categoryName || !subcategoryName) {
            return res.status(400).json({
                success: false,
                message: 'categoryId, categoryName, and subcategoryName are required'
            });
        }

        // Validate categoryId format (slug-like)
        if (!/^[a-z0-9-]+$/i.test(String(categoryId))) {
            return res.status(400).json({
                success: false,
                message: 'categoryId must be a valid identifier (letters, numbers, hyphens)'
            });
        }

        // Validate subcategoryName format
        const trimmedSubcategoryName = subcategoryName.trim();
        if (trimmedSubcategoryName.length < 2 || trimmedSubcategoryName.length > 50) {
            return res.status(400).json({
                success: false,
                message: 'Subcategory name must be between 2 and 50 characters'
            });
        }

        // Check for invalid characters (basic validation)
        if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmedSubcategoryName)) {
            return res.status(400).json({
                success: false,
                message: 'Subcategory name can only contain letters, numbers, spaces, hyphens, and underscores'
            });
        }
        
        console.log(`⚡ Adding custom subcategory: "${trimmedSubcategoryName}" to category "${categoryId}"`);
        
        const category = await Category.addCustomSubcategory(categoryId, categoryName, trimmedSubcategoryName);
        
        console.log(`✅ Custom subcategory added successfully: "${trimmedSubcategoryName}"`);
        
        res.json({
            success: true,
            message: 'Custom subcategory added successfully',
            data: category
        });
    } catch (error) {
        console.error('❌ Error adding custom subcategory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add custom subcategory',
            error: error.message
        });
    }
};

// Delete a custom subcategory
const deleteCustomSubcategory = async (req, res) => {
    try {
        const { categoryId, subcategoryId } = req.params;
        
        const category = await Category.findOne({ categoryId });
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        category.customSubcategories = category.customSubcategories.filter(
            sub => sub.id !== subcategoryId
        );
        
        category.updatedAt = Date.now(); // Manually update timestamp
        await category.save();
        
        res.json({
            success: true,
            message: 'Custom subcategory deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting custom subcategory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete custom subcategory',
            error: error.message
        });
    }
};

// Update a custom subcategory
const updateCustomSubcategory = async (req, res) => {
    try {
        const { categoryId, subcategoryId } = req.params;
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Subcategory name is required'
            });
        }
        
        const category = await Category.findOne({ categoryId });
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        const subcategory = category.customSubcategories.find(sub => sub.id === subcategoryId);
        
        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }
        
        subcategory.name = name;
        category.updatedAt = Date.now(); // Manually update timestamp
        await category.save();
        
        res.json({
            success: true,
            message: 'Custom subcategory updated successfully',
            data: subcategory
        });
    } catch (error) {
        console.error('Error updating custom subcategory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update custom subcategory',
            error: error.message
        });
    }
};

module.exports = {
    getAllCustomCategories,
    getCustomSubcategories,
    addCustomSubcategory,
    deleteCustomSubcategory,
    updateCustomSubcategory
};