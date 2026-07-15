@echo off
echo 🚀 Starting Rangoons WhatsApp Integration...
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
echo 🌐 Starting WhatsApp webhook server...
echo 📱 Port: 3001
echo 🌍 Webhook URL: http://154.57.212.38:3001/webhook

if not "%WA_DOMAIN%"=="" (
    echo 🌐 Custom Webhook URL: https://%WA_DOMAIN%/webhook
)

echo.
echo 💡 After DNS setup, your webhook will be accessible at:
echo    https://%WA_DOMAIN%/webhook
echo.

npm start

pause
