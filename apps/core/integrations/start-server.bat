@echo off
echo 🚀 Starting Rangoons E-commerce Server...
echo.

echo 📋 Checking dependencies...
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🌐 Starting server on port 8080...
echo 📱 WhatsApp integration will be available at: http://localhost:8080/admin/whatsapp/qr
echo 📊 Admin dashboard: http://localhost:8080/admin
echo 📤 Database export: http://localhost:8080/admin/export
echo 📥 CSV import: http://localhost:8080/admin/import
echo 📊 Status monitor: http://localhost:8080/server-status-widget.html
echo.

npm start

pause
