#!/usr/bin/env node

/**
 * Backend API Health Check Script
 * Tests all major endpoints to verify the backend is working correctly
 */

const https = require('https');
const http = require('http');

// Configuration
const API_BASE_URL = process.env.API_URL || 'https://api.hsglobalexport.com';
const TIMEOUT = 10000; // 10 seconds

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

// Test results
const results = {
    passed: 0,
    failed: 0,
    total: 0,
    tests: []
};

/**
 * Make HTTP/HTTPS request
 */
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const protocol = urlObj.protocol === 'https:' ? https : http;

        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'API-Health-Check/1.0',
                ...options.headers
            },
            timeout: TIMEOUT
        };

        const req = protocol.request(requestOptions, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = data ? JSON.parse(data) : {};
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: jsonData,
                        rawData: data
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: null,
                        rawData: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }

        req.end();
    });
}

/**
 * Run a single test
 */
async function runTest(name, url, expectedStatus = 200, options = {}) {
    results.total++;

    try {
        console.log(`${colors.cyan}Testing:${colors.reset} ${name}`);
        console.log(`${colors.blue}URL:${colors.reset} ${url}`);

        const startTime = Date.now();
        const response = await makeRequest(url, options);
        const duration = Date.now() - startTime;

        const passed = response.statusCode === expectedStatus;

        if (passed) {
            results.passed++;
            console.log(`${colors.green}✓ PASSED${colors.reset} (${duration}ms) - Status: ${response.statusCode}`);

            if (response.data) {
                console.log(`${colors.blue}Response:${colors.reset}`, JSON.stringify(response.data, null, 2));
            }
        } else {
            results.failed++;
            console.log(`${colors.red}✗ FAILED${colors.reset} (${duration}ms)`);
            console.log(`${colors.red}Expected:${colors.reset} ${expectedStatus}, ${colors.red}Got:${colors.reset} ${response.statusCode}`);

            if (response.rawData) {
                console.log(`${colors.red}Response:${colors.reset}`, response.rawData.substring(0, 500));
            }
        }

        results.tests.push({
            name,
            url,
            passed,
            statusCode: response.statusCode,
            expectedStatus,
            duration,
            data: response.data
        });

    } catch (error) {
        results.failed++;
        console.log(`${colors.red}✗ ERROR${colors.reset} - ${error.message}`);

        results.tests.push({
            name,
            url,
            passed: false,
            error: error.message
        });
    }

    console.log(''); // Empty line for readability
}

/**
 * Main test suite
 */
async function runTests() {
    console.log(`${colors.bright}${colors.cyan}========================================${colors.reset}`);
    console.log(`${colors.bright}Backend API Health Check${colors.reset}`);
    console.log(`${colors.cyan}========================================${colors.reset}`);
    console.log(`${colors.blue}Base URL:${colors.reset} ${API_BASE_URL}`);
    console.log(`${colors.blue}Time:${colors.reset} ${new Date().toISOString()}`);
    console.log('');

    // Test 1: Health Check
    await runTest(
        'Health Check',
        `${API_BASE_URL}/api/health`,
        200
    );

    // Test 2: Currency Rates
    await runTest(
        'Currency Rates',
        `${API_BASE_URL}/api/currency/rates`,
        200
    );

    // Test 3: Shipping Estimate (should fail without proper data, but endpoint should exist)
    await runTest(
        'Shipping Estimate Endpoint',
        `${API_BASE_URL}/api/shipping/estimate`,
        400, // Expecting 400 because we're not sending required data
        {
            method: 'POST',
            body: {}
        }
    );

    // Test 4: Contact Form Submission (should fail validation, but endpoint should exist)
    await runTest(
        'Contact Form Endpoint',
        `${API_BASE_URL}/api/contact/submit`,
        400, // Expecting 400 because we're not sending required data
        {
            method: 'POST',
            body: {}
        }
    );

    // Test 5: Quotation Submission (should fail validation, but endpoint should exist)
    await runTest(
        'Quotation Submission Endpoint',
        `${API_BASE_URL}/api/quotations/submit`,
        400, // Expecting 400 because we're not sending required data
        {
            method: 'POST',
            body: {}
        }
    );

    // Test 6: Blog Routes
    await runTest(
        'Blog List Endpoint',
        `${API_BASE_URL}/api/blogs`,
        200
    );

    // Test 7: Auth - Login (should fail without credentials, but endpoint should exist)
    await runTest(
        'Auth Login Endpoint',
        `${API_BASE_URL}/api/auth/login`,
        400, // Expecting 400 because we're not sending credentials
        {
            method: 'POST',
            body: {}
        }
    );

    // Test 8: Protected Admin Route (should return 401 unauthorized)
    await runTest(
        'Admin Protected Route',
        `${API_BASE_URL}/api/quotations`,
        401, // Expecting 401 because we're not authenticated
        {
            method: 'GET'
        }
    );

    // Print summary
    console.log(`${colors.bright}${colors.cyan}========================================${colors.reset}`);
    console.log(`${colors.bright}Test Summary${colors.reset}`);
    console.log(`${colors.cyan}========================================${colors.reset}`);
    console.log(`${colors.blue}Total Tests:${colors.reset} ${results.total}`);
    console.log(`${colors.green}Passed:${colors.reset} ${results.passed}`);
    console.log(`${colors.red}Failed:${colors.reset} ${results.failed}`);
    console.log(`${colors.blue}Success Rate:${colors.reset} ${((results.passed / results.total) * 100).toFixed(2)}%`);
    console.log('');

    // Detailed results
    if (results.failed > 0) {
        console.log(`${colors.red}${colors.bright}Failed Tests:${colors.reset}`);
        results.tests
            .filter(test => !test.passed)
            .forEach(test => {
                console.log(`${colors.red}✗${colors.reset} ${test.name}`);
                console.log(`  URL: ${test.url}`);
                if (test.error) {
                    console.log(`  Error: ${test.error}`);
                } else {
                    console.log(`  Expected: ${test.expectedStatus}, Got: ${test.statusCode}`);
                }
            });
        console.log('');
    }

    // Overall status
    if (results.failed === 0) {
        console.log(`${colors.green}${colors.bright}✓ All tests passed! Backend is working correctly.${colors.reset}`);
        process.exit(0);
    } else {
        console.log(`${colors.red}${colors.bright}✗ Some tests failed. Please check the backend.${colors.reset}`);
        process.exit(1);
    }
}

// Run the tests
runTests().catch(error => {
    console.error(`${colors.red}${colors.bright}Fatal Error:${colors.reset}`, error);
    process.exit(1);
});
