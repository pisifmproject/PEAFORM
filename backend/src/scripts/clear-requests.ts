import { db } from '../db/index.js';
import { peaf_forms, peaf_approvals, notifications } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

interface ClearOptions {
  deleteAll?: boolean;
  deleteByStatus?: string;
  deleteByDocumentNo?: string;
  deleteById?: string;
  dryRun?: boolean;
}

async function clearRequests(options: ClearOptions = {}) {
  try {
    console.log('\n🗑️  PEAF Request Cleanup Utility\n');
    console.log('================================\n');

    // Fetch forms based on options
    let formsToDelete: any[] = [];

    if (options.deleteById) {
      console.log(`📋 Fetching request with ID: ${options.deleteById}...`);
      formsToDelete = await db.select().from(peaf_forms).where(eq(peaf_forms.id, options.deleteById));
    } else if (options.deleteByDocumentNo) {
      console.log(`📋 Fetching request with Document No: ${options.deleteByDocumentNo}...`);
      formsToDelete = await db.select().from(peaf_forms).where(eq(peaf_forms.document_no, options.deleteByDocumentNo));
    } else if (options.deleteByStatus) {
      console.log(`📋 Fetching requests with status: ${options.deleteByStatus}...`);
      formsToDelete = await db.select().from(peaf_forms).where(eq(peaf_forms.status, options.deleteByStatus));
    } else if (options.deleteAll) {
      console.log('📋 Fetching ALL requests...');
      formsToDelete = await db.select().from(peaf_forms);
    } else {
      console.log('❌ No deletion criteria specified. Use --help for options.');
      rl.close();
      return;
    }

    if (formsToDelete.length === 0) {
      console.log('✅ No requests found matching the criteria.');
      rl.close();
      return;
    }

    console.log(`\n📊 Found ${formsToDelete.length} request(s) to delete:\n`);

    // Display requests to be deleted
    formsToDelete.forEach((form, index) => {
      console.log(`${index + 1}. Document No: ${form.document_no}`);
      console.log(`   Status: ${form.status}`);
      console.log(`   Applicant: ${form.applicant_name}`);
      console.log(`   Submitted: ${new Date(form.submission_date).toLocaleDateString()}`);
      
      // Count files
      const docs = form.supporting_documents as any[];
      const fileCount = docs ? docs.filter((d: any) => !d.isMenu).length : 0;
      console.log(`   Files: ${fileCount} file(s)`);
      console.log('');
    });

    // Dry run mode
    if (options.dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made.\n');
      console.log('What would be deleted:');
      console.log(`- ${formsToDelete.length} request(s) from database`);
      console.log(`- Associated approvals and notifications`);
      console.log(`- All uploaded files from uploads folder\n`);
      rl.close();
      return;
    }

    // Confirmation
    const answer = await question(`⚠️  Are you sure you want to delete these ${formsToDelete.length} request(s)? (yes/no): `);
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Deletion cancelled.');
      rl.close();
      return;
    }

    console.log('\n🚀 Starting deletion process...\n');

    let deletedFiles = 0;
    let deletedRequests = 0;
    let deletedApprovals = 0;
    let deletedNotifications = 0;
    let errors: string[] = [];

    // Process each form
    for (const form of formsToDelete) {
      try {
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
                console.log(`  ✓ Deleted file: ${file.filename}`);
              } else {
                console.log(`  ⚠️  File not found: ${file.filename}`);
              }
            } catch (fileError: any) {
              errors.push(`Failed to delete file ${file.filename}: ${fileError.message}`);
              console.log(`  ✗ Error deleting file: ${file.filename}`);
            }
          }
        }

        // 2. Delete approvals
        const approvalsResult = await db.delete(peaf_approvals)
          .where(eq(peaf_approvals.form_id, form.id))
          .returning();
        deletedApprovals += approvalsResult.length;
        console.log(`  ✓ Deleted ${approvalsResult.length} approval(s)`);

        // 3. Delete notifications
        const notificationsResult = await db.delete(notifications)
          .where(eq(notifications.form_id, form.id))
          .returning();
        deletedNotifications += notificationsResult.length;
        console.log(`  ✓ Deleted ${notificationsResult.length} notification(s)`);

        // 4. Delete form
        await db.delete(peaf_forms).where(eq(peaf_forms.id, form.id));
        deletedRequests++;
        console.log(`  ✓ Deleted request from database\n`);

      } catch (error: any) {
        errors.push(`Failed to delete request ${form.document_no}: ${error.message}`);
        console.log(`  ✗ Error processing request: ${error.message}\n`);
      }
    }

    // Summary
    console.log('================================\n');
    console.log('✅ Deletion Summary:\n');
    console.log(`📄 Requests deleted: ${deletedRequests}/${formsToDelete.length}`);
    console.log(`📎 Files deleted: ${deletedFiles}`);
    console.log(`✔️  Approvals deleted: ${deletedApprovals}`);
    console.log(`🔔 Notifications deleted: ${deletedNotifications}`);

    if (errors.length > 0) {
      console.log(`\n⚠️  Errors encountered: ${errors.length}\n`);
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    console.log('\n✨ Cleanup completed!\n');

  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: ClearOptions = {};

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
PEAF Request Cleanup Utility

Usage:
  npm run clear-requests [options]

Options:
  --all                    Delete ALL requests
  --status <status>        Delete requests by status (e.g., pending_hod, approved, rejected)
  --document-no <doc_no>   Delete request by document number
  --id <uuid>              Delete request by ID
  --dry-run                Show what would be deleted without actually deleting
  --help, -h               Show this help message

Examples:
  npm run clear-requests --all
  npm run clear-requests --status rejected
  npm run clear-requests --document-no "PEAF/001/PEAF_IFM_MTC/PE_IX_2026"
  npm run clear-requests --id "123e4567-e89b-12d3-a456-426614174000"
  npm run clear-requests --all --dry-run

⚠️  WARNING: This operation is irreversible. Always use --dry-run first!
  `);
  process.exit(0);
}

if (args.includes('--all')) {
  options.deleteAll = true;
}

if (args.includes('--status')) {
  const statusIndex = args.indexOf('--status');
  options.deleteByStatus = args[statusIndex + 1];
}

if (args.includes('--document-no')) {
  const docIndex = args.indexOf('--document-no');
  options.deleteByDocumentNo = args[docIndex + 1];
}

if (args.includes('--id')) {
  const idIndex = args.indexOf('--id');
  options.deleteById = args[idIndex + 1];
}

if (args.includes('--dry-run')) {
  options.dryRun = true;
}

// Run the cleanup
clearRequests(options);
