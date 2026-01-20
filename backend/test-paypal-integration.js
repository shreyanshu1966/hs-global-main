#!/usr/bin/env node

/**
 * PayPal Integration Test Script
 * 
 * This script helps verify that the PayPal integration is properly configured
 * Run this from the backend directory: node test-paypal-integration.js
 */

require('dotenv').config();
const axios = require('axios');

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';

const PAYPAL_API_BASE = PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

console.log('\n🔍 PayPal Integration Test\n');
console.log('='.repeat(50));

// Test 1: Check environment variables
console.log('\n✓ Test 1: Checking environment variables...');
if (!PAYPAL_CLIENT_ID) {
    console.error('❌ PAYPAL_CLIENT_ID is not set in .env');
    process.exit(1);
}
if (!PAYPAL_CLIENT_SECRET) {
    console.error('❌ PAYPAL_CLIENT_SECRET is not set in .env');
    process.exit(1);
}
console.log(`✅ Client ID: ${PAYPAL_CLIENT_ID.substring(0, 20)}...`);
console.log(`✅ Mode: ${PAYPAL_MODE}`);
console.log(`✅ API Base: ${PAYPAL_API_BASE}`);

// Test 2: Get access token
async function testAccessToken() {
    console.log('\n✓ Test 2: Getting PayPal access token...');
    try {
        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

        const response = await axios.post(
            `${PAYPAL_API_BASE}/v1/oauth2/token`,
            'grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        console.log('✅ Successfully obtained access token');
        console.log(`   Token type: ${response.data.token_type}`);
        console.log(`   Expires in: ${response.data.expires_in} seconds`);
        return response.data.access_token;
    } catch (error) {
        console.error('❌ Failed to get access token');
        console.error(`   Error: ${error.response?.data?.error_description || error.message}`);
        process.exit(1);
    }
}

// Test 3: Create a test order
async function testCreateOrder(accessToken) {
    console.log('\n✓ Test 3: Creating test PayPal order...');
    try {
        const testOrder = {
            intent: 'CAPTURE',
            purchase_units: [{
                reference_id: 'TEST-ORDER-001',
                description: 'Test Order from HS Global',
                amount: {
                    currency_code: 'USD',
                    value: '10.00'
                }
            }],
            application_context: {
                brand_name: 'HS Global Export',
                return_url: 'https://example.com/success',
                cancel_url: 'https://example.com/cancel'
            }
        };

        const response = await axios.post(
            `${PAYPAL_API_BASE}/v2/checkout/orders`,
            testOrder,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Successfully created test order');
        console.log(`   Order ID: ${response.data.id}`);
        console.log(`   Status: ${response.data.status}`);

        const approvalUrl = response.data.links.find(link => link.rel === 'approve')?.href;
        if (approvalUrl) {
            console.log(`   Approval URL: ${approvalUrl.substring(0, 60)}...`);
        }

        return response.data.id;
    } catch (error) {
        console.error('❌ Failed to create test order');
        console.error(`   Error: ${error.response?.data?.message || error.message}`);
        if (error.response?.data?.details) {
            console.error('   Details:', JSON.stringify(error.response.data.details, null, 2));
        }
        process.exit(1);
    }
}

// Test 4: Get order details
async function testGetOrder(accessToken, orderId) {
    console.log('\n✓ Test 4: Getting order details...');
    try {
        const response = await axios.get(
            `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Successfully retrieved order details');
        console.log(`   Order ID: ${response.data.id}`);
        console.log(`   Status: ${response.data.status}`);
        console.log(`   Amount: ${response.data.purchase_units[0].amount.value} ${response.data.purchase_units[0].amount.currency_code}`);
    } catch (error) {
        console.error('❌ Failed to get order details');
        console.error(`   Error: ${error.response?.data?.message || error.message}`);
        process.exit(1);
    }
}

// Run all tests
async function runTests() {
    try {
        const accessToken = await testAccessToken();
        const orderId = await testCreateOrder(accessToken);
        await testGetOrder(accessToken, orderId);

        console.log('\n' + '='.repeat(50));
        console.log('✅ All tests passed!');
        console.log('\nYour PayPal integration is properly configured.');
        console.log('\nNext steps:');
        console.log('1. Start your backend server: npm start');
        console.log('2. Start your frontend: cd ../frontend && npm run dev');
        console.log('3. Test the checkout flow on your website');
        console.log('4. Use sandbox account to complete payment:');
        console.log('   Email: sb-7gupb48893791@business.example.com');
        console.log('   Password: 4s[_mvLn');
        console.log('\n' + '='.repeat(50) + '\n');

    } catch (error) {
        console.error('\n❌ Tests failed');
        process.exit(1);
    }
}

runTests();
