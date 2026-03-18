const Product = require('../models/Product');
const publicProductService = require('../domain/product/services/publicProductService');
const {
    toLegacyListResponse,
    toLegacySingleResponse,
    toLegacyCategoryResponse,
    toLegacyFeaturedResponse,
    toV2ListResponse,
    toV2SingleResponse,
    toV2CategoryResponse,
    toV2FeaturedResponse
} = require('../domain/product/adapters/legacyProductAdapter');

// Get all products with pagination and filters (legacy response contract)
const getAllProducts = async (req, res) => {
    try {
        const result = await publicProductService.getAllProducts(req.query);
        res.json(toLegacyListResponse(result));
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};

// Get single product by ID (legacy response contract)
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await publicProductService.getProductById(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json(toLegacySingleResponse(result));
    } catch (error) {
        console.error('Get product by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
            error: error.message
        });
    }
};

// Get products by category (legacy response contract)
const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const result = await publicProductService.getProductsByCategory(category, req.query);
        res.json(toLegacyCategoryResponse(result));
    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};

// Get featured products (legacy response contract)
const getFeaturedProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const result = await publicProductService.getFeaturedProducts(limit);
        res.json(toLegacyFeaturedResponse(result));
    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured products',
            error: error.message
        });
    }
};

// Search products (legacy response contract)
const searchProducts = async (req, res) => {
    try {
        const result = await publicProductService.searchProducts(req.query);
        res.json({
            ...toLegacyListResponse(result),
            searchTerm: result.searchTerm
        });
    } catch (error) {
        if (error.code === 'VALIDATION_ERROR') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.error('Search products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search products',
            error: error.message
        });
    }
};

// V2 public endpoints with unified DTO contract
const getAllProductsV2 = async (req, res) => {
    try {
        const result = await publicProductService.getAllProducts(req.query);
        res.json(toV2ListResponse(result));
    } catch (error) {
        console.error('Get products v2 error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};

const getProductByIdV2 = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await publicProductService.getProductById(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json(toV2SingleResponse(result));
    } catch (error) {
        console.error('Get product by ID v2 error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
            error: error.message
        });
    }
};

const getProductsByCategoryV2 = async (req, res) => {
    try {
        const { category } = req.params;
        const result = await publicProductService.getProductsByCategory(category, req.query);
        res.json(toV2CategoryResponse(result));
    } catch (error) {
        console.error('Get products by category v2 error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};

const getFeaturedProductsV2 = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const result = await publicProductService.getFeaturedProducts(limit);
        res.json(toV2FeaturedResponse(result));
    } catch (error) {
        console.error('Get featured products v2 error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured products',
            error: error.message
        });
    }
};

const searchProductsV2 = async (req, res) => {
    try {
        const result = await publicProductService.searchProducts(req.query);
        res.json({
            ...toV2ListResponse(result),
            searchTerm: result.searchTerm
        });
    } catch (error) {
        if (error.code === 'VALIDATION_ERROR') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.error('Search products v2 error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search products',
            error: error.message
        });
    }
};

// Create product (Admin only)
const createProduct = async (req, res) => {
    try {
        const productData = req.body;

        // Check if product with same productId already exists
        const existingProduct = await Product.findOne({ productId: productData.productId });
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: 'Product with this ID already exists'
            });
        }

        const product = new Product(productData);
        await product.save();

        res.status(201).json({
            success: true,
            data: product,
            message: 'Product created successfully'
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
};

// Update product (Admin only)
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const product = await Product.findOneAndUpdate(
            { productId: id },
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product,
            message: 'Product updated successfully'
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
};

// Delete product (Admin only)
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findOneAndUpdate(
            { productId: id },
            { status: 'inactive' },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
};

// Add to cart tracking
const trackAddToCart = async (req, res) => {
    try {
        const { productId } = req.body;

        const product = await Product.findOne({ productId });
        if (product) {
            await product.incrementAddToCart();
        }

        res.json({
            success: true,
            message: 'Add to cart tracked'
        });
    } catch (error) {
        console.error('Track add to cart error:', error);
        res.status(200).json({
            success: true,
            message: 'Tracking failed but request successful'
        });
    }
};

// Get product categories and subcategories (legacy)
const getCategories = async (req, res) => {
    try {
        const result = await publicProductService.getPublicCategories();
        res.json({
            success: true,
            data: result.categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
};

// Get product facets with tags (v2)
const getCategoriesV2 = async (req, res) => {
    try {
        const result = await publicProductService.getPublicCategories();
        res.json({
            success: true,
            data: result.facets,
            schemaVersion: 'v2'
        });
    } catch (error) {
        console.error('Get categories v2 error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
};

module.exports = {
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
};
