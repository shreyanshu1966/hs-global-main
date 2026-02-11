/**
 * Test Live Server API Endpoints
 * Tests the discount products endpoint on production
 */

const axios = require('axios');

const LIVE_URL = 'https://hsglobalexport.com';

async function testLiveAPI() {
    console.log('🌐 Testing Live Server API...\n');
    
    try {
        // Test 1: Get all products with discount filter
        console.log('Test 1: GET /api/admin/products/discounts/products?status=all');
        console.log('========================================');
        const response = await axios.get(`${LIVE_URL}/api/admin/products/discounts/products`, {
            params: { status: 'all', page: 1, limit: 5 },
            headers: {
                'Authorization': `Bearer YOUR_TOKEN_HERE` // Replace with actual token
            },
            validateStatus: () => true // Don't throw on any status
        });
        
        console.log('Status:', response.status);
        console.log('Success:', response.data.success);
        console.log('Data count:', response.data.data?.length || 0);
        console.log('Pagination:', JSON.stringify(response.data.pagination, null, 2));
        
        if (response.data.data && response.data.data.length > 0) {
            console.log('\n📦 Sample Product:');
            console.log(JSON.stringify(response.data.data[0], null, 2));
        } else {
            console.log('\n⚠️ No products returned!');
            console.log('Full response:', JSON.stringify(response.data, null, 2));
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
    
    try {
        // Test 2: Get analytics
        console.log('\n\nTest 2: GET /api/admin/products/analytics/discounts');
        console.log('========================================');
        const analyticsResponse = await axios.get(`${LIVE_URL}/api/admin/products/analytics/discounts`, {
            headers: {
                'Authorization': `Bearer YOUR_TOKEN_HERE` // Replace with actual token
            },
            validateStatus: () => true
        });
        
        console.log('Status:', analyticsResponse.status);
        console.log('Analytics:', JSON.stringify(analyticsResponse.data.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
    
    console.log('\n\n📋 How to use this script:');
    console.log('1. Login to https://hsglobalexport.com/admin/login');
    console.log('2. Open browser DevTools > Application > Local Storage');
    console.log('3. Copy the "token" value');
    console.log('4. Replace YOUR_TOKEN_HERE in this script with your actual token');
    console.log('5. Run: node test-live-api.js');
}

testLiveAPI();
