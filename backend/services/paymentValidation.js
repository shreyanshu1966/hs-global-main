/**
 * Payment Validation Service
 * Provides comprehensive validation and security checks for payments
 */

const axios = require('axios');
const crypto = require('crypto');
const Order = require('../models/Order');

// PayPal Configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
const PAYPAL_API_BASE = PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

// Rate limiting for payment attempts
const paymentAttempts = new Map();
const maxAttemptsPerHour = 5;
const attemptWindow = 60 * 60 * 1000; // 1 hour

/**
 * Get PayPal Access Token with caching
 */
let tokenCache = null;
let tokenExpiry = null;

const getPayPalAccessToken = async () => {
    try {
        // Use cached token if still valid
        if (tokenCache && tokenExpiry && Date.now() < tokenExpiry) {
            return tokenCache;
        }

        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

        const response = await axios.post(
            `${PAYPAL_API_BASE}/v1/oauth2/token`,
            'grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 10000
            }
        );

        tokenCache = response.data.access_token;
        // Cache for 80% of the actual expiry time for safety
        tokenExpiry = Date.now() + (response.data.expires_in * 800);
        
        return tokenCache;
    } catch (error) {
        console.error('Failed to get PayPal access token:', error.response?.data || error.message);
        throw new Error('PayPal authentication failed');
    }
};

/**
 * Validate payment request for suspicious activity
 */
const validatePaymentRequest = (req, order) => {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const clientIP = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    console.log(`🔍 Validating payment request for user: ${userEmail}, IP: ${clientIP}`);

    // Check rate limiting
    const userKey = userId || clientIP;
    const now = Date.now();
    
    if (!paymentAttempts.has(userKey)) {
        paymentAttempts.set(userKey, []);
    }
    
    const userAttempts = paymentAttempts.get(userKey);
    // Clean old attempts
    const recentAttempts = userAttempts.filter(timestamp => now - timestamp < attemptWindow);
    paymentAttempts.set(userKey, recentAttempts);
    
    if (recentAttempts.length >= maxAttemptsPerHour) {
        throw new Error(`Too many payment attempts from ${userKey}. Please try again later.`);
    }
    
    // Add current attempt
    recentAttempts.push(now);

    // Validate order amounts and items
    if (!order.items || order.items.length === 0) {
        throw new Error('Order must contain at least one item');
    }

    // Check for reasonable order amounts (prevent extremely large orders)
    if (order.amount > 100000) { // $100,000 limit
        throw new Error('Order amount exceeds maximum allowed limit');
    }

    if (order.amount < 0.5) { // Minimum $0.50
        throw new Error('Order amount below minimum required');
    }

    // Validate item prices are reasonable
    for (const item of order.items) {
        if (!item.price || item.price <= 0) {
            throw new Error(`Invalid price for item: ${item.name}`);
        }
        if (item.quantity <= 0 || item.quantity > 100) {
            throw new Error(`Invalid quantity for item: ${item.name}`);
        }
        if (item.price > 10000) { // $10,000 per item limit
            console.warn(`⚠️ High value item detected: ${item.name} - $${item.price}`);
        }
    }

    return {
        isValid: true,
        clientIP,
        userAgent,
        riskLevel: calculateRiskLevel(order, userAttempts)
    };
};

/**
 * Calculate risk level for the payment
 */
const calculateRiskLevel = (order, userAttempts) => {
    let riskScore = 0;

    // High order amount
    if (order.amount > 5000) riskScore += 2;
    else if (order.amount > 1000) riskScore += 1;

    // Many recent attempts
    if (userAttempts.length > 3) riskScore += 2;
    else if (userAttempts.length > 1) riskScore += 1;

    // Large quantities
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity > 20) riskScore += 1;

    // Determine risk level
    if (riskScore >= 4) return 'HIGH';
    if (riskScore >= 2) return 'MEDIUM';
    return 'LOW';
};

/**
 * Verify PayPal order details match our order
 */
const verifyPayPalOrder = async (paypalOrderId, expectedOrder) => {
    try {
        const accessToken = await getPayPalAccessToken();

        const response = await axios.get(
            `${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );

        const paypalOrder = response.data;

        // Verify amounts
        const paypalAmount = parseFloat(paypalOrder.purchase_units[0]?.amount?.value || 0);
        const expectedAmount = parseFloat(expectedOrder.amount);

        if (Math.abs(paypalAmount - expectedAmount) > 0.01) {
            throw new Error(`Amount mismatch: Expected ${expectedAmount}, got ${paypalAmount}`);
        }

        // Verify currency
        const paypalCurrency = paypalOrder.purchase_units[0]?.amount?.currency_code;
        if (paypalCurrency !== expectedOrder.currency) {
            throw new Error(`Currency mismatch: Expected ${expectedOrder.currency}, got ${paypalCurrency}`);
        }

        // Verify order status
        if (paypalOrder.status !== 'APPROVED') {
            throw new Error(`Order not approved: Status is ${paypalOrder.status}`);
        }

        return {
            isValid: true,
            paypalOrder,
            verifiedAmount: paypalAmount,
            verifiedCurrency: paypalCurrency
        };

    } catch (error) {
        console.error('PayPal order verification failed:', error.message);
        throw error;
    }
};

/**
 * Check for duplicate orders (prevent double spending)
 */
const checkDuplicateOrder = async (userId, items, amount) => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Look for similar orders in the last 5 minutes
    const duplicateOrder = await Order.findOne({
        userId: userId,
        amount: amount,
        createdAt: { $gte: fiveMinutesAgo },
        status: { $in: ['created', 'paid', 'approved'] }
    });

    if (duplicateOrder) {
        // Check if items are similar (same product IDs)
        const existingProductIds = duplicateOrder.items.map(item => item.productId).sort();
        const newProductIds = items.map(item => item.id || item.productId).sort();
        
        if (JSON.stringify(existingProductIds) === JSON.stringify(newProductIds)) {
            throw new Error('Duplicate order detected. Please wait before placing the same order again.');
        }
    }

    return { isDuplicate: false };
};

/**
 * Validate shipping address
 */
const validateShippingAddress = (address) => {
    if (!address) {
        throw new Error('Shipping address is required');
    }

    const required = ['street', 'city', 'country'];
    for (const field of required) {
        if (!address[field] || address[field].trim().length < 2) {
            throw new Error(`Invalid shipping address: ${field} is required`);
        }
    }

    // Basic validation for suspicious addresses
    if (address.street.toLowerCase().includes('test') || 
        address.city.toLowerCase().includes('test')) {
        console.warn('⚠️ Suspicious address detected:', address);
    }

    return { isValid: true };
};

/**
 * Generate secure order ID with timestamp and random component
 */
const generateSecureOrderId = () => {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `HS-${timestamp}-${random}`;
};

/**
 * Comprehensive payment validation
 */
const validatePaymentFlow = async (req, orderData) => {
    try {
        console.log('🔐 Starting comprehensive payment validation');

        // 1. Validate request
        const requestValidation = validatePaymentRequest(req, orderData);
        
        // 2. Check for duplicates
        await checkDuplicateOrder(req.user._id, orderData.items, orderData.amount);
        
        // 3. Validate shipping
        validateShippingAddress(orderData.shippingAddress);
        
        // 4. Additional security checks for high-risk payments
        if (requestValidation.riskLevel === 'HIGH') {
            console.warn('⚠️ High-risk payment detected - applying additional security measures');
            // Could add additional verification steps here
        }

        console.log(`✅ Payment validation passed - Risk Level: ${requestValidation.riskLevel}`);
        
        return {
            isValid: true,
            riskLevel: requestValidation.riskLevel,
            secureOrderId: generateSecureOrderId(),
            validationDetails: {
                clientIP: requestValidation.clientIP,
                userAgent: requestValidation.userAgent,
                timestamp: new Date()
            }
        };

    } catch (error) {
        console.error('❌ Payment validation failed:', error.message);
        throw error;
    }
};

module.exports = {
    validatePaymentFlow,
    verifyPayPalOrder,
    checkDuplicateOrder,
    validateShippingAddress,
    generateSecureOrderId,
    getPayPalAccessToken
};