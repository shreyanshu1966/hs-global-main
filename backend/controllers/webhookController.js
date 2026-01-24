const crypto = require('crypto');
const axios = require('axios');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderConfirmationEmail, sendPaymentFailedEmail } = require('../services/emailService');

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
const PAYPAL_API_BASE = PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

// Webhook event tracking to prevent duplicates
const processedWebhookEvents = new Map();

/**
 * Store webhook event to prevent duplicate processing
 */
const storeWebhookEvent = async (eventId, eventType) => {
    processedWebhookEvents.set(eventId, {
        eventType,
        processedAt: new Date(),
        timestamp: Date.now()
    });
    
    // Clean up old events (keep last 1000 events)
    if (processedWebhookEvents.size > 1000) {
        const entries = Array.from(processedWebhookEvents.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        entries.slice(0, 200).forEach(([key]) => {
            processedWebhookEvents.delete(key);
        });
    }
};

/**
 * Check if webhook event was already processed
 */
const checkDuplicateWebhookEvent = async (eventId) => {
    return processedWebhookEvents.has(eventId);
};

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
 * PayPal Webhook Handler with enhanced security and robustness
 * Handles payment status updates from PayPal
 * Provides redundancy in case frontend verification fails
 */
exports.handlePayPalWebhook = async (req, res) => {
    try {
        // Process the webhook event
        const event = req.body;
        const eventType = event.event_type;
        const resource = event.resource;
        const eventId = event.id;

        console.log(`📨 PayPal Webhook received: ${eventType} (ID: ${eventId})`);

        // Check for duplicate events (PayPal may send duplicates)
        const existingEvent = await checkDuplicateWebhookEvent(eventId);
        if (existingEvent) {
            console.log(`⚠️ Duplicate webhook event ignored: ${eventId}`);
            return res.status(200).json({ ok: true, message: 'Duplicate event ignored' });
        }

        // Store event ID to prevent duplicates
        await storeWebhookEvent(eventId, eventType);

        // Process the webhook event with enhanced error handling
        switch (eventType) {
            case 'CHECKOUT.ORDER.APPROVED':
                await handleOrderApproved(resource, eventId);
                break;

            case 'PAYMENT.CAPTURE.COMPLETED':
                await handlePaymentCaptured(resource, eventId);
                break;

            case 'PAYMENT.CAPTURE.DENIED':
            case 'PAYMENT.CAPTURE.DECLINED':
            case 'PAYMENT.CAPTURE.FAILED':
                await handlePaymentFailed(resource, eventId);
                break;

            case 'CHECKOUT.ORDER.VOIDED':
                await handleOrderVoided(resource, eventId);
                break;

            case 'PAYMENT.CAPTURE.REFUNDED':
                await handlePaymentRefunded(resource, eventId);
                break;

            case 'PAYMENT.CAPTURE.REVERSED':
                await handlePaymentReversed(resource, eventId);
                break;

            default:
                console.log(`ℹ️ Unhandled webhook event: ${eventType}`);
        }

        // Always return 200 to acknowledge receipt
        res.status(200).json({ ok: true, message: 'Webhook processed successfully' });

    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        // Log the error details for debugging
        console.error('Request body:', JSON.stringify(req.body, null, 2));
        console.error('Request headers:', req.headers);
        
        // Still return 200 to prevent PayPal from retrying indefinitely
        res.status(200).json({ ok: true, message: 'Webhook received with errors' });
    }
};

/**
 * Handle CHECKOUT.ORDER.APPROVED event
 */
async function handleOrderApproved(resource, eventId) {
    try {
        const paypalOrderId = resource.id;

        console.log(`✅ Order approved: ${paypalOrderId} (Event: ${eventId})`);

        // Update order status to approved (waiting for capture)
        const result = await Order.findOneAndUpdate(
            { paypalOrderId },
            {
                status: 'approved',
                approvedAt: new Date(),
                lastWebhookEvent: eventId
            },
            { new: true }
        );

        if (result) {
            console.log(`📝 Order ${result.orderId} updated to approved status`);
        } else {
            console.warn(`⚠️ Order not found for PayPal ID: ${paypalOrderId}`);
        }
    } catch (error) {
        console.error('Error handling order.approved:', error);
        throw error;
    }
}

/**
 * Handle PAYMENT.CAPTURE.COMPLETED event (payment successful)
 */
async function handlePaymentCaptured(resource, eventId) {
    try {
        const captureId = resource.id;
        const paypalOrderId = resource.supplementary_data?.related_ids?.order_id;
        const captureAmount = parseFloat(resource.amount?.value || 0);
        const captureCurrency = resource.amount?.currency_code;

        console.log(`✅ Payment captured: ${captureId} for order: ${paypalOrderId} (Event: ${eventId})`);

        if (!paypalOrderId) {
            console.error('No PayPal order ID found in capture event');
            return;
        }

        // Update order in database with comprehensive details
        const order = await Order.findOneAndUpdate(
            { paypalOrderId },
            {
                status: 'paid',
                paymentId: captureId,
                deliveryStatus: 'processing',
                paidAt: new Date(),
                lastWebhookEvent: eventId,
                paymentDetails: {
                    captureId: captureId,
                    capturedAt: new Date(),
                    captureAmount: captureAmount,
                    captureCurrency: captureCurrency,
                    paypalStatus: 'COMPLETED',
                    webhookSource: true
                }
            },
            { new: true }
        );

        if (order) {
            console.log(`📝 Order ${order.orderId} marked as paid via webhook`);
            
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
        } else {
            console.warn(`⚠️ Order not found for PayPal ID: ${paypalOrderId}`);
        }
    } catch (error) {
        console.error('Error handling payment.captured:', error);
        throw error;
    }
}

/**
 * Handle PAYMENT.CAPTURE.DENIED/DECLINED/FAILED event
 */
async function handlePaymentFailed(resource, eventId) {
    try {
        const captureId = resource.id;
        const paypalOrderId = resource.supplementary_data?.related_ids?.order_id;
        const reasonCode = resource.status_details?.reason || 'UNKNOWN_FAILURE';

        console.log(`❌ Payment failed: ${captureId} for order: ${paypalOrderId} - Reason: ${reasonCode} (Event: ${eventId})`);

        if (!paypalOrderId) {
            console.error('No PayPal order ID found in failed payment event');
            return;
        }

        // Update order status
        const order = await Order.findOneAndUpdate(
            { paypalOrderId },
            {
                status: 'failed',
                paymentId: captureId,
                failureReason: reasonCode,
                failedAt: new Date(),
                lastWebhookEvent: eventId,
                paymentDetails: {
                    captureId: captureId,
                    failedAt: new Date(),
                    reasonCode: reasonCode,
                    webhookSource: true,
                    failureDetails: resource.status_details
                }
            },
            { new: true }
        );

        if (order) {
            console.log(`📝 Order ${order.orderId} marked as failed via webhook`);
            
            // Get user details
            const user = await User.findById(order.userId);

            if (user) {
                // Send payment failed email
                await sendPaymentFailedEmail(
                    user.email,
                    user.name,
                    {
                        orderId: order.orderId,
                        amount: order.amount,
                        failureReason: reasonCode
                    }
                );
                console.log(`📧 Payment failed email sent to ${user.email}`);
            }
        } else {
            console.warn(`⚠️ Order not found for PayPal ID: ${paypalOrderId}`);
        }
    } catch (error) {
        console.error('Error handling payment.failed:', error);
        throw error;
    }
}

/**
 * Handle CHECKOUT.ORDER.VOIDED event
 */
async function handleOrderVoided(resource, eventId) {
    try {
        const paypalOrderId = resource.id;
        const voidReason = resource.status_details?.reason || 'ORDER_VOIDED';

        console.log(`❌ Order voided: ${paypalOrderId} - Reason: ${voidReason} (Event: ${eventId})`);

        // Update order status
        const order = await Order.findOneAndUpdate(
            { paypalOrderId },
            {
                status: 'cancelled',
                failureReason: voidReason,
                voidedAt: new Date(),
                lastWebhookEvent: eventId
            },
            { new: true }
        );

        if (order) {
            console.log(`📝 Order ${order.orderId} marked as cancelled via webhook`);
        } else {
            console.warn(`⚠️ Order not found for PayPal ID: ${paypalOrderId}`);
        }
    } catch (error) {
        console.error('Error handling order.voided:', error);
        throw error;
    }
}

/**
 * Handle PAYMENT.CAPTURE.REFUNDED event
 */
async function handlePaymentRefunded(resource, eventId) {
    try {
        const refundId = resource.id;
        const captureId = resource.links?.find(link => link.rel === 'up')?.href?.split('/').pop();
        const refundAmount = parseFloat(resource.amount?.value || 0);

        console.log(`↩️ Payment refunded: ${refundId} for capture: ${captureId} - Amount: ${refundAmount} (Event: ${eventId})`);

        // Find order by payment/capture ID
        const order = await Order.findOneAndUpdate(
            { paymentId: captureId },
            {
                status: 'refunded',
                refundId: refundId,
                refundAmount: refundAmount,
                refundedAt: new Date(),
                lastWebhookEvent: eventId
            },
            { new: true }
        );

        if (order) {
            console.log(`📝 Order ${order.orderId} marked as refunded via webhook`);
        } else {
            console.warn(`⚠️ Order not found for capture ID: ${captureId}`);
        }
    } catch (error) {
        console.error('Error handling payment.refunded:', error);
        throw error;
    }
}

/**
 * Handle PAYMENT.CAPTURE.REVERSED event
 */
async function handlePaymentReversed(resource, eventId) {
    try {
        const captureId = resource.id;
        const reasonCode = resource.status_details?.reason || 'PAYMENT_REVERSED';

        console.log(`🔄 Payment reversed: ${captureId} - Reason: ${reasonCode} (Event: ${eventId})`);

        // Find order by payment/capture ID
        const order = await Order.findOneAndUpdate(
            { paymentId: captureId },
            {
                status: 'reversed',
                failureReason: reasonCode,
                reversedAt: new Date(),
                lastWebhookEvent: eventId
            },
            { new: true }
        );

        if (order) {
            console.log(`📝 Order ${order.orderId} marked as reversed via webhook`);
        } else {
            console.warn(`⚠️ Order not found for capture ID: ${captureId}`);
        }
    } catch (error) {
        console.error('Error handling payment.reversed:', error);
        throw error;
    }
}

module.exports = exports;
