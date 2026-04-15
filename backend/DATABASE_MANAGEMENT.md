# Database Management Scripts

This document describes the database management scripts available in the PEAFORM system.

## Available Scripts

### 1. Check Database Contents
**File**: `src/db/check-database.ts`

Shows current database statistics and lists all users and forms.

```bash
npx tsx src/db/check-database.ts
```

**Output**:
- Total count of users, forms, approvals, and notifications
- List of all users with their roles
- List of all forms with their status

### 2. Clean Database
**File**: `src/db/clean-database.ts`

⚠️ **WARNING**: This script will delete ALL data except the admin account!

Removes:
- All users except admin
- All forms
- All approvals
- All notifications

```bash
npx tsx src/db/clean-database.ts
```

**Use Cases**:
- Resetting database to initial state
- Removing all test/dummy data
- Preparing for production deployment

### 3. Database Migration
**File**: `src/db/migrate.ts`

Applies pending database migrations.

```bash
npm run db:migrate
```

### 4. Generate Migration
Generates a new migration file based on schema changes.

```bash
npm run db:generate
```

### 5. Database Studio
Opens Drizzle Studio for visual database management.

```bash
npm run db:studio
```

## Current Database State

After running the cleanup script on 2026-04-15:

- **Users**: 1 (admin only)
- **Forms**: 0
- **Approvals**: 0
- **Notifications**: 0

## Admin Account

The default admin account credentials:
- **Username**: `admin`
- **Password**: `password123` (change this in production!)
- **Role**: `admin`

## Safety Notes

1. Always backup your database before running cleanup scripts
2. The clean-database script cannot be undone
3. Make sure you have admin credentials before cleaning the database
4. In production, change the default admin password immediately

## Database Connection

The database connection is configured in `.env`:

```
DATABASE_URL=postgres://postgres:Indofood00@localhost:5432/peaform
```

Make sure PostgreSQL is running before executing any database scripts.
