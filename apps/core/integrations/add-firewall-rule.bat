@echo off
echo Adding Windows Firewall rule for Rangoons Server...
netsh advfirewall firewall add rule name="Rangoons Server" dir=in action=allow protocol=TCP localport=8080
echo Firewall rule added successfully!
pause
