# Video Upload Implementation Guide

## ✅ Completed Setup

1. **Package Added**: `basic-ftp` package added to `package.json`
2. **Environment Variables**: FTP credentials added to `.env`
3. **GoDaddy Upload Utility**: Created `backend/utils/godaddyVideoUpload.js`
4. **Product Model Updated**: Added video fields to Product schema
5. **Multer Updated**: Added video upload configurations in `cloudinaryUpload.js`

---

## 📋 What You Need to Do Next

### Step 1: Install the FTP Package

Run this command in your backend directory:

```bash
cd backend
npm install basic-ftp@^5.0.5
```

---

### Step 2: Update Admin Product Controller

You need to modify `backend/controllers/adminProductController.js`:

#### A. Import the video upload utility at the top:

```javascript
const Product = require('../models/Product');
const { uploadToCloudinary, uploadMultipleToCloudinary, deleteMultipleFromCloudinary } = require('../utils/cloudinaryUpload');
const { uploadVideoToGoDaddy, deleteVideoFromGoDaddy, validateVideo } = require('../utils/godaddyVideoUpload');
```

#### B. Update the `createProductWithImages` function:

Add video handling logic after image upload. Here's the modified section:

```javascript
// After uploading images...

// Handle video upload if present
if (req.files && req.files.video && req.files.video[0]) {
    const videoFile = req.files.video[0];
    
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
    }
}
```

#### C. Update the `updateProductWithImages` function:

Add video update/delete logic:

```javascript
// Handle video updates
if (req.files && req.files.video && req.files.video[0]) {
    const videoFile = req.files.video[0];
    
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
        if (product.videoUrl) {
            await deleteVideoFromGoDaddy(product.videoUrl);
            console.log('✅ Old video deleted');
        }

        // Upload new video to GoDaddy
        const videoUploadResult = await uploadVideoToGoDaddy(
            videoFile.buffer,
            videoFile.originalname,
            product.productId
        );

        // Update product with new video info
        updates.hasVideo = true;
        updates.videoUrl = videoUploadResult.url;
        updates.videoFilename = videoUploadResult.filename;
        updates.videoSize = videoUploadResult.size;
        updates.videoUploadedAt = new Date();

        console.log('✅ Video updated successfully:', videoUploadResult.filename);
    } catch (videoError) {
        console.error('❌ Video update failed:', videoError);
    }
}

// Handle video removal (if user wants to remove video)
if (req.body.removeVideo === 'true' && product.videoUrl) {
    try {
        await deleteVideoFromGoDaddy(product.videoUrl);
        updates.hasVideo = false;
        updates.videoUrl = null;
        updates.videoFilename = null;
        updates.videoSize = null;
        updates.videoUploadedAt = null;
        console.log('✅ Video removed successfully');
    } catch (videoError) {
        console.error('❌ Video deletion failed:', videoError);
    }
}
```

#### D. Update the `deleteProduct` function:

Add video deletion when product is deleted:

```javascript
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

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

        // Delete images from Cloudinary if needed
        if (product.images && product.images.length > 0) {
            try {
                await deleteMultipleFromCloudinary(product.images);
                console.log('✅ Images deleted from Cloudinary');
            } catch (error) {
                console.error('❌ Image deletion failed:', error);
            }
        }

        await Product.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
```

---

### Step 3: Update Admin Product Routes

Modify `backend/routes/adminProductRoutes.js`:

#### Change the multer upload configuration:

```javascript
const express = require('express');
const router = express.Router();
const { uploadMedia } = require('../utils/cloudinaryUpload'); // Change from 'upload' to 'uploadMedia'
const adminProductController = require('../controllers/adminProductController');
const { authenticateAdmin } = require('../middleware/adminAuth');

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// Product routes with mixed media upload (images + video)
router.post('/', 
    uploadMedia.fields([
        { name: 'images', maxCount: 10 },
        { name: 'video', maxCount: 1 }
    ]), 
    adminProductController.createProductWithImages
);

router.put('/:id', 
    uploadMedia.fields([
        { name: 'images', maxCount: 10 },
        { name: 'video', maxCount: 1 }
    ]), 
    adminProductController.updateProductWithImages
);

// Other routes remain the same...
```

---

### Step 4: Frontend Admin Panel Updates

#### Update your product form to include video upload:

```html
<!-- In your admin product form -->
<div class="form-group">
    <label for="video">Product Video (Optional)</label>
    <input 
        type="file" 
        id="video" 
        name="video" 
        accept="video/mp4,video/webm,video/quicktime"
        class="form-control"
    />
    <small class="form-text text-muted">
        Max size: 10MB. Allowed formats: MP4, WebM, MOV
    </small>
</div>

<!-- Show current video if exists -->
<div class="form-group" id="currentVideo" style="display: none;">
    <label>Current Video</label>
    <video width="100%" height="240" controls>
        <source id="videoSource" type="video/mp4">
        Your browser does not support the video tag.
    </video>
    <div class="mt-2">
        <label>
            <input type="checkbox" name="removeVideo" value="true">
            Remove video
        </label>
    </div>
</div>
```

#### Update your JavaScript form submission:

```javascript
async function submitProductForm(event) {
    event.preventDefault();
    
    const formData = new FormData();
    
    // Add text fields
    formData.append('name', document.getElementById('name').value);
    formData.append('category', document.getElementById('category').value);
    // ... other fields
    
    // Add images
    const imageFiles = document.getElementById('images').files;
    for (let i = 0; i < imageFiles.length; i++) {
        formData.append('images', imageFiles[i]);
    }
    
    // Add video if selected
    const videoFile = document.getElementById('video').files[0];
    if (videoFile) {
        formData.append('video', videoFile);
    }
    
    // Add removeVideo flag if checked
    const removeVideo = document.querySelector('input[name="removeVideo"]');
    if (removeVideo && removeVideo.checked) {
        formData.append('removeVideo', 'true');
    }
    
    try {
        const response = await fetch('/api/admin/products', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${yourAuthToken}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Product created successfully!');
            // Redirect or refresh
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to create product');
    }
}
```

#### Display video in product list/details:

```javascript
// When displaying product
if (product.hasVideo && product.videoUrl) {
    const videoHtml = `
        <div class="product-video">
            <video width="100%" height="400" controls>
                <source src="${product.videoUrl}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            <p class="video-info">
                Size: ${(product.videoSize / 1024 / 1024).toFixed(2)} MB
                <br>
                Uploaded: ${new Date(product.videoUploadedAt).toLocaleString()}
            </p>
        </div>
    `;
    document.getElementById('productVideoContainer').innerHTML = videoHtml;
}
```

---

## 🎯 Testing Checklist

1. ✅ Install `basic-ftp` package
2. ✅ Restart your backend server
3. ✅ Test video upload on product creation
4. ✅ Check if video appears in GoDaddy `/videos/products/` folder
5. ✅ Verify video URL is accessible: `https://www.hsglobalexport.com/videos/products/product-{id}-{timestamp}.mp4`
6. ✅ Test video update (replacing old video)
7. ✅ Test video removal (checkbox)
8. ✅ Test product deletion (should delete video too)

---

## 🔒 Security Notes

- FTP password is stored in `.env` (never commit to Git)
- Add `.env` to `.gitignore`
- Video size limited to 10MB
- Only MP4, WebM, MOV, AVI formats allowed
- Automatic filename sanitization prevents path injection

---

## 📊 Video Storage Details

- **FTP Server**: ftp.hsglobalexport.com
- **Username**: video@hsglobalexport.com
- **Storage Path**: `/home/m6yvujf4sxmn/public_html/videos/products/`
- **Public URL**: `https://www.hsglobalexport.com/videos/products/`
- **Naming**: `product-{productId}-{timestamp}.ext`
- **Example**: `product-ABC123-1738598400000.mp4`

---

## 🚨 Troubleshooting

### "Failed to upload video to GoDaddy"
- Check FTP credentials in `.env`
- Verify FTP server is accessible
- Check firewall/VPS outbound FTP connections

### "Directory not found"
- Verify the exact path: `/home/m6yvujf4sxmn/public_html/videos/products/`
- Ensure `/videos/products/` folder exists in GoDaddy File Manager

### "Video not accessible via URL"
- Check folder permissions in GoDaddy (should be readable)
- Verify public URL: `https://www.hsglobalexport.com/videos/products/`
- Check if `.htaccess` blocks video files

### Video upload is slow
- Videos pass through VPS to GoDaddy
- Consider optimizing/compressing videos before upload
- 10MB limit helps keep uploads reasonable

---

## 📝 Next Steps

1. Run `npm install` in backend
2. Update controller with video handling code above
3. Update routes with `uploadMedia.fields()`
4. Update frontend form
5. Test the complete flow
6. Monitor GoDaddy storage usage

**All code snippets above are ready to copy-paste!** 🚀
