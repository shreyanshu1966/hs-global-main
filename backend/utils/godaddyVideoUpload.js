const ftp = require('basic-ftp');
const path = require('path');
const { Readable } = require('stream');

/**
 * Upload video to GoDaddy hosting via FTP
 * @param {Buffer} buffer - Video file buffer
 * @param {string} filename - Original filename
 * @param {string} productId - Product ID for naming
 * @returns {Promise<Object>} Upload result with public URL
 */
const uploadVideoToGoDaddy = async (buffer, filename, productId) => {
    const client = new ftp.Client();
    client.ftp.verbose = false; // Set to true for debugging
    
    try {
        // Connect to FTP server
        await client.access({
            host: process.env.FTP_HOST,
            port: parseInt(process.env.FTP_PORT || '21'),
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false // Use true for FTPS
        });

        console.log('✅ Connected to GoDaddy FTP');

        // Generate unique filename
        const timestamp = Date.now();
        const ext = path.extname(filename).toLowerCase();
        const safeProductId = productId.replace(/[^a-zA-Z0-9-]/g, '-');
        const newFilename = `product-${safeProductId}-${timestamp}${ext}`;

        // Ensure the remote directory exists
        const remotePath = process.env.FTP_VIDEO_PATH || '/home/m6yvujf4sxmn/public_html/videos/products';
        
        try {
            await client.ensureDir(remotePath);
            console.log(`✅ Directory ensured: ${remotePath}`);
        } catch (error) {
            console.warn(`⚠️ Could not ensure directory (might already exist): ${error.message}`);
        }

        // Convert buffer to stream
        const stream = Readable.from(buffer);

        // Upload file
        const remoteFilePath = `${remotePath}/${newFilename}`;
        await client.uploadFrom(stream, remoteFilePath);

        console.log(`✅ Video uploaded: ${remoteFilePath}`);

        // Generate public URL
        const publicUrl = `${process.env.FTP_VIDEO_PUBLIC_URL || 'https://www.hsglobalexport.com/videos/products'}/${newFilename}`;

        return {
            success: true,
            filename: newFilename,
            url: publicUrl,
            size: buffer.length,
            path: remoteFilePath
        };

    } catch (error) {
        console.error('❌ FTP Upload Error:', error);
        throw new Error(`Failed to upload video to GoDaddy: ${error.message}`);
    } finally {
        client.close();
    }
};

/**
 * Delete video from GoDaddy hosting via FTP
 * @param {string} videoUrl - Public URL of the video to delete
 * @returns {Promise<boolean>} Success status
 */
const deleteVideoFromGoDaddy = async (videoUrl) => {
    if (!videoUrl) return false;

    const client = new ftp.Client();
    client.ftp.verbose = false;
    
    try {
        // Extract filename from URL
        const filename = videoUrl.split('/').pop();
        if (!filename) {
            throw new Error('Invalid video URL');
        }

        // Connect to FTP server
        await client.access({
            host: process.env.FTP_HOST,
            port: parseInt(process.env.FTP_PORT || '21'),
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false
        });

        console.log('✅ Connected to GoDaddy FTP for deletion');

        // Delete file
        const remotePath = process.env.FTP_VIDEO_PATH || '/home/m6yvujf4sxmn/public_html/videos/products';
        const remoteFilePath = `${remotePath}/${filename}`;
        
        await client.remove(remoteFilePath);
        console.log(`✅ Video deleted: ${remoteFilePath}`);

        return true;

    } catch (error) {
        console.error('❌ FTP Delete Error:', error);
        // Don't throw error on delete failure - just log it
        return false;
    } finally {
        client.close();
    }
};

/**
 * Validate video file
 * @param {Object} file - Multer file object
 * @returns {Object} Validation result
 */
const validateVideo = (file) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!file) {
        return { valid: false, error: 'No video file provided' };
    }

    if (!allowedTypes.includes(file.mimetype)) {
        return { 
            valid: false, 
            error: `Invalid video format. Allowed: MP4, WebM, MOV, AVI` 
        };
    }

    if (file.size > maxSize) {
        return { 
            valid: false, 
            error: `Video size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB` 
        };
    }

    return { valid: true };
};

module.exports = {
    uploadVideoToGoDaddy,
    deleteVideoFromGoDaddy,
    validateVideo
};
