const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderConfirmationEmail, sendPaymentFailedEmail } = require('../services/emailService');
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

        if (!amount) {
            return res.status(400).json({ ok: false, error: 'Amount is required' });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ ok: false, error: 'Cart items are required' });
        }

        if (!req.user) {
            return res.status(401).json({ ok: false, error: 'Authentication required' });
        }

        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            return res.status(500).json({ ok: false, error: 'PayPal credentials not configured' });
        }

        // Validate currency - PayPal supports specific currencies
        const PAYPAL_SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'SGD'];
        if (!PAYPAL_SUPPORTED_CURRENCIES.includes(currency)) {
            return res.status(400).json({
                ok: false,
                error: `Currency ${currency} not supported by PayPal. Supported: ${PAYPAL_SUPPORTED_CURRENCIES.join(', ')}`
            });
        }

        // Generate unique transaction ID
        const transactionId = `HS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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

        // Save Order to DB
        const newOrder = await Order.create({
            orderId: transactionId,
            userId: req.user._id,
            amount: amount,
            currency: currency,
            paypalOrderId: paypalOrder.id,
            status: 'created',
            receipt: receipt || `receipt_${Date.now()}`,
            items: items.map(item => ({
                productId: item.id || item.productId,
                name: item.name,
                quantity: item.quantity,
                price: item.price, // Converted price in payment currency
                priceINR: item.priceINR || null, // Original INR price for audit trail
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

        // Add order to user's orders array
        await User.findByIdAndUpdate(req.user._id, {
            $push: { orders: newOrder._id }
        });

        // Find approval URL
        const approvalUrl = paypalOrder.links.find(link => link.rel === 'approve')?.href;

        // Return payment session data
        res.json({
            ok: true,
            orderId: transactionId,
            paypalOrderId: paypalOrder.id,
            approvalUrl: approvalUrl,
            environment: PAYPAL_MODE
        });

    } catch (error) {
        console.error('Order creation failed:', error.response?.data || error.message);
        res.status(500).json({
            ok: false,
            error: error.response?.data?.message || error.message
        });
    }
};

/**
 * Capture/Verify PayPal payment
 * POST /api/capture-payment
 */
exports.capturePayment = async (req, res) => {
    try {
        const { paypalOrderId, orderId } = req.body;

        if (!paypalOrderId && !orderId) {
            return res.status(400).json({ ok: false, error: 'PayPal Order ID or Order ID is required' });
        }

        // Find order in database
        let order;
        if (orderId) {
            order = await Order.findOne({ orderId: orderId });
        } else {
            order = await Order.findOne({ paypalOrderId: paypalOrderId });
        }

        if (!order) {
            return res.status(404).json({ ok: false, error: 'Order not found' });
        }

        // Get PayPal access token
        const accessToken = await getPayPalAccessToken();

        // Capture the payment
        const response = await axios.post(
            `${PAYPAL_API_BASE}/v2/checkout/orders/${order.paypalOrderId}/capture`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const captureData = response.data;
        const captureStatus = captureData.status;

        // Update Order in DB based on payment status
        if (captureStatus === 'COMPLETED') {
            const captureId = captureData.purchase_units[0]?.payments?.captures[0]?.id;

            order.status = 'paid';
            order.paymentId = captureId;
            order.deliveryStatus = 'processing';
            await order.save();

            // Get user details for email
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
                        items: order.items,
                        shippingAddress: order.shippingAddress,
                        customer: order.customer,
                        createdAt: order.createdAt
                    }
                ).catch(err => console.error('Email sending failed:', err));
            }

            res.json({
                ok: true,
                message: 'Payment captured successfully',
                status: captureStatus,
                order: order
            });
        } else {
            // Payment failed or is pending
            order.status = 'failed';
            await order.save();

            // Get user details for email
            const user = await User.findById(order.userId);

            if (user) {
                // Send payment failed email (async, don't wait)
                sendPaymentFailedEmail(
                    user.email,
                    user.name,
                    {
                        orderId: order.orderId,
                        amount: order.amount
                    }
                ).catch(err => console.error('Email sending failed:', err));
            }

            res.status(400).json({
                ok: false,
                error: 'Payment capture failed',
                status: captureStatus
            });
        }

    } catch (error) {
        console.error('Payment capture failed:', error.response?.data || error.message);
        res.status(500).json({
            ok: false,
            error: error.response?.data?.message || 'Payment capture failed'
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
                        deliveryStatus: 'processing'
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
        'Singapore': 'SG'
    };
    return countryMap[countryName] || 'IN';
}
