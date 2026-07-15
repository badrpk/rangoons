@echo off
echo 🌐 Setting up custom domains for RangoonsCore...
echo.

REM Set your custom domain here
set DOMAIN=rangoons.my

echo 📝 Configuring domain: %DOMAIN%
echo.

REM Set environment variables for custom domains
set RANGOONS_DOMAIN=www.%DOMAIN%
set SHOP_DOMAIN=www.%DOMAIN%
set API_DOMAIN=api.%DOMAIN%
set WA_DOMAIN=wa.%DOMAIN%
set WA_NUMBER=923001555681

echo ✅ Environment variables set:
echo    RANGOONS_DOMAIN=%RANGOONS_DOMAIN%
echo    SHOP_DOMAIN=%SHOP_DOMAIN%
echo    API_DOMAIN=%API_DOMAIN%
echo    WA_DOMAIN=%WA_DOMAIN%
echo    WA_NUMBER=%WA_NUMBER%
echo.

echo 🌐 Your services will be accessible at:
echo    Shop: https://%SHOP_DOMAIN%
echo    API: https://%API_DOMAIN%
echo    WhatsApp: https://%WA_DOMAIN%
echo.

echo 📋 Next steps:
echo 1. Domain already registered: %DOMAIN%
echo 2. DNS A records pointing to 154.57.212.38 ✓
echo 3. Test your domains
echo 4. Start your servers
echo.

echo 💡 To use different domains, edit this file and change the DOMAIN variable
echo.

pause
