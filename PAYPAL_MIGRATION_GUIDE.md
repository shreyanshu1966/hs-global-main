# PayPal Integration - Migration Complete

## Overview
Successfully migrated from Payoneer to PayPal payment system. The integration is configured for **sandbox mode** for testing purposes.

## What Changed

### Backend Changes

1. **Payment Controller** (`backend/controllers/paymentController.js`)
   - Replaced Payoneer API integration with PayPal REST API
   - Implemented PayPal OAuth2 authentication
   - Updated order creation to use PayPal Orders API v2
   - Updated payment capture to use PayPal Capture API
   - Added proper error handling and logging

2. **Order Model** (`backend/models/Order.js`)
   - Removed: `payoneerListId` field
   - Added: `paypalOrderId` field (stores PayPal Order ID)
   - Updated: `paymentId` now stores PayPal Capture ID

3. **Webhook Controller** (`backend/controllers/webhookController.js`)
   - Replaced Razorpay webhook handlers with PayPal webhook handlers
   - Handles events: `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`, `CHECKOUT.ORDER.VOIDED`

4. **Environment Variables** (`.env`)
   - Removed: Razorpay credentials
   - Added:
     ```
     PAYPAL_CLIENT_ID=AWxxiX5n1LVjxW7NAccSYbpwF7cHYHPLT5N7_uQC3vs-IXX6TDYa9obvW14bEN2x3g8tkCeRbFi9MrUt
     PAYPAL_CLIENT_SECRET=EMYnsETvyuRLbdpDxu8Bp8SiLpOOQFNHxEwNME0-doDdfqsJ1LI0aBdjs5MX0b-b6A0kaB_G0EQUb2dU
     PAYPAL_MODE=sandbox
     ```

### Frontend Changes

1. **Checkout Page** (`frontend/src/pages/Checkout.tsx`)
   - Removed Payoneer SDK integration
   - Added PayPal React SDK (`@paypal/react-paypal-js`)
   - Implemented `PayPalButtons` component for seamless checkout
   - Simplified payment flow - no need for manual SDK initialization
   - Better error handling and user feedback

2. **Package Dependencies**
   - Removed: `@payoneer/checkout-web`
   - Added: `@paypal/react-paypal-js`

## PayPal Sandbox Credentials

### API Credentials
- **Client ID**: `AWxxiX5n1LVjxW7NAccSYbpwF7cHYHPLT5N7_uQC3vs-IXX6TDYa9obvW14bEN2x3g8tkCeRbFi9MrUt`
- **Secret**: `EMYnsETvyuRLbdpDxu8Bp8SiLpOOQFNHxEwNME0-doDdfqsJ1LI0aBdjs5MX0b-b6A0kaB_G0EQUb2dU`
- **Mode**: `sandbox`

### Sandbox Test Account
- **Username**: `sb-7gupb48893791@business.example.com`
- **Password**: `4s[_mvLn`

## Testing the Integration

### 1. Start the Backend
```bash
cd backend
npm start
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Payment Flow

1. **Add items to cart** on the website
2. **Go to checkout** page
3. **Fill in shipping details**
4. **Click PayPal button** - You'll see PayPal's payment interface
5. **Login with sandbox account**:
   - Email: `sb-7gupb48893791@business.example.com`
   - Password: `4s[_mvLn`
6. **Complete payment**
7. **Verify**:
   - Order is created in database
   - Payment status is updated to "paid"
   - Confirmation email is sent

### PayPal Sandbox Test Cards

You can also use PayPal's test credit cards:
- **Card Number**: `4032039668478305` (Visa)
- **Expiry**: Any future date
- **CVV**: Any 3 digits

Or use PayPal's sandbox personal accounts to test buyer flow.

## API Endpoints

### Create Order
```
POST /api/create-order
Authorization: Bearer <token>

Body:
{
  "amount": "100.00",
  "currency": "USD",
  "items": [...],
  "shippingAddress": {...},
  "customer": {...}
}

Response:
{
  "ok": true,
  "orderId": "HS-1234567890-abc123",
  "paypalOrderId": "5O190127TN364715T",
  "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=...",
  "environment": "sandbox"
}
```

### Capture Payment
```
POST /api/capture-payment

Body:
{
  "paypalOrderId": "5O190127TN364715T",
  "orderId": "HS-1234567890-abc123"
}

Response:
{
  "ok": true,
  "message": "Payment captured successfully",
  "status": "COMPLETED",
  "order": {...}
}
```

### Get Payment Status
```
GET /api/payment-status/:paypalOrderId

Response:
{
  "ok": true,
  "status": "COMPLETED",
  "data": {...}
}
```

## Webhook Configuration

To receive real-time payment updates from PayPal:

1. **Go to PayPal Developer Dashboard**:
   - Sandbox: https://developer.paypal.com/dashboard/webhooks
   - Live: https://developer.paypal.com/dashboard/webhooks

2. **Create a new webhook**:
   - Webhook URL: `https://yourdomain.com/api/webhooks/paypal`
   - Events to subscribe:
     - `CHECKOUT.ORDER.APPROVED`
     - `PAYMENT.CAPTURE.COMPLETED`
     - `PAYMENT.CAPTURE.DENIED`
     - `CHECKOUT.ORDER.VOIDED`

3. **Save the Webhook ID** (optional):
   - Add to `.env`: `PAYPAL_WEBHOOK_ID=your_webhook_id`

## Going Live

When ready to accept real payments:

1. **Get Live Credentials**:
   - Go to https://developer.paypal.com/dashboard/
   - Switch to "Live" mode
   - Create a new REST API app
   - Copy Client ID and Secret

2. **Update Environment Variables**:
   ```
   PAYPAL_CLIENT_ID=<your_live_client_id>
   PAYPAL_CLIENT_SECRET=<your_live_client_secret>
   PAYPAL_MODE=live
   ```

3. **Update Frontend**:
   - Update `PAYPAL_CLIENT_ID` in `Checkout.tsx` with your live Client ID
   - Or better: Move it to environment variable `VITE_PAYPAL_CLIENT_ID`

4. **Configure Live Webhooks**:
   - Set up webhooks in live mode
   - Use your production domain

5. **Test Thoroughly**:
   - Test with small amounts first
   - Verify email notifications
   - Check order status updates

## Security Notes

⚠️ **Important Security Considerations**:

1. **Never commit credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Verify webhook signatures** in production (implement webhook verification)
4. **Use HTTPS** in production
5. **Validate all inputs** on the backend
6. **Keep PayPal SDK updated** for security patches

## Troubleshooting

### Payment Not Completing
- Check browser console for errors
- Verify PayPal credentials are correct
- Ensure backend is running and accessible
- Check network tab for failed API calls

### Webhook Not Receiving Events
- Verify webhook URL is publicly accessible
- Check PayPal webhook logs in developer dashboard
- Ensure webhook endpoint returns 200 status

### Order Not Updating in Database
- Check backend logs for errors
- Verify MongoDB connection
- Check order ID matches between frontend and backend

## Support Resources

- **PayPal Developer Docs**: https://developer.paypal.com/docs/
- **PayPal REST API Reference**: https://developer.paypal.com/api/rest/
- **PayPal React SDK**: https://paypal.github.io/react-paypal-js/
- **PayPal Sandbox**: https://developer.paypal.com/dashboard/

## Migration Checklist

- [x] Install PayPal dependencies
- [x] Remove Payoneer/Razorpay dependencies
- [x] Update backend payment controller
- [x] Update Order model
- [x] Update webhook handlers
- [x] Update frontend checkout page
- [x] Update environment variables
- [x] Test order creation
- [x] Test payment capture
- [ ] Configure webhooks (when deploying)
- [ ] Test email notifications
- [ ] Switch to live mode (when ready)

## Next Steps

1. **Test the integration** thoroughly in sandbox mode
2. **Configure webhooks** when you deploy to production
3. **Update email templates** if needed
4. **Add order tracking** features
5. **Implement refund functionality** if required
6. **Switch to live mode** when ready to accept real payments

---

**Migration completed on**: January 20, 2026
**Status**: ✅ Ready for testing in sandbox mode
