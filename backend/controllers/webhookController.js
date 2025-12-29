const crypto = require('crypto');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderConfirmationEmail, sendPaymentFailedEmail } = require('../services/emailService');

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

/**
 * Razorpay Webhook Handler
 * Handles payment status updates from Razorpay
 * Provides redundancy in case frontend verification fails
 */
exports.handleRazorpayWebhook = async (req, res) => {
    try {
        // Verify webhook signature
        const webhookSignature = req.headers['x-razorpay-signature'];

        if (!webhookSignature) {
            console.error('❌ Webhook signature missing');
            return res.status(400).json({ ok: false, error: 'Signature missing' });
        }

        // Verify the webhook signature
        const body = JSON.stringify(req.body);
        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
            .update(body)
            .digest('hex');

        const isAuthentic = expectedSignature === webhookSignature;

        if (!isAuthentic) {
            console.error('❌ Invalid webhook signature');
            return res.status(400).json({ ok: false, error: 'Invalid signature' });
        }

        // Process the webhook event
        const event = req.body.event;
        const payload = req.body.payload;

        console.log(`📨 Webhook received: ${event}`);

        switch (event) {
            case 'payment.authorized':
                await handlePaymentAuthorized(payload);
                break;

            case 'payment.captured':
                await handlePaymentCaptured(payload);
                break;

            case 'payment.failed':
                await handlePaymentFailed(payload);
                break;

            case 'order.paid':
                await handleOrderPaid(payload);
                break;

            default:
                console.log(`ℹ️ Unhandled webhook event: ${event}`);
        }

        // Always return 200 to acknowledge receipt
        res.status(200).json({ ok: true, message: 'Webhook processed' });

    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        // Still return 200 to prevent Razorpay from retrying
        res.status(200).json({ ok: true, message: 'Webhook received' });
    }
};

/**
 * Handle payment.authorized event
 */
async function handlePaymentAuthorized(payload) {
    try {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;

        console.log(`✅ Payment authorized: ${payment.id} for order: ${orderId}`);

        // Update order status
        await Order.findOneAndUpdate(
            { orderId },
            {
                paymentId: payment.id,
                status: 'authorized'
            }
        );
    } catch (error) {
        console.error('Error handling payment.authorized:', error);
    }
}

/**
 * Handle payment.captured event (payment successful)
 */
async function handlePaymentCaptured(payload) {
    try {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;
        const paymentId = payment.id;

        console.log(`✅ Payment captured: ${paymentId} for order: ${orderId}`);

        // Update order in database
        const order = await Order.findOneAndUpdate(
            { orderId },
            {
                status: 'paid',
                paymentId: paymentId,
                deliveryStatus: 'processing'
            },
            { new: true }
        );

        if (order) {
            // Get user details
            const user = await User.findById(order.userId);

            if (user) {
                // Send order confirmation email
                await sendOrderConfirmationEmail(
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
                );
                console.log(`📧 Order confirmation email sent to ${user.email}`);
            }
        }
    } catch (error) {
        console.error('Error handling payment.captured:', error);
    }
}

/**
 * Handle payment.failed event
 */
async function handlePaymentFailed(payload) {
    try {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;

        console.log(`❌ Payment failed: ${payment.id} for order: ${orderId}`);

        // Update order status
        const order = await Order.findOneAndUpdate(
            { orderId },
            {
                status: 'failed',
                paymentId: payment.id
            },
            { new: true }
        );

        if (order) {
            // Get user details
            const user = await User.findById(order.userId);

            if (user) {
                // Send payment failed email
                await sendPaymentFailedEmail(
                    user.email,
                    user.name,
                    {
                        orderId: order.orderId,
                        amount: order.amount
                    }
                );
                console.log(`📧 Payment failed email sent to ${user.email}`);
            }
        }
    } catch (error) {
        console.error('Error handling payment.failed:', error);
    }
}

/**
 * Handle order.paid event
 */
async function handleOrderPaid(payload) {
    try {
        const order = payload.order.entity;
        const orderId = order.id;

        console.log(`✅ Order paid: ${orderId}`);

        // Update order status (redundant check)
        await Order.findOneAndUpdate(
            { orderId },
            {
                status: 'paid',
                deliveryStatus: 'processing'
            }
        );
    } catch (error) {
        console.error('Error handling order.paid:', error);
    }
}

module.exports = exports;
