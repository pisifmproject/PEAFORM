# PEAFORM Complete Deployment Script with PM2 & Apache
#      This script will:
#      1. Build frontend & backend
#      2. Deploy frontend to Apache
#      3. Manage backend with PM2
#      4. Restart Apache to load new config
#      ================================================

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  PEAFORM Complete Deployment" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = "C:\Users\netcom\Documents\ifm_septian\project\PEAFORM"

# Step 1: Build Frontend
Write-Host "[1/5] Building Frontend..." -ForegroundColor Yellow
Set-Location "$projectPath\frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "X Frontend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "OK Frontend built" -ForegroundColor Green
Write-Host ""

# Step 2: Build Backend
Write-Host "[2/5] Building Backend..." -ForegroundColor Yellow
Set-Location "$projectPath\backend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "X Backend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "OK Backend built" -ForegroundColor Green
Write-Host ""

# Step 3: PM2 Management
Write-Host "[3/5] Managing Backend with PM2..." -ForegroundColor Yellow
Set-Location "$projectPath\backend"

$pmList = pm2 list 2>$null
if ($pmList -match "peaform-backend") {
    pm2 restart peaform-backend 2>$null
    Write-Host "  Restarted existing backend" -ForegroundColor Cyan
} else {
    pm2 start ecosystem.config.cjs 2>$null
    Write-Host "  Started new backend" -ForegroundColor Cyan
}
pm2 save --force 2>$null
Write-Host "OK Backend running on PM2" -ForegroundColor Green
Write-Host ""

# Step 4: Deploy Frontend
Write-Host "[4/5] Deploying Frontend..." -ForegroundColor Yellow
$xamppDir = "C:\xampp\htdocs\peaform"
if (Test-Path $xamppDir) {
    Remove-Item -Path "$xamppDir\*" -Recurse -Force
} else {
    New-Item -ItemType Directory -Path $xamppDir -Force | Out-Null
}
Copy-Item -Path "$projectPath\frontend\dist\*" -Destination $xamppDir -Recurse -Force
Write-Host "OK Frontend deployed to $xamppDir" -ForegroundColor Green
Write-Host ""

# Step 5: Apache Config & Restart
Write-Host "[5/5] Configuring Apache..." -ForegroundColor Yellow
Copy-Item "$projectPath\apache-config.conf" "C:\MyServer\Apache24\conf\extra\peaform-9000.conf" -Force
Write-Host "  Config copied" -ForegroundColor Cyan
Write-Host "  Restarting Apache..." -ForegroundColor Cyan
& "C:\MyServer\Apache24\bin\httpd.exe" -k restart 2>$null
Start-Sleep -Seconds 2
Write-Host "OK Apache restarted" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "=================================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Website:" -ForegroundColor Cyan
Write-Host "  Local: http://localhost:9000/" -ForegroundColor White
Write-Host "  Network: http://10.125.48.102:9000/" -ForegroundColor White
Write-Host ""
Write-Host "Login:" -ForegroundColor Cyan
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "Backend Status:" -ForegroundColor Yellow
pm2 list
Write-Host ""
