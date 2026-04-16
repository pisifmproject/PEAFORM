import { db } from '../db/index.js';
import { peaf_forms } from '../db/schema.js';
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

async function cleanOrphanFiles(dryRun: boolean = false) {
  try {
    console.log('\n🧹 PEAF Orphan Files Cleanup Utility\n');
    console.log('====================================\n');

    // Get uploads directory
    const uploadsDir = path.join(__dirname, '../../uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('❌ Uploads directory not found!');
      rl.close();
      return;
    }

    // Get all files in uploads directory
    console.log('📂 Scanning uploads directory...');
    const filesInFolder = fs.readdirSync(uploadsDir).filter(file => {
      const filePath = path.join(uploadsDir, file);
      return fs.statSync(filePath).isFile();
    });

    console.log(`📊 Found ${filesInFolder.length} file(s) in uploads folder\n`);

    if (filesInFolder.length === 0) {
      console.log('✅ No files to clean up.');
      rl.close();
      return;
    }

    // Get all files from database
    console.log('🔍 Fetching file references from database...');
    const allForms = await db.select().from(peaf_forms);
    
    const filesInDatabase = new Set<string>();
    allForms.forEach(form => {
      const docs = form.supporting_documents as any[];
      if (docs && Array.isArray(docs)) {
        docs.forEach((doc: any) => {
          if (!doc.isMenu && doc.filename) {
            filesInDatabase.add(doc.filename);
          }
        });
      }
    });

    console.log(`📊 Found ${filesInDatabase.size} file reference(s) in database\n`);

    // Find orphan files
    const orphanFiles = filesInFolder.filter(file => !filesInDatabase.has(file));

    if (orphanFiles.length === 0) {
      console.log('✅ No orphan files found. All files are referenced in database.');
      rl.close();
      return;
    }

    console.log(`🗑️  Found ${orphanFiles.length} orphan file(s):\n`);

    // Calculate total size
    let totalSize = 0;
    orphanFiles.forEach((file, index) => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalSize += stats.size;
      
      console.log(`${index + 1}. ${file}`);
      console.log(`   Size: ${sizeKB} KB`);
      console.log(`   Modified: ${stats.mtime.toLocaleString()}`);
      console.log('');
    });

    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
    console.log(`📦 Total size: ${totalSizeMB} MB\n`);

    // Dry run mode
    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be deleted.\n');
      console.log(`What would be deleted: ${orphanFiles.length} file(s) (${totalSizeMB} MB)\n`);
      rl.close();
      return;
    }

    // Confirmation
    const answer = await question(`⚠️  Are you sure you want to delete these ${orphanFiles.length} orphan file(s)? (yes/no): `);
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Cleanup cancelled.');
      rl.close();
      return;
    }

    console.log('\n🚀 Starting cleanup process...\n');

    let deletedCount = 0;
    let errors: string[] = [];

    // Delete orphan files
    for (const file of orphanFiles) {
      try {
        const filePath = path.join(uploadsDir, file);
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`✓ Deleted: ${file}`);
      } catch (error: any) {
        errors.push(`Failed to delete ${file}: ${error.message}`);
        console.log(`✗ Error deleting: ${file}`);
      }
    }

    // Summary
    console.log('\n====================================\n');
    console.log('✅ Cleanup Summary:\n');
    console.log(`🗑️  Files deleted: ${deletedCount}/${orphanFiles.length}`);
    console.log(`💾 Space freed: ${totalSizeMB} MB`);

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

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
PEAF Orphan Files Cleanup Utility

This script finds and deletes files in the uploads folder that are not referenced
in the database (orphan files). This can happen when:
- A request is deleted manually from database
- File upload fails but file remains
- Database is restored from backup

Usage:
  npm run clean-orphan-files [options]

Options:
  --dry-run    Show what would be deleted without actually deleting
  --help, -h   Show this help message

Examples:
  npm run clean-orphan-files --dry-run
  npm run clean-orphan-files

⚠️  WARNING: This operation is irreversible. Always use --dry-run first!
  `);
  process.exit(0);
}

const dryRun = args.includes('--dry-run');

// Run the cleanup
cleanOrphanFiles(dryRun);
