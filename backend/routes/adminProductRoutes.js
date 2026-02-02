const express = require('express');
const router = express.Router();
const {
    getAdminProducts,
    createProductWithImages,
    updateProductWithImages,
    deleteProductWithImages,
    reorderProductImages,
    getSubcategories
} = require('../controllers/adminProductController');

const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinaryUpload');

// All routes require authentication and admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

// Admin product routes
router.get('/', getAdminProducts);
router.get('/subcategories/:category', getSubcategories);
router.post('/', upload.array('images', 10), createProductWithImages); // Max 10 images
router.put('/:id', upload.array('images', 10), updateProductWithImages);
router.delete('/:id', deleteProductWithImages);
router.patch('/:id/reorder-images', reorderProductImages);

module.exports = router;
