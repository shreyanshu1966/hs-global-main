const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderConfirmationEmail, sendPaymentFailedEmail } = require('../services/emailService');

// PayPal SDK
const paypalSdk = require('@paypal/paypal-server-sdk');
const { Client, Environment, LogLevel } = paypalSdk;

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_ENVIRONMENT = process.env.PAYPAL_ENVIRONMENT || 'sandbox';

// Configure PayPal client
const paypalClient = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: PAYPAL_CLIENT_ID,
        oAuthClientSecret: PAYPAL_CLIENT_SECRET,
    },
    environment: PAYPAL_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox,
    logging: {
        logLevel: LogLevel.Info,
        logRequest: { logBody: true },
        logResponse: { logHeaders: true },
    },
});

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

        // Check if this is just a request for client credentials (dummy amount = 1)
        if (amount === 1 && items.length === 1 && items[0].name === 'dummy') {
            return res.json({
                ok: true,
                clientId: PAYPAL_CLIENT_ID,
                environment: PAYPAL_ENVIRONMENT
            });
        }

        // Convert INR to USD if needed (assuming 1 INR = 0.012 USD, you should use a real exchange rate API)
        let finalAmount = amount;
        let finalCurrency = currency;

        if (currency === 'INR') {
            // Convert INR to USD for PayPal (PayPal doesn't support INR in all regions)
            finalAmount = (amount * 0.012).toFixed(2); // You should use a real exchange rate API
            finalCurrency = 'USD';
        }

        // Create PayPal order using new SDK
        const collect = {
            body: {
                intent: paypalSdk.OrdersCreateInputIntent.Capture,
                purchaseUnits: [{
                    amount: {
                        currencyCode: finalCurrency,
                        value: finalAmount.toString()
                    },
                    description: `Order from HS Global Export - ${items.length} items`,
                    shipping: {
                        name: {
                            fullName: customer?.name || req.user.name
                        },
                        address: {
                            addressLine1: shippingAddress?.street || '',
                            adminArea2: shippingAddress?.city || '',
                            adminArea1: shippingAddress?.state || '',
                            postalCode: shippingAddress?.postalCode || '',
                            countryCode: shippingAddress?.country === 'India' ? 'IN' : 'US'
                        }
                    }
                }],
                applicationContext: {
                    returnUrl: `${process.env.FRONTEND_URL}/checkout-success`,
                    cancelUrl: `${process.env.FRONTEND_URL}/checkout`,
                    shippingPreference: paypalSdk.ShippingPreference.SetProvidedAddress,
                    userAction: paypalSdk.UserAction.PayNow
                }
            }
        };

        const { result: order } = await paypalClient.orders.create(collect);

        // Save Order to DB with all details
        const newOrder = await Order.create({
            orderId: order.id,
            userId: req.user._id,
            amount: amount, // Store original amount in INR
            currency: currency, // Store original currency
            paypalAmount: finalAmount, // Store PayPal amount
            paypalCurrency: finalCurrency, // Store PayPal currency
            status: 'created',
            receipt: receipt || `receipt_${Date.now()}`,
            items: items.map(item => ({
                productId: item.id || item.productId,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
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

        // Return order and client ID (frontend needs client ID)
        res.json({
            ok: true,
            order: order,
            clientId: PAYPAL_CLIENT_ID,
            environment: PAYPAL_ENVIRONMENT
        });

    } catch (error) {
        console.error('Order creation failed:', error);
        res.status(500).json({ ok: false, error: error.message });
    }
};

exports.capturePayment = async (req, res) => {
    try {
        const { orderID } = req.body;

        if (!orderID) {
            return res.status(400).json({ ok: false, error: 'OrderID is required' });
        }

        // Capture the PayPal payment using new SDK
        const collect = {
            id: orderID,
            body: {}
        };

        const { result: capture } = await paypalClient.orders.capture(collect);

        if (capture.status === 'COMPLETED') {
            // Update Order in DB
            const order = await Order.findOneAndUpdate(
                { orderId: orderID },
                {
                    status: 'paid',
                    paymentId: capture.purchaseUnits[0].payments.captures[0].id,
                    deliveryStatus: 'processing' // Auto-update delivery status
                },
                { new: true } // Return updated document
            );

            if (order) {
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
            }

            res.json({ ok: true, message: 'Payment captured successfully', capture: capture });
        } else {
            // Update Order in DB as failed
            const order = await Order.findOneAndUpdate(
                { orderId: orderID },
                { status: 'failed' },
                { new: true }
            );

            if (order) {
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
            }

            res.status(400).json({ ok: false, error: 'Payment capture failed', capture: capture });
        }

    } catch (error) {
        console.error('Payment capture failed:', error);
        res.status(500).json({ ok: false, error: 'Payment capture failed' });
    }
};

