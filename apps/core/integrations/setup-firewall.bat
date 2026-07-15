@echo off
echo 🔥 Windows Firewall Configuration for Rangoons Server
echo ====================================================
echo.
echo This script will configure Windows Firewall to allow
echo incoming connections to your Rangoons server on port 8080
echo.
echo ⚠️  IMPORTANT: Run this as Administrator!
echo.

echo 📋 Adding Firewall Rules...
echo.

netsh advfirewall firewall add rule name="Rangoons Server HTTP" dir=in action=allow protocol=TCP localport=8080
if %errorlevel% equ 0 (
    echo ✅ HTTP rule added successfully
) else (
    echo ❌ Failed to add HTTP rule
)

netsh advfirewall firewall add rule name="Rangoons Server HTTPS" dir=in action=allow protocol=TCP localport=8080
if %errorlevel% equ 0 (
    echo ✅ HTTPS rule added successfully
) else (
    echo ❌ Failed to add HTTPS rule
)

echo.
echo 🔍 Verifying rules...
netsh advfirewall firewall show rule name="Rangoons Server*"

echo.
echo 📋 Next Steps:
echo 1. Configure router port forwarding (80→8080, 443→8080)
echo 2. Test external access
echo 3. Your website will be accessible without port numbers!
echo.

pause
