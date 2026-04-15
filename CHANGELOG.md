# Changelog - PEAFORM System

## 2026-04-15 - Production Fixes & Database Cleanup

### Fixed
1. **Cookie Authentication Issue**
   - Changed `secure` flag from `true` to `false` in cookie configuration
   - Reason: Website runs on HTTP, not HTTPS. Cookies with `secure: true` only work on HTTPS
   - Added `maxAge: 24 * 60 * 60 * 1000` for 24-hour cookie expiration

2. **Database CASCADE Delete**
   - Added `onDelete: 'cascade'` to all foreign key references in schema
   - Now users can be deleted without foreign key constraint errors
   - Related data (forms, approvals, notifications) will be automatically deleted

3. **CRUD Operations**
   - Fixed delete user functionality
   - All CRUD operations now working properly

### Removed
1. **Dummy Data and Seed Files**
   - Deleted `backend/src/db/seed.ts`
   - Deleted `backend/src/db/seed-simple.ts`
   - Deleted `server.ts` (old JSON database server)
   - Deleted `database.json` (old JSON database)
   - Removed `db:seed` script from package.json
   - **Removed "Seed Dummy Data" button from Admin Panel**
   - System now uses real-time data only, no dummy data

2. **Database Cleanup**
   - Created and ran `clean-database.ts` script
   - Deleted all dummy users (11 users removed)
   - Deleted all dummy forms (2 forms removed)
   - Deleted all approvals
   - Deleted all notifications
   - **Only admin account remains in database**

### Added
1. **Database Management Scripts**
   - `backend/src/db/clean-database.ts` - Script to clean all data except admin
   - `backend/src/db/check-database.ts` - Script to check database contents

### Configuration
- Backend runs on: `http://10.125.48.102:3002`
- Frontend accessible at: `http://10.125.48.102:9000/`
- Database: PostgreSQL at `localhost:5432/peaform`

### Migration
- Generated and applied migration for CASCADE delete constraints
- Migration file: `drizzle/0000_orange_princess_powerful.sql`

### Current Database State
- **Users**: 1 (admin only)
- **Forms**: 0
- **Approvals**: 0
- **Notifications**: 0

### Notes
- Port 9000 was already in use by another service
- Backend uses port 3002, frontend served on port 9000
- All dummy users and forms have been removed from database
- System ready for production use with real data only
- Admin credentials remain unchanged
