/**
 * Middleware for validating product discount data
 * Ensures discount configuration is valid before saving to database
 */

/**
 * Validate discount configuration
 * @param {Object} discount - Discount object to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
const validateDiscountConfig = (discount) => {
    const errors = [];
    
    if (!discount) {
        return { valid: true, errors: [] }; // No discount is valid
    }
    
    // If discount is enabled, validate all fields
    if (discount.enabled) {
        // Percentage validation
        if (typeof discount.percentage !== 'number' || discount.percentage <= 0) {
            errors.push('Discount percentage must be greater than 0 when discount is enabled');
        }
        
        if (discount.percentage > 100) {
            errors.push('Discount percentage cannot exceed 100%');
        }
        
        if (discount.percentage < 0) {
            errors.push('Discount percentage cannot be negative');
        }
        
        // Date range validation
        if (discount.startDate && discount.endDate) {
            const startDate = new Date(discount.startDate);
            const endDate = new Date(discount.endDate);
            
            if (isNaN(startDate.getTime())) {
                errors.push('Invalid discount start date');
            }
            
            if (isNaN(endDate.getTime())) {
                errors.push('Invalid discount end date');
            }
            
            if (startDate >= endDate) {
                errors.push('Discount start date must be before end date');
            }
        }
        
        // Validate individual dates
        if (discount.startDate && isNaN(new Date(discount.startDate).getTime())) {
            errors.push('Invalid discount start date format');
        }
        
        if (discount.endDate && isNaN(new Date(discount.endDate).getTime())) {
            errors.push('Invalid discount end date format');
        }
        
        // Description validation
        if (discount.description && discount.description.length > 200) {
            errors.push('Discount description cannot exceed 200 characters');
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Middleware to validate discount data in request body
 */
const validateDiscountMiddleware = (req, res, next) => {
    try {
        let discount = null;
        
        // Extract discount from various possible locations
        if (req.body.discount) {
            discount = req.body.discount;
        } else if (req.body.productData) {
            // Handle multipart form data
            const productData = typeof req.body.productData === 'string' 
                ? JSON.parse(req.body.productData) 
                : req.body.productData;
            discount = productData.discount;
        }
        
        // If no discount data, skip validation
        if (!discount) {
            return next();
        }
        
        // Validate discount configuration
        const validation = validateDiscountConfig(discount);
        
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid discount configuration',
                errors: validation.errors
            });
        }
        
        next();
    } catch (error) {
        console.error('Discount validation error:', error);
        return res.status(400).json({
            success: false,
            message: 'Error validating discount data',
            error: error.message
        });
    }
};

/**
 * Middleware to check for expired discounts and warn
 */
const checkExpiredDiscountMiddleware = async (req, res, next) => {
    try {
        let discount = null;
        
        if (req.body.discount) {
            discount = req.body.discount;
        } else if (req.body.productData) {
            const productData = typeof req.body.productData === 'string' 
                ? JSON.parse(req.body.productData) 
                : req.body.productData;
            discount = productData.discount;
        }
        
        if (!discount || !discount.enabled || !discount.endDate) {
            return next();
        }
        
        const now = new Date();
        const endDate = new Date(discount.endDate);
        
        // Warn if end date is in the past
        if (endDate < now) {
            console.warn(`⚠️  Attempting to enable discount that has already expired: ${discount.endDate}`);
            // Don't block, just warn
        }
        
        next();
    } catch (error) {
        // Don't fail on this check, just log and continue
        console.error('Expired discount check error:', error);
        next();
    }
};

/**
 * Sanitize discount data before saving
 */
const sanitizeDiscountData = (req, res, next) => {
    try {
        let discount = null;
        let productData = null;
        
        if (req.body.discount) {
            discount = req.body.discount;
        } else if (req.body.productData) {
            productData = typeof req.body.productData === 'string' 
                ? JSON.parse(req.body.productData) 
                : req.body.productData;
            discount = productData.discount;
        }
        
        if (!discount) {
            return next();
        }
        
        // Sanitize percentage
        if (typeof discount.percentage === 'string') {
            discount.percentage = parseFloat(discount.percentage) || 0;
        }
        
        // Round to 2 decimal places
        if (discount.percentage) {
            discount.percentage = Math.round(discount.percentage * 100) / 100;
        }
        
        // Ensure percentage is within bounds
        if (discount.percentage < 0) discount.percentage = 0;
        if (discount.percentage > 100) discount.percentage = 100;
        
        // Normalize date fields
        if (discount.startDate === '') discount.startDate = null;
        if (discount.endDate === '') discount.endDate = null;
        
        // Trim description
        if (discount.description) {
            discount.description = discount.description.trim();
        }
        
        // If discount is disabled, optionally clear dates (commented out to preserve history)
        // if (!discount.enabled) {
        //     discount.startDate = null;
        //     discount.endDate = null;
        // }
        
        // Update the request body
        if (productData) {
            productData.discount = discount;
            req.body.productData = typeof req.body.productData === 'string'
                ? JSON.stringify(productData)
                : productData;
        } else {
            req.body.discount = discount;
        }
        
        next();
    } catch (error) {
        console.error('Discount sanitization error:', error);
        next(); // Continue even if sanitization fails
    }
};

module.exports = {
    validateDiscountConfig,
    validateDiscountMiddleware,
    checkExpiredDiscountMiddleware,
    sanitizeDiscountData
};
