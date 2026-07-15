@echo off
echo 🚀 Starting Automated Port Forwarding Configuration
echo =================================================
echo.
echo This will guide you through the entire setup process:
echo 1. Check current status
echo 2. Windows Firewall setup
echo 3. Router configuration guide
echo 4. Automatic testing
echo 5. Final status and next steps
echo.

echo 🌐 Your Configuration:
echo   Domain: rangoons.live
echo   Static IP: 154.57.212.38
echo   Router: http://192.168.18.1
echo   Username: Epuser
echo   Password: SnnHBC33
echo.

echo 🚀 Starting automated configuration...
echo.

powershell -ExecutionPolicy Bypass -File "auto-configure-port-forwarding.ps1"

echo.
echo Configuration script completed!
pause
