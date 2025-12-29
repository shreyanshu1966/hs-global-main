const Order = require('../models/Order');
const User = require('../models/User');
const crypto = require('crypto');
const { sendOrderConfirmationEmail, sendPaymentFailedEmail } = require('../services/emailService');

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

exports.createOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt, items, shippingAddress, customer } = req.body;

        if (!amount) {
            return res.status(400).json({ ok: false, error: 'Amount is required' });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ ok: false, error: 'Cart items are required' });
        }

        if (!req.user) {
            return res.status(401).json({ ok: false, error: 'Authentication required' });
        }

        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            return res.status(500).json({ ok: false, error: 'Razorpay credentials not configured' });
        }

        const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

        const orderData = {
            amount: parseInt(amount) * 100, // Convert to paise
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
        };

        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        const order = await response.json();

        if (!response.ok) {
            throw new Error(order.error?.description || 'Failed to create order');
        }

        // Save Order to DB with all details
        const newOrder = await Order.create({
            orderId: order.id,
            userId: req.user._id,
            amount: orderData.amount, // stored in paise
            currency: order.currency,
            status: 'created',
            receipt: orderData.receipt,
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

        // Return order and Key ID (frontend needs Key ID)
        res.json({ ok: true, order, keyId: RAZORPAY_KEY_ID });

    } catch (error) {
        console.error('Order creation failed:', error);
        res.status(500).json({ ok: false, error: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ ok: false, error: 'Missing payment details' });
        }

        // Verify Signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update Order in DB
            const order = await Order.findOneAndUpdate(
                { orderId: razorpay_order_id },
                {
                    status: 'paid',
                    paymentId: razorpay_payment_id,
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

            res.json({ ok: true, message: 'Payment verified successfully', valid: true });
        } else {
            // Update Order in DB as failed
            const order = await Order.findOneAndUpdate(
                { orderId: razorpay_order_id },
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

            res.status(400).json({ ok: false, error: 'Invalid signature', valid: false });
        }

    } catch (error) {
        console.error('Payment verification failed:', error);
        res.status(500).json({ ok: false, error: 'Payment verification failed' });
    }
};

