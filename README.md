# PEAFORM - Project Engineering Approval Form

Sistem manajemen approval untuk project engineering di Indofood Manufacturing.

## 🚀 Features

- ✅ Multi-level approval workflow (HOD → HSE → Factory Manager → Engineering Manager)
- ✅ Real-time notifications
- ✅ Role-based access control (Admin, User, HOD, HSE, FM, EM)
- ✅ Plant-based filtering for approvers
- ✅ Auto-generated document numbers
- ✅ Complete CRUD operations
- ✅ Responsive design with modern UI
- ✅ Production-ready with clean database

## 🔧 Prerequisites

- Node.js v18+
- PostgreSQL v14+
- PM2 (global): `npm install -g pm2`
- Apache/XAMPP (for production)

## 📦 Installation

### 1. Clone Repository

```bash
git clone https://github.com/pisifmproject/PEAFORM.git
cd PEAFORM
```

### 2. Setup Backend

```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run db:migrate

# Build
npm run build
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run build
```

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
- Frontend: `http://localhost:5173`

### Production Deployment

```powershell
.\deploy.ps1
```

Akan:
1. Build backend dan frontend
2. Deploy frontend ke Apache
3. Restart backend dengan PM2

## 🌐 Access URLs

- **Production**: `http://10.125.48.102:9000/`
- **Backend API**: `http://10.125.48.102:3002/api`
- **Health Check**: `http://10.125.48.102:3002/health`

## 🔑 Default Login

⚠️ **IMPORTANT**: Change password after first login!

- **Admin**: `admin` / `password123`

## 📁 Project Structure

```
PEAFORM/
├── frontend/                    # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── context/            # React context (Auth)
│   │   └── lib/                # Utilities & API client
│   └── dist/                   # Build output
│
├── backend/                     # Express + Drizzle ORM
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Auth middleware
│   │   ├── db/                 # Database & migrations
│   │   └── config/             # Configuration
│   ├── dist/                   # Build output
│   └── logs/                   # PM2 logs
│
├── deploy.ps1                  # Production deployment script
├── development.ps1             # Development script
├── CHANGELOG.md                # Version history
└── README.md                   # This file
```

## 🗄️ Database Management

### Check Database Contents

```bash
cd backend
npx tsx src/db/check-database.ts
```

### Clean Database (⚠️ Removes all data except admin)

```bash
cd backend
npx tsx src/db/clean-database.ts
```

### Other Commands

```bash
npm run db:studio    # Open Drizzle Studio
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema (dev only)
```

See [backend/DATABASE_MANAGEMENT.md](backend/DATABASE_MANAGEMENT.md) for details.

## 📦 PM2 Management

```bash
pm2 list                    # List all processes
pm2 logs peaform-backend    # View logs
pm2 restart peaform-backend # Restart
pm2 stop peaform-backend    # Stop
pm2 delete peaform-backend  # Delete process
pm2 monit                   # Monitor
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Routing
- **Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Express** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **PM2** - Process manager

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Forms
- `GET /api/forms` - Get all forms (filtered by role)
- `GET /api/forms/:id` - Get form details
- `POST /api/forms` - Create new form
- `POST /api/forms/:id/approve` - Approve/reject form

### Admin
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id/role` - Update user role
- `PUT /api/users/:id/plant` - Update user plant
- `DELETE /api/users/:id` - Delete user

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ HTTP-only cookies
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ CORS protection
- ✅ SQL injection prevention (Drizzle ORM)

## 📊 Current Database State

After cleanup (2026-04-15):
- **Users**: 1 (admin only)
- **Forms**: 0
- **Approvals**: 0
- **Notifications**: 0

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
netstat -ano | findstr :3002

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Database Connection Error

1. Check PostgreSQL is running
2. Verify credentials in `.env`
3. Test connection: `cd backend && node test-db-connection.ts`

### PM2 Not Starting

```bash
# Delete and restart
pm2 delete peaform-backend
pm2 start ecosystem.config.cjs
```

## 📝 Naming Conventions

- **Files**: kebab-case (`user-service.ts`)
- **Variables**: snake_case (`user_id`, `form_data`)
- **Functions**: camelCase (`createUser`, `getFormById`)
- **Components**: PascalCase (`UserProfile`, `FormList`)

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and recent changes.

## 🤝 Contributing

1. Follow naming conventions
2. Test before commit
3. Update documentation
4. Never commit `.env` files

## 📄 License

Internal use only - Indofood Manufacturing

## 👥 Team

Developed by IFM Septian Team - PISIFM Project

---

**Last Updated**: April 15, 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅
