@echo off
echo 🚀 Starting Rangoons Optimized System...
echo.

echo 📱 Starting Mobile Edge Servers...
start "Vivo Edge Server" cmd /k "cd integrations && node edge-server.js vivo"
timeout /t 3 /nobreak >nul
start "Samsung Edge Server" cmd /k "cd integrations && node edge-server.js samsung"
timeout /t 3 /nobreak >nul

echo 🖥️ Starting Optimized C++ Server...
start "Rangoons C++ Server" cmd /k "cd src && g++ -O3 -std=c++17 -pthread -o rangoons-optimized *.cpp && rangoons-optimized.exe"
timeout /t 5 /nobreak >nul

echo 🎯 Starting Business Control Panel...
start "Business Control Panel" cmd /k "cd integrations/business-control-panel && npm start"
timeout /t 3 /nobreak >nul

echo.
echo ✅ All systems started successfully!
echo.
echo 📊 System Status:
echo    • C++ Server: Port 8080 (Primary)
echo    • Vivo Edge: Port 8081 (Mobile)
echo    • Samsung Edge: Port 8082 (Mobile)
echo    • Control Panel: Port 3003 (Business)
echo.
echo 🌐 Access Points:
echo    • Main Website: http://localhost:8080
echo    • Vivo Edge: http://192.168.18.22:8081
echo    • Samsung Edge: http://192.168.18.160:8082
echo    • Business Panel: http://localhost:3003
echo.
echo ⚡ Performance Features:
echo    • Multi-threaded C++ server
echo    • Edge computing on mobile devices
echo    • Load balancing & failover
echo    • Real-time health monitoring
echo    • Performance analytics
echo.
pause
