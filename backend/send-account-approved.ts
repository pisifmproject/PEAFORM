import { sendApprovalEmailToUser } from './src/services/email-service';
import 'dotenv/config';

/**
 * Script untuk mengirim email notifikasi ke user bahwa akun sudah di-approve
 * dan sudah boleh login ke sistem PEAF
 * 
 * Cara menggunakan:
 * 1. Edit informasi user di bawah sesuai dengan data yang sebenarnya
 * 2. Jalankan: npx tsx send-account-approved.ts
 */

async function sendAccountApprovedNotification() {
  try {
    console.log('📧 Mengirim email notifikasi akun sudah di-approve...\n');

    // ===== EDIT INFORMASI USER DI SINI =====
    const userInfo = {
      userEmail: 'septian.jumantoro@icbp.indofood.co.id',              // Ganti dengan email user
      userName: 'Septian Bagus Jumantoro',        // Ganti dengan nama user
      userNik: '50175212',                  // Ganti dengan NIK user
      userUsername: 'septian',        // Ganti dengan username user
    };
    // ========================================

    // Kirim email
    await sendApprovalEmailToUser(userInfo);

    console.log('✅ Email berhasil dikirim!');
    console.log(`📬 Tujuan: ${userInfo.userEmail}`);
    console.log(`👤 User: ${userInfo.userName} (${userInfo.userNik})`);
    console.log(`🔑 Username: ${userInfo.userUsername}`);
    console.log(`📅 Waktu: ${new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Makassar',
      dateStyle: 'long',
      timeStyle: 'short',
    })}\n`);

    console.log('ℹ️  User sekarang sudah bisa login menggunakan:');
    console.log(`   - NIK atau Username: ${userInfo.userNik} / ${userInfo.userUsername}`);
    console.log(`   - Password: Password yang dibuat saat registrasi\n`);

  } catch (error: any) {
    console.error('❌ Gagal mengirim email:', error.message);
    console.error('Detail error:', error);
    process.exit(1);
  }
}

// Jalankan script
sendAccountApprovedNotification();
