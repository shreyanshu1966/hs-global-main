@echo off
echo ========================================
echo Database Cleanup Script
echo ========================================
echo.
echo This will remove the Discount (coupon) collection
echo Product-level discounts will be preserved
echo.
pause

cd /d "%~dp0"
node clean-database.js

echo.
pause
