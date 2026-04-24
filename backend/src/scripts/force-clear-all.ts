import { db } from '../db/index.js';
import { peaf_forms, peaf_approvals, notifications } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function forceClearAll() {
  try {
    console.log('\n🗑️  Force Clear All PEAF Requests\n');
    console.log('================================\n');

    // Fetch all forms
    const formsToDelete = await db.select().from(peaf_forms);
    
    console.log(`📊 Found ${formsToDelete.length} request(s) to delete\n`);

    if (formsToDelete.length === 0) {
      console.log('✅ No requests found in database.');
      process.exit(0);
    }

    let deletedFiles = 0;
    let deletedRequests = 0;
    let deletedApprovals = 0;
    let deletedNotifications = 0;

    // Process each form
    for (const form of formsToDelete) {
      console.log(`Processing: ${form.document_no}...`);

      // 1. Delete uploaded files
      const docs = form.supporting_documents as any[];
      if (docs && Array.isArray(docs)) {
        const files = docs.filter((d: any) => !d.isMenu);
        
        for (const file of files) {
          try {
            const uploadsDir = path.join(__dirname, '../../uploads');
            const filePath = path.join(uploadsDir, file.filename);
            
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              deletedFiles++;
            }
          } catch (fileError) {
            console.log(`  ⚠️  Could not delete file: ${file.filename}`);
          }
        }
      }

      // 2. Delete approvals
      const approvalsResult = await db.delete(peaf_approvals)
        .where(eq(peaf_approvals.form_id, form.id))
        .returning();
      deletedApprovals += approvalsResult.length;

      // 3. Delete notifications
      const notificationsResult = await db.delete(notifications)
        .where(eq(notifications.form_id, form.id))
        .returning();
      deletedNotifications += notificationsResult.length;

      // 4. Delete form
      await db.delete(peaf_forms).where(eq(peaf_forms.id, form.id));
      deletedRequests++;
      console.log(`  ✓ Deleted\n`);
    }

    // Summary
    console.log('================================\n');
    console.log('✅ Deletion Summary:\n');
    console.log(`📄 Requests deleted: ${deletedRequests}`);
    console.log(`📎 Files deleted: ${deletedFiles}`);
    console.log(`✔️  Approvals deleted: ${deletedApprovals}`);
    console.log(`🔔 Notifications deleted: ${deletedNotifications}`);
    console.log('\n✨ Cleanup completed!\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

forceClearAll();
