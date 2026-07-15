# 🧪 Port Forwarding Test Script
# Run this after configuring router port forwarding

Write-Host "🌐 Testing Port Forwarding Configuration" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Test current status
Write-Host "📋 Current Status:" -ForegroundColor Yellow
Write-Host "  DNS: rangoons.live → 154.57.212.38" -ForegroundColor Green
Write-Host "  Server: Running on port 8080" -ForegroundColor Green
Write-Host ""

# Test port 8080 (should always work)
Write-Host "🔍 Testing Port 8080 (Direct Access):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://rangoons.live:8080" -Method Head -TimeoutSec 10
    Write-Host "  ✅ Port 8080: HTTP $($response.StatusCode) OK" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Port 8080: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test port 80 (needs port forwarding)
Write-Host "🔍 Testing Port 80 (Port Forwarding):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://rangoons.live" -Method Head -TimeoutSec 10
    Write-Host "  ✅ Port 80: HTTP $($response.StatusCode) OK" -ForegroundColor Green
    Write-Host "  🎉 Port forwarding is working!" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Port 80: Failed - $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  💡 Port forwarding not yet configured" -ForegroundColor Yellow
}

Write-Host ""

# Test port 443 (needs port forwarding)
Write-Host "🔍 Testing Port 443 (HTTPS Port Forwarding):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://rangoons.live" -Method Head -TimeoutSec 10
    Write-Host "  ✅ Port 443: HTTP $($response.StatusCode) OK" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Port 443: Failed - $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  💡 HTTPS port forwarding not yet configured" -ForegroundColor Yellow
}

Write-Host ""

# Summary
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  If port 80 works: Port forwarding is configured ✅" -ForegroundColor Green
Write-Host "  If port 80 fails: Configure router port forwarding 🔧" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Configure router at http://192.168.18.1" -ForegroundColor White
Write-Host "  2. Set up port forwarding (80→8080, 443→8080)" -ForegroundColor White
Write-Host "  3. Run this script again to verify" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
