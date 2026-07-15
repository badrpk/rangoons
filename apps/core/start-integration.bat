@echo off
echo 🚀 Starting Rangoons Main Integration Server...
echo.

REM Check if domain environment variables are set
if "%RANGOONS_DOMAIN%"=="" (
    echo 💡 No custom domains configured
    echo 💡 Run setup-domains.bat to configure custom domains
    echo 💡 Using default configuration for now
    echo.
) else (
    echo 🌐 Using custom domains:
    echo    Shop: %SHOP_DOMAIN%
    echo    API: %API_DOMAIN%
    echo    WhatsApp: %WA_DOMAIN%
    echo.
)

cd integrations

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Installation failed!
        pause
        exit /b 1
    )
)

echo ✅ Dependencies installed
echo 🌐 Starting main integration server...
echo 📱 Port: 3001
echo 🌍 Server URL: http://154.57.212.38:3001

if not "%SHOP_DOMAIN%"=="" (
    echo 🌐 Custom Shop URL: https://%SHOP_DOMAIN%
)

echo.
echo 📊 Services included:
echo   ✅ Order Processing
echo   ✅ Catalog Synchronization
echo   ✅ WhatsApp Integration
echo   ✅ API Endpoints
echo   ✅ Dashboard
echo.

echo 🌐 Dashboard: http://localhost:3001/dashboard
echo 📱 Health Check: http://localhost:3001/health
echo.

node main-integration.js

pause
