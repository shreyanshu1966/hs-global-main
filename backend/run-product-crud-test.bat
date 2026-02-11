@echo off
echo ========================================
echo Product CRUD Test Runner
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Run the test
echo Running comprehensive CRUD tests...
echo.
node test-product-crud.js

echo.
echo ========================================
echo Test execution completed
echo ========================================
pause
