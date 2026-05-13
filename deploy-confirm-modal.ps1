# Deploy Script - ConfirmModal Update
# This script deploys the new ConfirmModal component to replace window.confirm()

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PEAF System - Deploy ConfirmModal" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Pull latest changes
Write-Host "[1/5] Pulling latest changes from GitHub..." -ForegroundColor Yellow
cd /var/www/peaf
git pull origin develop

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to pull from GitHub" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Successfully pulled latest changes" -ForegroundColor Green
Write-Host ""

# Step 2: Install dependencies (if needed)
Write-Host "[2/5] Checking frontend dependencies..." -ForegroundColor Yellow
cd frontend
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Dependencies up to date" -ForegroundColor Green
Write-Host ""

# Step 3: Build frontend
Write-Host "[3/5] Building frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Frontend build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Frontend built successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Restart backend (if needed)
Write-Host "[4/5] Restarting backend..." -ForegroundColor Yellow
cd ..
pm2 restart peaf-backend

if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Failed to restart backend (may not be running)" -ForegroundColor Yellow
} else {
    Write-Host "✓ Backend restarted successfully" -ForegroundColor Green
}

Write-Host ""

# Step 5: Clear browser cache instruction
Write-Host "[5/5] Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  IMPORTANT: Clear Browser Cache" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To see the changes, please:" -ForegroundColor Yellow
Write-Host "1. Press Ctrl + Shift + R (Windows/Linux)" -ForegroundColor White
Write-Host "   or Cmd + Shift + R (Mac)" -ForegroundColor White
Write-Host "2. Or clear browser cache manually" -ForegroundColor White
Write-Host ""
Write-Host "Changes deployed:" -ForegroundColor Cyan
Write-Host "✓ Replaced window.confirm() with ConfirmModal" -ForegroundColor Green
Write-Host "✓ Professional modal design with animations" -ForegroundColor Green
Write-Host "✓ Color-coded by action type (danger/success/warning)" -ForegroundColor Green
Write-Host "✓ Smooth transitions and backdrop blur" -ForegroundColor Green
Write-Host ""
Write-Host "Deployment completed successfully!" -ForegroundColor Green
