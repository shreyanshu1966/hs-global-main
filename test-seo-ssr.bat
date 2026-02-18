@echo off
REM Test SEO SSR Server Bot Detection
REM This script tests if the SSR server properly detects bots and serves meta tags

echo ========================================
echo  Testing SEO SSR Server
echo ========================================
echo.

REM Check if server is running
echo [1/4] Checking if SSR server is running...
curl -s http://localhost:4000 > nul
if %errorlevel% neq 0 (
    echo ERROR: SSR server not running on port 4000
    echo Please start it with: node backend/seo-ssr-server.js
    pause
    exit /b 1
)
echo OK: Server is running
echo.

REM Test 1: Regular user (should get React app)
echo [2/4] Testing regular user request...
curl -s -A "Mozilla/5.0" http://localhost:4000/ | findstr /C:"<div id=\"root\">" > nul
if %errorlevel% equ 0 (
    echo PASS: Regular users get React app
) else (
    echo FAIL: React app not served to regular users
)
echo.

REM Test 2: Facebook bot (should get meta tags)
echo [3/4] Testing Facebook bot...
echo Looking for product: spider-green-beige-designer
curl -s -A "facebookexternalhit/1.1" http://localhost:4000/products/spider-green-beige-designer > temp.html

findstr /C:"og:type" temp.html > nul
if %errorlevel% eq 0 (
    echo PASS: Facebook bot gets Open Graph tags
    findstr /C:"og:title" temp.html
    findstr /C:"og:image" temp.html
) else (
    echo FAIL: No Open Graph tags found
)
echo.

REM Test 3: Twitter bot (should get meta tags)
echo [4/4] Testing Twitter bot...
curl -s -A "Twitterbot/1.0" http://localhost:4000/products/spider-green-beige-designer > temp2.html

findstr /C:"twitter:card" temp2.html > nul
if %errorlevel% equ 0 (
    echo PASS: Twitter bot gets Twitter Card tags
    findstr /C:"twitter:title" temp2.html
) else (
    echo FAIL: No Twitter Card tags found
)
echo.

REM Cleanup
del temp.html temp2.html 2>nul

echo ========================================
echo  Test Complete!
echo ========================================
echo.
echo To test with a real product:
echo curl -A "facebookexternalhit" http://localhost:4000/products/YOUR_PRODUCT_SLUG
echo.

pause
