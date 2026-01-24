const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderConfirmationEmail, sendPaymentFailedEmail } = require('../services/emailService');
const { validatePaymentFlow, verifyPayPalOrder } = require('../services/paymentValidation');
const axios = require('axios');

// PayPal Configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';

// PayPal API Base URLs
const PAYPAL_API_BASE = PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

/**
 * Get PayPal Access Token
 */
const getPayPalAccessToken = async () => {
    try {
        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

        const response = await axios.post(
            `${PAYPAL_API_BASE}/v1/oauth2/token`,
            'grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.error('Failed to get PayPal access token:', error.response?.data || error.message);
        throw new Error('Failed to authenticate with PayPal');
    }
};

/**
 * Create a new PayPal order
 * POST /api/create-order
 */
exports.createOrder = async (req, res) => {
    try {
        const { amount, currency = 'USD', receipt, items, shippingAddress, customer } = req.body;

        // Enhanced validation with comprehensive security checks
        if (!amount || amount <= 0) {
            return res.status(400).json({ ok: false, error: 'Valid amount is required', code: 'INVALID_AMOUNT' });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ ok: false, error: 'Cart items are required', code: 'MISSING_ITEMS' });
        }

        if (!req.user) {
            return res.status(401).json({ ok: false, error: 'Authentication required', code: 'AUTH_REQUIRED' });
        }

        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            console.error('❌ PayPal credentials not configured');
            return res.status(500).json({ ok: false, error: 'Payment system configuration error', code: 'CONFIG_ERROR' });
        }

        // Prepare order data for validation
        const orderData = {
            amount,
            currency,
            items,
            shippingAddress,
            customer
        };

        console.log(`🔍 Creating order for user: ${req.user.email}, amount: ${amount} ${currency}`);

        // Comprehensive payment validation
        const validationResult = await validatePaymentFlow(req, orderData);
        
        if (!validationResult.isValid) {
            return res.status(400).json({ 
                ok: false, 
                error: 'Payment validation failed', 
                code: 'VALIDATION_FAILED' 
            });
        }

        // Enhanced currency validation
        const PAYPAL_SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'SGD'];
        if (!PAYPAL_SUPPORTED_CURRENCIES.includes(currency)) {
            return res.status(400).json({
                ok: false,
                error: `Currency ${currency} not supported by PayPal. Supported: ${PAYPAL_SUPPORTED_CURRENCIES.join(', ')}`,
                code: 'UNSUPPORTED_CURRENCY'
            });
        }

        // Use secure order ID from validation
        const transactionId = validationResult.secureOrderId;

        // Get PayPal access token
        const accessToken = await getPayPalAccessToken();

        // Calculate item total to ensure it matches
        const itemsTotal = items.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * item.quantity);
        }, 0);

        console.log('Order creation debug:', {
            requestedAmount: amount,
            calculatedItemsTotal: itemsTotal.toFixed(2),
            currency: currency,
            itemCount: items.length,
            hasOriginalPrices: items.every(item => item.priceINR !== undefined)
        });

        // Prepare PayPal order request
        // Note: When items are present, PayPal validates that item_total matches sum of items
        const paypalOrderRequest = {
            intent: 'CAPTURE',
            purchase_units: [{
                reference_id: transactionId,
                description: `Order from HS Global Export`,
                custom_id: transactionId,
                soft_descriptor: 'HS GLOBAL',
                amount: {
                    currency_code: currency,
                    value: itemsTotal.toFixed(2), // Use calculated total to ensure it matches items
                    breakdown: {
                        item_total: {
                            currency_code: currency,
                            value: itemsTotal.toFixed(2) // Must match sum of items
                        }
                    }
                },
                items: items.map(item => ({
                    name: item.name.substring(0, 127), // PayPal has 127 char limit
                    description: `${item.category || 'Product'}`.substring(0, 127),
                    sku: (item.id || item.productId).toString().substring(0, 127),
                    unit_amount: {
                        currency_code: currency,
                        value: parseFloat(item.price).toFixed(2)
                    },
                    quantity: item.quantity.toString(),
                    category: 'PHYSICAL_GOODS'
                })),
                shipping: {
                    name: {
                        full_name: customer?.name || req.user.name
                    },
                    address: {
                        address_line_1: shippingAddress?.street || '',
                        address_line_2: shippingAddress?.fullAddress || '',
                        admin_area_2: shippingAddress?.city || '',
                        admin_area_1: shippingAddress?.state || '',
                        postal_code: shippingAddress?.postalCode || '',
                        country_code: getCountryCode(shippingAddress?.country || 'India')
                    }
                }
            }],
            application_context: {
                brand_name: 'HS Global Export',
                landing_page: 'NO_PREFERENCE',
                user_action: 'PAY_NOW',
                return_url: `${process.env.FRONTEND_URL}/checkout-success`,
                cancel_url: `${process.env.FRONTEND_URL}/checkout`
            }
        };

        // Create PayPal order
        const response = await axios.post(
            `${PAYPAL_API_BASE}/v2/checkout/orders`,
            paypalOrderRequest,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const paypalOrder = response.data;

        // Check if order already exists to prevent duplicates
        let existingOrder = await Order.findOne({ 
            $or: [
                { paypalOrderId: paypalOrder.id },
                { orderId: transactionId }
            ]
        });

        let newOrder;
        
        if (existingOrder) {
            console.log(`📋 Order already exists: ${existingOrder.orderId}, status: ${existingOrder.status}`);
            
            // If order is in failed/cancelled state, we can reuse it
            if (['failed', 'cancelled', 'expired'].includes(existingOrder.status)) {
                console.log(`🔄 Reusing failed order: ${existingOrder.orderId}`);
                existingOrder.status = 'payment_pending';
                existingOrder.paypalOrderId = paypalOrder.id;
                existingOrder.updatedAt = new Date();
                existingOrder.attemptCount = (existingOrder.attemptCount || 0) + 1;
                await existingOrder.save();
                newOrder = existingOrder;
            } else {
                // Order is active, return existing
                newOrder = existingOrder;
            }
        } else {
            // Create new order with payment_pending status
            newOrder = await Order.create({
                orderId: transactionId,
                userId: req.user._id,
                amount: amount,
                currency: currency,
                paypalOrderId: paypalOrder.id,
                status: 'payment_pending', // Changed from 'created' to 'payment_pending'
                receipt: receipt || `rcpt_${Date.now()}`,
                riskLevel: validationResult.riskLevel,
                validationDetails: validationResult.validationDetails,
                attemptCount: 1,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes expiry
                items: items.map(item => ({
                    productId: item.id || item.productId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    priceINR: item.priceINR || null,
                    image: item.image,
                    category: item.category
                })),
                shippingAddress: {
                    street: shippingAddress?.street || '',
                    city: shippingAddress?.city || '',
                    state: shippingAddress?.state || '',
                    postalCode: shippingAddress?.postalCode || '',
                    country: shippingAddress?.country || '',
                    fullAddress: shippingAddress?.fullAddress || ''
                },
                customer: {
                    name: customer?.name || req.user.name,
                    email: customer?.email || req.user.email,
                    phone: customer?.phone || req.user.phone
                }
            });
        }

        // Log order creation for security auditing
        console.log(`📝 Order created: ${transactionId} | Risk: ${validationResult.riskLevel} | User: ${req.user.email} | Amount: ${amount} ${currency}`);

        // Add order to user's orders array
        await User.findByIdAndUpdate(req.user._id, {
            $push: { orders: newOrder._id }
        });

        // Find approval URL
        const approvalUrl = paypalOrder.links.find(link => link.rel === 'approve')?.href;

        // Return payment session data with security details
        res.json({
            ok: true,
            orderId: transactionId,
            paypalOrderId: paypalOrder.id,
            approvalUrl: approvalUrl,
            environment: PAYPAL_MODE,
            riskLevel: validationResult.riskLevel,
            orderSummary: {
                amount: amount,
                currency: currency,
                itemCount: items.length,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Order creation failed:', {
            error: error.response?.data || error.message,
            userId: req.user?.id,
            amount: req.body.amount,
            currency: req.body.currency
        });
        
        // Enhanced error response with specific error codes
        let errorCode = 'ORDER_CREATION_FAILED';
        let statusCode = 500;
        
        if (error.message.includes('validation failed')) {
            errorCode = 'VALIDATION_FAILED';
            statusCode = 400;
        } else if (error.message.includes('Duplicate order')) {
            errorCode = 'DUPLICATE_ORDER';
            statusCode = 409;
        } else if (error.message.includes('Too many payment attempts')) {
            errorCode = 'RATE_LIMITED';
            statusCode = 429;
        } else if (error.response?.status === 401) {
            errorCode = 'PAYPAL_AUTH_FAILED';
            statusCode = 502;
        }
        
        res.status(statusCode).json({
            ok: false,
            error: error.response?.data?.message || error.message,
            code: errorCode
        });
    }
};

/**
 * Capture/Verify PayPal payment with enhanced validation and verification
 * POST /api/capture-payment
 */
exports.capturePayment = async (req, res) => {
    const startTime = Date.now();
    const timeoutMs = 30000; // 30 second timeout
    
    try {
        const { paypalOrderId, orderId, payerId } = req.body;

        if (!paypalOrderId && !orderId) {
            return res.status(400).json({ 
                ok: false, 
                error: 'PayPal Order ID or Order ID is required',
                code: 'MISSING_ORDER_ID'
            });
        }

        console.log(`🔍 Starting payment capture for PayPal Order: ${paypalOrderId}`);

        // Find order in database with additional validation
        let order;
        if (orderId) {
            order = await Order.findOne({ orderId: orderId });
        } else {
            order = await Order.findOne({ paypalOrderId: paypalOrderId });
        }

        if (!order) {
            console.error(`❌ Order not found: PayPal ID ${paypalOrderId}, Internal ID: ${orderId}`);
            return res.status(404).json({ 
                ok: false, 
                error: 'Order not found',
                code: 'ORDER_NOT_FOUND'
            });
        }

        // Check if payment is already captured
        if (order.status === 'paid') {
            console.warn(`⚠️ Payment already captured for order: ${order.orderId}`);
            return res.status(200).json({
                ok: true,
                message: 'Payment already captured',
                status: 'COMPLETED',
                order: order,
                code: 'ALREADY_CAPTURED'
            });
        }

        // Check for timeout before proceeding
        if (Date.now() - startTime > timeoutMs) {
            throw new Error('Payment capture timeout');
        }

        // First, verify the order status with PayPal before capturing
        const accessToken = await getPayPalAccessToken();
        
        // Get current order status from PayPal
        const orderStatusResponse = await axios.get(
            `${PAYPAL_API_BASE}/v2/checkout/orders/${order.paypalOrderId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000 // 15 second timeout for API calls
            }
        );

        const currentOrderData = orderStatusResponse.data;
        console.log(`📊 PayPal order status: ${currentOrderData.status}`);

        // Validate order is in approved state
        if (currentOrderData.status !== 'APPROVED') {
            console.error(`❌ Order not in approved state: ${currentOrderData.status}`);
            return res.status(400).json({
                ok: false,
                error: `Order status is ${currentOrderData.status}, cannot capture`,
                status: currentOrderData.status,
                code: 'ORDER_NOT_APPROVED'
            });
        }

        // Verify amounts match (security check)
        const paypalAmount = parseFloat(currentOrderData.purchase_units[0]?.amount?.value || 0);
        const orderAmount = parseFloat(order.amount);
        
        if (Math.abs(paypalAmount - orderAmount) > 0.01) {
            console.error(`❌ Amount mismatch: PayPal ${paypalAmount}, Order ${orderAmount}`);
            return res.status(400).json({
                ok: false,
                error: 'Amount verification failed',
                code: 'AMOUNT_MISMATCH'
            });
        }

        console.log(`💳 Capturing payment for order: ${order.paypalOrderId}`);
        
        // Capture the payment with enhanced error handling
        const captureResponse = await axios.post(
            `${PAYPAL_API_BASE}/v2/checkout/orders/${order.paypalOrderId}/capture`,
            {
                // Add request ID for idempotency
                payment_instruction: {
                    disbursement_mode: 'INSTANT'
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'PayPal-Request-Id': `${order.orderId}-${Date.now()}`, // Idempotency key
                    'Prefer': 'return=representation'
                },
                timeout: 20000 // 20 second timeout for capture
            }
        );

        const captureData = captureResponse.data;
        const captureStatus = captureData.status;
        const captureDetails = captureData.purchase_units[0]?.payments?.captures[0] || {};
        const captureId = captureDetails.id;

        console.log(`📋 Capture response status: ${captureStatus}`);
        console.log(`💰 Capture amount: ${captureDetails.amount?.value} ${captureDetails.amount?.currency_code}`);

        // Enhanced status handling with more granular responses
        if (captureStatus === 'COMPLETED') {
            if (!captureId) {
                console.error('❌ No capture ID returned despite COMPLETED status');
                throw new Error('Invalid capture response - missing capture ID');
            }

            // Additional verification - check capture amount
            const captureAmount = parseFloat(captureDetails.amount?.value || 0);
            if (Math.abs(captureAmount - orderAmount) > 0.01) {
                console.error(`❌ Capture amount mismatch: Expected ${orderAmount}, Got ${captureAmount}`);
                throw new Error('Capture amount verification failed');
            }

            // Update order with comprehensive details
            order.status = 'paid';
            order.paymentId = captureId;
            order.deliveryStatus = 'processing';
            order.paymentDetails = {
                captureId: captureId,
                capturedAt: new Date(),
                captureAmount: captureAmount,
                captureCurrency: captureDetails.amount?.currency_code || order.currency,
                paypalStatus: captureStatus,
                paypalFeeAmount: captureDetails.seller_receivable_breakdown?.paypal_fee?.value || null,
                netAmount: captureDetails.seller_receivable_breakdown?.net_amount?.value || null
            };
            
            await order.save();
            console.log(`✅ Order ${order.orderId} successfully marked as paid`);

            // Get user details for email notification
            const user = await User.findById(order.userId);

            if (user) {
                // Send order confirmation email (async, don't wait)
                sendOrderConfirmationEmail(
                    user.email,
                    user.name,
                    {
                        orderId: order.orderId,
                        paymentId: order.paymentId,
                        amount: order.amount,
                        currency: order.currency,
                        items: order.items,
                        shippingAddress: order.shippingAddress,
                        customer: order.customer,
                        createdAt: order.createdAt,
                        paymentDetails: order.paymentDetails
                    }
                ).catch(err => console.error('📧 Email sending failed:', err));
            }

            res.json({
                ok: true,
                message: 'Payment captured successfully',
                status: captureStatus,
                order: {
                    ...order.toObject(),
                    // Remove sensitive details from response
                    paymentDetails: {
                        captureId: order.paymentDetails.captureId,
                        capturedAt: order.paymentDetails.capturedAt,
                        status: captureStatus
                    }
                },
                captureId: captureId
            });
            
        } else if (captureStatus === 'PENDING') {
            // Handle pending payments
            order.status = 'pending_payment';
            order.paymentId = captureId;
            order.paymentDetails = {
                captureId: captureId || null,
                pendingSince: new Date(),
                paypalStatus: captureStatus,
                reasonCode: captureDetails.status_details?.reason || 'PENDING_REVIEW'
            };
            await order.save();
            
            console.log(`⏳ Payment pending for order: ${order.orderId} - Reason: ${captureDetails.status_details?.reason}`);

            res.json({
                ok: true,
                message: 'Payment is pending verification',
                status: captureStatus,
                order: order,
                pendingReason: captureDetails.status_details?.reason
            });
            
        } else {
            // Payment failed, declined, or other non-success status
            const failureReason = captureDetails.status_details?.reason || captureStatus || 'CAPTURE_FAILED';
            
            order.status = 'payment_failed';
            order.failureReason = failureReason;
            order.failureCount = (order.failureCount || 0) + 1;
            order.paymentDetails = {
                failedAt: new Date(),
                paypalStatus: captureStatus,
                reasonCode: captureDetails.status_details?.reason,
                failureDetails: captureDetails.status_details,
                failureCount: order.failureCount
            };

            // If too many failures, mark as permanently failed
            if (order.failureCount >= 3) {
                order.status = 'permanently_failed';
                order.permanentlyFailedAt = new Date();
            }

            await order.save();

            console.error(`❌ Payment capture failed for order: ${order.orderId} - Status: ${captureStatus}, Attempt: ${order.failureCount}`);

            // Get user details for failure email
            const user = await User.findById(order.userId);

            if (user && order.failureCount <= 3) {
                // Send payment failed email with retry option (async)
                sendPaymentFailedEmail(
                    user.email,
                    user.name,
                    {
                        orderId: order.orderId,
                        amount: order.amount,
                        failureReason: order.failureReason,
                        canRetry: order.failureCount < 3,
                        attemptCount: order.failureCount,
                        retryUrl: `${process.env.FRONTEND_URL}/checkout?retry=${order.orderId}`
                    }
                ).catch(err => console.error('📧 Failure email sending failed:', err));
            }

            res.status(400).json({
                ok: false,
                error: 'Payment capture failed',
                status: captureStatus,
                reason: failureReason,
                canRetry: order.failureCount < 3,
                attemptCount: order.failureCount,
                orderId: order.orderId,
                code: 'CAPTURE_FAILED'
            });
        }

    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error(`❌ Payment capture failed after ${processingTime}ms:`, error.response?.data || error.message);
        
        // Enhanced error handling with specific error codes
        let errorCode = 'CAPTURE_ERROR';
        let errorMessage = 'Payment capture failed';
        let statusCode = 500;

        if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
            errorCode = 'NETWORK_TIMEOUT';
            errorMessage = 'Network timeout during payment processing';
            statusCode = 504;
        } else if (error.response?.status === 401) {
            errorCode = 'AUTH_FAILED';
            errorMessage = 'PayPal authentication failed';
            statusCode = 502;
        } else if (error.response?.status === 404) {
            errorCode = 'ORDER_NOT_FOUND_PAYPAL';
            errorMessage = 'Order not found on PayPal';
            statusCode = 404;
        } else if (error.response?.status >= 400 && error.response?.status < 500) {
            errorCode = 'PAYPAL_CLIENT_ERROR';
            errorMessage = error.response?.data?.message || 'PayPal client error';
            statusCode = 400;
        } else if (error.response?.status >= 500) {
            errorCode = 'PAYPAL_SERVER_ERROR';
            errorMessage = 'PayPal server error';
            statusCode = 502;
        }

        // Log error details for debugging
        console.error('Error details:', {
            orderPaypalId: order?.paypalOrderId,
            orderInternalId: order?.orderId,
            errorCode,
            errorMessage,
            processingTime,
            paypalResponse: error.response?.data
        });

        // Update order status if we have an order object
        if (order) {
            try {
                order.status = 'capture_error';
                order.failureReason = errorCode;
                order.failureCount = (order.failureCount || 0) + 1;
                order.lastErrorAt = new Date();
                order.paymentDetails = {
                    failedAt: new Date(),
                    errorCode,
                    errorMessage,
                    processingTime,
                    failureCount: order.failureCount
                };
                
                // Mark as permanently failed if too many errors
                if (order.failureCount >= 5) {
                    order.status = 'permanently_failed';
                    order.permanentlyFailedAt = new Date();
                }
                
                await order.save();
            } catch (saveError) {
                console.error('Failed to update order after capture error:', saveError);
            }
        }

        res.status(statusCode).json({
            ok: false,
            error: errorMessage,
            code: errorCode,
            canRetry: order ? order.failureCount < 5 : false,
            orderId: order?.orderId,
            processingTime
        });
    }
};

/**
 * Get payment status
 * GET /api/payment-status/:paypalOrderId
 */
exports.getPaymentStatus = async (req, res) => {
    try {
        const { paypalOrderId } = req.params;

        if (!paypalOrderId) {
            return res.status(400).json({ ok: false, error: 'PayPal Order ID is required' });
        }

        // Get PayPal access token
        const accessToken = await getPayPalAccessToken();

        // Get order details from PayPal
        const response = await axios.get(
            `${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const orderData = response.data;

        res.json({
            ok: true,
            status: orderData.status,
            data: orderData
        });

    } catch (error) {
        console.error('Failed to get payment status:', error.response?.data || error.message);
        res.status(500).json({
            ok: false,
            error: error.response?.data?.message || 'Failed to get payment status'
        });
    }
};

/**
 * Payment callback/webhook handler
 * POST /api/payment-callback
 */
exports.paymentCallback = async (req, res) => {
    try {
        const webhookData = req.body;
        const eventType = webhookData.event_type;
        const resource = webhookData.resource;

        console.log('PayPal webhook received:', eventType);

        if (eventType === 'CHECKOUT.ORDER.APPROVED') {
            // Order was approved, but not yet captured
            const paypalOrderId = resource.id;
            await Order.findOneAndUpdate(
                { paypalOrderId: paypalOrderId },
                { status: 'approved' }
            );
        } else if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
            // Payment was captured successfully
            const captureId = resource.id;
            const paypalOrderId = resource.supplementary_data?.related_ids?.order_id;

            if (paypalOrderId) {
                const order = await Order.findOneAndUpdate(
                    { paypalOrderId: paypalOrderId },
                    {
                        status: 'paid',
                        paymentId: captureId,
                        deliveryStatus: 'processing',
                        paymentDetails: {
                            captureId: captureId,
                            capturedAt: new Date(),
                            captureAmount: resource.amount?.value,
                            captureCurrency: resource.amount?.currency_code,
                            paypalStatus: 'COMPLETED'
                        }
                    },
                    { new: true }
                );

                if (order) {
                    // Get user details for email
                    const user = await User.findById(order.userId);
                    if (user) {
                        sendOrderConfirmationEmail(
                            user.email,
                            user.name,
                            {
                                orderId: order.orderId,
                                paymentId: order.paymentId,
                                amount: order.amount,
                                items: order.items,
                                shippingAddress: order.shippingAddress,
                                customer: order.customer,
                                createdAt: order.createdAt
                            }
                        ).catch(err => console.error('Email sending failed:', err));
                    }
                }
            }
        } else if (eventType === 'PAYMENT.CAPTURE.DENIED' || eventType === 'CHECKOUT.ORDER.VOIDED') {
            // Payment failed
            const paypalOrderId = resource.id;
            await Order.findOneAndUpdate(
                { paypalOrderId: paypalOrderId },
                { status: 'failed' }
            );
        }

        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Payment callback error:', error);
        res.status(200).json({ ok: true }); // Still return 200 to prevent retries
    }
};

/**
 * Helper function to convert country name to ISO 3166-1 alpha-2 code
 */
function getCountryCode(countryName) {
    const countryMap = {
        'India': 'IN',
        'United States': 'US',
        'United Kingdom': 'GB',
        'Canada': 'CA',
        'Australia': 'AU',
        'United Arab Emirates': 'AE',
        'Germany': 'DE',
        'France': 'FR',
        'Singapore': 'SG',
        'Japan': 'JP',
        'South Korea': 'KR',
        'Netherlands': 'NL',
        'Switzerland': 'CH',
        'Sweden': 'SE',
        'Norway': 'NO',
        'Denmark': 'DK',
        'Finland': 'FI'
    };
    return countryMap[countryName] || 'IN';
}

/**
 * Cancel expired or failed orders
 * This should be run as a cron job to cleanup orders
 */
exports.cleanupExpiredOrders = async (req, res) => {
    try {
        const currentTime = new Date();
        const oneHourAgo = new Date(currentTime - 60 * 60 * 1000); // 1 hour
        const oneDayAgo = new Date(currentTime - 24 * 60 * 60 * 1000); // 24 hours

        // Cancel orders that are payment_pending for more than 1 hour
        const expiredPendingOrders = await Order.updateMany(
            {
                status: 'payment_pending',
                createdAt: { $lt: oneHourAgo }
            },
            {
                status: 'expired',
                expiredAt: currentTime
            }
        );

        // Mark orders as abandoned if they've been in failed state for 24 hours
        const abandonedOrders = await Order.updateMany(
            {
                status: { $in: ['payment_failed', 'capture_error'] },
                lastErrorAt: { $lt: oneDayAgo }
            },
            {
                status: 'abandoned',
                abandonedAt: currentTime
            }
        );

        console.log(`🧹 Cleanup completed: ${expiredPendingOrders.modifiedCount} expired, ${abandonedOrders.modifiedCount} abandoned`);

        if (res) {
            res.json({
                ok: true,
                expiredOrders: expiredPendingOrders.modifiedCount,
                abandonedOrders: abandonedOrders.modifiedCount
            });
        }

    } catch (error) {
        console.error('Order cleanup failed:', error);
        if (res) {
            res.status(500).json({ ok: false, error: 'Cleanup failed' });
        }
    }
};

/**
 * Retry payment for a failed order
 * POST /api/retry-payment
 */
exports.retryPayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ ok: false, error: 'Order ID is required' });
        }

        const order = await Order.findOne({ orderId: orderId });

        if (!order) {
            return res.status(404).json({ ok: false, error: 'Order not found' });
        }

        // Check if retry is allowed
        if (order.status === 'permanently_failed') {
            return res.status(400).json({ 
                ok: false, 
                error: 'Order has permanently failed, retry not allowed',
                code: 'PERMANENTLY_FAILED'
            });
        }

        if (order.failureCount >= 3) {
            return res.status(400).json({
                ok: false,
                error: 'Maximum retry attempts exceeded',
                code: 'MAX_RETRIES_EXCEEDED'
            });
        }

        // Check if user owns this order
        if (req.user && order.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                ok: false,
                error: 'Unauthorized to retry this order',
                code: 'UNAUTHORIZED'
            });
        }

        // Reset order for retry
        order.status = 'payment_pending';
        order.retryCount = (order.retryCount || 0) + 1;
        order.lastRetryAt = new Date();
        order.failureReason = null;
        
        // Create new PayPal order for retry
        const accessToken = await getPayPalAccessToken();

        const paypalOrderRequest = {
            intent: 'CAPTURE',
            purchase_units: [{
                reference_id: order.orderId,
                description: `Retry order from HS Global Export`,
                custom_id: order.orderId,
                soft_descriptor: 'HS GLOBAL',
                amount: {
                    currency_code: order.currency,
                    value: order.amount.toFixed(2),
                    breakdown: {
                        item_total: {
                            currency_code: order.currency,
                            value: order.amount.toFixed(2)
                        }
                    }
                },
                items: order.items.map(item => ({
                    name: item.name.substring(0, 127),
                    description: `${item.category || 'Product'}`.substring(0, 127),
                    sku: (item.productId).toString().substring(0, 127),
                    unit_amount: {
                        currency_code: order.currency,
                        value: parseFloat(item.price).toFixed(2)
                    },
                    quantity: item.quantity.toString(),
                    category: 'PHYSICAL_GOODS'
                }))
            }],
            application_context: {
                brand_name: 'HS Global Export',
                landing_page: 'NO_PREFERENCE',
                user_action: 'PAY_NOW',
                return_url: `${process.env.FRONTEND_URL}/checkout-success`,
                cancel_url: `${process.env.FRONTEND_URL}/checkout?retry=${orderId}`
            }
        };

        const response = await axios.post(
            `${PAYPAL_API_BASE}/v2/checkout/orders`,
            paypalOrderRequest,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const paypalOrder = response.data;
        order.paypalOrderId = paypalOrder.id;
        await order.save();

        const approvalUrl = paypalOrder.links.find(link => link.rel === 'approve')?.href;

        res.json({
            ok: true,
            orderId: order.orderId,
            paypalOrderId: paypalOrder.id,
            approvalUrl: approvalUrl,
            retryCount: order.retryCount,
            message: 'Order prepared for retry'
        });

    } catch (error) {
        console.error('Payment retry failed:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to retry payment',
            details: error.message
        });
    }
};

/**
 * Get order details by order ID
 * GET /api/order/:orderId
 */
exports.getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await Order.findOne({ orderId: orderId })
            .populate('userId', 'name email')
            .lean();

        if (!order) {
            return res.status(404).json({ ok: false, error: 'Order not found' });
        }

        // Check if user owns this order (if authenticated)
        if (req.user && order.userId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                ok: false,
                error: 'Unauthorized to view this order'
            });
        }

        res.json({
            ok: true,
            order: {
                orderId: order.orderId,
                status: order.status,
                amount: order.amount,
                currency: order.currency,
                items: order.items,
                shippingAddress: order.shippingAddress,
                customer: order.customer,
                createdAt: order.createdAt,
                canRetry: ['payment_failed', 'capture_error', 'expired'].includes(order.status) && (order.failureCount || 0) < 3,
                failureCount: order.failureCount || 0,
                retryCount: order.retryCount || 0,
                paymentDetails: order.paymentDetails
            }
        });

    } catch (error) {
        console.error('Failed to get order details:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to get order details'
        });
    }
};

/**
 * Helper function to convert country name to ISO 3166-1 alpha-2 code
 */
function getCountryCode(countryName) {
    const countryMap = {
        'India': 'IN',
        'United States': 'US',
        'United Kingdom': 'GB',
        'Canada': 'CA',
        'Australia': 'AU',
        'United Arab Emirates': 'AE',
        'Germany': 'DE',
        'France': 'FR',
        'Singapore': 'SG'
    };
    return countryMap[countryName] || 'IN';
}
