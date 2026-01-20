const crypto = require('crypto');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderConfirmationEmail, sendPaymentFailedEmail } = require('../services/emailService');

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID; // Optional: for webhook verification

/**
 * PayPal Webhook Handler
 * Handles payment status updates from PayPal
 * Provides redundancy in case frontend verification fails
 */
exports.handlePayPalWebhook = async (req, res) => {
    try {
        // Process the webhook event
        const event = req.body;
        const eventType = event.event_type;
        const resource = event.resource;

        console.log(`📨 PayPal Webhook received: ${eventType}`);

        switch (eventType) {
            case 'CHECKOUT.ORDER.APPROVED':
                await handleOrderApproved(resource);
                break;

            case 'PAYMENT.CAPTURE.COMPLETED':
                await handlePaymentCaptured(resource);
                break;

            case 'PAYMENT.CAPTURE.DENIED':
            case 'PAYMENT.CAPTURE.DECLINED':
                await handlePaymentFailed(resource);
                break;

            case 'CHECKOUT.ORDER.VOIDED':
                await handleOrderVoided(resource);
                break;

            default:
                console.log(`ℹ️ Unhandled webhook event: ${eventType}`);
        }

        // Always return 200 to acknowledge receipt
        res.status(200).json({ ok: true, message: 'Webhook processed' });

    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        // Still return 200 to prevent PayPal from retrying
        res.status(200).json({ ok: true, message: 'Webhook received' });
    }
};

/**
 * Handle CHECKOUT.ORDER.APPROVED event
 */
async function handleOrderApproved(resource) {
    try {
        const paypalOrderId = resource.id;

        console.log(`✅ Order approved: ${paypalOrderId}`);

        // Update order status to approved (waiting for capture)
        await Order.findOneAndUpdate(
            { paypalOrderId },
            {
                status: 'approved'
            }
        );
    } catch (error) {
        console.error('Error handling order.approved:', error);
    }
}

/**
 * Handle PAYMENT.CAPTURE.COMPLETED event (payment successful)
 */
async function handlePaymentCaptured(resource) {
    try {
        const captureId = resource.id;
        const paypalOrderId = resource.supplementary_data?.related_ids?.order_id;

        console.log(`✅ Payment captured: ${captureId} for order: ${paypalOrderId}`);

        if (!paypalOrderId) {
            console.error('No PayPal order ID found in capture event');
            return;
        }

        // Update order in database
        const order = await Order.findOneAndUpdate(
            { paypalOrderId },
            {
                status: 'paid',
                paymentId: captureId,
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
 * Handle PAYMENT.CAPTURE.DENIED/DECLINED event
 */
async function handlePaymentFailed(resource) {
    try {
        const captureId = resource.id;
        const paypalOrderId = resource.supplementary_data?.related_ids?.order_id;

        console.log(`❌ Payment failed: ${captureId} for order: ${paypalOrderId}`);

        if (!paypalOrderId) {
            console.error('No PayPal order ID found in failed payment event');
            return;
        }

        // Update order status
        const order = await Order.findOneAndUpdate(
            { paypalOrderId },
            {
                status: 'failed',
                paymentId: captureId
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
 * Handle CHECKOUT.ORDER.VOIDED event
 */
async function handleOrderVoided(resource) {
    try {
        const paypalOrderId = resource.id;

        console.log(`❌ Order voided: ${paypalOrderId}`);

        // Update order status
        await Order.findOneAndUpdate(
            { paypalOrderId },
            {
                status: 'failed'
            }
        );
    } catch (error) {
        console.error('Error handling order.voided:', error);
    }
}

module.exports = exports;
