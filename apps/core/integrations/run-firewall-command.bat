@echo off
echo 🔥 Windows Firewall Setup for Rangoons Server
echo =============================================
echo.
echo This will add a firewall rule to allow incoming connections
echo to your Rangoons server on port 8080
echo.
echo ⚠️  IMPORTANT: Right-click this file and select "Run as Administrator"
echo.

echo 📋 Adding Firewall Rule...
netsh advfirewall firewall add rule name="Rangoons Server" dir=in action=allow protocol=TCP localport=8080

if %errorlevel% equ 0 (
    echo.
    echo ✅ Firewall rule added successfully!
    echo.
    echo 🚀 Next Steps:
    echo 1. Configure router port forwarding at http://192.168.18.1
    echo 2. Username: Epuser
    echo 3. Password: SnnHBC33
    echo 4. Add port forwarding rules (80→8080, 443→8080)
    echo.
) else (
    echo.
    echo ❌ Failed to add firewall rule
    echo Please run as Administrator
)

echo Press any key to continue...
pause > nul
