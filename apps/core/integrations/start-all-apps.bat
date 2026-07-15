@echo off
echo Starting all Rangoons apps...
echo.
echo Starting Android app...
start "Android App" cmd /k "cd /d D:\rangoons-core\integrations\android-app && npm start"
timeout /t 2 /nobreak > nul

echo Starting iOS app...
start "iOS App" cmd /k "cd /d D:\rangoons-core\integrations\ios-app && npm start"
timeout /t 2 /nobreak > nul

echo Starting Harmony app...
start "Harmony App" cmd /k "cd /d D:\rangoons-core\integrations\harmony-app && npm start"
timeout /t 2 /nobreak > nul

echo Starting Business Control Panel...
start "Business Control Panel" cmd /k "cd /d D:\rangoons-core\integrations\business-control-panel && npm start"
timeout /t 2 /nobreak > nul

echo.
echo All apps are starting...
echo.
echo Android App: http://localhost:3000
echo iOS App: http://localhost:3001  
echo Harmony App: http://localhost:3002
echo Business Control Panel: http://localhost:3003
echo.
echo Press any key to open all apps in browser...
pause > nul

start http://localhost:3000
start http://localhost:3001
start http://localhost:3002
start http://localhost:3003

echo Apps opened in browser!
