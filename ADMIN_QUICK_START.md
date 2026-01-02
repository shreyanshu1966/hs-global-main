# Quick Start Guide - Admin Dashboard

## Prerequisites
- Backend server running on port 3000
- Frontend server running on port 5173
- MongoDB connection active
- At least one user with admin role in database

## Step 1: Create an Admin User

If you don't have an admin user yet, you need to manually update a user in MongoDB:

### Option A: Using MongoDB Compass or Shell
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### Option B: Using the setup script
Create a file `backend/create-admin.js`:
```javascript
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const email = 'admin@example.com'; // Change this
    const user = await User.findOne({ email });
    
    if (user) {
      user.role = 'admin';
      await user.save();
      console.log('User updated to admin:', user.email);
    } else {
      console.log('User not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();
```

Run it:
```bash
cd backend
node create-admin.js
```

## Step 2: Restart Backend Server

The backend needs to be restarted to load the new admin routes:

1. Stop the current backend server (Ctrl+C in the terminal)
2. Start it again:
```bash
cd backend
npm start
```

## Step 3: Access Admin Dashboard

1. **Login** with your admin account at `http://localhost:5173/login`
2. After login, you should see a purple **"Admin"** button in the header
3. Click the Admin button or navigate to `http://localhost:5173/admin`

## Step 4: Explore Features

### Analytics Tab (Default)
- View total revenue, users, and orders
- Check recent activity (last 7 days)
- Analyze order status distribution
- Review monthly revenue trends
- Monitor delivery status

### Orders Tab
- Search orders by ID, email, or name
- Filter by payment status (created, paid, failed)
- Filter by delivery status (pending, processing, shipped, delivered, cancelled)
- Click "Edit" to update order delivery status
- Save changes

### Users Tab
- Search users by name or email
- Filter by role (user, admin)
- Change user roles using dropdown
- Delete users (cannot delete yourself)

## Troubleshooting

### "Access denied" error
- Verify your user has `role: "admin"` in the database
- Clear browser cache and cookies
- Re-login

### Admin button not showing
- Check that you're logged in
- Verify your user role is "admin"
- Check browser console for errors

### Backend errors
- Ensure MongoDB is running
- Check backend console for errors
- Verify all environment variables are set
- Restart backend server

### Frontend errors
- Check browser console for errors
- Verify frontend is running on port 5173
- Clear browser cache
- Restart frontend server

## Testing the Features

### Test Order Management
1. Create a test order through the checkout flow
2. Go to Admin → Orders
3. Find your order
4. Click Edit
5. Change delivery status
6. Click Save
7. Verify the status updated

### Test User Management
1. Create a test user account
2. Go to Admin → Users
3. Find the test user
4. Change their role to admin
5. Verify the change
6. Change back to user

### Test Analytics
1. Create some test orders with different statuses
2. Go to Admin → Analytics
3. Verify the statistics are accurate
4. Check the charts display correctly

## API Testing with Postman/cURL

### Get Analytics
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/analytics
```

### Get Users
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/admin/users?page=1&limit=10"
```

### Get Orders
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/admin/orders?page=1&limit=10"
```

### Update Order Status
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deliveryStatus":"shipped","trackingNumber":"TRACK123"}' \
  http://localhost:3000/api/admin/orders/ORDER_ID
```

### Update User Role
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}' \
  http://localhost:3000/api/admin/users/USER_ID
```

## Next Steps

1. **Customize the design** - Modify `Admin.css` to match your brand
2. **Add more analytics** - Extend the analytics controller
3. **Add notifications** - Implement email notifications for status changes
4. **Export data** - Add CSV/Excel export functionality
5. **Activity logs** - Track admin actions

## Support

If you encounter any issues:
1. Check the browser console for frontend errors
2. Check the backend terminal for server errors
3. Verify MongoDB connection
4. Review the ADMIN_DASHBOARD.md documentation
5. Check the ADMIN_IMPLEMENTATION_SUMMARY.md for technical details

## Security Reminder

⚠️ **Important Security Notes:**
- Only grant admin access to trusted users
- Regularly audit admin actions
- Use strong passwords for admin accounts
- Enable email verification for admin accounts
- Consider implementing 2FA for admin users
- Monitor admin activity logs

Enjoy your new admin dashboard! 🎉
