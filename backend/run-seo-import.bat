@echo off
REM ========================================
REM Product SEO CSV Import Script
REM ========================================
REM
REM This script imports SEO metadata from CSV file into the database
REM
REM Prerequisites:
REM   1. MongoDB must be running
REM   2. .env file configured with MONGODB_URI
REM   3. CSV file path updated in import-seo-from-csv.js
REM   4. csv-parser package installed (npm install csv-parser)
REM

echo.
echo ========================================
echo   Product SEO CSV Import
echo ========================================
echo.

cd backend

echo [1/3] Checking for csv-parser package...
call npm list csv-parser >nul 2>&1
if errorlevel 1 (
    echo.
    echo [!] csv-parser not found. Installing...
    call npm install csv-parser
    if errorlevel 1 (
        echo.
        echo [ERROR] Failed to install csv-parser
        pause
        exit /b 1
    )
    echo [OK] csv-parser installed successfully
) else (
    echo [OK] csv-parser is already installed
)

echo.
echo [2/3] Checking MongoDB connection...
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hsglobal').then(() => { console.log('[OK] MongoDB connection successful'); process.exit(0); }).catch(err => { console.log('[ERROR] MongoDB connection failed:', err.message); process.exit(1); });"

if errorlevel 1 (
    echo.
    echo [ERROR] Cannot connect to MongoDB. Please check:
    echo   - MongoDB service is running
    echo   - MONGODB_URI in .env file is correct
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] Starting SEO import from CSV...
echo.
node scripts/import-seo-from-csv.js

if errorlevel 1 (
    echo.
    echo [ERROR] Import failed! Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Import Completed Successfully!
echo ========================================
echo.
echo Next Steps:
echo   1. Verify products in database
echo   2. Test product pages in browser
echo   3. Check social media previews
echo.

pause
