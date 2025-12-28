const Order = require('../models/Order');
const crypto = require('crypto');

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

exports.createOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;

        if (!amount) {
            return res.status(400).json({ ok: false, error: 'Amount is required' });
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

        // Save Order to DB
        await Order.create({
            orderId: order.id,
            amount: orderData.amount, // stored in paise
            currency: order.currency,
            status: 'created',
            receipt: orderData.receipt
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
            await Order.findOneAndUpdate(
                { orderId: razorpay_order_id },
                {
                    status: 'paid',
                    paymentId: razorpay_payment_id
                }
            );

            res.json({ ok: true, message: 'Payment verified successfully', valid: true });
        } else {
            // Update Order in DB as failed (optional, but good)
            await Order.findOneAndUpdate(
                { orderId: razorpay_order_id },
                { status: 'failed' }
            );
            res.status(400).json({ ok: false, error: 'Invalid signature', valid: false });
        }

    } catch (error) {
        console.error('Payment verification failed:', error);
        res.status(500).json({ ok: false, error: 'Payment verification failed' });
    }
};
