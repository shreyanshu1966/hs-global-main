const Product = require('../models/Product');
const { uploadToCloudinary, uploadMultipleToCloudinary, deleteMultipleFromCloudinary } = require('../utils/cloudinaryUpload');
const { uploadVideoToGoDaddy, deleteVideoFromGoDaddy, validateVideo } = require('../utils/godaddyVideoUpload');
const { 
    processMultipleProductImages, 
    cleanupOldImageVariants, 
    validateImageForEcommerce,
    generateImageSEOData 
} = require('../utils/imageProcessor');

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

        // Handle images array when using fields configuration
        const imageFiles = req.files?.images || [];

        if (imageFiles && imageFiles.length > 0) {
            console.log(`Uploading ${imageFiles.length} images to Cloudinary...`);

            for (const file of imageFiles) {
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

        // Handle video upload if present
        const videoFiles = req.files?.video || [];
        if (videoFiles && videoFiles.length > 0 && videoFiles[0]) {
            const videoFile = videoFiles[0];

            // Validate video
            const validation = validateVideo(videoFile);
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    message: validation.error
                });
            }

            try {
                // Upload video to GoDaddy
                const videoUploadResult = await uploadVideoToGoDaddy(
                    videoFile.buffer,
                    videoFile.originalname,
                    productData.productId
                );

                // Update product data with video info
                productData.hasVideo = true;
                productData.videoUrl = videoUploadResult.url;
                productData.videoFilename = videoUploadResult.filename;
                productData.videoSize = videoUploadResult.size;
                productData.videoUploadedAt = new Date();

                console.log('✅ Video uploaded successfully:', videoUploadResult.filename);
            } catch (videoError) {
                console.error('❌ Video upload failed:', videoError);
                // Continue without video - don't fail entire product creation
                // But log detailed error for debugging
                if (videoError.message.includes('ENOTFOUND')) {
                    console.error('⚠️  FTP hostname not found. Please verify FTP_HOST in .env file');
                } else if (videoError.message.includes('ECONNREFUSED')) {
                    console.error('⚠️  FTP connection refused. Check FTP_HOST and FTP_PORT');
                } else if (videoError.message.includes('authentication')) {
                    console.error('⚠️  FTP authentication failed. Check FTP_USER and FTP_PASSWORD');
                }
            }
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

        // Handle images array when using fields configuration
        const imageFiles = req.files?.images || [];

        if (imageFiles && imageFiles.length > 0) {
            console.log(`Uploading ${imageFiles.length} new images to Cloudinary...`);

            for (const file of imageFiles) {
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

        // Determine base images (existing ones that should be kept)
        let baseImages = [];
        if (productData.existingImages && Array.isArray(productData.existingImages)) {
            // Use explicitly provided existing images (allows for deletion/reordering)
            baseImages = productData.existingImages;
        } else if (productData.preserveExistingImages !== false && existingProduct.images) {
            // Fallback to keeping all existing images if not explicitly told otherwise
            baseImages = existingProduct.images;
        }

        // Combine base images with new images
        let finalImages;
        if (productData.newImagesFirst) {
            finalImages = [...newImages, ...baseImages];
        } else {
            finalImages = [...baseImages, ...newImages];
        }

        // Update product images if there are changes
        if (finalImages.length > 0 || (productData.existingImages && newImages.length === 0)) {
            productData.images = finalImages;
            productData.sortedImages = finalImages;
            productData.image = finalImages[0]; // Update main image
        } else if (newImages.length > 0) {
            // If somehow we have new images but no base images logic matched (should be covered above)
            productData.images = newImages;
            productData.sortedImages = newImages;
            productData.image = newImages[0];
        }

        // Clean up deleted images from Cloudinary ONLY if we have an explicit list of new existing images
        // This calculates which images were present before but are NOT in the new list
        if (productData.existingImages && existingProduct.images) {
            const imagesToDelete = existingProduct.images.filter(
                img => !productData.existingImages.includes(img)
            );

            if (imagesToDelete.length > 0) {
                try {
                    await deleteMultipleFromCloudinary(imagesToDelete);
                    console.log(`Deleted ${imagesToDelete.length} removed images from Cloudinary`);
                } catch (deleteError) {
                    console.error('Error deleting removed images:', deleteError);
                }
            }
        }

        // Handle video updates
        const videoFiles = req.files?.video || [];
        if (videoFiles && videoFiles.length > 0 && videoFiles[0]) {
            const videoFile = videoFiles[0];

            // Validate video
            const validation = validateVideo(videoFile);
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    message: validation.error
                });
            }

            try {
                // Delete old video if exists
                if (existingProduct.videoUrl) {
                    await deleteVideoFromGoDaddy(existingProduct.videoUrl);
                    console.log('✅ Old video deleted');
                }

                // Upload new video to GoDaddy
                const videoUploadResult = await uploadVideoToGoDaddy(
                    videoFile.buffer,
                    videoFile.originalname,
                    existingProduct.productId
                );

                // Update product with new video info
                productData.hasVideo = true;
                productData.videoUrl = videoUploadResult.url;
                productData.videoFilename = videoUploadResult.filename;
                productData.videoSize = videoUploadResult.size;
                productData.videoUploadedAt = new Date();

                console.log('✅ Video updated successfully:', videoUploadResult.filename);
            } catch (videoError) {
                console.error('❌ Video update failed:', videoError);
                if (videoError.message.includes('ENOTFOUND')) {
                    console.error('⚠️  FTP hostname not found. Please verify FTP_HOST in .env file');
                }
            }
        }

        // Handle video removal (if user wants to remove video)
        if (productData.removeVideo === 'true' && existingProduct.videoUrl) {
            try {
                await deleteVideoFromGoDaddy(existingProduct.videoUrl);
                productData.hasVideo = false;
                productData.videoUrl = null;
                productData.videoFilename = null;
                productData.videoSize = null;
                productData.videoUploadedAt = null;
                console.log('✅ Video removed successfully');
            } catch (videoError) {
                console.error('❌ Video deletion failed:', videoError);
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

        // Delete video from GoDaddy if exists
        if (product.videoUrl) {
            try {
                await deleteVideoFromGoDaddy(product.videoUrl);
                console.log('✅ Video deleted from GoDaddy');
            } catch (videoError) {
                console.error('❌ Video deletion failed:', videoError);
                // Continue with product deletion even if video deletion fails
            }
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

/**
 * Generate a product preview without saving to database
 * This allows admins to see how the product will look before creating/updating
 */
const previewProduct = async (req, res) => {
    try {
        const productData = JSON.parse(req.body.productData || '{}');

        // Upload temporary images to Cloudinary for preview
        const uploadedImages = [];
        const imageFiles = req.files?.images || [];

        if (imageFiles && imageFiles.length > 0) {
            console.log(`Uploading ${imageFiles.length} images to Cloudinary for preview...`);

            for (const file of imageFiles) {
                try {
                    const result = await uploadToCloudinary(
                        file.buffer,
                        `hs-global/preview/${productData.category}/${productData.subcategory}`
                    );
                    uploadedImages.push(result.secure_url);
                    console.log('Preview image uploaded:', result.secure_url);
                } catch (uploadError) {
                    console.error('Error uploading preview image:', uploadError);
                    // Continue with other images even if one fails
                }
            }
        }

        // Handle video upload for preview
        let videoInfo = null;
        const videoFiles = req.files?.video || [];
        if (videoFiles && videoFiles.length > 0 && videoFiles[0]) {
            const videoFile = videoFiles[0];

            // Validate video
            const validation = validateVideo(videoFile);
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    message: validation.error
                });
            }

            try {
                // For preview, we'll just return video metadata instead of uploading
                videoInfo = {
                    hasVideo: true,
                    videoSize: videoFile.size,
                    videoName: videoFile.originalname,
                    videoType: videoFile.mimetype
                };
            } catch (videoError) {
                console.error('Video processing error:', videoError);
            }
        }

        // Create preview product object
        const previewProduct = {
            ...productData,
            image: uploadedImages.length > 0 ? uploadedImages[0] : productData.image,
            images: uploadedImages.length > 0 ? uploadedImages : productData.images || [],
            sortedImages: uploadedImages.length > 0 ? uploadedImages : productData.sortedImages || [],
            ...videoInfo,
            // Add preview-specific fields
            isPreview: true,
            previewTimestamp: new Date().toISOString(),
            // Calculate discount price if applicable
            discountedPrice: productData.discount?.enabled && productData.priceUSD 
                ? Math.round(productData.priceUSD * (1 - productData.discount.percentage / 100))
                : null
        };

        res.json({
            success: true,
            data: previewProduct,
            message: 'Product preview generated successfully'
        });
    } catch (error) {
        console.error('Preview product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate product preview',
            error: error.message
        });
    }
};

/**
 * Process and crop product images with enhanced features
 */
const processProductImages = async (req, res) => {
    try {
        const { productId } = req.params;
        const { cropData } = req.body; // Array of crop data for each image
        
        const product = await Product.findOne({ productId });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const imageFiles = req.files?.images || [];
        if (!imageFiles || imageFiles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No images provided for processing'
            });
        }

        // Validate images
        const validationPromises = imageFiles.map(file => validateImageForEcommerce(file.buffer));
        const validationResults = await Promise.all(validationPromises);
        
        const invalidImages = validationResults
            .map((result, index) => ({ index, result }))
            .filter(({ result }) => !result.isValid);

        if (invalidImages.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Some images failed validation',
                errors: invalidImages.map(({ index, result }) => ({
                    imageIndex: index,
                    errors: result.errors
                }))
            });
        }

        // Process images with cropping
        const folderPath = `hs-global/products/${product.category}/${product.subcategory}`;
        const cropDataArray = Array.isArray(cropData) ? cropData : [];
        
        const processingResult = await processMultipleProductImages(
            imageFiles, 
            cropDataArray, 
            folderPath, 
            productId
        );

        if (!processingResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Image processing failed',
                error: processingResult.error
            });
        }

        // Update product with processed images
        const processedImageUrls = processingResult.images.map(img => img.urls.original);
        const imageProcessingData = processingResult.images.map((img, index) => ({
            originalUrl: img.urls.original,
            processedUrl: img.urls.medium,
            thumbnailUrl: img.urls.thumbnail,
            webpUrl: img.urls.webp,
            cropData: img.metadata.cropData,
            ...generateImageSEOData(product.name, product.category, index)
        }));

        // Clean up old images if replacing
        if (product.images && product.images.length > 0) {
            await cleanupOldImageVariants(product.images);
        }

        // Update product
        const updatedProduct = await Product.findOneAndUpdate(
            { productId },
            {
                images: processedImageUrls,
                sortedImages: processedImageUrls,
                image: processedImageUrls[0],
                imageProcessing: imageProcessingData,
                'imageMetadata.totalSize': processingResult.images.reduce((sum, img) => sum + img.metadata.size, 0),
                'imageMetadata.lastOptimized': new Date(),
                updatedAt: new Date()
            },
            { new: true }
        );

        res.json({
            success: true,
            data: updatedProduct,
            message: `Successfully processed ${processingResult.totalProcessed} images`,
            processingInfo: {
                totalProcessed: processingResult.totalProcessed,
                variants: ['original', 'webp', 'thumbnail', 'medium', 'large'],
                totalSize: processingResult.images.reduce((sum, img) => sum + img.metadata.size, 0)
            }
        });

    } catch (error) {
        console.error('Process product images error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process product images',
            error: error.message
        });
    }
};

/**
 * Update product specifications (both standard and custom)
 */
const updateProductSpecifications = async (req, res) => {
    try {
        const { productId } = req.params;
        const { furnitureSpecs, slabSpecs, customSpecs } = req.body;

        const product = await Product.findOne({ productId });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const updateData = { updatedAt: new Date() };

        // Update standard specifications based on category
        if (product.category === 'furniture' && furnitureSpecs) {
            updateData.furnitureSpecs = furnitureSpecs;
        } else if (product.category === 'slabs' && slabSpecs) {
            updateData.slabSpecs = slabSpecs;
        }

        // Update custom specifications
        if (customSpecs && Array.isArray(customSpecs)) {
            // Validate custom specs
            const validCustomSpecs = customSpecs.filter(spec => 
                spec.key && spec.label && 
                ['text', 'number', 'select', 'textarea'].includes(spec.type)
            );

            updateData.customSpecs = validCustomSpecs.map((spec, index) => ({
                ...spec,
                order: spec.order || index
            }));
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { productId },
            updateData,
            { new: true }
        );

        res.json({
            success: true,
            data: updatedProduct,
            message: 'Product specifications updated successfully'
        });

    } catch (error) {
        console.error('Update specifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product specifications',
            error: error.message
        });
    }
};

/**
 * Update product inventory and shipping information
 */
const updateProductInventoryAndShipping = async (req, res) => {
    try {
        const { productId } = req.params;
        const { inventory, shipping, manufacturing, variants } = req.body;

        const product = await Product.findOne({ productId });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const updateData = { updatedAt: new Date() };

        if (inventory) updateData.inventory = inventory;
        if (shipping) updateData.shipping = shipping;
        if (manufacturing) updateData.manufacturing = manufacturing;
        if (variants && Array.isArray(variants)) updateData.variants = variants;

        const updatedProduct = await Product.findOneAndUpdate(
            { productId },
            updateData,
            { new: true }
        );

        res.json({
            success: true,
            data: updatedProduct,
            message: 'Product inventory and shipping information updated successfully'
        });

    } catch (error) {
        console.error('Update inventory and shipping error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product inventory and shipping information',
            error: error.message
        });
    }
};

/**
 * Get discount analytics and statistics
 */
const getDiscountAnalytics = async (req, res) => {
    try {
        console.log('📊 getDiscountAnalytics called');
        console.log('🔐 Auth user:', req.user?.email);
        
        const analytics = await Product.getDiscountAnalytics();
        console.log('📈 Analytics result:', analytics);
        
        // Get expiring soon (next 3 days)
        const expiringSoon = await Product.getExpiringSoonDiscounts(3);
        console.log('⏰ Expiring soon count:', expiringSoon.length);
        
        const responseData = {
            success: true,
            data: {
                ...analytics,
                expiringSoon: expiringSoon.map(p => ({
                    productId: p.productId,
                    name: p.name,
                    discount: p.discount,
                    endDate: p.discount.endDate,
                    daysRemaining: Math.ceil((new Date(p.discount.endDate) - new Date()) / (1000 * 60 * 60 * 24))
                }))
            }
        };
        
        console.log('✅ Sending response:', JSON.stringify(responseData).substring(0, 200));
        res.json(responseData);
    } catch (error) {
        console.error('❌ Get discount analytics error:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch discount analytics',
            error: error.message
        });
    }
};

/**
 * Disable all expired discounts
 */
const disableExpiredDiscounts = async (req, res) => {
    try {
        const disabledCount = await Product.disableExpiredDiscounts();
        
        res.json({
            success: true,
            data: {
                disabledCount
            },
            message: `Successfully disabled ${disabledCount} expired discount(s)`
        });
    } catch (error) {
        console.error('Disable expired discounts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to disable expired discounts',
            error: error.message
        });
    }
};

/**
 * Get products with active discounts
 */
const getDiscountedProducts = async (req, res) => {
    try {
        console.log('📦 getDiscountedProducts called');
        console.log('🔐 Auth user:', req.user?.email);
        console.log('📋 Query params:', req.query);
        
        const { 
            page = 1, 
            limit = 20,
            status = 'all' // active, scheduled, expired, all
        } = req.query;
        
        console.log('🎯 Filters:', { page, limit, status });
        
        const now = new Date();
        let query = {};
        
        // Filter by discount status
        if (status === 'all') {
            // Show all products (with or without discounts)
            query = {};
        } else if (status === 'active') {
            query = {
                'discount.enabled': true,
                $or: [
                    { 'discount.startDate': null, 'discount.endDate': null },
                    { 'discount.startDate': null, 'discount.endDate': { $gte: now } },
                    { 'discount.startDate': { $lte: now }, 'discount.endDate': null },
                    { 'discount.startDate': { $lte: now }, 'discount.endDate': { $gte: now } }
                ]
            };
        } else if (status === 'scheduled') {
            query = {
                'discount.enabled': true,
                'discount.startDate': { $gt: now }
            };
        } else if (status === 'expired') {
            query = {
                'discount.enabled': true,
                'discount.endDate': { $lt: now }
            };
        }
        
        console.log('🔍 MongoDB query:', JSON.stringify(query));
        
        const skip = (page - 1) * limit;
        
        const [products, total] = await Promise.all([
            Product.find(query)
                .select('productId name category subcategory priceUSD discount image')
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ 'discount.endDate': 1 }),
            Product.countDocuments(query)
        ]);
        
        console.log('📊 Results:', { productsFound: products.length, total });
        
        // Add discount status to each product
        const productsWithStatus = products.map(product => {
            const status = product.getDiscountStatus();
            return {
                ...product.toObject(),
                discountStatus: status,
                finalPrice: product.getFinalPrice()
            };
        });
        
        const responseData = {
            success: true,
            data: productsWithStatus,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                count: productsWithStatus.length,
                totalItems: total
            }
        };
        
        console.log('✅ Sending response with', productsWithStatus.length, 'products');
        res.json(responseData);
    } catch (error) {
        console.error('❌ Get discounted products error:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch discounted products',
            error: error.message
        });
    }
};

/**
 * Update discount for a specific product
 */
const updateProductDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const { discount } = req.body;
        
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Update discount
        product.discount = {
            enabled: discount.enabled || false,
            percentage: discount.percentage || 0,
            startDate: discount.startDate || null,
            endDate: discount.endDate || null,
            description: discount.description || '',
            createdAt: product.discount?.createdAt || new Date(),
            lastModified: new Date()
        };
        
        await product.save();
        
        const discountStatus = product.getDiscountStatus();
        
        res.json({
            success: true,
            data: {
                productId: product.productId,
                name: product.name,
                discount: product.discount,
                discountStatus,
                finalPrice: product.getFinalPrice()
            },
            message: 'Product discount updated successfully'
        });
    } catch (error) {
        console.error('Update product discount error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product discount',
            error: error.message
        });
    }
};

/**
 * Apply discount to all products
 */
const applyDiscountToAll = async (req, res) => {
    try {
        const { discount } = req.body;
        
        if (!discount || !discount.percentage) {
            return res.status(400).json({
                success: false,
                message: 'Discount percentage is required'
            });
        }

        const discountData = {
            enabled: true,
            percentage: Math.min(Math.max(0, discount.percentage), 100),
            startDate: discount.startDate || null,
            endDate: discount.endDate || null,
            description: discount.description || '',
            createdAt: new Date(),
            lastModified: new Date()
        };

        const result = await Product.updateMany(
            {},
            { $set: { discount: discountData } }
        );

        console.log('Apply to all - Update result:', JSON.stringify(result));
        const updatedCount = result?.matchedCount || result?.n || 0;

        res.json({
            success: true,
            data: {
                updatedCount: updatedCount,
                discount: discountData
            },
            message: `Discount applied to ${updatedCount} product(s)`
        });
    } catch (error) {
        console.error('Apply discount to all error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to apply discount to all products',
            error: error.message
        });
    }
};

/**
 * Remove discount from all products
 */
const removeDiscountFromAll = async (req, res) => {
    try {
        const discountData = {
            enabled: false,
            percentage: 0,
            startDate: null,
            endDate: null,
            description: '',
            createdAt: null,
            lastModified: new Date()
        };

        const result = await Product.updateMany(
            {},
            { $set: { discount: discountData } }
        );

        console.log('Remove from all - Update result:', JSON.stringify(result));
        const updatedCount = result?.matchedCount || result?.n || 0;

        res.json({
            success: true,
            data: {
                updatedCount: updatedCount
            },
            message: `Discount removed from ${updatedCount} product(s)`
        });
    } catch (error) {
        console.error('Remove discount from all error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove discount from all products',
            error: error.message
        });
    }
};

/**
 * Apply discount to selected products (bulk)
 */
const applyBulkDiscount = async (req, res) => {
    try {
        const { productIds, discount } = req.body;
        
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Product IDs array is required'
            });
        }

        if (!discount || !discount.percentage) {
            return res.status(400).json({
                success: false,
                message: 'Discount percentage is required'
            });
        }

        const discountData = {
            enabled: true,
            percentage: Math.min(Math.max(0, discount.percentage), 100),
            startDate: discount.startDate || null,
            endDate: discount.endDate || null,
            description: discount.description || '',
            createdAt: new Date(),
            lastModified: new Date()
        };

        const result = await Product.updateMany(
            { _id: { $in: productIds } },
            { $set: { discount: discountData } }
        );

        console.log('Apply bulk - Product IDs:', productIds, 'Update result:', JSON.stringify(result));
        const updatedCount = result?.matchedCount || result?.n || 0;

        res.json({
            success: true,
            data: {
                updatedCount: updatedCount,
                discount: discountData
            },
            message: `Discount applied to ${updatedCount} product(s)`
        });
    } catch (error) {
        console.error('Apply bulk discount error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to apply bulk discount',
            error: error.message
        });
    }
};

/**
 * Remove discount from selected products (bulk)
 */
const removeBulkDiscount = async (req, res) => {
    try {
        const { productIds } = req.body;
        
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Product IDs array is required'
            });
        }

        const discountData = {
            enabled: false,
            percentage: 0,
            startDate: null,
            endDate: null,
            description: '',
            createdAt: null,
            lastModified: new Date()
        };

        const result = await Product.updateMany(
            { _id: { $in: productIds } },
            { $set: { discount: discountData } }
        );

        console.log('Remove bulk - Product IDs:', productIds, 'Update result:', JSON.stringify(result));
        const updatedCount = result?.matchedCount || result?.n || 0;

        res.json({
            success: true,
            data: {
                updatedCount: updatedCount
            },
            message: `Discount removed from ${updatedCount} product(s)`
        });
    } catch (error) {
        console.error('Remove bulk discount error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove bulk discount',
            error: error.message
        });
    }
};

/**
 * Remove discount from a single product
 */
const removeProductDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        product.discount = {
            enabled: false,
            percentage: 0,
            startDate: null,
            endDate: null,
            description: '',
            createdAt: null,
            lastModified: new Date()
        };
        
        await product.save();
        
        res.json({
            success: true,
            data: {
                productId: product.productId,
                name: product.name
            },
            message: 'Product discount removed successfully'
        });
    } catch (error) {
        console.error('Remove product discount error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove product discount',
            error: error.message
        });
    }
};

// ==================== REGIONAL PRICING ====================

const { REGIONS } = require('../utils/regionUtils');

/**
 * Update regional pricing for a single product
 * PATCH /api/admin/products/:id/regional-pricing
 */
const updateProductRegionalPricing = async (req, res) => {
    try {
        const { id } = req.params;
        const { regionalPricing } = req.body;

        if (!regionalPricing || typeof regionalPricing !== 'object') {
            return res.status(400).json({ success: false, message: 'regionalPricing object is required' });
        }

        const product = await Product.findOne({ $or: [{ productId: id }, { _id: id }] });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Validate and apply each region
        for (const region of REGIONS) {
            if (regionalPricing[region]) {
                const { enabled, adjustmentType, adjustmentValue } = regionalPricing[region];
                if (adjustmentType && !['percentage', 'fixed'].includes(adjustmentType)) {
                    return res.status(400).json({ success: false, message: `Invalid adjustmentType for region ${region}` });
                }
                product.regionalPricing[region] = {
                    enabled: Boolean(enabled),
                    adjustmentType: adjustmentType || 'percentage',
                    adjustmentValue: Number(adjustmentValue) || 0
                };
            }
        }

        await product.save();

        res.json({ success: true, data: product.regionalPricing, message: 'Regional pricing updated' });
    } catch (error) {
        console.error('Update regional pricing error:', error);
        res.status(500).json({ success: false, message: 'Failed to update regional pricing', error: error.message });
    }
};

/**
 * Bulk update regional pricing by category and/or subcategory
 * POST /api/admin/products/regional-pricing/bulk
 * Body: { category?, subcategory?, regionalPricing: {...} }
 */
const bulkUpdateRegionalPricing = async (req, res) => {
    try {
        const { category, subcategory, regionalPricing } = req.body;

        if (!regionalPricing || typeof regionalPricing !== 'object') {
            return res.status(400).json({ success: false, message: 'regionalPricing object is required' });
        }

        const filter = {};
        if (category) filter.category = category;
        if (subcategory) filter.subcategory = subcategory;

        const affectedCount = await Product.countDocuments(filter);

        // Build the $set payload
        const setPayload = {};
        for (const region of REGIONS) {
            if (regionalPricing[region]) {
                const { enabled, adjustmentType, adjustmentValue } = regionalPricing[region];
                setPayload[`regionalPricing.${region}.enabled`] = Boolean(enabled);
                setPayload[`regionalPricing.${region}.adjustmentType`] = adjustmentType || 'percentage';
                setPayload[`regionalPricing.${region}.adjustmentValue`] = Number(adjustmentValue) || 0;
            }
        }

        const result = await Product.updateMany(filter, { $set: setPayload });

        res.json({
            success: true,
            modifiedCount: result.modifiedCount,
            affectedCount,
            message: `Regional pricing updated for ${result.modifiedCount} products`
        });
    } catch (error) {
        console.error('Bulk update regional pricing error:', error);
        res.status(500).json({ success: false, message: 'Failed to bulk update regional pricing', error: error.message });
    }
};

/**
 * Get overview of regional pricing across all products
 * GET /api/admin/products/regional-pricing/overview
 */
const getRegionalPricingOverview = async (req, res) => {
    try {
        const stats = {};
        for (const region of REGIONS) {
            stats[region] = await Product.countDocuments({ [`regionalPricing.${region}.enabled`]: true });
        }
        const totalProducts = await Product.countDocuments({});
        res.json({ success: true, totalProducts, regionStats: stats });
    } catch (error) {
        console.error('Get regional pricing overview error:', error);
        res.status(500).json({ success: false, message: 'Failed to get overview', error: error.message });
    }
};

module.exports = {
    getAdminProducts,
    createProductWithImages,
    updateProductWithImages,
    deleteProductWithImages,
    reorderProductImages,
    getSubcategories,
    previewProduct,
    processProductImages,
    updateProductSpecifications,
    updateProductInventoryAndShipping,
    // Discount management
    getDiscountAnalytics,
    disableExpiredDiscounts,
    getDiscountedProducts,
    updateProductDiscount,
    applyDiscountToAll,
    removeDiscountFromAll,
    applyBulkDiscount,
    removeBulkDiscount,
    removeProductDiscount,
    // Regional pricing
    updateProductRegionalPricing,
    bulkUpdateRegionalPricing,
    getRegionalPricingOverview
};
