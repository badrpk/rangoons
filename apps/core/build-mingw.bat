@echo off
echo 🚀 Building RangoonsCore with MinGW...
echo.

REM Check if MinGW is available
where g++.exe >nul 2>&1
if errorlevel 1 (
    echo ❌ MinGW compiler (g++.exe) not found!
    echo.
    echo Please install one of the following:
    echo 1. MinGW-w64 (recommended)
    echo 2. MSYS2 with MinGW
    echo 3. Or use build.bat for Visual Studio
    echo.
    pause
    exit /b 1
)

echo ✅ Compiler found: g++.exe
echo.

REM Create bin directory
if not exist "bin" mkdir bin

REM Compile the project
echo 🔨 Compiling source files...
g++.exe -std=c++17 -O2 -Wall -Wextra -pthread -Iinclude ^
    src\main.cpp src\server.cpp src\database.cpp src\utils.cpp ^
    -o bin\rangoons.exe ^
    -lws2_32 -lsqlite3

if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo ✅ Build successful!
echo 📁 Executable created: bin\rangoons.exe
echo.
echo 🚀 You can now run: start-rangoons.bat
echo.

pause
