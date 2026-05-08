import { sendNewRegistrationEmailToAdmin } from './src/services/email-service';
import 'dotenv/config';

/**
 * Script untuk mengirim email notifikasi ke admin tentang permintaan approval akun
 * 
 * Cara menggunakan:
 * 1. Edit informasi pendaftar di bawah sesuai dengan data yang sebenarnya
 * 2. Jalankan: npx tsx send-approval-notification.ts
 */

async function sendApprovalNotification() {
  try {
    console.log('📧 Mengirim email notifikasi approval akun...\n');

    // ===== EDIT INFORMASI PENDAFTAR DI SINI =====
    const registrantInfo = {
      adminEmail: 'septian.jumantoro@icbp.indofood.co.id',
      adminName: 'Shella',
      registrantName: 'Septian Bagus Jumantoro',        // Ganti dengan nama pendaftar
      registrantNik: '50175212',                  // Ganti dengan NIK pendaftar
      registrantEmail: 'septian.jumantoro@icbp.indofood.co.id',              // Ganti dengan email pendaftar
      registrantUsername: 'septian',        // Ganti dengan username pendaftar
      registrationId: 'manual-notification',             // ID untuk tracking
      registeredAt: new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Makassar',
        dateStyle: 'long',
        timeStyle: 'short',
      }),
    };
    // ============================================

    // Kirim email
    await sendNewRegistrationEmailToAdmin(registrantInfo);

    console.log('✅ Email berhasil dikirim!');
    console.log(`📬 Tujuan: ${registrantInfo.adminEmail}`);
    console.log(`👤 Pendaftar: ${registrantInfo.registrantName} (${registrantInfo.registrantNik})`);
    console.log(`📅 Waktu: ${registrantInfo.registeredAt}\n`);

  } catch (error: any) {
    console.error('❌ Gagal mengirim email:', error.message);
    console.error('Detail error:', error);
    process.exit(1);
  }
}

// Jalankan script
sendApprovalNotification();
