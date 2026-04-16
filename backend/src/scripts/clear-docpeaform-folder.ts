import * as fs from 'fs';
import * as path from 'path';
import readline from 'readline';

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

async function clearDocPEAFormFolder(dryRun: boolean = false) {
  try {
    console.log('\n🗑️  DocPEAForm Folder Cleanup Utility\n');
    console.log('=====================================\n');

    // Target folder path
    const targetFolder = 'C:\\Users\\netcom\\Documents\\ifm_septian\\project\\DocPEAForm';
    
    if (!fs.existsSync(targetFolder)) {
      console.log('❌ DocPEAForm folder not found!');
      console.log(`   Path: ${targetFolder}`);
      rl.close();
      return;
    }

    // Get all files in the folder
    console.log('📂 Scanning DocPEAForm folder...');
    console.log(`   Path: ${targetFolder}\n`);
    
    const files = fs.readdirSync(targetFolder).filter(file => {
      const filePath = path.join(targetFolder, file);
      return fs.statSync(filePath).isFile();
    });

    if (files.length === 0) {
      console.log('✅ Folder is already empty. Nothing to delete.');
      rl.close();
      return;
    }

    console.log(`📊 Found ${files.length} file(s) to delete:\n`);

    // Display files with details
    let totalSize = 0;
    files.forEach((file, index) => {
      const filePath = path.join(targetFolder, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalSize += stats.size;
      
      console.log(`${index + 1}. ${file}`);
      console.log(`   Size: ${sizeKB} KB`);
      console.log(`   Modified: ${stats.mtime.toLocaleString()}`);
      console.log('');
    });

    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
    console.log(`📦 Total size: ${totalSizeMB} MB (${(totalSize / 1024).toFixed(2)} KB)\n`);

    // Categorize files
    const tempFiles = files.filter(f => f.startsWith('TEMP_'));
    const peafFiles = files.filter(f => f.match(/^\d{3}_PEAF_/));
    const otherFiles = files.filter(f => !f.startsWith('TEMP_') && !f.match(/^\d{3}_PEAF_/));

    console.log('📋 File Categories:\n');
    console.log(`   🔸 TEMP files: ${tempFiles.length}`);
    console.log(`   🔸 PEAF files: ${peafFiles.length}`);
    console.log(`   🔸 Other files: ${otherFiles.length}\n`);

    // Dry run mode
    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be deleted.\n');
      console.log('What would be deleted:');
      console.log(`- ${files.length} file(s)`);
      console.log(`- ${totalSizeMB} MB of disk space\n`);
      
      if (tempFiles.length > 0) {
        console.log('TEMP files that would be deleted:');
        tempFiles.forEach(f => console.log(`  - ${f}`));
        console.log('');
      }
      
      if (peafFiles.length > 0) {
        console.log('PEAF files that would be deleted:');
        peafFiles.forEach(f => console.log(`  - ${f}`));
        console.log('');
      }
      
      rl.close();
      return;
    }

    // Confirmation
    const answer = await question(`⚠️  Are you sure you want to delete ALL ${files.length} file(s) from DocPEAForm folder? (yes/no): `);
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Deletion cancelled.');
      rl.close();
      return;
    }

    console.log('\n🚀 Starting deletion process...\n');

    let deletedCount = 0;
    let errors: string[] = [];

    // Delete all files
    for (const file of files) {
      try {
        const filePath = path.join(targetFolder, file);
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`✓ Deleted: ${file}`);
      } catch (error: any) {
        errors.push(`Failed to delete ${file}: ${error.message}`);
        console.log(`✗ Error deleting: ${file}`);
      }
    }

    // Summary
    console.log('\n=====================================\n');
    console.log('✅ Deletion Summary:\n');
    console.log(`🗑️  Files deleted: ${deletedCount}/${files.length}`);
    console.log(`💾 Space freed: ${totalSizeMB} MB`);
    console.log(`📁 Folder: ${targetFolder}`);

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
DocPEAForm Folder Cleanup Utility

This script deletes ALL files in the DocPEAForm folder:
  C:\\Users\\netcom\\Documents\\ifm_septian\\project\\DocPEAForm

Usage:
  npm run clear-docpeaform [options]

Options:
  --dry-run    Show what would be deleted without actually deleting
  --help, -h   Show this help message

Examples:
  npm run clear-docpeaform --dry-run
  npm run clear-docpeaform

⚠️  WARNING: This will delete ALL files in the DocPEAForm folder!
  `);
  process.exit(0);
}

const dryRun = args.includes('--dry-run');

// Run the cleanup
clearDocPEAFormFolder(dryRun);
