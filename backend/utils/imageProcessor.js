const sharp = require('sharp');
const { uploadToCloudinary, deleteFromCloudinary } = require('./cloudinaryUpload');

/**
 * Enhanced image processing utility for ecommerce products
 * Handles cropping, resizing, format conversion, and optimization
 */

/**
 * Process a single image with cropping and optimization
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {Object} cropData - Crop data from frontend
 * @param {string} folderPath - Cloudinary folder path
 * @param {string} productId - Product ID for naming
 * @param {number} index - Image index
 */
const processProductImage = async (imageBuffer, cropData = null, folderPath, productId, index = 0) => {
    try {
        let sharpInstance = sharp(imageBuffer);

        // Get original image metadata
        const metadata = await sharpInstance.metadata();
        
        // Apply cropping if provided
        if (cropData && cropData.x !== undefined && cropData.y !== undefined) {
            const { x, y, width, height, rotation = 0 } = cropData;
            
            // Calculate crop dimensions based on original image size
            const cropX = Math.round(x * metadata.width / 100);
            const cropY = Math.round(y * metadata.height / 100);
            const cropWidth = Math.round(width * metadata.width / 100);
            const cropHeight = Math.round(height * metadata.height / 100);
            
            // Apply rotation if specified
            if (rotation && rotation !== 0) {
                sharpInstance = sharpInstance.rotate(rotation);
            }
            
            // Apply crop
            sharpInstance = sharpInstance.extract({
                left: cropX,
                top: cropY,
                width: cropWidth,
                height: cropHeight
            });
        }

        // Generate different sizes and formats
        const variants = await Promise.all([
            // Original optimized JPEG (high quality)
            generateImageVariant(sharpInstance, 'jpeg', 95, null, 'original'),
            
            // WebP format (better compression)
            generateImageVariant(sharpInstance, 'webp', 90, null, 'webp'),
            
            // Thumbnail (300x300)
            generateImageVariant(sharpInstance, 'jpeg', 85, { width: 300, height: 300 }, 'thumb'),
            
            // Medium size (800x800)
            generateImageVariant(sharpInstance, 'jpeg', 90, { width: 800, height: 800 }, 'medium'),
            
            // Large size (1200x1200)
            generateImageVariant(sharpInstance, 'jpeg', 95, { width: 1200, height: 1200 }, 'large')
        ]);

        // Upload all variants to Cloudinary
        const uploadPromises = variants.map((variant, variantIndex) => {
            const fileName = `${productId}_${index}_${variant.type}`;
            return uploadToCloudinary(variant.buffer, folderPath, fileName);
        });

        const uploadResults = await Promise.all(uploadPromises);

        // Return structured result
        return {
            original: uploadResults[0]?.secure_url,
            webp: uploadResults[1]?.secure_url,
            thumbnail: uploadResults[2]?.secure_url,
            medium: uploadResults[3]?.secure_url,
            large: uploadResults[4]?.secure_url,
            metadata: {
                originalWidth: metadata.width,
                originalHeight: metadata.height,
                format: metadata.format,
                size: variants[0].buffer.length,
                cropData: cropData || null
            }
        };

    } catch (error) {
        console.error('Error processing product image:', error);
        throw new Error(`Image processing failed: ${error.message}`);
    }
};

/**
 * Generate a specific image variant
 */
const generateImageVariant = async (sharpInstance, format, quality, resize = null, type) => {
    try {
        let pipeline = sharpInstance.clone();
        
        if (resize) {
            pipeline = pipeline.resize(resize.width, resize.height, {
                fit: 'inside',
                withoutEnlargement: true,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            });
        }

        let buffer;
        if (format === 'webp') {
            buffer = await pipeline.webp({ quality }).toBuffer();
        } else {
            buffer = await pipeline.jpeg({ quality, progressive: true }).toBuffer();
        }

        return {
            buffer,
            type,
            format,
            quality
        };
    } catch (error) {
        throw new Error(`Error generating ${type} variant: ${error.message}`);
    }
};

/**
 * Process multiple product images
 */
const processMultipleProductImages = async (imageFiles, cropDataArray = [], folderPath, productId) => {
    try {
        const processPromises = imageFiles.map((file, index) => {
            const cropData = cropDataArray[index] || null;
            return processProductImage(file.buffer, cropData, folderPath, productId, index);
        });

        const results = await Promise.all(processPromises);
        
        return {
            success: true,
            images: results.map((result, index) => ({
                index,
                urls: result,
                metadata: result.metadata
            })),
            totalProcessed: results.length
        };

    } catch (error) {
        console.error('Error processing multiple images:', error);
        return {
            success: false,
            error: error.message,
            images: []
        };
    }
};

/**
 * Clean up old image variants when product images are updated
 */
const cleanupOldImageVariants = async (oldImageUrls) => {
    try {
        if (!oldImageUrls || oldImageUrls.length === 0) return;

        // Extract public IDs from Cloudinary URLs and delete
        const deletePromises = oldImageUrls.map(url => {
            try {
                return deleteFromCloudinary(url);
            } catch (error) {
                console.warn('Failed to delete old image:', url, error.message);
                return Promise.resolve();
            }
        });

        await Promise.allSettled(deletePromises);
        console.log(`Cleaned up ${oldImageUrls.length} old image variants`);

    } catch (error) {
        console.error('Error cleaning up old images:', error);
    }
};

/**
 * Generate product image SEO data
 */
const generateImageSEOData = (productName, productCategory, imageIndex) => {
    const altText = `${productName} - ${productCategory} - Image ${imageIndex + 1}`;
    const caption = `High quality ${productCategory.toLowerCase()} ${productName}`;
    
    return {
        altText,
        caption,
        seoFilename: productName.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            + `-${imageIndex + 1}`
    };
};

/**
 * Validate image requirements for ecommerce
 */
const validateImageForEcommerce = async (imageBuffer) => {
    try {
        const metadata = await sharp(imageBuffer).metadata();
        const errors = [];

        // Minimum dimensions check
        if (metadata.width < 300 || metadata.height < 300) {
            errors.push('Image dimensions should be at least 300x300 pixels for better quality');
        }

        // Optimal dimensions suggestion
        if (metadata.width < 800 || metadata.height < 800) {
            errors.push('For best results, use images of at least 800x800 pixels');
        }

        // File size check (before processing)
        const size = imageBuffer.length;
        if (size > 10 * 1024 * 1024) { // 10MB
            errors.push('Image file size is too large. Please use images smaller than 10MB');
        }

        // Format check
        if (!['jpeg', 'jpg', 'png', 'webp'].includes(metadata.format)) {
            errors.push('Unsupported image format. Please use JPEG, PNG, or WebP');
        }

        return {
            isValid: errors.length === 0,
            errors,
            metadata: {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                size: size
            }
        };

    } catch (error) {
        return {
            isValid: false,
            errors: ['Invalid image file'],
            metadata: null
        };
    }
};

module.exports = {
    processProductImage,
    processMultipleProductImages,
    cleanupOldImageVariants,
    generateImageSEOData,
    validateImageForEcommerce
};