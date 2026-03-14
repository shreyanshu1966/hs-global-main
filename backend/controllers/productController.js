const Product = require('../models/Product');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildSubcategoryFilter = (subcategory) => {
    if (!subcategory || typeof subcategory !== 'string') {
        return undefined;
    }

    const normalized = subcategory.trim().toLowerCase();
    if (!normalized) {
        return undefined;
    }

    const aliasMap = {
        others: 'other',
        'center-table': 'dining-table',
        'center-tables': 'dining-table',
        center: 'dining-table',
        'wash-basin': 'wash-basins',
        'wash basin': 'wash-basins'
    };

    const canonical = aliasMap[normalized] || normalized;
    const escaped = escapeRegex(canonical);
    const flexiblePattern = escaped.replace(/[-_\s]+/g, '[-_\\s]*');

    return {
        $regex: `^${flexiblePattern}$`,
        $options: 'i'
    };
};

// Get all products with pagination and filters
const getAllProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            subcategory,
            featured,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            minPrice,
            maxPrice
        } = req.query;

        const filters = {
            status: 'active',
            available: true
        };

        // Apply filters
        if (category) filters.category = category;
        const subcategoryFilter = buildSubcategoryFilter(subcategory);
        if (subcategoryFilter) filters.subcategory = subcategoryFilter;
        if (featured !== undefined) filters.featured = featured === 'true';
        if (minPrice) filters.priceINR = { ...filters.priceINR, $gte: parseFloat(minPrice) };
        if (maxPrice) filters.priceINR = { ...filters.priceINR, $lte: parseFloat(maxPrice) };

        let query;

        // Handle search
        if (search) {
            query = Product.search(search, filters);
        } else {
            query = Product.find(filters);
        }

        // Apply sorting
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        query = query.sort(sort);

        // Apply pagination
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(parseInt(limit));

        const products = await query.exec();
        const total = await Product.countDocuments(filters);

        res.json({
            success: true,
            data: products,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                count: products.length,
                totalItems: total
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};

// Get single product by ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findOne({
            productId: id,
            status: 'active'
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Increment view count
        await product.incrementView();

        // Get related products
        const relatedProducts = await Product.find({
            _id: { $ne: product._id },
            category: product.category,
            subcategory: product.subcategory,
            status: 'active',
            available: true
        }).limit(10).select('productId name image priceINR category subcategory');

        res.json({
            success: true,
            data: {
                product,
                relatedProducts
            }
        });
    } catch (error) {
        console.error('Get product by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
            error: error.message
        });
    }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const {
            page = 1,
            limit = 20,
            subcategory,
            sortBy = 'featured',
            sortOrder = 'desc'
        } = req.query;

        const filters = {
            category,
            status: 'active',
            available: true
        };

        const subcategoryFilter = buildSubcategoryFilter(subcategory);
        if (subcategoryFilter) filters.subcategory = subcategoryFilter;

        const sort = {};
        if (sortBy === 'featured') {
            sort.featured = -1;
            sort.createdAt = -1;
        } else {
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        }

        const skip = (page - 1) * limit;

        const products = await Product.find(filters)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(filters);

        // Get subcategories for this category
        const subcategories = await Product.distinct('subcategory', {
            category,
            status: 'active',
            available: true
        });

        res.json({
            success: true,
            data: {
                products,
                subcategories,
                category
            },
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                count: products.length,
                totalItems: total
            }
        });
    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const products = await Product.getFeatured(parseInt(limit));

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured products',
            error: error.message
        });
    }
};

// Search products
const searchProducts = async (req, res) => {
    try {
        const { q, category, limit = 20, page = 1 } = req.query;

        if (!q || q.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const filters = {};
        if (category) filters.category = category;

        const skip = (page - 1) * limit;

        const products = await Product.search(q.trim(), filters)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalQuery = await Product.search(q.trim(), filters);
        const total = await Product.countDocuments(totalQuery.getQuery());

        res.json({
            success: true,
            data: products,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                count: products.length,
                totalItems: total
            },
            searchTerm: q.trim()
        });
    } catch (error) {
        console.error('Search products error:', error);
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

// Get product categories and subcategories
const getCategories = async (req, res) => {
    try {
        const categories = await Product.aggregate([
            {
                $match: { status: 'active', available: true }
            },
            {
                $group: {
                    _id: '$category',
                    subcategories: { $addToSet: '$subcategory' },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: '$_id',
                    subcategories: 1,
                    count: 1
                }
            },
            {
                $sort: { category: 1 }
            }
        ]);

        res.json({
            success: true,
            data: categories
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

module.exports = {
    getAllProducts,
    getProductById,
    getProductsByCategory,
    getFeaturedProducts,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    trackAddToCart,
    getCategories
};