@echo off
echo 🔍 Testing RangoonsCore Domain Configuration...
echo.

REM Check if domain environment variables are set
if "%RANGOONS_DOMAIN%"=="" (
    echo ❌ No custom domains configured
    echo 💡 Run setup-domains.bat first
    echo.
    pause
    exit /b 1
)

echo 🌐 Testing domains for: %RANGOONS_DOMAIN%
echo.

echo 📱 Testing Shop Domain: %SHOP_DOMAIN%
nslookup %SHOP_DOMAIN% 2>nul
if errorlevel 1 (
    echo ❌ DNS resolution failed for %SHOP_DOMAIN%
) else (
    echo ✅ DNS resolution successful for %SHOP_DOMAIN%
)
echo.

echo 🔌 Testing API Domain: %API_DOMAIN%
nslookup %API_DOMAIN% 2>nul
if errorlevel 1 (
    echo ❌ DNS resolution failed for %API_DOMAIN%
) else (
    echo ✅ DNS resolution successful for %API_DOMAIN%
)
echo.

echo 📱 Testing WhatsApp Domain: %WA_DOMAIN%
nslookup %WA_DOMAIN% 2>nul
if errorlevel 1 (
    echo ❌ DNS resolution failed for %WA_DOMAIN%
) else (
    echo ✅ DNS resolution successful for %WA_DOMAIN%
)
echo.

echo 🌐 Testing connectivity to your server...
echo.

echo 📡 Testing HTTP connectivity to port 8080...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://154.57.212.38:8080/health' -TimeoutSec 5; Write-Host '✅ HTTP connectivity successful' } catch { Write-Host '❌ HTTP connectivity failed' }"

echo 📡 Testing HTTP connectivity to port 3001...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://154.57.212.38:3001/health' -TimeoutSec 5; Write-Host '✅ HTTP connectivity successful' } catch { Write-Host '❌ HTTP connectivity failed' }"

echo.
echo 📋 Domain Status Summary:
echo    Shop: %SHOP_DOMAIN% → 154.57.212.38:8080
echo    API: %API_DOMAIN% → 154.57.212.38:8080
echo    WhatsApp: %WA_DOMAIN% → 154.57.212.38:3001
echo.

echo 💡 If DNS resolution fails:
echo    1. Check your domain registrar's DNS settings
echo    2. Verify A records point to 154.57.212.38
echo    3. Wait for DNS propagation (24-48 hours)
echo    4. Check firewall settings
echo.

echo 💡 If connectivity fails:
echo    1. Ensure your server is running
echo    2. Check Windows Firewall settings
echo    3. Verify router port forwarding
echo    4. Test from different network
echo.

pause
