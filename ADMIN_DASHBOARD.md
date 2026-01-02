# Admin Dashboard

## Overview
The Admin Dashboard provides comprehensive management capabilities for the HS Global platform, including analytics, order management, and user management.

## Access
- **URL**: `/admin`
- **Authentication**: Required (Admin role only)
- **Navigation**: Admin button appears in the header for users with admin role

## Features

### 1. Analytics Dashboard
Provides real-time insights into platform performance:

#### Key Metrics
- **Total Revenue**: Sum of all paid orders
- **Total Users**: Count of registered users with verification status
- **Total Orders**: Count of all orders with payment status breakdown
- **Recent Activity**: Orders and users from the last 7 days

#### Charts & Visualizations
- **Order Status Distribution**: Visual breakdown of paid, pending, and failed orders
- **Monthly Revenue**: Last 6 months revenue trends with order counts
- **Delivery Status**: Current distribution of orders by delivery status

### 2. Orders Management
Complete order tracking and management system:

#### Features
- **Search**: Find orders by order ID, customer email, or customer name
- **Filters**: 
  - Payment Status (created, paid, failed)
  - Delivery Status (pending, processing, shipped, delivered, cancelled)
- **Pagination**: 10 orders per page with navigation controls

#### Order Details Displayed
- Order ID
- Customer information (name, email)
- Order amount with currency
- Payment status
- Delivery status
- Order date

#### Actions
- **Edit Order**: Update delivery status, add tracking number, and notes
- **Status Updates**: Change delivery status from pending → processing → shipped → delivered

### 3. Users Management
Comprehensive user administration:

#### Features
- **Search**: Find users by name or email
- **Filter**: By role (user, admin)
- **Pagination**: 10 users per page

#### User Details Displayed
- Name and email
- Phone number
- Role (user/admin)
- Email verification status
- Number of orders
- Join date

#### Actions
- **Change Role**: Promote users to admin or demote to regular user
- **Delete User**: Remove users from the system (cannot delete yourself)
- **Protection**: Cannot modify or delete your own account

## Backend API Endpoints

All endpoints require authentication and admin role.

### Analytics
```
GET /api/admin/analytics
```
Returns comprehensive analytics data including users, orders, and revenue statistics.

### Users
```
GET /api/admin/users?page=1&limit=10&search=&role=
PUT /api/admin/users/:userId/role
DELETE /api/admin/users/:userId
```

### Orders
```
GET /api/admin/orders?page=1&limit=10&status=&deliveryStatus=&search=
PUT /api/admin/orders/:orderId
```

## Security

### Authentication
- All admin routes require JWT authentication
- Admin middleware verifies user role is 'admin'
- Unauthorized access returns 403 Forbidden

### Protections
- Users cannot delete or modify their own admin account
- Role changes require confirmation
- User deletion requires confirmation

## Database Models

### User Model
- Role field: 'user' | 'admin' (default: 'user')
- Email verification tracking
- Order references

### Order Model
- Payment status tracking
- Delivery status management
- Customer information
- Items details
- Tracking number support
- Admin notes

## Design Features

### Visual Design
- **Gradient Backgrounds**: Purple to indigo gradient theme
- **Glassmorphism**: Frosted glass effects on cards and filters
- **Smooth Animations**: Fade-in effects and hover transitions
- **Status Badges**: Color-coded status indicators
- **Responsive Charts**: Visual data representation

### User Experience
- **Tab Navigation**: Easy switching between Analytics, Orders, and Users
- **Real-time Search**: Instant filtering as you type
- **Loading States**: Spinner during data fetching
- **Error Handling**: User-friendly error messages
- **Confirmation Dialogs**: For destructive actions

### Mobile Responsive
- Optimized layouts for all screen sizes
- Horizontal scrolling for tables on mobile
- Touch-friendly buttons and controls
- Collapsible filters on small screens

## Usage Guide

### Accessing Admin Dashboard
1. Log in with an admin account
2. Click the "Admin" button in the header (purple gradient button)
3. Navigate to `/admin` route

### Managing Orders
1. Go to Orders tab
2. Use search or filters to find specific orders
3. Click "Edit" on an order to update its status
4. Select new delivery status from dropdown
5. Click "Save" to apply changes

### Managing Users
1. Go to Users tab
2. Search for users by name or email
3. Change user role using the dropdown (requires confirmation)
4. Delete users if needed (requires confirmation)

### Viewing Analytics
1. Go to Analytics tab (default view)
2. Review key metrics in stat cards
3. Analyze charts for trends
4. Monitor recent activity

## Future Enhancements

Potential improvements for the admin dashboard:

- Export data to CSV/Excel
- Advanced filtering options
- Bulk actions for orders and users
- Email notifications for status changes
- Activity logs and audit trail
- Custom date range selection for analytics
- More detailed revenue breakdowns
- Product inventory management
- Customer support ticket system

## Technical Stack

### Frontend
- React with TypeScript
- CSS with modern features (gradients, backdrop-filter)
- Responsive design with media queries

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Role-based access control

### API Communication
- RESTful API design
- JSON data format
- Error handling with proper status codes
- Pagination support

## Troubleshooting

### Cannot Access Admin Dashboard
- Verify you're logged in
- Check your user role is 'admin'
- Clear browser cache and cookies
- Check console for errors

### Data Not Loading
- Check network connection
- Verify backend server is running
- Check browser console for API errors
- Verify MongoDB connection

### Permission Errors
- Ensure JWT token is valid
- Check token hasn't expired
- Verify admin role in database
- Re-login if necessary

## Support

For issues or questions about the admin dashboard:
1. Check this documentation
2. Review console errors
3. Check backend logs
4. Contact system administrator
