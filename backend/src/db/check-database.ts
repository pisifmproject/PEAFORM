import { db } from './index.js';
import { users, peaf_forms, peaf_approvals, notifications } from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabase() {
  try {
    console.log('Checking database contents...\n');

    const allUsers = await db.select().from(users);
    const allForms = await db.select().from(peaf_forms);
    const allApprovals = await db.select().from(peaf_approvals);
    const allNotifications = await db.select().from(notifications);

    console.log('📊 Database Statistics:');
    console.log(`   Users: ${allUsers.length}`);
    console.log(`   Forms: ${allForms.length}`);
    console.log(`   Approvals: ${allApprovals.length}`);
    console.log(`   Notifications: ${allNotifications.length}`);

    if (allUsers.length > 0) {
      console.log('\n👥 Users in database:');
      allUsers.forEach(user => {
        console.log(`   - ${user.username} (${user.role}) - ${user.name}`);
      });
    }

    if (allForms.length > 0) {
      console.log('\n📄 Forms in database:');
      allForms.forEach(form => {
        console.log(`   - ${form.document_no} - ${form.status}`);
      });
    }

  } catch (error) {
    console.error('Error checking database:', error);
    throw error;
  }
}

checkDatabase()
  .then(() => {
    console.log('\nDatabase check completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nDatabase check failed:', error);
    process.exit(1);
  });
