@echo off
echo.
echo ===============================================
echo       HS Global - Review Seeding Script
echo ===============================================
echo.
echo This script will generate realistic reviews for all products
echo.

cd /d "%~dp0"

echo Checking if Node.js is available...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Node.js found! Starting review generation...
echo.

node seed-reviews.js

echo.
if errorlevel 1 (
    echo ERROR: Review generation failed!
) else (
    echo SUCCESS: Reviews generated successfully!
)

echo.
pause