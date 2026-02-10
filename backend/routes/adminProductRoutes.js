const express = require('express');
const router = express.Router();
const {
    getAdminProducts,
    createProductWithImages,
    updateProductWithImages,
    deleteProductWithImages,
    reorderProductImages,
    getSubcategories,
    previewProduct
} = require('../controllers/adminProductController');

const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { uploadMedia } = require('../utils/cloudinaryUpload');

// All routes require authentication and admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

// Admin product routes
router.get('/', getAdminProducts);
router.get('/subcategories/:category', getSubcategories);
router.post('/preview', 
    uploadMedia.fields([
        { name: 'images', maxCount: 10 },
        { name: 'video', maxCount: 1 }
    ]), 
    previewProduct
);
router.post('/', 
    uploadMedia.fields([
        { name: 'images', maxCount: 10 },
        { name: 'video', maxCount: 1 }
    ]), 
    createProductWithImages
);
router.put('/:id', 
    uploadMedia.fields([
        { name: 'images', maxCount: 10 },
        { name: 'video', maxCount: 1 }
    ]), 
    updateProductWithImages
);
router.delete('/:id', deleteProductWithImages);
router.patch('/:id/reorder-images', reorderProductImages);

module.exports = router;
