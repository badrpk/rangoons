@echo off
echo 🚀 Starting Rangoons Simple Server (Node.js)...
echo.

REM Check if domain environment variables are set
if "%RANGOONS_DOMAIN%"=="" (
    echo 💡 No custom domains configured
    echo 💡 Run setup-domains.bat to configure custom domains
    echo 💡 Using default IP addresses for now
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
echo 🌐 Starting simple e-commerce server...
echo 📱 Port: 8080
echo 🌍 Server URL: http://154.57.212.38:8080

if not "%SHOP_DOMAIN%"=="" (
    echo 🌐 Custom Shop URL: https://%SHOP_DOMAIN%
)

echo.
echo 💡 This is a simplified version while you set up the C++ compiler
echo 📚 See SETUP-WINDOWS.md for full setup instructions
echo 🌐 See DNS-SETUP.md for domain configuration
echo.

node simple-server.js

pause
