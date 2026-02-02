const Product = require('../models/Product');
const { uploadToCloudinary, uploadMultipleToCloudinary, deleteMultipleFromCloudinary } = require('../utils/cloudinaryUpload');

/**
 * Get all products for admin (includes inactive and draft products)
 * Admin version - shows all products regardless of status
 */
const getAdminProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            subcategory,
            status,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const filters = {};

        // Apply filters
        if (category) filters.category = category;
        if (subcategory) filters.subcategory = subcategory;
        if (status) filters.status = status;

        let query;

        // Handle search
        if (search) {
            filters.$or = [
                { name: { $regex: search, $options: 'i' } },
                { productId: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        query = Product.find(filters);

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
        console.error('Get admin products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};

/**
 * Create product with image uploads
 */
const createProductWithImages = async (req, res) => {
    try {
        const productData = JSON.parse(req.body.productData || '{}');
        
        // Check if product with same productId already exists
        const existingProduct = await Product.findOne({ productId: productData.productId });
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: 'Product with this ID already exists'
            });
        }

        // Upload images to Cloudinary
        const uploadedImages = [];
        
        if (req.files && req.files.length > 0) {
            console.log(`Uploading ${req.files.length} images to Cloudinary...`);
            
            for (const file of req.files) {
                try {
                    const result = await uploadToCloudinary(
                        file.buffer,
                        `hs-global/products/${productData.category}/${productData.subcategory}`
                    );
                    uploadedImages.push(result.secure_url);
                    console.log('Uploaded:', result.secure_url);
                } catch (uploadError) {
                    console.error('Error uploading image:', uploadError);
                    // Continue with other images even if one fails
                }
            }
        }

        // Set images
        if (uploadedImages.length > 0) {
            productData.image = uploadedImages[0]; // First image as main
            productData.images = uploadedImages; // All images
            productData.sortedImages = uploadedImages; // Same as images initially
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

/**
 * Update product with image uploads
 */
const updateProductWithImages = async (req, res) => {
    try {
        const { id } = req.params;
        const productData = JSON.parse(req.body.productData || '{}');

        // Find existing product
        const existingProduct = await Product.findOne({ productId: id });
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Handle new image uploads
        const newImages = [];
        
        if (req.files && req.files.length > 0) {
            console.log(`Uploading ${req.files.length} new images to Cloudinary...`);
            
            for (const file of req.files) {
                try {
                    const result = await uploadToCloudinary(
                        file.buffer,
                        `hs-global/products/${productData.category || existingProduct.category}/${productData.subcategory || existingProduct.subcategory}`
                    );
                    newImages.push(result.secure_url);
                    console.log('Uploaded:', result.secure_url);
                } catch (uploadError) {
                    console.error('Error uploading image:', uploadError);
                }
            }
        }

        // Merge existing and new images if preserveExistingImages flag is set
        if (productData.preserveExistingImages && existingProduct.images) {
            productData.images = [...existingProduct.images, ...newImages];
            productData.sortedImages = productData.images;
        } else if (newImages.length > 0) {
            // Replace all images with new ones
            productData.images = newImages;
            productData.sortedImages = newImages;
            productData.image = newImages[0]; // Update main image
            
            // Optionally delete old images from Cloudinary
            if (existingProduct.images && existingProduct.images.length > 0) {
                try {
                    await deleteMultipleFromCloudinary(existingProduct.images);
                    console.log('Deleted old images from Cloudinary');
                } catch (deleteError) {
                    console.error('Error deleting old images:', deleteError);
                    // Continue even if deletion fails
                }
            }
        }

        // Update product
        const product = await Product.findOneAndUpdate(
            { productId: id },
            { ...productData, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

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

/**
 * Delete product and its images
 */
const deleteProductWithImages = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findOne({ productId: id });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Delete images from Cloudinary
        if (product.images && product.images.length > 0) {
            try {
                await deleteMultipleFromCloudinary(product.images);
                console.log('Deleted product images from Cloudinary');
            } catch (deleteError) {
                console.error('Error deleting images:', deleteError);
                // Continue with product deletion even if image deletion fails
            }
        }

        // Delete product from database
        await Product.deleteOne({ productId: id });

        res.json({
            success: true,
            message: 'Product and images deleted successfully'
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

/**
 * Reorder product images
 */
const reorderProductImages = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrls } = req.body;

        if (!Array.isArray(imageUrls)) {
            return res.status(400).json({
                success: false,
                message: 'imageUrls must be an array'
            });
        }

        const product = await Product.findOneAndUpdate(
            { productId: id },
            { 
                sortedImages: imageUrls,
                image: imageUrls[0] || product.image, // Update main image to first in order
                updatedAt: new Date() 
            },
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
            data: product,
            message: 'Product images reordered successfully'
        });
    } catch (error) {
        console.error('Reorder images error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reorder images',
            error: error.message
        });
    }
};

/**
 * Get all subcategories for a category
 */
const getSubcategories = async (req, res) => {
    try {
        const { category } = req.params;
        
        if (!category || !['furniture', 'slabs'].includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Valid category is required (furniture or slabs)'
            });
        }

        // Get predefined subcategories
        const predefined = Product.getPredefinedSubcategories(category);
        
        // Get all subcategories actually used in database
        const used = await Product.getSubcategoriesByCategory(category);
        
        // Combine and deduplicate
        const allSubcategories = Array.from(new Set([...predefined, ...used]));
        
        res.json({
            success: true,
            data: {
                predefined,
                used,
                all: allSubcategories.sort()
            }
        });
    } catch (error) {
        console.error('Get subcategories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get subcategories',
            error: error.message
        });
    }
};

module.exports = {
    getAdminProducts,
    createProductWithImages,
    updateProductWithImages,
    deleteProductWithImages,
    reorderProductImages,
    getSubcategories
};
