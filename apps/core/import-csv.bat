@echo off
echo 📊 Starting CSV Import for PostgreSQL...
echo.

REM Check if domain environment variables are set
if "%RANGOONS_DOMAIN%"=="" (
    echo 💡 No custom domains configured
    echo 💡 Run setup-domains.bat to configure custom domains
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
echo 📊 Starting CSV import...
echo 📁 CSV File: products_export csv.csv
echo 🗄️ Database: PostgreSQL
echo.

echo 💡 Make sure PostgreSQL is running on port 5432
echo 💡 See POSTGRESQL-SETUP.md for database setup
echo.

echo 🚀 Running import...
npm run import-csv

pause
