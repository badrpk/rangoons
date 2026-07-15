@echo off
echo 🌐 Rangoons DNS Configuration Tool
echo ==================================
echo.
echo This script will configure DNS records on Porkbun
echo to point www.rangoons.my to your static IP 154.57.212.38
echo.

echo 📋 Prerequisites:
echo 1. Porkbun API Key (already configured)
echo 2. Porkbun Secret API Key (will be prompted for)
echo 3. Node.js installed
echo.

echo 🔑 To get your Porkbun Secret API Key:
echo 1. Login to https://porkbun.com
echo 2. Go to Account → API Access
echo 3. Copy your Secret API Key (starts with sk1_)
echo.

echo ✅ The script will automatically prompt you for the Secret API Key
echo    No manual editing required!
echo.

pause

echo.
echo 🚀 Running DNS configuration...
echo.

cd integrations
node configure-porkbun-dns.js

echo.
echo 📊 DNS configuration completed!
echo.
echo 🔍 Next steps:
echo 1. Wait for DNS propagation (15 min - 48 hours)
echo 2. Configure router port forwarding (80→8080, 443→8080)
echo 3. Test with: http://www.rangoons.my
echo.

pause
