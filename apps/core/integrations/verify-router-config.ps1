# Router Configuration Verification Script
# This script helps verify your Huawei OptiXstar EG8145X6-10 router settings

Write-Host "🔍 Router Configuration Verification" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Your network details
$localIP = "192.168.18.73"
$routerIP = "192.168.18.1"
$staticIP = "154.57.212.38"
$serverPort = 8080

Write-Host "📋 Network Configuration:" -ForegroundColor Yellow
Write-Host "   Local Computer IP: $localIP" -ForegroundColor White
Write-Host "   Router IP: $routerIP" -ForegroundColor White
Write-Host "   Static Public IP: $staticIP" -ForegroundColor White
Write-Host "   Server Port: $serverPort" -ForegroundColor White
Write-Host ""

# Test router accessibility
Write-Host "🌐 Testing Router Access..." -ForegroundColor Yellow
try {
    $routerTest = Test-NetConnection -ComputerName $routerIP -Port 80 -InformationLevel Quiet
    if ($routerTest.TcpTestSucceeded) {
        Write-Host "   ✅ Router admin panel accessible at http://$routerIP" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Router admin panel not accessible" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error testing router access" -ForegroundColor Red
}

Write-Host ""

# Test external port accessibility
Write-Host "🌍 Testing External Port Accessibility..." -ForegroundColor Yellow

$ports = @(80, 443, 8080)
foreach ($port in $ports) {
    try {
        $test = Test-NetConnection -ComputerName $staticIP -Port $port -InformationLevel Quiet
        if ($test.TcpTestSucceeded) {
            Write-Host "   ✅ Port $port is accessible externally" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Port $port is NOT accessible externally" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ Error testing port $port" -ForegroundColor Red
    }
}

Write-Host ""

# Test local server
Write-Host "🖥️ Testing Local Server..." -ForegroundColor Yellow
try {
    $localTest = Test-NetConnection -ComputerName $localIP -Port $serverPort -InformationLevel Quiet
    if ($localTest.TcpTestSucceeded) {
        Write-Host "   ✅ Local server accessible at $localIP`:$serverPort" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Local server not accessible" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error testing local server" -ForegroundColor Red
}

Write-Host ""

# Router configuration instructions
Write-Host "🔧 Router Configuration Required:" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "1. Open browser and go to: http://$routerIP" -ForegroundColor White
Write-Host "2. Login with:" -ForegroundColor White
Write-Host "   Username: Epuser" -ForegroundColor White
Write-Host "   Password: SnnHBC33" -ForegroundColor White
Write-Host ""
Write-Host "3. Navigate to: Advanced Settings > NAT > IPv4 Port Mapping" -ForegroundColor White
Write-Host ""
Write-Host "4. Configure these rules:" -ForegroundColor White
Write-Host "   HTTP Rule:" -ForegroundColor Yellow
Write-Host "     - Protocol: TCP" -ForegroundColor White
Write-Host "     - Start External Port: 80" -ForegroundColor White
Write-Host "     - End External Port: 80" -ForegroundColor White
Write-Host "     - Start Internal Port: $serverPort" -ForegroundColor White
Write-Host "     - End Internal Port: $serverPort" -ForegroundColor White
Write-Host "     - Internal Host: $localIP" -ForegroundColor White
Write-Host ""
Write-Host "   HTTPS Rule:" -ForegroundColor Yellow
Write-Host "     - Start External Port: 443" -ForegroundColor White
Write-Host "     - End External Port: 443" -ForegroundColor White
Write-Host "     - Start Internal Port: $serverPort" -ForegroundColor White
Write-Host "     - End Internal Port: $serverPort" -ForegroundColor White
Write-Host "     - Internal Host: $localIP" -ForegroundColor White
Write-Host ""
Write-Host "5. Click 'Apply' and restart router if prompted" -ForegroundColor White
Write-Host ""

# Test website accessibility
Write-Host "🌐 Testing Website Accessibility..." -ForegroundColor Yellow
try {
    $webTest = Invoke-WebRequest -Uri "http://$staticIP`:$serverPort" -TimeoutSec 10 -UseBasicParsing
    if ($webTest.StatusCode -eq 200) {
        Write-Host "   ✅ Website accessible via IP:PORT" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Website responded with status: $($webTest.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Website not accessible via IP:PORT" -ForegroundColor Red
}

Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Configure router port forwarding as shown above" -ForegroundColor White
Write-Host "2. Restart router after configuration" -ForegroundColor White
Write-Host "3. Run this script again to verify changes" -ForegroundColor White
Write-Host "4. Test www.rangoons.live (without port number)" -ForegroundColor White

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
