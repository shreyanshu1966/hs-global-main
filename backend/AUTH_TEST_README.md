# Authentication Flow Test Script

## 🎯 Purpose
This script comprehensively tests all authentication functionality including:
- OTP sending and verification
- User registration with email verification
- Regular password login
- OTP-based login
- Email verification resend functionality

## 📧 Demo Email
The script uses: **shreyanshumaske1966@gmail.com**

## 🚀 How to Run

### Prerequisites
**IMPORTANT:** Make sure your backend server is running first!

1. **Start the backend server** (in one terminal):
   ```bash
   cd backend
   npm start
   ```
   Wait for: `Server running on port 3000`

2. **Run tests** (in another terminal):

#### Method 1: Using npm script (Recommended)
```bash
cd backend
npm run test-auth
```

#### Method 2: Direct Node execution
```bash
cd backend
node test-auth-flow.js
```

#### Method 3: Windows Batch File
```bash
cd backend
run-auth-test.bat
```

#### Method 4: Test against production (advanced)
```bash
cd backend
node test-auth-flow.js --production
```

## 📊 Test Results Interpretation

### ✅ Success Indicators
- **✅ OTP Send: SUCCESS** - OTP email successfully sent
- **✅ OTP Verify: SUCCESS** - OTP verification working
- **✅ Registration: SUCCESS** - User creation working
- **✅ Login: SUCCESS** - Password login working
- **✅ Email Resend: SUCCESS** - Verification email resend working

### ⚠️ Expected Warnings
- **User might already exist** - Normal if running tests multiple times
- **No OTP provided** - Expected in production mode (OTP sent via email)

### ❌ Critical Failures
- **Email configuration incomplete** - Check SMTP settings in .env
- **Request failed** - Server might not be running
- **Server configuration error** - Missing environment variables

## 🔧 What Gets Tested

### 1. Email Service Configuration
- Verifies SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS are set
- Checks optional EMAIL_FROM, EMAIL_TO variables

### 2. OTP Flow
- **POST /api/otp/send** - Sends OTP to email
- **POST /api/otp/verify** - Verifies OTP code

### 3. Authentication OTP Flow  
- **POST /api/auth/request-otp** - Requests OTP for login
- **POST /api/auth/login-otp** - Login using OTP (manual step)

### 4. Registration Flow
- **POST /api/auth/register** - Creates new user account
- Checks if email verification is triggered

### 5. Login Flow
- **POST /api/auth/login** - Standard email/password login

### 6. Email Verification
- **POST /api/auth/resend-verification** - Resends verification email

## 📧 Email Verification

After running the test:
1. **Check the demo email inbox** for verification emails
2. **Click verification links** to complete email verification
3. **Note OTP codes** sent via email for manual testing

## 🧹 Cleanup

The script provides cleanup instructions at the end:
```javascript
// To remove test data from database:
db.users.deleteOne({ email: "shreyanshumaske1966@gmail.com" })
db.otps.deleteMany({ email: "shreyanshumaske1966@gmail.com" })
```

## 🔍 Troubleshooting

### "Backend server is not running" Error
```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Run tests (after seeing "Server running" message)
cd backend
npm run test-auth
```

### "Received HTML instead of JSON" Error
This means the test is hitting the frontend instead of the backend API:
- Make sure backend server is running on port 3000
- Check that you're using `http://localhost:3000/api` not the production URL
- Restart the backend server if needed

### Server Not Running
```bash
cd backend
npm start
```

### Missing Dependencies
```bash
cd backend
npm install
```

### SMTP Configuration Issues
Check your `.env` file has:
```env
SMTP_HOST=sg2plzcpnl509436.prod.sin2.secureserver.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=contact@hsglobalexport.com
SMTP_PASS=Hsglobal@2026contact
EMAIL_FROM=contact@hsglobalexport.com
```

### Database Connection Issues
- Ensure MongoDB is running
- Check MONGODB_URI in .env

## 📱 Testing Frontend Integration

After backend tests pass, test frontend:
1. **Visit:** http://localhost:5173/login-otp
2. **Enter:** shreyanshumaske1966@gmail.com  
3. **Check:** Email for OTP code
4. **Verify:** OTP input and login works

## 🎯 Expected Output

Successful test run should show:
```
🧪 Testing Authentication Flow
📧 Demo Email: shreyanshumaske1966@gmail.com
🌐 API URL: http://localhost:3000/api
============================================================

🔵 Testing Email Service Configuration
--------------------------------------------------
   ✅ SMTP_HOST: sg2plzcpnl509436.prod.sin2.secureserver.net
   ✅ SMTP_PORT: 587
   ✅ SMTP_USER: contact@hsglobalexport.com
   ✅ SMTP_PASS: ***

🔵 Testing OTP Send Functionality  
--------------------------------------------------
📤 POST /otp/send
📥 Status: 200
✅ OTP Send: SUCCESS
📧 OTP sent to shreyanshumaske1966@gmail.com

... (more test results)

============================================================
✅ All tests completed in 3.45s
📧 Check your email inbox for verification emails
🔍 Check console logs above for any failures
============================================================
```