# 🚀 Automated Port Forwarding Configuration Script
# This script will guide you through the entire setup process

Write-Host "🌐 Automated Port Forwarding Setup for Rangoons Edge Computing" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check current status
Write-Host "📋 Step 1: Checking Current Status..." -ForegroundColor Yellow
Write-Host "  DNS: rangoons.live → 154.57.212.38" -ForegroundColor Green
Write-Host "  Server: Running on port 8080" -ForegroundColor Green
Write-Host ""

# Test current port 8080 access
Write-Host "🔍 Testing current port 8080 access..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://rangoons.live:8080" -Method Head -TimeoutSec 10
    Write-Host "  ✅ Port 8080: HTTP $($response.StatusCode) OK" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Port 8080: Failed - $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  💡 Please ensure your C++ server is running on port 8080" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

Write-Host ""

# Step 2: Windows Firewall Setup
Write-Host "📋 Step 2: Windows Firewall Configuration..." -ForegroundColor Yellow
Write-Host "  This step requires Administrator privileges" -ForegroundColor Blue
Write-Host ""

$firewallRule = Get-NetFirewallRule -DisplayName "Rangoons Server" -ErrorAction SilentlyContinue

if ($firewallRule) {
    Write-Host "  ✅ Firewall rule already exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Firewall rule not found" -ForegroundColor Yellow
    Write-Host "  💡 Please run 'run-firewall-command.bat' as Administrator" -ForegroundColor Blue
    Write-Host "  Or manually run this command:" -ForegroundColor White
    Write-Host "  netsh advfirewall firewall add rule name='Rangoons Server' dir=in action=allow protocol=TCP localport=8080" -ForegroundColor Cyan
    Write-Host ""
    
    $continue = Read-Host "Press Enter after setting up firewall, or 'q' to quit"
    if ($continue -eq 'q') { exit }
}

Write-Host ""

# Step 3: Router Configuration Guide
Write-Host "📋 Step 3: Router Configuration..." -ForegroundColor Yellow
Write-Host "  Router: Huawei OptiXstar EG8145X6-10" -ForegroundColor White
Write-Host "  IP: http://192.168.18.1" -ForegroundColor White
Write-Host "  Username: Epuser" -ForegroundColor White
Write-Host "  Password: SnnHBC33" -ForegroundColor White
Write-Host ""

Write-Host "🔧 Configuration Steps:" -ForegroundColor Blue
Write-Host "  1. Open http://192.168.18.1 in your browser" -ForegroundColor White
Write-Host "  2. Login with Epuser/SnnHBC33" -ForegroundColor White
Write-Host "  3. Navigate to: Advanced Settings → NAT → Port Forwarding" -ForegroundColor White
Write-Host "  4. Add these rules:" -ForegroundColor White
Write-Host ""

Write-Host "📋 Port Forwarding Rules:" -ForegroundColor Cyan
Write-Host "  Rule 1: HTTP (Port 80)" -ForegroundColor White
Write-Host "    External Port: 80" -ForegroundColor Gray
Write-Host "    Internal Host: 154.57.212.38" -ForegroundColor Gray
Write-Host "    Internal Port: 8080" -ForegroundColor Gray
Write-Host "    Protocol: TCP" -ForegroundColor Gray
Write-Host ""
Write-Host "  Rule 2: HTTPS (Port 443)" -ForegroundColor White
Write-Host "    External Port: 443" -ForegroundColor Gray
Write-Host "    Internal Host: 154.57.212.38" -ForegroundColor Gray
Write-Host "    Internal Port: 8080" -ForegroundColor Gray
Write-Host "    Protocol: TCP" -ForegroundColor Gray
Write-Host ""

Write-Host "💡 Alternative menu paths if Port Forwarding not found:" -ForegroundColor Blue
Write-Host "  - Applications → Port Forwarding" -ForegroundColor Gray
Write-Host "  - Security → Port Forwarding" -ForegroundColor Gray
Write-Host "  - Look for 'Virtual Server' instead of 'Port Forwarding'" -ForegroundColor Gray
Write-Host ""

$ready = Read-Host "Press Enter when you've configured the router, or 'q' to quit"
if ($ready -eq 'q') { exit }

Write-Host ""

# Step 4: Testing Configuration
Write-Host "📋 Step 4: Testing Port Forwarding..." -ForegroundColor Yellow
Write-Host "  Testing HTTP (Port 80)..." -ForegroundColor Blue

try {
    $response = Invoke-WebRequest -Uri "http://rangoons.live" -Method Head -TimeoutSec 10
    Write-Host "  ✅ Port 80: HTTP $($response.StatusCode) OK" -ForegroundColor Green
    Write-Host "  🎉 Port forwarding is working!" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Port 80: Failed - $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  💡 Port forwarding not yet working" -ForegroundColor Yellow
}

Write-Host ""

Write-Host "  Testing HTTPS (Port 443)..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "https://rangoons.live" -Method Head -TimeoutSec 10
    Write-Host "  ✅ Port 443: HTTP $($response.StatusCode) OK" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Port 443: Failed - $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  💡 HTTPS port forwarding not yet working" -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Final Status and Next Steps
Write-Host "📋 Step 5: Final Status and Next Steps..." -ForegroundColor Yellow
Write-Host ""

# Test both ports again for final status
$port80Working = $false
$port443Working = $false

try {
    $response = Invoke-WebRequest -Uri "http://rangoons.live" -Method Head -TimeoutSec 5
    $port80Working = $true
} catch { }

try {
    $response = Invoke-WebRequest -Uri "https://rangoons.live" -Method Head -TimeoutSec 5
    $port443Working = $true
} catch { }

Write-Host "🎯 Final Configuration Status:" -ForegroundColor Cyan
if ($port80Working) {
    Write-Host "  ✅ HTTP (Port 80): Working - http://rangoons.live" -ForegroundColor Green
} else {
    Write-Host "  ❌ HTTP (Port 80): Not working - Check router configuration" -ForegroundColor Red
}

if ($port443Working) {
    Write-Host "  ✅ HTTPS (Port 443): Working - https://rangoons.live" -ForegroundColor Green
} else {
    Write-Host "  ❌ HTTPS (Port 443): Not working - Check router configuration" -ForegroundColor Red
}

Write-Host ""

if ($port80Working) {
    Write-Host "🎉 SUCCESS! Your website is now accessible worldwide!" -ForegroundColor Green
    Write-Host "  🌐 Primary URL: http://rangoons.live" -ForegroundColor White
    Write-Host "  🌐 WWW URL: http://www.rangoons.live" -ForegroundColor White
    Write-Host "  📱 Mobile Edge Computing Ready!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Test from external network (mobile data)" -ForegroundColor White
    Write-Host "  2. Configure mobile edge nodes (Vivo, Samsung)" -ForegroundColor White
    Write-Host "  3. Set up load balancing between nodes" -ForegroundColor White
} else {
    Write-Host "⚠️  Port forwarding not yet working" -ForegroundColor Yellow
    Write-Host "  🔧 Troubleshooting steps:" -ForegroundColor Blue
    Write-Host "  1. Verify router settings are saved" -ForegroundColor White
    Write-Host "  2. Check internal IP is correct (154.57.212.38)" -ForegroundColor White
    Write-Host "  3. Try rebooting router" -ForegroundColor White
    Write-Host "  4. Check if ISP blocks ports 80/443" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
