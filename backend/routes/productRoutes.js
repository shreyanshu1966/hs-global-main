const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    getProductsByCategory,
    getFeaturedProducts,
    searchProducts,
    getAllProductsV2,
    getProductByIdV2,
    getProductsByCategoryV2,
    getFeaturedProductsV2,
    searchProductsV2,
    createProduct,
    updateProduct,
    deleteProduct,
    trackAddToCart,
    getCategories,
    getCategoriesV2
} = require('../controllers/productController');

const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const publicCache = (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=60');
    next();
};

// Public routes
router.get('/products', publicCache, getAllProducts);
router.get('/products/search', publicCache, searchProducts);
router.get('/products/featured', publicCache, getFeaturedProducts);
router.get('/products/categories', publicCache, getCategories);
router.get('/products/category/:category', publicCache, getProductsByCategory);
router.get('/products/:id', publicCache, getProductById);

// Public v2 routes (centralized DTO contract)
router.get('/products-v2', publicCache, getAllProductsV2);
router.get('/products-v2/search', publicCache, searchProductsV2);
router.get('/products-v2/featured', publicCache, getFeaturedProductsV2);
router.get('/products-v2/categories', publicCache, getCategoriesV2);
router.get('/products-v2/category/:category', publicCache, getProductsByCategoryV2);
router.get('/products-v2/:id', publicCache, getProductByIdV2);

// Analytics route
router.post('/products/track/add-to-cart', trackAddToCart);

// Admin routes
router.post('/products', authMiddleware, adminMiddleware, createProduct);
router.put('/products/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/products/:id', authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;