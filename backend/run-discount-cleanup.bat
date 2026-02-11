@echo off
REM Run discount expiration handler
REM This script disables expired product discounts

echo Running Discount Expiration Handler...
echo.

node utils/discountExpirationHandler.js

echo.
pause
