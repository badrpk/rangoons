@echo off
echo 🗄️ Starting Rangoons PostgreSQL Server...
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
echo 🗄️ Starting PostgreSQL server...
echo 📱 Port: 8080
echo 🌍 Server URL: http://154.57.212.38:8080

if not "%SHOP_DOMAIN%"=="" (
    echo 🌐 Custom Shop URL: https://%SHOP_DOMAIN%
)

echo.
echo 📊 Features:
echo   ✅ PostgreSQL Database
echo   ✅ WhatsApp Integration
echo   ✅ Order Processing
echo   ✅ Product Management
echo   ✅ API Endpoints
echo.

echo 🌐 Shop: http://localhost:8080
echo 📱 Health Check: http://localhost:8080/health
echo.

echo 💡 Make sure PostgreSQL is running on port 5432
echo 💡 See POSTGRESQL-SETUP.md for database setup
echo.

node simple-server-pg.js

pause
