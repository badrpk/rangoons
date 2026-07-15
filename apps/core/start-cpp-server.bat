@echo off
echo 🚀 Starting Rangoons C++ E-commerce Server...
echo.

echo 📋 Checking if server binary exists...
if not exist "rangoons-server.exe" (
    echo ❌ Server binary not found!
    echo.
    echo 🔧 Building the server...
    make clean
    make all
    if not exist "rangoons-server.exe" (
        echo ❌ Build failed! Please check the errors above.
        pause
        exit /b 1
    )
    echo ✅ Build successful!
) else (
    echo ✅ Server binary found
)

echo.
echo 🌐 Starting server on port 8080...
echo 📱 WhatsApp integration will be available at: http://localhost:8080/admin/whatsapp/qr
echo 📊 Admin dashboard: http://localhost:8080/admin
echo 📤 Database export: http://localhost:8080/admin/export
echo 📥 CSV import: http://localhost:8080/admin/import
echo 📊 Status monitor: http://localhost:8080/server-status-widget.html
echo.

echo 🗄️ Database Configuration:
echo    Host: localhost
echo    Database: rangoons
echo    User: postgres
echo    Port: 5432
echo.

echo 💡 Make sure PostgreSQL is running and accessible!
echo.

rangoons-server.exe

pause
