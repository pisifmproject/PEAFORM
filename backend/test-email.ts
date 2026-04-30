/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PEAF System – Test Kirim Email
 *  Jalankan: npx tsx test-email.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *  Mendukung 2 mode test:
 *    1. Registration notification  → dikirim ke ADMIN
 *    2. Approval notification      → dikirim ke USER
 *
 *  Pastikan file .env sudah diisi dengan benar sebelum menjalankan ini.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import {
  verifySMTPConnection,
  sendNewRegistrationEmailToAdmin,
  sendApprovalEmailToUser,
} from './src/services/email-service.js';

// ─── Konfigurasi ──────────────────────────────────────────────────────────────
const CONFIG = {
  // Email admin yang menerima notifikasi registrasi baru
  ADMIN_EMAIL:   'septian.jumantoro@icbp.indofood.co.id',
  ADMIN_NAME:    'System Admin',

  // Email user yang menerima notifikasi approval
  USER_EMAIL:    'septian.jumantoro@icbp.indofood.co.id', // 👈 Ganti ke email user test

  // Data dummy pendaftar
  REGISTRANT_NAME:     'Budi Santoso',
  REGISTRANT_NIK:      '50009999',
  REGISTRANT_EMAIL:    'budi.santoso@icbp.indofood.co.id',
  REGISTRANT_USERNAME: 'budi.santoso',
  REGISTRATION_ID:     'test-registration-id-12345',
};
// ─────────────────────────────────────────────────────────────────────────────

const SEP = '─'.repeat(60);

async function runEmailTest() {
  console.log('\n' + SEP);
  console.log('  PEAF System – Test Pengiriman Email (2 template)');
  console.log(SEP);

  console.log('\n📋 Konfigurasi SMTP:');
  console.log(`   Host    : ${process.env.SMTP_HOST}`);
  console.log(`   Port    : ${process.env.SMTP_PORT}`);
  console.log(`   Secure  : ${process.env.SMTP_SECURE}`);
  console.log(`   User    : ${process.env.SMTP_USER || '(anonymous)'}`);
  console.log(`   From    : ${process.env.SMTP_FROM}`);
  console.log(`   Base URL: ${process.env.FRONTEND_URL}`);

  // Verifikasi koneksi SMTP
  console.log('\n🔌 Memverifikasi koneksi SMTP...');
  const isConnected = await verifySMTPConnection();
  if (!isConnected) {
    console.error('\n❌ Koneksi SMTP gagal. Periksa kembali konfigurasi di .env\n');
    process.exit(1);
  }
  console.log('✅ Koneksi SMTP berhasil!\n');

  // ── Test 1: Email notifikasi registrasi ke Admin ──────────────────────────
  console.log(SEP);
  console.log('  [1/2] Test: Notifikasi Registrasi → Admin');
  console.log(SEP);
  console.log(`📤 Mengirim ke ${CONFIG.ADMIN_EMAIL}...`);

  await sendNewRegistrationEmailToAdmin({
    adminEmail:          CONFIG.ADMIN_EMAIL,
    adminName:           CONFIG.ADMIN_NAME,
    registrantName:      CONFIG.REGISTRANT_NAME,
    registrantNik:       CONFIG.REGISTRANT_NIK,
    registrantEmail:     CONFIG.REGISTRANT_EMAIL,
    registrantUsername:  CONFIG.REGISTRANT_USERNAME,
    registrationId:      CONFIG.REGISTRATION_ID,
  });
  console.log('✅ Email registrasi ke admin BERHASIL dikirim!\n');

  // ── Test 2: Email notifikasi approval ke User ─────────────────────────────
  console.log(SEP);
  console.log('  [2/2] Test: Notifikasi Approval → User');
  console.log(SEP);
  console.log(`📤 Mengirim ke ${CONFIG.USER_EMAIL}...`);

  await sendApprovalEmailToUser({
    userEmail:    CONFIG.USER_EMAIL,
    userName:     CONFIG.REGISTRANT_NAME,
    userNik:      CONFIG.REGISTRANT_NIK,
    userUsername: CONFIG.REGISTRANT_USERNAME,
  });
  console.log('✅ Email approval ke user BERHASIL dikirim!\n');

  console.log(SEP);
  console.log('  ✅ SEMUA TEST EMAIL BERHASIL!');
  console.log(SEP + '\n');
}

runEmailTest().catch((err) => {
  console.error('\n' + SEP);
  console.error('  ❌ TEST GAGAL');
  console.error(SEP);
  console.error(`  Error: ${err.message}`);
  console.error(SEP + '\n');
  process.exit(1);
});
