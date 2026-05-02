Write-Host "Starting Database Cleanup..." -ForegroundColor Cyan

# Pindah ke folder backend
Set-Location -Path "backend"

# Menjalankan script clear db
npm run force-clear-all

# Kembali ke folder semula (root workspace)
Set-Location -Path ".."

Write-Host "Cleanup script finished." -ForegroundColor Green
