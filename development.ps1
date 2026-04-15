# development.ps1 - Development Mode PEAFORM
# Frontend: Vite HMR (Hot Module Replacement) — perubahan langsung terlihat tanpa compile
# Backend : tsx watch (hot reload TypeScript) — auto restart saat file .ts berubah
# Akses   : http://localhost:5173/peaf/

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  PEAFORM Development Mode" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontend (Vite HMR) : http://localhost:5173/" -ForegroundColor Green
Write-Host "  Backend (tsx watch) : http://localhost:3002/api/" -ForegroundColor Green
Write-Host ""
Write-Host "  Tekan Ctrl+C dua kali untuk menghentikan semua proses." -ForegroundColor DarkGray
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$ROOT = $PSScriptRoot

# Pastikan backend (PM2 production) tidak konflik di port 3002
# Cek apakah peaform-backend PM2 sedang online
$pm2Status = pm2 list 2>$null | Select-String "peaform-backend.*online"

if ($pm2Status) {
    Write-Host "[!] PM2 peaform-backend sedang running di port 3002." -ForegroundColor Yellow
    Write-Host "    Menghentikan sementara agar tidak konflik dengan dev backend..." -ForegroundColor Yellow
    pm2 stop peaform-backend | Out-Null
    Write-Host "    OK PM2 peaform-backend dihentikan." -ForegroundColor Green
    Write-Host ""
}

# Simpan flag agar bisa restart PM2 saat dev selesai
$stoppedPm2 = [bool]$pm2Status

# -- Jalankan Backend (tsx watch) di window terpisah --
Write-Host "[1/2] Menjalankan Backend (tsx watch)..." -ForegroundColor Yellow
$backendJob = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$ROOT\backend'; Write-Host '[BACKEND] tsx watch starting...' -ForegroundColor Cyan; npm run dev"
) -PassThru

Write-Host "    OK Backend job dimulai (PID: $($backendJob.Id))" -ForegroundColor Green
Write-Host ""

# Tunggu sebentar agar backend sempat bind ke port 3002
Start-Sleep -Seconds 3

# -- Jalankan Frontend (Vite) di window terpisah --
Write-Host "[2/2] Menjalankan Frontend (Vite HMR)..." -ForegroundColor Yellow
$frontendJob = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$ROOT\frontend'; Write-Host '[FRONTEND] Vite dev server starting...' -ForegroundColor Cyan; npm run dev"
) -PassThru

Write-Host "    OK Frontend job dimulai (PID: $($frontendJob.Id))" -ForegroundColor Green
Write-Host ""

# -- Tampilkan info akses --
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.InterfaceAlias -notmatch "Loopback" -and $_.IPAddress -notmatch "^169" } |
    Select-Object -First 1).IPAddress

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  DEV SERVER RUNNING" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Lokal   : http://localhost:5173/" -ForegroundColor White
if ($ipAddress) {
    Write-Host "  Network : http://${ipAddress}:5173/" -ForegroundColor White
}
Write-Host ""
Write-Host "  Backend API : http://localhost:3002/api/" -ForegroundColor White
Write-Host "  Health Check: http://localhost:3002/health" -ForegroundColor White
Write-Host ""
Write-Host "  Cara kerja:" -ForegroundColor DarkGray
Write-Host "    - Edit file .tsx / .ts di frontend -> browser auto-refresh (HMR)" -ForegroundColor DarkGray
Write-Host "    - Edit file .ts di backend -> server auto-restart (tsx watch)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Login Credentials:" -ForegroundColor Yellow
Write-Host "    Username: admin" -ForegroundColor White
Write-Host "    Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "  Untuk STOP: tutup window Backend dan Frontend, lalu tekan Enter di sini." -ForegroundColor Yellow
Write-Host ""

# Tunggu input user sebelum cleanup
Read-Host "Tekan Enter untuk menghentikan dev mode dan kembali ke production PM2"

# -- Cleanup --
Write-Host ""
Write-Host "Menghentikan proses dev..." -ForegroundColor Yellow

try { 
    Stop-Process -Id $backendJob.Id -Force -ErrorAction SilentlyContinue 
    Write-Host "  Backend process stopped" -ForegroundColor DarkGray
} catch {}

try { 
    Stop-Process -Id $frontendJob.Id -Force -ErrorAction SilentlyContinue 
    Write-Host "  Frontend process stopped" -ForegroundColor DarkGray
} catch {}

Write-Host "OK Proses dev dihentikan." -ForegroundColor Green

# Restart PM2 production jika tadi dihentikan
if ($stoppedPm2) {
    Write-Host ""
    Write-Host "Memulai kembali PM2 peaform-backend (production)..." -ForegroundColor Yellow
    Set-Location "$ROOT\backend"
    pm2 start peaform-backend
    Write-Host "OK PM2 peaform-backend kembali online." -ForegroundColor Green
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Dev mode selesai. Gunakan deploy.ps1" -ForegroundColor Cyan
Write-Host "  untuk production build." -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
