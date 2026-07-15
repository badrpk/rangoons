@echo off
echo 🗄️ Quick PostgreSQL Setup for Rangoons
echo.

echo 📋 Prerequisites Check:
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ PostgreSQL is installed
    echo.
    echo 🔧 Testing connection...
    psql -U postgres -h localhost -c "SELECT version();" 2>nul
    if %errorlevel% == 0 (
        echo ✅ PostgreSQL is running and accessible
        echo.
        echo 🎯 Next steps:
        echo 1. Run: .\import-csv.bat
        echo 2. Run: .\start-shein-style.bat
        echo 3. Visit: http://localhost:8080
        pause
        exit /b 0
    ) else (
        echo ❌ PostgreSQL connection failed
        echo.
        echo 🔧 Starting PostgreSQL service...
        net start postgresql-x64-15 2>nul
        if %errorlevel% == 0 (
            echo ✅ PostgreSQL service started
            echo.
            echo 🎯 Next steps:
            echo 1. Run: .\import-csv.bat
            echo 2. Run: .\start-shein-style.bat
            echo 3. Visit: http://localhost:8080
        ) else (
            echo ❌ Could not start PostgreSQL service
            echo.
            echo 📥 Please install PostgreSQL manually:
            echo 1. Download from: https://www.postgresql.org/download/windows/
            echo 2. Install with default settings
            echo 3. Remember your password!
            echo 4. Run this script again
        )
    )
) else (
    echo ❌ PostgreSQL is not installed
    echo.
    echo 📥 Installing PostgreSQL...
    echo.
    echo 🌐 Download PostgreSQL from:
    echo    https://www.postgresql.org/download/windows/
    echo.
    echo 📋 Installation steps:
    echo 1. Download PostgreSQL 15.x or 16.x
    echo 2. Run installer as Administrator
    echo 3. Use default port: 5432
    echo 4. Set a password (remember this!)
    echo 5. Install all components
    echo.
    echo 💡 After installation, run this script again
)

echo.
echo 💡 Alternative: Use Docker (if you have Docker Desktop)
echo    docker run --name rangoons-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=rangoons -p 5432:5432 -d postgres:15
echo.
pause
