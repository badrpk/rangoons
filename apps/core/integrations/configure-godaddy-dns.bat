@echo off
echo 🌐 Rangoons GoDaddy DNS Configuration Tool
echo ==========================================
echo.
echo This script will configure DNS records on GoDaddy
echo to point your domain to your static IP 154.57.212.38
echo.

echo 📋 Prerequisites:
echo 1. GoDaddy API Key (already configured)
echo 2. GoDaddy Secret (already configured)
echo 3. Node.js installed
echo 4. Domain registered on GoDaddy
echo.

echo 🔑 Your GoDaddy API credentials are already configured:
echo    API Key: dKD7eEsrwY6x_D8Uze31RdTNyX66c9BdUhz
echo    Secret: KTBqgbvRxq1XWkV5WKtjNR
echo.

echo ✅ The script will automatically prompt you to confirm your domain
echo    No manual editing required!
echo.

pause

echo.
echo 🚀 Running GoDaddy DNS configuration...
echo.

cd integrations
node configure-godaddy-dns.js

echo.
echo 📊 DNS configuration completed!
echo.
echo 🔍 Next steps:
echo 1. Wait for DNS propagation (15 min - 48 hours)
echo 2. Configure router port forwarding (80→8080, 443→8080)
echo 3. Test with your configured domain
echo.

pause
