@echo off
echo 🛍️ Starting Rangoons Shein-Style E-commerce Server...
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
echo 🛍️ Starting Shein-style server...
echo 📱 Port: 8080
echo 🌍 Server URL: http://154.57.212.38:8080

if not "%SHOP_DOMAIN%"=="" (
    echo 🌐 Custom Shop URL: https://%SHOP_DOMAIN%
)

echo.
echo ✨ Features:
echo   ✅ Modern Shein-style UI
echo   ✅ Responsive design
echo   ✅ Product search & filtering
echo   ✅ Category browsing
echo   ✅ WhatsApp integration
echo   ✅ PostgreSQL database
echo   ✅ Enhanced product display
echo   ✅ Shopping cart (coming soon)
echo   ✅ Wishlist (coming soon)
echo.

echo 🌐 Shop: http://localhost:8080
echo 📱 Health Check: http://localhost:8080/health
echo.

echo 💡 Make sure PostgreSQL is running on port 5432
echo 💡 Run import-csv.bat first to import your products
echo.

node shein-style-server.js

pause
