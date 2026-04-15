import { db } from './index.js';
import { users, peaf_forms, peaf_approvals, notifications } from './schema.js';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

async function cleanDatabase() {
  try {
    console.log('Starting database cleanup...');

    // Get admin user
    const adminUser = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
    
    if (adminUser.length === 0) {
      console.log('No admin user found. Database is already clean or needs initial setup.');
      return;
    }

    const adminId = adminUser[0].id;
    console.log(`Found admin user: ${adminUser[0].username} (${adminId})`);

    // Delete all notifications
    console.log('Deleting all notifications...');
    await db.delete(notifications);

    // Delete all approvals
    console.log('Deleting all approvals...');
    await db.delete(peaf_approvals);

    // Delete all forms
    console.log('Deleting all forms...');
    await db.delete(peaf_forms);

    // Delete all users except admin
    console.log('Deleting all users except admin...');
    const deletedUsers = await db.delete(users).where(eq(users.role, 'user')).returning();
    const deletedHOD = await db.delete(users).where(eq(users.role, 'hod')).returning();
    const deletedHSE = await db.delete(users).where(eq(users.role, 'hse')).returning();
    const deletedFM = await db.delete(users).where(eq(users.role, 'factory_manager')).returning();
    const deletedEM = await db.delete(users).where(eq(users.role, 'engineering_manager')).returning();

    const totalDeleted = deletedUsers.length + deletedHOD.length + deletedHSE.length + deletedFM.length + deletedEM.length;

    console.log(`\n✅ Database cleanup completed!`);
    console.log(`   - Deleted ${totalDeleted} users (kept admin)`);
    console.log(`   - Deleted all forms`);
    console.log(`   - Deleted all approvals`);
    console.log(`   - Deleted all notifications`);
    console.log(`\nOnly admin account remains in the database.`);

  } catch (error) {
    console.error('Error cleaning database:', error);
    throw error;
  }
}

cleanDatabase()
  .then(() => {
    console.log('\nDatabase cleanup script finished successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nDatabase cleanup script failed:', error);
    process.exit(1);
  });
