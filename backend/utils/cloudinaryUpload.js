const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Memory storage for multer (we'll handle upload to cloudinary ourselves)
const storage = multer.memoryStorage();

// File filter for images only
const imageFileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// File filter for videos only
const videoFileFilter = (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Only video files (MP4, WebM, MOV, AVI) are allowed!'), false);
    }
    cb(null, true);
};

// File filter for both images and videos
const mediaFileFilter = (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    
    if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image and video files are allowed!'), false);
    }
};

// Multer configuration for images
const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    }
});

// Multer configuration for videos
const uploadVideo = multer({
    storage: storage,
    fileFilter: videoFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size for videos
    }
});

// Multer configuration for mixed media (images + videos)
const uploadMedia = multer({
    storage: storage,
    fileFilter: mediaFileFilter,
    limits: {
        fileSize: 150 * 1024 * 1024 // 150MB — supports up to 100MB videos + 5MB images
    }
});

/**
 * Upload a single image to Cloudinary with WebP conversion and compression
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - Cloudinary folder path
 * @param {string} publicId - Optional public ID for the image
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = (buffer, folder = 'hs-global/products', publicId = null) => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder: folder,
            format: 'webp', // Convert to WebP
            quality: 'auto:good', // Auto quality optimization
            fetch_format: 'auto', // Automatically deliver best format
            transformation: [
                {
                    width: 2000,
                    height: 2000,
                    crop: 'limit', // Don't upscale, only downscale if larger
                    quality: 85 // Good quality with compression
                }
            ],
            overwrite: false,
            unique_filename: true,
            use_filename: true
        };

        if (publicId) {
            uploadOptions.public_id = publicId;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        // Convert buffer to stream and pipe to cloudinary
        const readableStream = new Readable();
        readableStream.push(buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array<Buffer>} buffers - Array of image buffers
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<Array<Object>>} Array of Cloudinary upload results
 */
const uploadMultipleToCloudinary = async (buffers, folder = 'hs-global/products') => {
    const uploadPromises = buffers.map(buffer => uploadToCloudinary(buffer, folder));
    return Promise.all(uploadPromises);
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Cloudinary delete result
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string} Public ID
 */
const extractPublicId = (url) => {
    if (!url) return null;
    
    // Example URL: https://res.cloudinary.com/dynd1aan0/image/upload/v1234567/hs-global/products/image.webp
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    
    if (uploadIndex === -1) return null;
    
    // Get everything after /upload/v12345/
    const pathParts = parts.slice(uploadIndex + 2);
    const publicIdWithExt = pathParts.join('/');
    
    // Remove file extension
    return publicIdWithExt.replace(/\.[^/.]+$/, '');
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array<string>} urls - Array of Cloudinary URLs
 * @returns {Promise<Array<Object>>} Array of delete results
 */
const deleteMultipleFromCloudinary = async (urls) => {
    const deletePromises = urls.map(url => {
        const publicId = extractPublicId(url);
        if (publicId) {
            return deleteFromCloudinary(publicId);
        }
        return Promise.resolve({ result: 'skipped', url });
    });
    
    return Promise.all(deletePromises);
};

module.exports = {
    upload,
    uploadVideo,
    uploadMedia,
    uploadToCloudinary,
    uploadMultipleToCloudinary,
    deleteFromCloudinary,
    deleteMultipleFromCloudinary,
    extractPublicId,
    cloudinary
};
