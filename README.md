# PEAFORM - Project Engineering Approval Form

Sistem manajemen approval untuk project engineering di Indofood Manufacturing.

## 🚀 Quick Start

### Development Mode

```powershell
.\development.ps1
```

Features:
- ✅ Auto-stop PM2 jika running (menghindari konflik)
- ✅ Backend & Frontend di window terpisah
- ✅ Hot reload (tsx watch + Vite HMR)
- ✅ Auto-restart PM2 setelah selesai

Akan menjalankan:
- Backend: `http://localhost:3002`
- Frontend: `http://localhost:5173/peaf/`

### Production Deployment

```powershell
.\deploy.ps1
```

Akan:
1. Build backend dan frontend
2. Deploy frontend ke Apache
3. Restart backend dengan PM2

## 📁 Struktur Project

```
PEAFORM/
├── frontend/           # React + Vite + TypeScript
├── backend/            # Express + Drizzle ORM + PostgreSQL
├── deploy.ps1          # Script deployment production
├── development.ps1     # Script development mode
└── README-DEPLOYMENT.md # Dokumentasi lengkap
```

## 🔧 Prerequisites

- Node.js v18+
- PostgreSQL v14+
- PM2 (global)
- Apache/XAMPP

## 📖 Dokumentasi Lengkap

Lihat [README-DEPLOYMENT.md](./README-DEPLOYMENT.md) untuk:
- Setup lengkap
- Konfigurasi database
- Konfigurasi Apache
- Troubleshooting
- Dan lainnya

## 🔑 Default Login

- **Admin**: `admin` / `password123`
- **User**: `user1` / `password123`
- **HOD Cikupa**: `hod_cikupa` / `password123`

## 🌐 URLs

- **Development Frontend**: http://localhost:5173
- **Production Frontend**: http://localhost/peaform
- **Backend API**: http://localhost:3002/api
- **Health Check**: http://localhost:3002/health

## 📝 Naming Conventions

- **Files**: kebab-case (`user-service.ts`)
- **Variables**: snake_case (`user_id`, `form_data`)
- **Functions**: camelCase (`createUser`, `getFormById`)
- **Components**: PascalCase (`UserProfile`, `FormList`)

## 🛠️ Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- TailwindCSS
- React Router
- React Hook Form + Zod

### Backend
- Express
- TypeScript
- Drizzle ORM
- PostgreSQL
- JWT Authentication
- PM2 Process Manager

## 📦 PM2 Management

```powershell
pm2 list                    # List all processes
pm2 logs peaform-backend    # View logs
pm2 restart peaform-backend # Restart
pm2 stop peaform-backend    # Stop
pm2 monit                   # Monitor
```

## 🗄️ Database Management

```powershell
cd backend
npm run db:studio    # Open Drizzle Studio
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema (dev only)
npm run db:seed      # Seed database
```

## 🤝 Contributing

1. Follow naming conventions
2. Test before commit
3. Update documentation

## 📄 License

Internal use only - Indofood Manufacturing
