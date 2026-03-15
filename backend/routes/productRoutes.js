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

// Public routes
router.get('/products', getAllProducts);
router.get('/products/search', searchProducts);
router.get('/products/featured', getFeaturedProducts);
router.get('/products/categories', getCategories);
router.get('/products/category/:category', getProductsByCategory);
router.get('/products/:id', getProductById);

// Public v2 routes (centralized DTO contract)
router.get('/products-v2', getAllProductsV2);
router.get('/products-v2/search', searchProductsV2);
router.get('/products-v2/featured', getFeaturedProductsV2);
router.get('/products-v2/categories', getCategoriesV2);
router.get('/products-v2/category/:category', getProductsByCategoryV2);
router.get('/products-v2/:id', getProductByIdV2);

// Analytics route
router.post('/products/track/add-to-cart', trackAddToCart);

// Admin routes
router.post('/products', authMiddleware, adminMiddleware, createProduct);
router.put('/products/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/products/:id', authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;