# Payment Enhancement Implementation Guide

## Overview

This document outlines the three major enhancements implemented for the payment system:

1. **Razorpay Webhooks** - For redundant payment verification
2. **Email Notifications** - For order confirmation and payment failures
3. **Payment Retry Logic** - For handling failed transactions with exponential backoff

---

## 1. Razorpay Webhooks Implementation

### Purpose
Webhooks provide a redundant payment verification mechanism. If the frontend verification fails (network issues, browser closed, etc.), Razorpay will still notify our backend about the payment status.

### Files Created/Modified

#### New Files:
- `backend/controllers/webhookController.js` - Handles webhook events
- `backend/routes/webhookRoutes.js` - Webhook route definitions

#### Modified Files:
- `backend/server.js` - Added webhook routes

### Webhook Events Handled:
- `payment.authorized` - Payment authorized by bank
- `payment.captured` - Payment successfully captured
- `payment.failed` - Payment failed
- `order.paid` - Order marked as paid

### Configuration Steps:

#### 1. Add Webhook Secret to Environment Variables
```bash
# In backend/.env
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_from_razorpay_dashboard
```

#### 2. Configure Webhook in Razorpay Dashboard

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/app/webhooks)
2. Click "Add New Webhook"
3. Enter your webhook URL:
   ```
   https://yourdomain.com/api/webhooks/razorpay
   ```
   For local testing with ngrok:
   ```
   https://your-ngrok-url.ngrok.io/api/webhooks/razorpay
   ```

4. Select events to listen to:
   - ✅ payment.authorized
   - ✅ payment.captured
   - ✅ payment.failed
   - ✅ order.paid

5. Set the webhook secret (copy this to your .env file)
6. Save the webhook

#### 3. Test Webhook Locally with ngrok

```bash
# Install ngrok (if not already installed)
npm install -g ngrok

# Start your backend server
npm start

# In another terminal, expose your local server
ngrok http 3000

# Copy the ngrok URL and configure it in Razorpay Dashboard
```

### How It Works:

```
Payment Flow with Webhooks:

1. User completes payment on Razorpay
2. Frontend receives payment response
3. Frontend sends verification request to backend
4. Backend verifies and updates order ✅

Simultaneously:

5. Razorpay sends webhook to backend
6. Backend verifies webhook signature
7. Backend processes event (update order, send email)
8. Backend responds 200 OK to Razorpay
```

### Security:
- Webhook signature verification using HMAC SHA256
- Only processes webhooks with valid signatures
- Always returns 200 OK to prevent retry storms

---

## 2. Email Notifications Implementation

### Purpose
Automatically send email notifications to customers for order confirmations and payment failures.

### Files Created/Modified

#### Modified Files:
- `backend/services/emailService.js` - Added new email templates
- `backend/controllers/paymentController.js` - Integrated email sending
- `backend/controllers/webhookController.js` - Sends emails on webhook events

### Email Types:

#### 1. Order Confirmation Email
**Sent when:** Payment is successfully verified
**Contains:**
- Order ID and payment ID
- Order date and status
- List of items with images
- Total amount
- Shipping address
- Customer details
- Link to view order status

#### 2. Payment Failed Email
**Sent when:** Payment verification fails
**Contains:**
- Order ID
- Reason for failure
- Retry payment link
- Support information

### Configuration:

#### 1. Email Service Setup (Gmail Example)

```bash
# In backend/.env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@hsglobal.com
FRONTEND_URL=http://localhost:5173
```

#### 2. Gmail App Password Setup

1. Go to Google Account Settings
2. Security → 2-Step Verification (enable if not enabled)
3. App Passwords → Generate new app password
4. Select "Mail" and "Other (Custom name)"
5. Copy the generated password to `EMAIL_PASSWORD`

#### 3. Alternative Email Services

**SendGrid:**
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

**Mailgun:**
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your_mailgun_smtp_username
EMAIL_PASSWORD=your_mailgun_smtp_password
```

### Email Templates:
- Professional HTML design
- Mobile-responsive
- Brand colors (black and white theme)
- Product images included
- Clear call-to-action buttons

### Testing Emails:

#### Development Mode:
- Uses Ethereal Email (fake SMTP)
- Logs preview URLs to console
- No real emails sent

#### Production Mode:
- Uses configured SMTP service
- Sends real emails
- Logs message IDs

---

## 3. Payment Retry Logic Implementation

### Purpose
Intelligently handle failed payment attempts with exponential backoff to prevent abuse while giving users multiple chances to complete payment.

### Files Created/Modified

#### New Files:
- `frontend/src/services/paymentRetryService.ts` - Retry logic service

#### Modified Files:
- `frontend/src/pages/Checkout.tsx` - Integrated retry tracking and UI

### Features:

#### 1. Exponential Backoff
- **First retry:** Immediate
- **Second retry:** 2 seconds wait
- **Third retry:** 4 seconds wait
- **Maximum delay:** 10 seconds

#### 2. Retry Limits
- **Maximum retries:** 3 attempts
- **Tracking:** Per order ID
- **Storage:** localStorage (persists across page refreshes)

#### 3. Automatic Cleanup
- Removes attempts older than 24 hours
- Clears attempts on successful payment
- Prevents localStorage bloat

### How It Works:

```typescript
// Record a failed attempt
paymentRetryService.recordAttempt(orderId, errorMessage);

// Check if retry is allowed
const canRetry = paymentRetryService.canRetry(orderId);

// Get retry information
const retryInfo = paymentRetryService.getRetryInfo(orderId);
// Returns:
// {
//   canRetry: boolean,
//   remainingRetries: number,
//   canRetryNow: boolean,
//   timeUntilNextRetry: number (ms),
//   attemptCount: number
// }

// Clear attempts on success
paymentRetryService.clearAttempts(orderId);
```

### User Experience:

#### On Payment Failure:
1. Error message displayed
2. Retry information shown:
   - Number of remaining attempts
   - Wait time before next retry (if applicable)
3. Retry button enabled/disabled based on wait time

#### Visual Feedback:
- **Red banner:** Payment error message
- **Blue banner:** Retry available with countdown
- **Yellow banner:** Maximum retries reached

### Configuration:

```typescript
// Default configuration
{
  maxRetries: 3,
  baseDelay: 1000,  // 1 second
  maxDelay: 10000   // 10 seconds
}

// Custom configuration (if needed)
const customRetryService = new PaymentRetryService({
  maxRetries: 5,
  baseDelay: 2000,
  maxDelay: 30000
});
```

---

## Testing Guide

### 1. Test Webhooks

#### Using Razorpay Test Mode:
```bash
# Use test credentials
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxx
```

#### Test Scenarios:
1. **Successful Payment:**
   - Complete payment with test card
   - Check webhook logs in console
   - Verify order status updated
   - Verify email sent

2. **Failed Payment:**
   - Use failed test card
   - Check webhook logs
   - Verify order marked as failed
   - Verify failure email sent

3. **Webhook Signature Verification:**
   - Send invalid webhook (should reject)
   - Send valid webhook (should process)

### 2. Test Email Notifications

#### Development Testing:
```bash
# Start backend
npm start

# Check console for email preview URLs
# Example output:
# ✅ Order confirmation email sent: <message-id>
# 📧 Preview URL: https://ethereal.email/message/xxxxx
```

#### Production Testing:
1. Configure real SMTP credentials
2. Set `NODE_ENV=production`
3. Complete a test payment
4. Check your inbox for confirmation email

### 3. Test Payment Retry Logic

#### Test Scenarios:

1. **First Failure (Immediate Retry):**
   - Cancel payment
   - See error message
   - Retry button should be immediately available

2. **Second Failure (2s Wait):**
   - Cancel payment again
   - See countdown timer (2 seconds)
   - Retry button disabled during countdown

3. **Third Failure (4s Wait):**
   - Cancel payment again
   - See countdown timer (4 seconds)
   - Only 1 retry remaining message

4. **Maximum Retries:**
   - Cancel payment one more time
   - See "Maximum retries reached" message
   - No retry button available

5. **Successful Payment:**
   - Complete payment successfully
   - Retry counter should be cleared
   - Next order starts fresh

---

## Environment Variables Reference

### Complete .env Configuration:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/hs_global

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxx

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@hsglobal.com

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Twilio (for OTP)
TWILIO_ACCOUNT_SID=xxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

---

## Production Deployment Checklist

### Before Going Live:

#### 1. Razorpay Configuration
- [ ] Switch to production Razorpay keys
- [ ] Configure production webhook URL
- [ ] Test webhook with production credentials
- [ ] Enable webhook event logging

#### 2. Email Configuration
- [ ] Set up production SMTP service
- [ ] Configure proper FROM email address
- [ ] Test email delivery
- [ ] Set up email monitoring/logging
- [ ] Configure SPF/DKIM records for domain

#### 3. Environment Variables
- [ ] Update all production environment variables
- [ ] Change JWT_SECRET to strong random value
- [ ] Set NODE_ENV=production
- [ ] Update FRONTEND_URL to production domain
- [ ] Update ALLOWED_ORIGINS

#### 4. Security
- [ ] Enable HTTPS
- [ ] Verify webhook signature validation
- [ ] Test rate limiting
- [ ] Review error messages (no sensitive data)
- [ ] Enable logging and monitoring

#### 5. Testing
- [ ] Test complete payment flow
- [ ] Test webhook delivery
- [ ] Test email delivery
- [ ] Test payment retry logic
- [ ] Test failure scenarios
- [ ] Load testing

---

## Monitoring and Logging

### What to Monitor:

#### 1. Webhook Events
```javascript
// Log format
console.log(`📨 Webhook received: ${event}`);
console.log(`✅ Payment captured: ${paymentId}`);
console.log(`❌ Payment failed: ${paymentId}`);
```

#### 2. Email Delivery
```javascript
// Log format
console.log(`✅ Order confirmation email sent: ${messageId}`);
console.log(`❌ Email sending failed: ${error}`);
```

#### 3. Payment Retries
```javascript
// Track in analytics
- Retry attempt count
- Success rate after retry
- Average time to successful payment
```

### Recommended Monitoring Tools:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Google Analytics** - Payment funnel tracking
- **Razorpay Dashboard** - Payment analytics

---

## Troubleshooting

### Common Issues:

#### 1. Webhooks Not Received
**Problem:** Razorpay webhooks not hitting your server

**Solutions:**
- Check webhook URL is publicly accessible
- Verify webhook secret is correct
- Check server logs for incoming requests
- Test with ngrok for local development
- Verify firewall/security group settings

#### 2. Emails Not Sending
**Problem:** Order confirmation emails not delivered

**Solutions:**
- Check SMTP credentials
- Verify EMAIL_PASSWORD is app-specific password
- Check spam folder
- Review email service logs
- Test with Ethereal Email first
- Verify EMAIL_FROM domain

#### 3. Retry Logic Not Working
**Problem:** Retry counter not updating

**Solutions:**
- Check browser console for errors
- Verify localStorage is enabled
- Clear localStorage and retry
- Check paymentRetryService import
- Verify order ID is being set correctly

#### 4. Payment Verification Fails
**Problem:** Payment succeeds but verification fails

**Solutions:**
- Check Razorpay credentials
- Verify signature calculation
- Check network connectivity
- Review backend logs
- Test with Razorpay test mode

---

## API Endpoints

### Webhook Endpoint:
```
POST /api/webhooks/razorpay
Headers:
  x-razorpay-signature: <signature>
Body:
  {
    event: "payment.captured",
    payload: { ... }
  }
```

### Payment Endpoints:
```
POST /api/create-order
Headers:
  Authorization: Bearer <token>
Body:
  {
    amount: number,
    items: array,
    shippingAddress: object,
    customer: object
  }

POST /api/verify-payment
Body:
  {
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string
  }
```

---

## Support and Resources

### Documentation:
- [Razorpay Webhooks](https://razorpay.com/docs/webhooks/)
- [Razorpay Payment Gateway](https://razorpay.com/docs/payments/)
- [Nodemailer Documentation](https://nodemailer.com/)

### Testing Tools:
- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
- [ngrok](https://ngrok.com/) - Local tunnel for webhooks
- [Ethereal Email](https://ethereal.email/) - Fake SMTP testing

### Contact:
For issues or questions:
- Check backend logs: `npm start`
- Check frontend console
- Review Razorpay dashboard
- Contact support team

---

## Changelog

### Version 1.0.0 (Current)
- ✅ Implemented Razorpay webhooks
- ✅ Added email notifications (order confirmation & payment failed)
- ✅ Implemented payment retry logic with exponential backoff
- ✅ Added comprehensive error handling
- ✅ Created documentation

### Future Enhancements:
- [ ] SMS notifications via Twilio
- [ ] Payment analytics dashboard
- [ ] Automated refund handling
- [ ] Multi-currency webhook support
- [ ] Advanced retry strategies (A/B testing)

---

**Last Updated:** December 30, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
