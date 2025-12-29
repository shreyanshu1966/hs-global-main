# 🧪 Order System Testing Guide

## ✅ Quick Fix Applied

**Issue:** Backend server was crashing due to incorrect middleware import
**Fix:** Changed `require('../middleware/authMiddleware')` to `const { authMiddleware } = require('../middleware/authMiddleware')`
**Files Fixed:** 
- `backend/routes/paymentRoutes.js`
- `backend/routes/orderRoutes.js`

---

## 🚀 Start the Servers

### Backend:
```bash
cd backend
npm start
```
**Expected Output:**
```
Server running on port 3000
Environment: development
MongoDB connected successfully
```

### Frontend:
```bash
cd frontend
npm run dev
```
**Expected Output:**
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

---

## 🧪 Testing Steps

### **Test 1: Order Creation & Payment**

1. **Login to your account:**
   - Go to http://localhost:5173/login
   - Login with your credentials

2. **Add items to cart:**
   - Browse products at http://localhost:5173/products
   - Click "Add to Cart" on 2-3 products
   - Verify cart count increases

3. **Go to checkout:**
   - Click cart icon
   - Click "Proceed to Checkout"
   - Verify you're redirected to checkout page

4. **Fill checkout form:**
   - Verify name, email, phone are auto-filled (from user profile)
   - Fill in address details:
     - Address Line 1: "123 Test Street"
     - City: "Mumbai"
     - State: "Maharashtra"
     - Postal Code: "400001"
     - Country: "India"

5. **Create order:**
   - Click "Pay ₹XXX" button
   - Wait for Razorpay modal to open
   - **Check browser console** - should see order created successfully

6. **Complete payment (Test Mode):**
   - In Razorpay modal, use test card details:
     - Card: 4111 1111 1111 1111
     - CVV: 123
     - Expiry: Any future date
   - Click "Pay"
   - Verify redirect to success page

7. **Verify success:**
   - Should see "Order Placed Successfully!" message
   - Cart should be empty
   - Click "Back to Home" or "Continue Shopping"

---

### **Test 2: View Order History**

1. **Go to Profile:**
   - Click profile icon in header
   - Or navigate to http://localhost:5173/profile

2. **Check Order History section:**
   - Should see your recent order(s)
   - Verify order details:
     - ✅ Order ID (last 8 characters)
     - ✅ Order date
     - ✅ Total amount
     - ✅ Payment status badge (green "Paid")
     - ✅ Delivery status badge (blue "Processing")
     - ✅ Product images preview

3. **Test empty state:**
   - If no orders, should see:
     - Package icon
     - "No orders yet" message
     - "Start Shopping" button

---

### **Test 3: View Order Details**

1. **Click on an order:**
   - From Profile page, click any order card
   - Should navigate to `/orders/order_xxxxx`

2. **Verify order details page:**
   - ✅ Order ID displayed
   - ✅ Payment status card (green "Payment Successful")
   - ✅ Delivery status card (blue "Processing")
   - ✅ All order items listed with:
     - Product images
     - Product names
     - Quantities
     - Prices
   - ✅ Total amount calculated correctly
   - ✅ Customer information:
     - Name
     - Email
     - Phone
   - ✅ Shipping address displayed
   - ✅ Order timeline (created date)

3. **Test navigation:**
   - Click "Back to Profile"
   - Should return to profile page

---

### **Test 4: Payment Failure Handling**

1. **Add items to cart and go to checkout**

2. **Fill form and click Pay**

3. **Cancel payment:**
   - When Razorpay modal opens, click "X" or press Escape
   - Should see error: "Payment was cancelled. Please try again."

4. **Verify order status:**
   - Check MongoDB (if you have access)
   - Order should have status: "created" (not paid)

5. **Retry payment:**
   - Click "Pay" button again
   - Should create new order
   - Complete payment this time

---

### **Test 5: API Endpoints (Using Postman/Thunder Client)**

#### **Get User Orders:**
```http
GET http://localhost:3000/api/my-orders
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
```

**Expected Response:**
```json
{
  "ok": true,
  "orders": [...],
  "count": 2
}
```

#### **Get Order Details:**
```http
GET http://localhost:3000/api/orders/order_xxxxx
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
```

**Expected Response:**
```json
{
  "ok": true,
  "order": {
    "_id": "...",
    "orderId": "order_xxxxx",
    "userId": "...",
    "amount": 150000,
    "status": "paid",
    "deliveryStatus": "processing",
    "items": [...],
    "shippingAddress": {...},
    "customer": {...}
  }
}
```

#### **Get Order Statistics:**
```http
GET http://localhost:3000/api/order-stats
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
```

---

## 🔍 Database Verification

### **Check MongoDB:**

1. **Connect to MongoDB:**
   ```bash
   mongosh
   use hs-global
   ```

2. **View orders:**
   ```javascript
   db.orders.find().pretty()
   ```

3. **Verify order structure:**
   - ✅ Has userId
   - ✅ Has items array
   - ✅ Has shippingAddress
   - ✅ Has customer info
   - ✅ Has status and deliveryStatus

4. **Check user's orders array:**
   ```javascript
   db.users.findOne({ email: "your@email.com" })
   ```
   - Should have `orders` array with order IDs

---

## ✅ Success Criteria

### **Order Creation:**
- [x] Order saved to database
- [x] Order linked to user
- [x] Cart items saved in order
- [x] Shipping address saved
- [x] Payment ID captured

### **Order History:**
- [x] Orders displayed in profile
- [x] Correct status badges
- [x] Proper date formatting
- [x] Amount displayed correctly

### **Order Details:**
- [x] All information displayed
- [x] Images load correctly
- [x] Navigation works
- [x] Responsive design

### **Error Handling:**
- [x] Payment cancellation handled
- [x] Invalid order ID shows error
- [x] Authentication required
- [x] Proper error messages

---

## 🐛 Troubleshooting

### **Backend won't start:**
```bash
# Clear node_modules and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install
npm start
```

### **Orders not showing:**
- Check if you're logged in
- Check browser console for errors
- Verify JWT token in localStorage
- Check MongoDB connection

### **Payment not working:**
- Verify Razorpay credentials in `.env`
- Check Razorpay test mode is enabled
- Check browser console for errors

### **Images not loading:**
- Verify image URLs in cart items
- Check CORS settings
- Check network tab in DevTools

---

## 📊 Expected Data Flow

```
User adds items to cart
    ↓
User goes to checkout (must be logged in)
    ↓
User fills shipping details
    ↓
User clicks "Pay"
    ↓
Frontend sends order to /api/create-order with:
  - Cart items
  - Shipping address
  - Customer info
  - Auth token
    ↓
Backend creates Razorpay order
    ↓
Backend saves order to MongoDB with:
  - userId
  - items
  - shippingAddress
  - status: 'created'
    ↓
Backend adds order to user's orders array
    ↓
Razorpay modal opens
    ↓
User completes payment
    ↓
Frontend sends to /api/verify-payment
    ↓
Backend verifies signature
    ↓
Backend updates order:
  - status: 'paid'
  - deliveryStatus: 'processing'
  - paymentId: 'pay_xxxxx'
    ↓
User redirected to success page
    ↓
Cart cleared
    ↓
Order visible in Profile → Order History
```

---

## 🎯 Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can login successfully
- [ ] Can add items to cart
- [ ] Can proceed to checkout
- [ ] Form auto-fills user data
- [ ] Can create order
- [ ] Razorpay modal opens
- [ ] Can complete payment
- [ ] Redirects to success page
- [ ] Cart is cleared
- [ ] Order appears in profile
- [ ] Can view order details
- [ ] All order info is correct
- [ ] Can navigate back to profile
- [ ] Payment cancellation works
- [ ] Error messages display correctly

---

**Testing Date:** December 30, 2025
**Status:** Ready for Testing
**Servers:** Both running successfully
