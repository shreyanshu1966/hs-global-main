# HS Global Export - Authentication System Setup

## Quick Start Guide

### 1. Backend Setup

#### Install Dependencies
The required packages have already been installed:
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation
- `cookie-parser` - Cookie handling

#### Environment Variables
Create or update your `backend/.env` file with:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/hs_global

# JWT Secret (IMPORTANT: Change this in production!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Other existing variables...
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

**⚠️ IMPORTANT**: Generate a strong JWT_SECRET for production:
```bash
# Generate a random secret (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Frontend Setup

No additional dependencies needed! The authentication system uses existing packages.

### 3. Testing the System

#### Create a Test Account
1. Navigate to: `http://localhost:5173/signup`
2. Fill in the registration form:
   - Name: Your Name
   - Email: test@example.com
   - Password: test123 (min 6 characters)
   - Phone: (optional)
3. Click "Create Account"
4. You'll be automatically logged in and redirected to `/profile`

#### Test Login
1. Navigate to: `http://localhost:5173/login`
2. Enter your credentials
3. You'll be redirected to your profile

#### Test Checkout Integration
1. Add items to cart
2. Go to checkout
3. If logged in: Your details will auto-fill
4. If not logged in: You'll see a prompt to login

## Features Implemented

### Backend Features
✅ User registration with password hashing
✅ User login with JWT token generation
✅ Protected routes with authentication middleware
✅ Profile management (view/update)
✅ Password change functionality
✅ Secure logout
✅ Admin role support (for future features)

### Frontend Features
✅ Login page with validation
✅ Signup page with password confirmation
✅ Profile page with edit capabilities
✅ Protected routes (auto-redirect to login)
✅ Authentication context (global state)
✅ Auto-fill checkout with user data
✅ Login prompt on checkout for guests
✅ User indicator in header
✅ Smooth animations with GSAP

## API Endpoints

### Public Endpoints
```
POST /api/auth/register
POST /api/auth/login
```

### Protected Endpoints (Require Authentication)
```
GET    /api/auth/profile
PUT    /api/auth/profile
PUT    /api/auth/change-password
POST   /api/auth/logout
```

## Usage Examples

### Frontend - Using Auth Context

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (isAuthenticated) {
    return <div>Welcome, {user?.name}!</div>;
  }

  return <button onClick={() => navigate('/login')}>Login</button>;
}
```

### Frontend - Protected Route

```tsx
import { ProtectedRoute } from '../components/ProtectedRoute';

// In App.tsx
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requireAdmin>
      <AdminPanel />
    </ProtectedRoute>
  } 
/>
```

### Backend - Using Auth Middleware

```javascript
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Protect a route
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// Admin-only route
router.get('/admin', authMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: 'Admin access granted' });
});
```

## Security Best Practices

### ✅ Implemented
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with 7-day expiration
- HTTP-only cookies for additional security
- Input validation on both client and server
- Protected routes with middleware
- Secure error messages (no sensitive data leaks)

### 🔒 Recommended for Production
1. **Use HTTPS** - Always use SSL/TLS in production
2. **Strong JWT Secret** - Use a cryptographically secure random string
3. **Rate Limiting** - Add rate limiting to prevent brute force attacks
4. **Email Verification** - Verify email addresses on registration
5. **Password Reset** - Implement forgot password functionality
6. **Two-Factor Authentication** - Add 2FA for enhanced security
7. **Session Management** - Track active sessions
8. **CORS Configuration** - Restrict allowed origins in production

## Troubleshooting

### "Invalid token" error
- Check if JWT_SECRET is set in backend/.env
- Ensure frontend and backend are using the same secret
- Clear localStorage and login again

### Auto-fill not working on checkout
- Ensure user is logged in
- Check browser console for errors
- Verify AuthContext is properly wrapped in App.tsx

### User data not persisting
- Check if localStorage is enabled in browser
- Verify token is being saved after login
- Check browser console for errors

### Backend not starting
- Ensure MongoDB is running
- Check if all environment variables are set
- Verify all dependencies are installed

## File Structure

```
backend/
├── controllers/
│   └── authController.js       # Auth logic
├── middleware/
│   └── authMiddleware.js       # JWT verification
├── models/
│   └── User.js                 # User schema
├── routes/
│   └── authRoutes.js           # Auth endpoints
├── .env                        # Environment variables
└── server.js                   # Updated with auth routes

frontend/
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx     # Global auth state
│   ├── components/
│   │   ├── Header.tsx          # Updated with user menu
│   │   └── ProtectedRoute.tsx  # Route protection
│   ├── pages/
│   │   ├── Login.tsx           # Login page
│   │   ├── Signup.tsx          # Registration page
│   │   ├── Profile.tsx         # User profile
│   │   └── Checkout.tsx        # Updated with auto-fill
│   └── App.tsx                 # Updated with AuthProvider
```

## Next Steps

### Recommended Enhancements
1. **Email Verification**
   - Send verification email on registration
   - Add email verification endpoint
   - Update User model with `emailVerified` field

2. **Password Reset**
   - Add "Forgot Password" link
   - Generate reset tokens
   - Send reset email
   - Create reset password page

3. **Social Login**
   - Google OAuth
   - Facebook Login
   - Apple Sign In

4. **Order History**
   - Link orders to user accounts
   - Display order history on profile page
   - Add order tracking

5. **Admin Panel**
   - User management
   - Order management
   - Analytics dashboard

## Support

For issues or questions:
1. Check the AUTHENTICATION_GUIDE.md for detailed documentation
2. Review the code comments in each file
3. Check browser console and server logs for errors

## License

This authentication system is part of the HS Global Export application.
