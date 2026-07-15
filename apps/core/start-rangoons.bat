@echo off
echo 🚀 Starting RangoonsCore Server...
echo.

REM Set environment variables
set RANGOONS_DB=rangoons.db
set RANGOONS_HOST=0.0.0.0
set RANGOONS_PORT=8080
set ADMIN_KEY=secret123

echo 📊 Database: %RANGOONS_DB%
echo 🌐 Host: %RANGOONS_HOST%
echo 🔌 Port: %RANGOONS_PORT%
echo 🔑 Admin Key: %ADMIN_KEY%
echo.

echo 🌍 Your server will be accessible at:
echo    Local: http://localhost:%RANGOONS_PORT%
echo    Network: http://154.57.212.38:%RANGOONS_PORT%
echo.

REM Check if executable exists
if not exist "bin\rangoons.exe" (
    echo ❌ Executable not found!
    echo.
    echo Please build the project first using one of these:
    echo 1. build.bat (requires Visual Studio)
    echo 2. build-mingw.bat (requires MinGW)
    echo.
    echo Or run from "Developer Command Prompt for VS" and use:
    echo   cl.exe /std:c++17 /O2 /W3 /EHsc /MT /Iinclude ^
    echo   src\main.cpp src\server.cpp src\database.cpp src\utils.cpp ^
    echo   /Fe:bin\rangoons.exe ws2_32.lib sqlite3.lib
    echo.
    pause
    exit /b 1
)

echo ✅ Executable found: bin\rangoons.exe
echo.
echo 🚀 Starting server...
echo ⚠️  Press Ctrl+C to stop the server
echo.

bin\rangoons.exe

pause
