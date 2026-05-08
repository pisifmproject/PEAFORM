# Script untuk fix unauthorized issue dan deploy ulang
# Run as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PEAF - Fix Unauthorized Issue" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Rebuild Backend
Write-Host "[1/5] Rebuilding backend..." -ForegroundColor Yellow
Set-Location backend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend built successfully" -ForegroundColor Green
Set-Location ..

# 2. Restart Backend with PM2
Write-Host ""
Write-Host "[2/5] Restarting backend service..." -ForegroundColor Yellow
pm2 restart peaform-backend
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  PM2 restart failed, trying to start..." -ForegroundColor Yellow
    Set-Location backend
    pm2 start ecosystem.config.cjs
    Set-Location ..
}
Write-Host "✅ Backend restarted" -ForegroundColor Green

# 3. Wait for backend to be ready
Write-Host ""
Write-Host "[3/5] Waiting for backend to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
$response = Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing -ErrorAction SilentlyContinue
if ($response.StatusCode -eq 200) {
    Write-Host "✅ Backend is healthy" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend health check failed, but continuing..." -ForegroundColor Yellow
}

# 4. Check Apache configuration
Write-Host ""
Write-Host "[4/5] Checking Apache configuration..." -ForegroundColor Yellow
$apacheConfigPath = "C:\xampp\apache\conf\extra\httpd-vhosts.conf"
if (Test-Path $apacheConfigPath) {
    Write-Host "✅ Apache config found at: $apacheConfigPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  MANUAL STEP REQUIRED:" -ForegroundColor Yellow
    Write-Host "   1. Copy apache-vhost-peaform.conf to Apache config" -ForegroundColor White
    Write-Host "   2. Restart Apache from XAMPP Control Panel" -ForegroundColor White
    Write-Host "   3. Or run: net stop Apache2.4 && net start Apache2.4" -ForegroundColor White
} else {
    Write-Host "⚠️  Apache config not found at default location" -ForegroundColor Yellow
    Write-Host "   Please manually update your Apache configuration" -ForegroundColor White
}

# 5. Instructions
Write-Host ""
Write-Host "[5/5] Next steps:" -ForegroundColor Yellow
Write-Host "   1. Restart Apache" -ForegroundColor White
Write-Host "   2. Clear browser cache and cookies" -ForegroundColor White
Write-Host "   3. Login again to the application" -ForegroundColor White
Write-Host "   4. Try to submit a request" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 For detailed troubleshooting, see: FIX_UNAUTHORIZED_ISSUE.md" -ForegroundColor Cyan
Write-Host ""
