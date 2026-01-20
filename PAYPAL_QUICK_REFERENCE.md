# PayPal Integration - Quick Reference

## Environment Variables

Add these to your `backend/.env` file:

```env
# PayPal Configuration (Sandbox for testing)
PAYPAL_CLIENT_ID=AWxxiX5n1LVjxW7NAccSYbpwF7cHYHPLT5N7_uQC3vs-IXX6TDYa9obvW14bEN2x3g8tkCeRbFi9MrUt
PAYPAL_CLIENT_SECRET=EMYnsETvyuRLbdpDxu8Bp8SiLpOOQFNHxEwNME0-doDdfqsJ1LI0aBdjs5MX0b-b6A0kaB_G0EQUb2dU
PAYPAL_MODE=sandbox
```

## Sandbox Test Account

**Business Account** (for receiving payments):
- Username: `sb-7gupb48893791@business.example.com`
- Password: `4s[_mvLn`

## Testing Payment Flow

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Add items to cart
4. Go to checkout
5. Fill shipping details
6. Click PayPal button
7. Login with sandbox account above
8. Complete payment

## API Endpoints

- **Create Order**: `POST /api/create-order`
- **Capture Payment**: `POST /api/capture-payment`
- **Payment Status**: `GET /api/payment-status/:paypalOrderId`
- **Webhook**: `POST /api/webhooks/paypal`

## PayPal Dashboard Links

- **Sandbox Dashboard**: https://developer.paypal.com/dashboard/
- **Sandbox Accounts**: https://developer.paypal.com/dashboard/accounts
- **Webhooks**: https://developer.paypal.com/dashboard/webhooks
- **API Credentials**: https://developer.paypal.com/dashboard/applications/sandbox

## Going Live

1. Get live credentials from PayPal Dashboard (switch to Live mode)
2. Update `.env`:
   ```
   PAYPAL_MODE=live
   PAYPAL_CLIENT_ID=<your_live_client_id>
   PAYPAL_CLIENT_SECRET=<your_live_client_secret>
   ```
3. Update frontend `Checkout.tsx` with live Client ID
4. Configure webhooks for production domain

## Common Issues

**Payment not completing?**
- Check browser console for errors
- Verify credentials in `.env`
- Ensure backend is running

**Order not in database?**
- Check backend logs
- Verify MongoDB connection
- Check authentication token

**Webhook not working?**
- Ensure URL is publicly accessible
- Check PayPal webhook logs
- Verify endpoint returns 200

## Resources

- Docs: https://developer.paypal.com/docs/
- Support: https://developer.paypal.com/support/
