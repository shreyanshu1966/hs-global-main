const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Test configuration
const TEST_EMAIL = 'shreyanshumaske1966@gmail.com';
const TEST_PASSWORD = 'TestPassword123!';
const TEST_NAME = 'Test User';

// Always use local backend for testing unless explicitly overridden
const API_BASE = process.argv.includes('--production') 
    ? (process.env.FRONTEND_URL || 'https://www.hsglobalexport.com')
    : 'http://localhost:3000';
const API_URL = `${API_BASE}/api`;

console.log(`🧪 Testing Authentication Flow`);
console.log(`📧 Demo Email: ${TEST_EMAIL}`);
console.log(`🌐 API URL: ${API_URL}`);
console.log('='.repeat(60));

// Helper function to make API requests
async function apiRequest(endpoint, method = 'GET', body = null, headers = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
        method,
        url,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        timeout: 30000, // Increased to 30 seconds for email operations
        validateStatus: () => true // Don't throw on HTTP error status
    };
    
    if (body) {
        config.data = body;
    }
    
    try {
        console.log(`📤 ${method} ${endpoint}`);
        if (body) console.log(`   Body:`, JSON.stringify(body, null, 2));
        
        const response = await axios(config);
        const data = response.data;
        
        console.log(`📥 Status: ${response.status}`);
        
        // Check if we got HTML instead of JSON (indicates wrong endpoint)
        if (typeof data === 'string' && data.includes('<!DOCTYPE html>')) {
            console.log(`   Response: HTML page received (likely hitting frontend instead of API)`);
            return { 
                response, 
                data: { error: 'Received HTML response instead of JSON - check API endpoint' }, 
                status: response.status,
                isHtml: true
            };
        } else {
            console.log(`   Response:`, JSON.stringify(data, null, 2));
        }
        
        return { response, data, status: response.status };
    } catch (error) {
        console.error(`❌ Request failed:`, error.message);
        return { error: error.message };
    }
}

// Test functions
async function testOTPSend() {
    console.log('\n🔵 Testing OTP Send Functionality');
    console.log('-'.repeat(50));
    
    const result = await apiRequest('/otp/send', 'POST', {
        email: TEST_EMAIL
    });
    
    if (result.data?.ok) {
        console.log('✅ OTP Send: SUCCESS');
        console.log(`📧 OTP sent to ${TEST_EMAIL}`);
        
        // If development mode, show the OTP token
        if (result.data.otpToken) {
            console.log(`🔑 Development OTP Token: ${result.data.otpToken}`);
            return result.data.otpToken;
        }
        
        return true;
    } else {
        console.log('❌ OTP Send: FAILED');
        if (result.isHtml) {
            console.log('Error: Received HTML instead of JSON - backend server may not be running on correct port');
        } else {
            console.log('Error:', result.data?.error || result.error);
        }
        return false;
    }
}

async function testOTPVerify(otp) {
    console.log('\n🔵 Testing OTP Verification');
    console.log('-'.repeat(50));
    
    if (!otp) {
        console.log('⚠️  No OTP provided - skipping verification test');
        return false;
    }
    
    const result = await apiRequest('/otp/verify', 'POST', {
        email: TEST_EMAIL,
        code: otp
    });
    
    if (result.data?.ok) {
        console.log('✅ OTP Verify: SUCCESS');
        return true;
    } else {
        console.log('❌ OTP Verify: FAILED');
        console.log('Error:', result.data?.error || result.error);
        return false;
    }
}

async function testAuthOTPFlow() {
    console.log('\n🔵 Testing Auth OTP Login Flow');
    console.log('-'.repeat(50));
    
    // Step 1: Request OTP for login
    const otpRequest = await apiRequest('/auth/request-otp', 'POST', {
        email: TEST_EMAIL
    });
    
    if (!otpRequest.data?.ok) {
        console.log('❌ Auth OTP Request: FAILED');
        if (otpRequest.isHtml) {
            console.log('Error: Received HTML instead of JSON - backend server may not be running on correct port');
        } else {
            console.log('Error:', otpRequest.data?.error || otpRequest.error);
        }
        return false;
    }
    
    console.log('✅ Auth OTP Request: SUCCESS');
    
    // Note: In production, user would get OTP via email
    console.log('📧 Check email for OTP to test login with OTP');
    console.log('   Use: POST /auth/login-otp with { email, otp }');
    
    return true;
}

async function testRegistration() {
    console.log('\n🔵 Testing User Registration');
    console.log('-'.repeat(50));
    
    // First check if user already exists
    console.log('ℹ️  Checking if user already exists...');
    
    const result = await apiRequest('/auth/register', 'POST', {
        name: TEST_NAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        phone: '+1234567890'
    });
    
    if (result.data?.ok) {
        console.log('✅ Registration: SUCCESS');
        console.log(`👤 User created: ${result.data.user?.name} (${result.data.user?.email})`);
        console.log(`🔒 Email Verified: ${result.data.user?.emailVerified ? 'Yes' : 'No'}`);
        
        if (!result.data.user?.emailVerified) {
            console.log('📧 Verification email should be sent to user');
        }
        
        return {
            success: true,
            user: result.data.user,
            token: result.data.token
        };
    } else {
        console.log('❌ Registration: FAILED');
        if (result.isHtml) {
            console.log('Error: Received HTML instead of JSON - backend server may not be running on correct port');
        } else if (result.error && result.error.includes('timeout')) {
            console.log('Error: Request timed out - email sending may be slow');
            console.log('ℹ️  This can happen with GoDaddy SMTP when sending verification emails');
            console.log('ℹ️  The registration might still have succeeded despite the timeout');
        } else {
            console.log('Error:', result.data?.error || result.error);
            
            if (result.data?.error?.includes('already exists') || result.status === 400) {
                console.log('ℹ️  User already exists - this is expected for testing');
                return { success: false, userExists: true };
            }
        }
        
        return { success: false };
    }
}

async function testLogin() {
    console.log('\n🔵 Testing Regular Login');
    console.log('-'.repeat(50));
    
    const result = await apiRequest('/auth/login', 'POST', {
        email: TEST_EMAIL,
        password: TEST_PASSWORD
    });
    
    if (result.data?.ok) {
        console.log('✅ Login: SUCCESS');
        console.log(`👤 Logged in: ${result.data.user?.name} (${result.data.user?.email})`);
        console.log(`🔒 Email Verified: ${result.data.user?.emailVerified ? 'Yes' : 'No'}`);
        
        return {
            success: true,
            user: result.data.user,
            token: result.data.token
        };
    } else {
        console.log('❌ Login: FAILED');
        if (result.isHtml) {
            console.log('Error: Received HTML instead of JSON - backend server may not be running on correct port');
        } else {
            console.log('Error:', result.data?.error || result.error);
        }
        return { success: false };
    }
}

async function testEmailResending(token) {
    console.log('\n🔵 Testing Email Verification Resend');
    console.log('-'.repeat(50));
    
    if (!token) {
        console.log('⚠️  No auth token provided - skipping resend test');
        return false;
    }
    
    console.log('ℹ️  This test sends verification email via GoDaddy SMTP...');
    console.log('⏳ Please wait, email sending may take 10-30 seconds...');
    
    const result = await apiRequest('/auth/resend-verification', 'POST', null, {
        'Authorization': `Bearer ${token}`
    });
    
    if (result.data?.ok) {
        console.log('✅ Email Resend: SUCCESS');
        console.log('📧 Verification email sent');
        return true;
    } else {
        console.log('❌ Email Resend: FAILED');
        if (result.error && result.error.includes('timeout')) {
            console.log('Error: Request timed out');
            console.log('ℹ️  GoDaddy SMTP can be slow - the email might still be sent');
            console.log('📧 Check your inbox in a few minutes');
        } else if (result.isHtml) {
            console.log('Error: Received HTML instead of JSON');
        } else {
            console.log('Error:', result.data?.error || result.error);
        }
        return false;
    }
}

async function checkServerStatus() {
    console.log('\n🔵 Checking Backend Server Status');
    console.log('-'.repeat(50));
    
    try {
        const response = await axios.get(`${API_BASE}/api/health`, {
            timeout: 5000,
            validateStatus: () => true
        });
        
        if (response.status === 200) {
            console.log('✅ Backend server is running');
            return true;
        } else if (response.status === 404) {
            console.log('⚠️  Server running but no health endpoint found (this is okay)');
            return true;
        } else {
            console.log('❌ Server responded with status:', response.status);
            return false;
        }
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Backend server is not running!');
            console.log('   Please start the server with: npm start');
            return false;
        } else {
            console.log('⚠️  Could not connect to server:', error.message);
            console.log('   Proceeding with tests anyway...');
            return true;
        }
    }
}

async function testEmailServiceConfiguration() {
    console.log('\n🔵 Testing Email Service Configuration');
    console.log('-'.repeat(50));
    
    // Check environment variables
    const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    let configValid = true;
    
    console.log('📋 Checking email configuration:');
    requiredVars.forEach(varName => {
        const value = process.env[varName];
        if (value) {
            console.log(`   ✅ ${varName}: ${varName.includes('PASS') ? '***' : value}`);
        } else {
            console.log(`   ❌ ${varName}: MISSING`);
            configValid = false;
        }
    });
    
    // Check optional variables
    const optionalVars = ['EMAIL_FROM', 'EMAIL_TO'];
    optionalVars.forEach(varName => {
        const value = process.env[varName];
        if (value) {
            console.log(`   ℹ️  ${varName}: ${value}`);
        } else {
            console.log(`   ⚠️  ${varName}: Not set (will use defaults)`);
        }
    });
    
    return configValid;
}

async function cleanupTestUser() {
    console.log('\n🧹 Cleanup (Optional)');
    console.log('-'.repeat(50));
    console.log('ℹ️  To clean up test user, manually delete from database:');
    console.log(`   db.users.deleteOne({ email: "${TEST_EMAIL}" })`);
    console.log(`   db.otps.deleteMany({ email: "${TEST_EMAIL}" })`);
}

// Main test runner
async function runAllTests() {
    const startTime = Date.now();
    
    try {
        console.log('🚀 Starting Authentication Flow Tests...\n');
        
        // Check if backend server is running
        const serverRunning = await checkServerStatus();
        if (!serverRunning) {
            console.log('\n💡 To start the backend server:');
            console.log('   cd backend');
            console.log('   npm start');
            return;
        }
        
        // 1. Test email configuration
        const configValid = await testEmailServiceConfiguration();
        if (!configValid) {
            console.log('\n❌ Email configuration is incomplete. Please check your .env file');
            return;
        }
        
        // 2. Test OTP functionality
        const otpToken = await testOTPSend();
        if (otpToken && typeof otpToken === 'string') {
            await testOTPVerify(otpToken);
        }
        
        // 3. Test auth OTP flow
        await testAuthOTPFlow();
        
        // 4. Test registration
        const registration = await testRegistration();
        
        // 5. Test login
        const login = await testLogin();
        
        // 6. Test email resending (if we have a token)
        const token = login?.token || registration?.token;
        if (token) {
            await testEmailResending(token);
        }
        
        // 7. Cleanup instructions
        await cleanupTestUser();
        
    } catch (error) {
        console.error('\n💥 Test runner failed:', error.message);
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n' + '='.repeat(60));
    console.log(`✅ All tests completed in ${duration}s`);
    console.log('📧 Check your email inbox for verification emails');
    console.log('🔍 Check console logs above for any failures');
    console.log('='.repeat(60));
}

// Run if called directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    runAllTests,
    testOTPSend,
    testOTPVerify,
    testAuthOTPFlow,
    testRegistration,
    testLogin,
    testEmailResending,
    TEST_EMAIL
};