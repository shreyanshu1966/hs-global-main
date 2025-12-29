# Authentication System Implementation

## Overview
A complete JWT-based authentication system has been implemented with user registration, login, profile management, and password change functionality.

## Backend Implementation

### 1. Dependencies Added
```bash
npm install bcryptjs jsonwebtoken cookie-parser
```

### 2. Database Model
**File**: `backend/models/User.js`
- User schema with email, password, name, phone, address
- Password hashing using bcrypt
- Email validation and uniqueness
- Public profile method (excludes sensitive data)
- Password comparison method

### 3. Authentication Middleware
**File**: `backend/middleware/authMiddleware.js`
- JWT token verification
- Token extraction from headers or cookies
- User attachment to request object
- Admin role checking middleware

### 4. Authentication Controller
**File**: `backend/controllers/authController.js`

**Endpoints**:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (returns JWT token)
- `GET /api/auth/profile` - Get current user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `PUT /api/auth/change-password` - Change password (protected)
- `POST /api/auth/logout` - Logout user (protected)

### 5. Routes
**File**: `backend/routes/authRoutes.js`
- Public routes: register, login
- Protected routes: profile, update profile, change password, logout

### 6. Server Configuration
**File**: `backend/server.js`
- Added `cookie-parser` middleware
- Added `/api/auth` routes
- CORS configured with credentials support

## Frontend Implementation

### 1. Authentication Context
**File**: `frontend/src/contexts/AuthContext.tsx`

**Features**:
- Global authentication state management
- User data persistence in localStorage
- Token management
- Auto-verification of stored tokens
- Methods: login, register, logout, updateProfile, changePassword

**Usage**:
```tsx
const { user, isAuthenticated, login, logout } = useAuth();
```

### 2. Login Page
**File**: `frontend/src/pages/Login.tsx`

**Features**:
- Email and password inputs
- Password visibility toggle
- Form validation
- Error handling
- Redirect to profile after login
- Link to signup page
- GSAP animations

### 3. Signup Page
**File**: `frontend/src/pages/Signup.tsx`

**Features**:
- Full name, email, phone, password inputs
- Password confirmation
- Password visibility toggles
- Client-side validation
- Error handling
- Redirect to profile after registration
- Link to login page
- GSAP animations

### 4. Profile Page
**File**: `frontend/src/pages/Profile.tsx`

**Features**:
- View user information
- Edit profile (name, phone, address)
- Change password
- Logout functionality
- Order history placeholder
- Avatar placeholder with upload button
- Protected route (redirects to login if not authenticated)
- GSAP animations

### 5. App Integration
**File**: `frontend/src/App.tsx`

**Changes**:
- Wrapped app with `AuthProvider`
- Added routes: `/login`, `/signup`, `/profile`

### 6. Header Integration
**File**: `frontend/src/components/Header.tsx`

**Changes**:
- Added user profile/login button
- Shows user's first name when authenticated
- Shows "Login" button when not authenticated
- Links to `/profile` or `/login` accordingly

## Security Features

### Backend
1. **Password Hashing**: Bcrypt with salt rounds
2. **JWT Tokens**: 7-day expiration
3. **HTTP-Only Cookies**: Additional security layer
4. **Input Validation**: Mongoose schema validation
5. **Error Handling**: Secure error messages
6. **Protected Routes**: Middleware authentication

### Frontend
1. **Token Storage**: localStorage with auto-verification
2. **Protected Routes**: Redirect to login if not authenticated
3. **Token Refresh**: Auto-verify on app load
4. **Secure Forms**: Client-side validation
5. **Password Visibility**: Toggle for user convenience

## Environment Variables Required

Add to `backend/.env`:
```env
JWT_SECRET=your-secret-key-change-in-production
MONGODB_URI=your-mongodb-connection-string
```

## API Usage Examples

### Register
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}

Response:
{
  "ok": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    ...
  }
}
```

### Login
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "ok": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Get Profile
```javascript
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response:
{
  "ok": true,
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": { ... },
    "role": "user",
    "createdAt": "..."
  }
}
```

### Update Profile
```javascript
PUT /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  }
}

Response:
{
  "ok": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

### Change Password
```javascript
PUT /api/auth/change-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}

Response:
{
  "ok": true,
  "message": "Password changed successfully"
}
```

## Testing the System

### 1. Start Backend
```bash
cd backend
npm start
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Flow
1. Navigate to `http://localhost:5173/signup`
2. Create a new account
3. You'll be redirected to `/profile`
4. Edit your profile information
5. Change your password
6. Logout and login again
7. Check that the header shows your name

## Next Steps / Enhancements

1. **Email Verification**: Send verification emails on registration
2. **Password Reset**: Forgot password functionality
3. **Social Login**: Google, Facebook OAuth
4. **Two-Factor Authentication**: SMS or authenticator app
5. **Session Management**: Active sessions list
6. **Profile Picture Upload**: Cloudinary integration
7. **Order History**: Link orders to user accounts
8. **Admin Dashboard**: User management for admins
9. **Rate Limiting**: Prevent brute force attacks
10. **Refresh Tokens**: Implement token refresh mechanism

## File Structure

```
backend/
├── controllers/
│   └── authController.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   └── User.js
├── routes/
│   └── authRoutes.js
└── server.js

frontend/
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   └── Profile.tsx
│   ├── components/
│   │   └── Header.tsx (updated)
│   └── App.tsx (updated)
```

## Notes

- All passwords are hashed before storage
- JWT tokens expire after 7 days
- Protected routes automatically redirect to login
- User data is synced between localStorage and server
- Profile page includes order history placeholder for future integration
- The system is production-ready with proper error handling and validation
