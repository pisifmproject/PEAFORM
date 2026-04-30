/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PEAF System – Test Kirim Email
 *  Jalankan: npx tsx test-email.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Script ini mengirim contoh email notifikasi registrasi user baru ke
 *  alamat tujuan yang bisa dikonfigurasi di bawah (TARGET_EMAIL).
 *
 *  Pastikan file .env sudah diisi dengan benar sebelum menjalankan ini.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import nodemailer from 'nodemailer';
import { buildNewRegistrationEmailHtml, verifySMTPConnection } from './src/services/email-service.js';

// ─── Konfigurasi Target Test ──────────────────────────────────────────────────
// Ubah nilai di bawah sesuai kebutuhan testing
const CONFIG = {
  TARGET_EMAIL: 'septian.jumantoro@icbp.indofood.co.id', // 👈 Ganti ke email tujuan test
  ADMIN_NAME: 'System Admin',
  REGISTRANT_NAME: 'Budi Santoso',
  REGISTRANT_NIK: '50009999',
  REGISTRANT_EMAIL: 'budi.santoso@icbp.indofood.co.id',
  REGISTRANT_USERNAME: 'budi.santoso',
  REGISTRATION_ID: 'test-registration-id-12345',
};
// ─────────────────────────────────────────────────────────────────────────────

const separator = '─'.repeat(60);

async function runEmailTest() {
  console.log('\n' + separator);
  console.log('  PEAF System – Test Pengiriman Email');
  console.log(separator);

  // 1. Tampilkan konfigurasi SMTP yang dipakai
  console.log('\n📋 Konfigurasi SMTP:');
  console.log(`   Host    : ${process.env.SMTP_HOST}`);
  console.log(`   Port    : ${process.env.SMTP_PORT}`);
  console.log(`   Secure  : ${process.env.SMTP_SECURE}`);
  console.log(`   User    : ${process.env.SMTP_USER || '(tidak ada – anonymous)'}`);
  console.log(`   From    : ${process.env.SMTP_FROM}`);
  console.log(`   Target  : ${CONFIG.TARGET_EMAIL}`);
  console.log(`   Base URL: ${process.env.FRONTEND_URL}`);

  // 2. Verifikasi koneksi SMTP
  console.log('\n🔌 Memverifikasi koneksi SMTP...');
  const isConnected = await verifySMTPConnection();
  if (!isConnected) {
    console.error('\n❌ Koneksi SMTP gagal. Periksa kembali konfigurasi di .env\n');
    process.exit(1);
  }
  console.log('✅ Koneksi SMTP berhasil!\n');

  // 3. Build HTML template
  console.log('📝 Membuat template HTML...');
  const registeredAt = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Makassar',
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const htmlBody = buildNewRegistrationEmailHtml({
    adminName: CONFIG.ADMIN_NAME,
    registrantName: CONFIG.REGISTRANT_NAME,
    registrantNik: CONFIG.REGISTRANT_NIK,
    registrantEmail: CONFIG.REGISTRANT_EMAIL,
    registrantUsername: CONFIG.REGISTRANT_USERNAME,
    registrationId: CONFIG.REGISTRATION_ID,
    registeredAt,
  });
  console.log('✅ Template HTML siap\n');

  // 4. Kirim email
  console.log(`📤 Mengirim email ke ${CONFIG.TARGET_EMAIL}...`);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 25,
    secure: process.env.SMTP_SECURE === 'true',
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    tls: {
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || 'PEAF System <noreply@indofood.co.id>',
    to: CONFIG.TARGET_EMAIL,
    subject: `[PEAF TEST] Permintaan Akun Baru – ${CONFIG.REGISTRANT_NAME} (${CONFIG.REGISTRANT_NIK})`,
    html: htmlBody,
  });

  console.log('\n' + separator);
  console.log('  ✅ EMAIL BERHASIL DIKIRIM!');
  console.log(separator);
  console.log(`  Message ID : ${info.messageId}`);
  console.log(`  Accepted   : ${info.accepted?.join(', ') || '-'}`);
  console.log(`  Rejected   : ${info.rejected?.join(', ') || 'none'}`);
  console.log(`  Response   : ${info.response}`);
  console.log(separator + '\n');
}

runEmailTest().catch((err) => {
  console.error('\n' + separator);
  console.error('  ❌ TEST GAGAL');
  console.error(separator);
  console.error(`  Error: ${err.message}`);
  console.error(separator + '\n');
  process.exit(1);
});
