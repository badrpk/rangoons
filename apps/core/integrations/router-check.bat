@echo off
echo 🔍 Router Configuration Check
echo =============================
echo.

echo 📋 Your Network Details:
echo    Local Computer IP: 192.168.18.73
echo    Router IP: 192.168.18.1
echo    Static Public IP: 154.57.212.38
echo    Server Port: 8080
echo.

echo 🌐 Testing Router Access...
powershell -Command "Test-NetConnection -ComputerName 192.168.18.1 -Port 80 | Select-Object TcpTestSucceeded"
echo.

echo 🌍 Testing External Ports...
echo Testing Port 80...
powershell -Command "Test-NetConnection -ComputerName 154.57.212.38 -Port 80 | Select-Object TcpTestSucceeded"
echo Testing Port 443...
powershell -Command "Test-NetConnection -ComputerName 154.57.212.38 -Port 443 | Select-Object TcpTestSucceeded"
echo Testing Port 8080...
powershell -Command "Test-NetConnection -ComputerName 154.57.212.38 -Port 8080 | Select-Object TcpTestSucceeded"
echo.

echo 🖥️ Testing Local Server...
powershell -Command "Test-NetConnection -ComputerName 192.168.18.73 -Port 8080 | Select-Object TcpTestSucceeded"
echo.

echo 🔧 Router Configuration Required:
echo ================================
echo.
echo 1. Open browser and go to: http://192.168.18.1
echo 2. Login with:
echo    Username: Epuser
echo    Password: SnnHBC33
echo.
echo 3. Navigate to: Advanced Settings > NAT > IPv4 Port Mapping
echo.
echo 4. Configure these rules:
echo    HTTP Rule:
echo      - Protocol: TCP
echo      - Start External Port: 80
echo      - End External Port: 80
echo      - Start Internal Port: 8080
echo      - End Internal Port: 8080
echo      - Internal Host: 192.168.18.73
echo.
echo    HTTPS Rule:
echo      - Protocol: TCP
echo      - Start External Port: 443
echo      - End External Port: 443
echo      - Start Internal Port: 8080
echo      - End Internal Port: 8080
echo      - Internal Host: 192.168.18.73
echo.
echo 5. Click 'Apply' and restart router if prompted
echo.

echo 📝 Next Steps:
echo 1. Configure router port forwarding as shown above
echo 2. Restart router after configuration
echo 3. Run this script again to verify changes
echo 4. Test www.rangoons.live (without port number)
echo.

pause
