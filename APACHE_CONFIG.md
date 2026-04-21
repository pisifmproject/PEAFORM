# Konfigurasi Apache - Multi-App (SMP + PISIFM + PEAFORM)

Dokumen ini menjelaskan arsitektur deployment untuk 3 aplikasi web di server `10.125.48.102`. Semua traffic web diatur melalui port 80 menggunakan Apache sebagai *Reverse Proxy* utama, yang akan meneruskan request ke aplikasi yang sesuai berdasarkan path URL.

---

## 📋 1. Ringkasan Port & Service

| Aplikasi | URL / Path | Apache Port | Backend Port | PM2 Process Name | Direktori Frontend (htdocs) |
|---|---|---|---|---|---|
| **SMP** | `.../smp/` | **80** (Main) | **3001** | `smp-backend` | `C:/MyServer/htdocs/smp` |
| **PISIFM** | `.../pisifm/` | **2026** (VHost) | **5000** | `pisifm-backend` | `C:/MyServer/htdocs/pisifm` |
| **PEAFORM**| `.../peaf/` | **9000** (VHost) | **3002** | `peaform-backend` | `C:/MyServer/htdocs/peaf` |

> **Catatan:** File konfigurasi utama Apache berada di `C:\MyServer\Apache24\conf\httpd.conf` yang me-load file konfigurasi lainnya melalui perintah pemanggilan `Include conf/extra/*.conf`.

---

## 📍 2. File Konfigurasi Apache (C:\MyServer\Apache24\conf\extra\\)

1. **`smp.conf`**
   - Berperan sebagai pintu gerbang utama di **Port 80**.
   - Melayani langsung request untuk frontend SMP.
   - Bertindak sebagai jembatan *Reverse Proxy* menuju `/pisifm` (ke VHost port 2026) dan `/peaf` (ke VHost port 9000).

2. **`pisifm.conf`**
   - Beroperasi sebagai Virtual Host mendengarkan di **Port 2026**.
   - Melayani struktur file statis frontend PISIFM.
   - Meneruskan request dari UI ke Backend API `/pisifm/api` menuju Node.js di port **5000**.

3. **`peaform-9000.conf`**
   - Beroperasi sebagai Virtual Host mendengarkan di **Port 9000**.
   - Melayani struktur file statis frontend PEAFORM (React dibangun dengan konfigurasi `base: "/peaf/"`).
   - Meneruskan request dari UI ke Backend API `/peaf/api` menuju Node.js di port **3002**.

---

## 🔄 3. Alur Request (Request Flow)

Diagram di bawah ini menjabarkan bagaimana request browser diterima oleh sistem, diteruskan oleh aturan Proxy Apache, dan sampai ke logika Node.js PM2.

### A. Alur SMP (Smart Monitoring Plant)
```text
Browser → http://10.125.48.102/smp/ (Port 80)
              ↓
          smp.conf (Apache Port 80)
              ├─→ [Frontend File] Alias /smp        → Menampilkan C:/MyServer/htdocs/smp/index.html
              │
              └─→ [Backend API]   ProxyPass /api    → http://localhost:3001/api
                       ↓
                  smp-backend (Node.js via PM2, Port 3001)
```

### B. Alur PISIFM / PEAK
```text
Browser → http://10.125.48.102/pisifm/ (Port 80)
              ↓
          smp.conf (Apache Port 80)
              ↓ ProxyPass /pisifm → http://localhost:2026/pisifm
          pisifm.conf (Apache VHost, Port 2026)
              ├─→ [Frontend File] Alias /pisifm     → Menampilkan C:/MyServer/htdocs/pisifm/index.html
              │
              └─→ [Backend API] ProxyPass /pisifm/api → http://localhost:5000/api
                       ↓
                  pisifm-backend (Node.js via PM2, Port 5000)
```

### C. Alur PEAFORM
```text
Browser → http://10.125.48.102/peaf/ (Port 80)
              ↓
          smp.conf (Apache Port 80)
              ↓ ProxyPass /peaf → http://localhost:9000/peaf
          peaform-9000.conf (Apache VHost, Port 9000)
              ├─→ [Frontend File] Alias /peaf       → Menampilkan C:/MyServer/htdocs/peaf/index.html
              │
              └─→ [Backend API] ProxyPass /peaf/api  → http://localhost:3002/api
                       ↓
                  peaform-backend (Node.js via PM2, Port 3002)
```

---

## 🛠️ 4. Perintah Operasional Server

### Manage Backend (Node.js dengan PM2)
PM2 digunakan untuk memastikan backend berjalan 24 jam nonstop layaknya Windows Services, sekaligus merestart node instance bila terjadi kendala crash runtime.

```powershell
# Menampilkan Ringkasan Status & Memory dari Semua Services PM2
pm2 list

# Melakukan Restart Aplikasi Spesifik Saat Punya Kode Pembaruan
pm2 restart smp-backend
pm2 restart pisifm-backend
pm2 restart peaform-backend

# Memantau Log (Traffic Konsol & Error Output) Real-Time
pm2 logs
pm2 logs peaform-backend
```

### Manage Web Server Apache
Jalankan semua perintah web server di **PowerShell (Administrator Mode)**.

```powershell
# Pengecekan Sintaks Aturan Proxy (Wajib dilakukan setiap kali mengedit file `.conf` Apache)
C:\MyServer\Apache24\bin\httpd.exe -t
# Output akan muncul: "Syntax OK"

# Melakukan reload config terbaru tanpa memutus koneksi/session yang berjalan (Graceful)
C:\MyServer\Apache24\bin\httpd.exe -k restart

# Alternatif start/stop proses manual 
net stop Apache2.4
net start Apache2.4
```

---

## 🚀 5. Cara Build & Deploy Pembaruan

### Deploy PISIFM
```powershell
# Pindah ke Lokasi Project Code
cd /path/to/pisifm/frontend

# Compile Resource
npm run build

# Gantikan Asset Statis (Hapus folder lama, letakkan maping folder baru)
Remove-Item -Path "C:\MyServer\htdocs\pisifm\*" -Recurse -Force
Copy-Item -Path ".\dist\*" -Destination "C:\MyServer\htdocs\pisifm" -Recurse -Force
```

### Deploy PEAFORM
```powershell
# Pindah ke Lokasi Kode PEAFORM 
cd /path/to/peaform/frontend

# Compile Resource (Menghasilkan ./dist folder siap publish)
npm run build

# Menghapus dan Mengcopy Asset Baru ke Host Root PEAFORM
Remove-Item -Path "C:\MyServer\htdocs\peaf\*" -Recurse -Force
Copy-Item -Path ".\dist\*" -Destination "C:\MyServer\htdocs\peaf" -Recurse -Force
```
*(Catatan: Setelah mengganti frontend build `/dist/`, Apache Web Server **tidak wajib** di-restart, karena perbarui HTML JS dan CSS hanya butuh browser me-reload halaman dari jalur static. Refresh browser langsung dapat memuat update tergres.)*
