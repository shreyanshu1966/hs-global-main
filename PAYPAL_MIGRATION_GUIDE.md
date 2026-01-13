# PayPal Integration Migration Guide

## Overview
The payment system has been successfully migrated from Razorpay to PayPal. Here's what you need to do to complete the setup.

## 1. Environment Variables Setup

Create a `.env` file in the `backend` directory with the following PayPal credentials:

```env
# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENVIRONMENT=sandbox
```

### Getting PayPal Credentials

1. **Create a PayPal Developer Account:**
   - Go to [PayPal Developer](https://developer.paypal.com/)
   - Sign in or create an account

2. **Create an Application:**
   - Navigate to "My Apps & Credentials"
   - Click "Create App"
   - Choose "Default Application" 
   - Select "Sandbox" for testing or "Live" for production
   - Copy the Client ID and Client Secret

3. **Environment Settings:**
   - Use `sandbox` for development/testing
   - Use `production` for live transactions

## 2. Backend Changes Made

✅ **Dependencies Updated:**
- Removed: `razorpay`
- Added: `@paypal/paypal-server-sdk`

✅ **Controller Updates:**
- `paymentController.js` - Updated to use PayPal SDK
- Routes changed from `/verify-payment` to `/capture-payment`

✅ **Database Schema:**
- Added `paypalAmount` and `paypalCurrency` fields to Order model
- Maintains backward compatibility with existing orders

## 3. Frontend Changes Made

✅ **Payment Integration:**
- Replaced Razorpay SDK with PayPal JavaScript SDK
- Updated `Checkout.tsx` to render PayPal buttons
- Maintained existing error handling and retry logic

✅ **User Experience:**
- PayPal buttons render when form is completed
- Automatic currency conversion (INR → USD)
- Same checkout flow with PayPal branding

## 4. Currency Conversion

**Important:** The system currently uses a fixed exchange rate (1 INR = 0.012 USD). 

**Recommendation:** Implement a real-time currency conversion API:
```javascript
// Example using a currency API
const getExchangeRate = async (from, to) => {
  const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
  const data = await response.json();
  return data.rates[to];
};
```

## 5. Testing

### Sandbox Testing:
1. Set `PAYPAL_ENVIRONMENT=sandbox`
2. Use PayPal sandbox accounts for testing
3. Test both successful and failed payments

### PayPal Test Accounts:
- Create buyer and seller accounts in PayPal Developer Dashboard
- Use sandbox credentials for testing

## 6. Deployment Checklist

Before going live:
- [ ] Set `PAYPAL_ENVIRONMENT=production`
- [ ] Use production PayPal Client ID and Secret
- [ ] Test with real PayPal accounts
- [ ] Implement proper error logging
- [ ] Set up webhook endpoints (optional)
- [ ] Update currency conversion to use live rates

## 7. Migration Benefits

✅ **Global Reach:** PayPal supports 200+ countries
✅ **Multiple Currencies:** Supports 25+ currencies
✅ **Trust:** Widely recognized payment brand
✅ **Security:** PCI compliance handled by PayPal
✅ **Mobile Friendly:** Optimized mobile checkout

## 8. Next Steps

1. **Set up PayPal Developer Account**
2. **Add environment variables**
3. **Test in sandbox mode**
4. **Deploy to production when ready**

## Support

- PayPal Developer Documentation: https://developer.paypal.com/docs/
- PayPal SDK Reference: https://github.com/paypal/paypal-server-sdk-nodejs

---

**Note:** All existing orders and user data remain intact. The system gracefully handles both old Razorpay orders and new PayPal orders.