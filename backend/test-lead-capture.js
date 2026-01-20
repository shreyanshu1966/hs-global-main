// Test script for lead capture endpoint
const API_URL = 'http://localhost:3000/api';

async function testLeadCapture() {
    console.log('🧪 Testing Lead Capture Endpoint...\n');

    const testData = {
        name: 'Test User',
        email: 'test@example.com',
        countryCode: '+91',
        phone: '9876543210',
        clientType: 'personal',
        services: ['Marble', 'Granite'],
        message: 'This is a test submission'
    };

    try {
        console.log('📤 Sending test lead capture...');
        console.log('Data:', JSON.stringify(testData, null, 2));

        const response = await fetch(`${API_URL}/leads/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        const result = await response.json();

        console.log('\n📥 Response Status:', response.status);
        console.log('Response:', JSON.stringify(result, null, 2));

        if (response.ok && result.ok) {
            console.log('\n✅ SUCCESS! Lead capture is working correctly.');
            console.log('Lead ID:', result.leadId);
            console.log('\n📧 Check your email for:');
            console.log('  - Admin notification email');
            console.log('  - Customer confirmation email');
        } else {
            console.log('\n❌ FAILED! Error:', result.error);
        }

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
    }
}

// Run the test
testLeadCapture();
