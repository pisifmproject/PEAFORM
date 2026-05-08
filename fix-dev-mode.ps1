# Quick fix untuk development mode login issue
# Run this if you can't login in development mode

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fix Development Mode Login Issue" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.development exists
if (Test-Path "backend\.env.development") {
    Write-Host "✅ .env.development already exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  Creating .env.development..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env.development"
    
    # Update values for development
    $envContent = Get-Content "backend\.env.development" -Raw
    $envContent = $envContent -replace 'NODE_ENV=development', 'NODE_ENV=development'
    $envContent = $envContent -replace 'FRONTEND_URL=.*', 'FRONTEND_URL=http://localhost:5173'
    $envContent = $envContent -replace 'COOKIE_PATH=.*', 'COOKIE_PATH='
    Set-Content "backend\.env.development" $envContent
    
    Write-Host "✅ .env.development created" -ForegroundColor Green
}

Write-Host ""
Write-Host "Checking package.json dev script..." -ForegroundColor Yellow

$packageJson = Get-Content "backend\package.json" -Raw | ConvertFrom-Json
$devScript = $packageJson.scripts.dev

if ($devScript -like "*--env-file=.env.development*") {
    Write-Host "✅ Dev script already configured correctly" -ForegroundColor Green
} else {
    Write-Host "⚠️  Dev script needs update" -ForegroundColor Yellow
    Write-Host "   Current: $devScript" -ForegroundColor DarkGray
    Write-Host "   Please update package.json manually or re-run setup" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Stop any running development servers" -ForegroundColor White
Write-Host "2. Clear browser cookies (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "3. Run: .\development.ps1" -ForegroundColor White
Write-Host "4. Open: http://localhost:5173" -ForegroundColor White
Write-Host "5. Login with: admin / password123" -ForegroundColor White
Write-Host ""
Write-Host "If still having issues:" -ForegroundColor Yellow
Write-Host "- Check backend console for errors" -ForegroundColor DarkGray
Write-Host "- Check browser console (F12)" -ForegroundColor DarkGray
Write-Host "- Verify cookie path is '/' in browser DevTools" -ForegroundColor DarkGray
Write-Host ""
