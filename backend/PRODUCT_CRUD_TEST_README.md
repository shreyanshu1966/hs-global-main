# Product CRUD Test Suite

## Overview
Comprehensive automated test suite for Product CRUD operations. Tests all create, read, update, and delete operations with validation.

## What This Tests

### ✅ Create Operations
- **Furniture Product Creation** - Creates a complete furniture product with all fields:
  - Required fields: productId, name, category, subcategory, description
  - Pricing: priceINR with discount configuration
  - Dimensions: length, width, height, unit, weight
  - Furniture specs: type, shape, material, size, surfaceFinish, colorName, height, location, packagingDetails
  - Status flags: status, available, featured
  - Image upload

- **Slab Product Creation** - Creates a slab product with slab-specific specs:
  - Slab specs: finish, thickness, origin, material, application

### ✅ Read Operations
- **Get Product by ID** - Fetches individual product and validates all fields
- **Get All Products** - Tests pagination and filtering by category
- **Public API** - Tests public-facing product endpoints (no authentication)

### ✅ Update Operations
- **Update Product Fields** - Modifies:
  - Name, description, price
  - Discount settings
  - Specifications
  - Feature flags
  
- **Update Product Status** - Changes product status (active/inactive)

### ✅ Delete Operations
- **Delete Product** - Removes product and verifies deletion
- **Cleanup** - Automatically cleans up all test data

### ✅ Validation Tests
- **Missing Required Fields** - Ensures validation catches incomplete data
- **Duplicate Product ID** - Tests unique constraint enforcement
- **Category-Specific Specs** - Validates furniture vs slab specifications

### ✅ Public API Tests
- **Get Public Products** - Tests unauthenticated product listing
- **Get Categories** - Tests category endpoint

## Prerequisites

1. **Backend Server Running**
   ```bash
   cd backend
   npm start
   ```
   Server should be running on `http://localhost:3000`

2. **Admin Account**
   You need admin credentials. Default:
   - Email: `admin@hsglobal.com`
   - Password: `admin123`

3. **Dependencies**
   ```bash
   npm install axios form-data
   ```

## How to Run

### Method 1: Using Batch File (Windows)
```bash
cd backend
run-product-crud-test.bat
```

### Method 2: Direct Node Command
```bash
cd backend
node test-product-crud.js
```

### Method 3: Custom Configuration
```bash
# Set environment variables
set API_URL=http://localhost:3000/api
set ADMIN_EMAIL=your-admin@email.com
set ADMIN_PASSWORD=your-password

# Run test
node test-product-crud.js
```

## Configuration

You can configure the test using environment variables:

```bash
# API endpoint
API_URL=http://localhost:3000/api

# Admin credentials
ADMIN_EMAIL=admin@hsglobal.com
ADMIN_PASSWORD=admin123
```

## Test Output

The test provides detailed colored output:

```
🚀 Starting Comprehensive Product CRUD Tests

============================================================
AUTHENTICATION
============================================================
📋 TEST: Admin Login
✅ Admin authenticated successfully
✅ Token: eyJhbGciOiJIUzI1NiIs...

============================================================
CREATE OPERATION - FURNITURE PRODUCT
============================================================
📋 TEST: Create furniture product with all fields
✅ Product created: Test Marble Coffee Table
✅ MongoDB ID: 507f1f77bcf86cd799439011
✅ Product ID: TEST-FURN-1707648234567
✅ All fields validated successfully
✅ PASSED: Create Furniture Product

...

============================================================
TEST SUMMARY
============================================================

📊 Results:
Total Tests: 12
Passed: 12
Failed: 0

✨ Success Rate: 100.00%
```

## Test Coverage

| Test Category | Tests | Purpose |
|--------------|-------|---------|
| Authentication | 1 | Verify admin login and token |
| Create | 2 | Furniture & Slab product creation |
| Read | 2 | Get by ID, Get all with filters |
| Update | 2 | Update fields & status |
| Delete | 1 | Delete and verify removal |
| Validation | 2 | Required fields & duplicates |
| Public API | 2 | Unauthenticated endpoints |
| **TOTAL** | **12** | **Complete CRUD coverage** |

## What Gets Tested

### Field Validation
- ✅ productId (unique, required)
- ✅ name (required)
- ✅ category (required: furniture/slabs)
- ✅ subcategory (required)
- ✅ description (required)
- ✅ priceINR (required)
- ✅ status (active/inactive)
- ✅ available (boolean)
- ✅ featured (boolean)
- ✅ dimensions (length, width, height, unit)
- ✅ weight (number)
- ✅ discount (enabled, percentage, description)
- ✅ furnitureSpecs (9 fields)
- ✅ slabSpecs (5 fields)
- ✅ images (upload)

### Specifications Validation

**Furniture Specs (9 fields):**
1. type
2. shape
3. material
4. size
5. surfaceFinish
6. colorName
7. height
8. location
9. packagingDetails

**Slab Specs (5 fields):**
1. finish
2. thickness
3. origin
4. material
5. application

## Expected Results

✅ **All 12 tests should pass with 100% success rate**

If any test fails, the output will show:
- ❌ Which test failed
- 📝 Error message
- 🔍 Response data (if available)

## Troubleshooting

### Problem: "ECONNREFUSED"
**Solution:** Make sure backend server is running on port 3000

### Problem: "Authentication failed"
**Solution:** Check admin credentials in database or environment variables

### Problem: "Product already exists"
**Solution:** Test uses timestamp-based IDs to avoid conflicts. If error persists, delete test products manually.

### Problem: "Image upload failed"
**Solution:** Test creates temporary image file. Ensure write permissions in backend directory.

## Test Data Cleanup

The test automatically cleans up:
- ✅ All created products are deleted after testing
- ✅ Temporary image files are removed
- ✅ No residual data left in database

If test crashes unexpectedly, you may need to manually delete products with IDs starting with:
- `TEST-FURN-*`
- `TEST-SLAB-*`

## Success Criteria

✅ All 12 tests pass
✅ 100% success rate
✅ All fields validated correctly
✅ CRUD operations work as expected
✅ Validation catches errors
✅ Data cleanup completed

## Next Steps

After successful test completion:
1. ✅ CRUD operations are verified working
2. ✅ Ready for production use
3. ✅ Can integrate with frontend
4. ✅ Can deploy with confidence

## Notes

- Tests run sequentially to maintain data integrity
- Each test is independent and self-contained
- Colored output helps identify issues quickly
- Detailed logging for debugging
- Exit code 0 = all passed, 1 = failures detected
