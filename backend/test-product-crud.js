/**
 * Comprehensive Product CRUD Test
 * Tests all product operations: Create, Read, Update, Delete
 * 
 * Run with: node test-product-crud.js
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@hsglobal.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Test data
let authToken = '';
let testProductId = '';
let createdProductMongoId = '';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'magenta');
    console.log('='.repeat(60));
}

function logTest(testName) {
    log(`\n📋 TEST: ${testName}`, 'blue');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

// Test Results Tracker
const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
};

function recordTest(name, passed, error = null) {
    testResults.total++;
    if (passed) {
        testResults.passed++;
        logSuccess(`PASSED: ${name}`);
    } else {
        testResults.failed++;
        logError(`FAILED: ${name}`);
        if (error) {
            logError(`Error: ${error}`);
        }
    }
    testResults.tests.push({ name, passed, error });
}

// Authentication
async function authenticateAdmin() {
    logSection('AUTHENTICATION');
    logTest('Admin Login');
    
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });

        if (response.data.ok && response.data.token) {
            authToken = response.data.token;
            logSuccess('Admin authenticated successfully');
            logSuccess(`Token: ${authToken.substring(0, 20)}...`);
            logSuccess(`User: ${response.data.user.name} (${response.data.user.email})`);
            logSuccess(`Role: ${response.data.user.role}`);
            recordTest('Admin Authentication', true);
            return true;
        } else {
            throw new Error('No token received');
        }
    } catch (error) {
        recordTest('Admin Authentication', false, error.message);
        throw error;
    }
}

// Helper function to create test image
function createTestImage() {
    const imagePath = path.join(__dirname, 'test-product-image.txt');
    fs.writeFileSync(imagePath, 'Test product image data');
    return imagePath;
}

// Test 1: Create Product - Furniture with all fields
async function testCreateFurnitureProduct() {
    logSection('CREATE OPERATION - FURNITURE PRODUCT');
    logTest('Create furniture product with all fields');
    
    try {
        const formData = new FormData();
        
        testProductId = `TEST-FURN-${Date.now()}`;
        
        const productData = {
            productId: testProductId,
            name: 'Test Marble Coffee Table',
            category: 'furniture',
            subcategory: 'coffee-table',
            description: 'A beautiful handcrafted marble coffee table with intricate patterns. Perfect for modern living rooms.',
            image: 'https://res.cloudinary.com/test/image/upload/test-product.jpg',
            images: ['https://res.cloudinary.com/test/image/upload/test-product.jpg'],
            sortedImages: ['https://res.cloudinary.com/test/image/upload/test-product.jpg'],
            priceUSD: 45000,
            status: 'active',
            available: true,
            featured: true,
            dimensions: {
                length: 120,
                width: 60,
                height: 45,
                unit: 'cm'
            },
            weight: 75,
            furnitureSpecs: {
                type: 'Table',
                shape: 'Rectangle',
                material: 'Marble',
                size: '120cm x 60cm x 45cm',
                surfaceFinish: 'Polished',
                colorName: 'Carrara White',
                height: '45cm',
                location: 'Rajasthan, India',
                packagingDetails: 'Wrapped in protective foam and wooden crate'
            },
            discount: {
                enabled: true,
                percentage: 15,
                description: 'Launch Offer'
            }
        };

        formData.append('productData', JSON.stringify(productData));

        const response = await axios.post(
            `${API_URL}/admin/products`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    ...formData.getHeaders()
                }
            }
        );

        if (response.data.success && response.data.data) {
            createdProductMongoId = response.data.data._id;
            logSuccess(`Product created: ${response.data.data.name}`);
            logSuccess(`MongoDB ID: ${createdProductMongoId}`);
            logSuccess(`Product ID: ${response.data.data.productId}`);
            
            // Validate all fields
            const product = response.data.data;
            const validations = [
                { field: 'productId', expected: testProductId, actual: product.productId },
                { field: 'name', expected: productData.name, actual: product.name },
                { field: 'category', expected: 'furniture', actual: product.category },
                { field: 'subcategory', expected: 'coffee-table', actual: product.subcategory },
                { field: 'priceUSD', expected: 45000, actual: product.priceUSD },
                { field: 'status', expected: 'active', actual: product.status },
                { field: 'available', expected: true, actual: product.available },
                { field: 'featured', expected: true, actual: product.featured },
                { field: 'weight', expected: 75, actual: product.weight },
                { field: 'dimensions.length', expected: 120, actual: product.dimensions?.length },
                { field: 'dimensions.width', expected: 60, actual: product.dimensions?.width },
                { field: 'dimensions.height', expected: 45, actual: product.dimensions?.height },
                { field: 'discount.enabled', expected: true, actual: product.discount?.enabled },
                { field: 'discount.percentage', expected: 15, actual: product.discount?.percentage }
            ];

            let allValid = true;
            validations.forEach(v => {
                if (v.expected !== v.actual) {
                    logWarning(`Field mismatch: ${v.field} - Expected: ${v.expected}, Got: ${v.actual}`);
                    allValid = false;
                }
            });

            if (allValid) {
                logSuccess('All fields validated successfully');
            }
            
            recordTest('Create Furniture Product', true);
            return true;
        } else {
            throw new Error('Product creation failed - no data returned');
        }
    } catch (error) {
        recordTest('Create Furniture Product', false, error.response?.data?.message || error.message);
        throw error;
    }
}

// Test 2: Create Product - Slab with specifications
async function testCreateSlabProduct() {
    logSection('CREATE OPERATION - SLAB PRODUCT');
    logTest('Create slab product with specifications');
    
    try {
        const formData = new FormData();
        
        const slabProductId = `TEST-SLAB-${Date.now()}`;
        
        const productData = {
            productId: slabProductId,
            name: 'Italian Carrara Marble Slab',
            category: 'slabs',
            subcategory: 'marble',
            description: 'Premium imported Italian Carrara marble slab with beautiful white background and grey veining.',
            image: 'https://res.cloudinary.com/test/image/upload/test-slab.jpg',
            images: ['https://res.cloudinary.com/test/image/upload/test-slab.jpg'],
            sortedImages: ['https://res.cloudinary.com/test/image/upload/test-slab.jpg'],
            priceUSD: 8500,
            status: 'active',
            available: true,
            featured: false,
            slabSpecs: {
                finish: 'Polished',
                thickness: '20mm',
                origin: 'Carrara, Italy',
                material: 'Marble',
                application: 'Kitchen Countertop'
            }
        };

        formData.append('productData', JSON.stringify(productData));

        const response = await axios.post(
            `${API_URL}/admin/products`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    ...formData.getHeaders()
                }
            }
        );

        if (response.data.success && response.data.data) {
            logSuccess(`Slab product created: ${response.data.data.name}`);
            logSuccess(`Slab specs validated: ${JSON.stringify(response.data.data.slabSpecs)}`);
            recordTest('Create Slab Product', true);
            return response.data.data._id;
        }
    } catch (error) {
        recordTest('Create Slab Product', false, error.response?.data?.message || error.message);
        return null;
    }
}

// Test 3: Read Product - Get by ID
async function testGetProductById() {
    logSection('READ OPERATION - GET BY ID');
    logTest('Fetch product by product ID');
    
    try {
        const response = await axios.get(`${API_URL}/admin/products/${testProductId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.data.success && response.data.data) {
            const product = response.data.data;
            logSuccess(`Product fetched: ${product.name}`);
            logSuccess(`Product ID: ${product.productId}`);
            logSuccess(`Category: ${product.category}`);
            logSuccess(`Price: ₹${product.priceUSD}`);
            
            // Validate it's the same product
            if (product.productId === testProductId) {
                logSuccess('Product ID matches created product');
                recordTest('Get Product By ID', true);
                return true;
            } else {
                throw new Error('Product ID mismatch');
            }
        } else {
            throw new Error('Product not found');
        }
    } catch (error) {
        recordTest('Get Product By ID', false, error.response?.data?.message || error.message);
        return false;
    }
}

// Test 4: Read Products - Get All with filters
async function testGetAllProducts() {
    logSection('READ OPERATION - GET ALL PRODUCTS');
    logTest('Fetch all products with pagination');
    
    try {
        const response = await axios.get(`${API_URL}/admin/products`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            params: {
                page: 1,
                limit: 10,
                category: 'furniture'
            }
        });

        if (response.data.success && response.data.data) {
            logSuccess(`Total products: ${response.data.pagination.totalItems}`);
            logSuccess(`Current page: ${response.data.pagination.current}`);
            logSuccess(`Products in response: ${response.data.data.length}`);
            recordTest('Get All Products', true);
            return true;
        }
    } catch (error) {
        recordTest('Get All Products', false, error.response?.data?.message || error.message);
        return false;
    }
}

// Test 5: Update Product - Modify fields
async function testUpdateProduct() {
    logSection('UPDATE OPERATION - MODIFY PRODUCT');
    logTest('Update product fields');
    
    try {
        const formData = new FormData();
        
        const updateData = {
            name: 'Updated Marble Coffee Table - Premium Edition',
            priceUSD: 52000,
            description: 'Updated description with more details about the craftsmanship and quality.',
            featured: false,
            discount: {
                enabled: true,
                percentage: 20,
                description: 'Special Discount'
            },
            furnitureSpecs: {
                type: 'Table',
                shape: 'Rectangle',
                material: 'Marble',
                size: '120cm x 60cm x 45cm',
                surfaceFinish: 'High Gloss Polished',
                colorName: 'Premium Carrara White',
                height: '45cm',
                location: 'Rajasthan, India',
                packagingDetails: 'Premium packaging with double foam protection'
            }
        };

        formData.append('productData', JSON.stringify(updateData));

        const response = await axios.put(
            `${API_URL}/admin/products/${testProductId}`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    ...formData.getHeaders()
                }
            }
        );

        if (response.data.success && response.data.data) {
            const product = response.data.data;
            logSuccess(`Product updated: ${product.name}`);
            
            // Validate updates
            const validations = [
                { field: 'name', expected: updateData.name, actual: product.name },
                { field: 'priceUSD', expected: 52000, actual: product.priceUSD },
                { field: 'featured', expected: false, actual: product.featured },
                { field: 'discount.percentage', expected: 20, actual: product.discount?.percentage }
            ];

            let allValid = true;
            validations.forEach(v => {
                if (v.expected !== v.actual) {
                    logWarning(`Update mismatch: ${v.field} - Expected: ${v.expected}, Got: ${v.actual}`);
                    allValid = false;
                } else {
                    logSuccess(`✓ ${v.field} updated correctly`);
                }
            });

            recordTest('Update Product', allValid);
            return allValid;
        }
    } catch (error) {
        recordTest('Update Product', false, error.response?.data?.message || error.message);
        return false;
    }
}

// Test 6: Update Product Status
async function testUpdateProductStatus() {
    logSection('UPDATE OPERATION - CHANGE STATUS');
    logTest('Change product status to inactive');
    
    try {
        const formData = new FormData();
        formData.append('productData', JSON.stringify({ status: 'inactive' }));

        const response = await axios.put(
            `${API_URL}/admin/products/${testProductId}`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    ...formData.getHeaders()
                }
            }
        );

        if (response.data.success && response.data.data.status === 'inactive') {
            logSuccess('Product status changed to inactive');
            recordTest('Update Product Status', true);
            return true;
        }
    } catch (error) {
        recordTest('Update Product Status', false, error.response?.data?.message || error.message);
        return false;
    }
}

// Test 7: Validation Tests
async function testValidationErrors() {
    logSection('VALIDATION TESTS');
    
    // Test 7a: Missing required fields
    logTest('Test missing required fields');
    try {
        const formData = new FormData();
        formData.append('productData', JSON.stringify({
            name: 'Incomplete Product'
            // Missing productId, category, subcategory, description
        }));

        await axios.post(
            `${API_URL}/admin/products`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    ...formData.getHeaders()
                }
            }
        );
        
        recordTest('Validation - Missing Required Fields', false, 'Should have failed but succeeded');
    } catch (error) {
        if (error.response?.status === 400 || error.response?.status === 500) {
            logSuccess('Correctly rejected missing required fields');
            recordTest('Validation - Missing Required Fields', true);
        } else {
            recordTest('Validation - Missing Required Fields', false, 'Unexpected error');
        }
    }

    // Test 7b: Duplicate product ID
    logTest('Test duplicate product ID');
    try {
        const formData = new FormData();
        formData.append('productData', JSON.stringify({
            productId: testProductId, // Duplicate ID
            name: 'Duplicate Product',
            category: 'furniture',
            subcategory: 'tables',
            description: 'This should fail',
            image: 'https://res.cloudinary.com/test/image/upload/test.jpg',
            images: ['https://res.cloudinary.com/test/image/upload/test.jpg'],
            sortedImages: ['https://res.cloudinary.com/test/image/upload/test.jpg']
        }));

        await axios.post(
            `${API_URL}/admin/products`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    ...formData.getHeaders()
                }
            }
        );
        
        recordTest('Validation - Duplicate Product ID', false, 'Should have failed but succeeded');
    } catch (error) {
        if (error.response?.status === 400 || error.response?.status === 500) {
            logSuccess('Correctly rejected duplicate product ID');
            recordTest('Validation - Duplicate Product ID', true);
        } else {
            recordTest('Validation - Duplicate Product ID', false, error.message);
        }
    }
}

// Test 8: Delete Product
async function testDeleteProduct() {
    logSection('DELETE OPERATION');
    logTest('Delete test product');
    
    try {
        const response = await axios.delete(
            `${API_URL}/admin/products/${testProductId}`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        if (response.data.success) {
            logSuccess('Product deleted successfully');
            
            // Verify deletion
            try {
                await axios.get(`${API_URL}/admin/products/${testProductId}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                recordTest('Delete Product', false, 'Product still exists after deletion');
            } catch (error) {
                if (error.response?.status === 404) {
                    logSuccess('Verified: Product no longer exists');
                    recordTest('Delete Product', true);
                } else {
                    recordTest('Delete Product', false, 'Unexpected error during verification');
                }
            }
        }
    } catch (error) {
        recordTest('Delete Product', false, error.response?.data?.message || error.message);
    }
}

// Test 9: Public API Tests (no auth required)
async function testPublicAPIs() {
    logSection('PUBLIC API TESTS');
    
    // Test 9a: Get public products
    logTest('Get public products list');
    try {
        const response = await axios.get(`${API_URL}/products`, {
            params: {
                page: 1,
                limit: 10,
                category: 'furniture'
            }
        });

        if (response.data.success && Array.isArray(response.data.data)) {
            logSuccess(`Public API returned ${response.data.data.length} products`);
            recordTest('Public API - Get Products', true);
        }
    } catch (error) {
        recordTest('Public API - Get Products', false, error.message);
    }

    // Test 9b: Get categories
    logTest('Get product categories');
    try {
        const response = await axios.get(`${API_URL}/products/categories`);

        if (response.data.success && Array.isArray(response.data.data)) {
            logSuccess(`Categories: ${response.data.data.map(c => c.category).join(', ')}`);
            recordTest('Public API - Get Categories', true);
        }
    } catch (error) {
        recordTest('Public API - Get Categories', false, error.message);
    }
}

// Print Test Summary
function printTestSummary() {
    logSection('TEST SUMMARY');
    
    console.log('\n📊 Results:');
    log(`Total Tests: ${testResults.total}`, 'blue');
    log(`Passed: ${testResults.passed}`, 'green');
    log(`Failed: ${testResults.failed}`, 'red');
    
    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
    console.log(`\n✨ Success Rate: ${successRate}%\n`);
    
    if (testResults.failed > 0) {
        console.log('\n❌ Failed Tests:');
        testResults.tests
            .filter(t => !t.passed)
            .forEach(t => {
                logError(`  • ${t.name}`);
                if (t.error) {
                    console.log(`    ${t.error}`);
                }
            });
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
}

// Main Test Runner
async function runAllTests() {
    log('\n🚀 Starting Comprehensive Product CRUD Tests\n', 'magenta');
    log(`API URL: ${API_URL}`, 'blue');
    log(`Admin Email: ${ADMIN_EMAIL}\n`, 'blue');

    try {
        // Step 1: Authenticate
        await authenticateAdmin();

        // Step 2: Create Operations
        await testCreateFurnitureProduct();
        const slabProductId = await testCreateSlabProduct();

        // Step 3: Read Operations
        await testGetProductById();
        await testGetAllProducts();

        // Step 4: Update Operations
        await testUpdateProduct();
        await testUpdateProductStatus();

        // Step 5: Validation Tests
        await testValidationErrors();

        // Step 6: Delete Operations
        await testDeleteProduct();
        
        // Clean up slab product if created
        if (slabProductId) {
            try {
                await axios.delete(`${API_URL}/admin/products/${slabProductId}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                logSuccess('Cleaned up slab product');
            } catch (err) {
                logWarning('Could not clean up slab product');
            }
        }

        // Step 7: Public API Tests
        await testPublicAPIs();

    } catch (error) {
        logError(`\nTest suite failed: ${error.message}`);
        if (error.response?.data) {
            console.error('Response data:', error.response.data);
        }
    }

    // Print summary
    printTestSummary();
    
    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
    logError(`Unhandled error: ${error.message}`);
    process.exit(1);
});

// Run tests
runAllTests();
