const express = require('express');
const router = express.Router();
const {
    getAdminProducts,
    createProductWithImages,
    updateProductWithImages,
    deleteProductWithImages,
    reorderProductImages,
    replaceProductImage,
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
    getRegionalPricingOverview,
    // Bulk actions
    bulkUpdateStatus,
    bulkDeleteProducts,
    bulkAdjustPrice
} = require('../controllers/adminProductController');

const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { uploadMedia } = require('../utils/cloudinaryUpload');
const { 
    validateDiscountMiddleware, 
    sanitizeDiscountData,
    checkExpiredDiscountMiddleware 
} = require('../middleware/discountValidation');

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
        { name: 'variantImages', maxCount: 50 },
        { name: 'video', maxCount: 1 }
    ]),
    sanitizeDiscountData,
    validateDiscountMiddleware,
    checkExpiredDiscountMiddleware,
    createProductWithImages
);
router.put('/:id',
    uploadMedia.fields([
        { name: 'images', maxCount: 10 },
        { name: 'variantImages', maxCount: 50 },
        { name: 'video', maxCount: 1 }
    ]),
    sanitizeDiscountData,
    validateDiscountMiddleware,
    checkExpiredDiscountMiddleware,
    updateProductWithImages
);
router.delete('/:id', deleteProductWithImages);
router.patch('/:id/reorder-images', reorderProductImages);
router.patch('/:id/replace-image', uploadMedia.single('image'), replaceProductImage);

// Enhanced ecommerce features
router.post('/:id/process-images', 
    uploadMedia.array('images', 10), 
    processProductImages
);
router.patch('/:id/specifications', updateProductSpecifications);
router.patch('/:id/inventory-shipping', updateProductInventoryAndShipping);

// Discount management routes
router.get('/analytics/discounts', getDiscountAnalytics);
router.post('/discounts/disable-expired', disableExpiredDiscounts);
router.get('/discounts/products', getDiscountedProducts);
router.patch('/:id/discount', 
    sanitizeDiscountData,
    validateDiscountMiddleware,
    checkExpiredDiscountMiddleware,
    updateProductDiscount
);
router.delete('/:id/discount', removeProductDiscount);

// Regional pricing routes
router.get('/regional-pricing/overview', getRegionalPricingOverview);
router.post('/regional-pricing/bulk', bulkUpdateRegionalPricing);
router.patch('/:id/regional-pricing', updateProductRegionalPricing);

// Bulk discount operations
router.post('/discounts/apply-all',
    sanitizeDiscountData,
    validateDiscountMiddleware,
    checkExpiredDiscountMiddleware,
    applyDiscountToAll
);
router.post('/discounts/remove-all', removeDiscountFromAll);
router.post('/discounts/apply-bulk',
    sanitizeDiscountData,
    validateDiscountMiddleware,
    checkExpiredDiscountMiddleware,
    applyBulkDiscount
);
router.post('/discounts/remove-bulk', removeBulkDiscount);

// Bulk actions
router.patch('/bulk/status', bulkUpdateStatus);
router.delete('/bulk', bulkDeleteProducts);
router.patch('/bulk/price', bulkAdjustPrice);

module.exports = router;
