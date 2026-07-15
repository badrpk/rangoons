@echo off
echo 🚀 Building RangoonsCore for Windows...
echo.

REM Check if Visual Studio is available
where cl.exe >nul 2>&1
if errorlevel 1 (
    echo ❌ Visual Studio compiler (cl.exe) not found!
    echo.
    echo Please install one of the following:
    echo 1. Visual Studio Community (free)
    echo 2. Visual Studio Build Tools
    echo 3. Or run from "Developer Command Prompt for VS"
    echo.
    echo After installation, run this script again.
    pause
    exit /b 1
)

echo ✅ Compiler found: cl.exe
echo.

REM Create bin directory
if not exist "bin" mkdir bin

REM Compile the project
echo 🔨 Compiling source files...
cl.exe /std:c++17 /O2 /W3 /EHsc /MT /Iinclude ^
    src\main.cpp src\server.cpp src\database.cpp src\utils.cpp ^
    /Fe:bin\rangoons.exe ^
    ws2_32.lib sqlite3.lib

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
