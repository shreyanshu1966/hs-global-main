@echo off
echo.
echo ========================================
echo    HS Global Authentication Flow Test
echo ========================================
echo.
echo Testing with email: shreyanshumaske1966@gmail.com
echo Backend URL: http://localhost:3000/api 
echo.

cd /d "%~dp0"

echo Checking if backend server is running...
echo.

node test-auth-flow.js

echo.
echo ========================================
echo Test completed! Check output above.
echo.
echo If tests failed with "server not running":
echo   1. Open another terminal
echo   2. Run: npm start  
echo   3. Wait for "Server running on port 3000"
echo   4. Run this test again
echo ========================================
pause