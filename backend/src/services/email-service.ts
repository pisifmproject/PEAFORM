import nodemailer from 'nodemailer';
import 'dotenv/config';

// ─── Transporter ─────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 25,
  secure: process.env.SMTP_SECURE === 'true',
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  tls: {
    rejectUnauthorized: false, // Izinkan self-signed cert (internal server)
  },
});

// ─── Verifikasi koneksi SMTP ──────────────────────────────────────────────────
export const verifySMTPConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('[EMAIL] SMTP connection verified successfully');
    return true;
  } catch (error: any) {
    console.error('[EMAIL] SMTP connection failed:', error.message);
    return false;
  }
};

// ─── Template Helper ──────────────────────────────────────────────────────────
const getBaseUrl = () =>
  process.env.FRONTEND_URL || 'http://10.125.48.102/peaf';

// ─── Template: Notifikasi Registrasi Baru ke Admin ───────────────────────────
export const buildNewRegistrationEmailHtml = (opts: {
  adminName: string;
  registrantName: string;
  registrantNik: string;
  registrantEmail: string;
  registrantUsername: string;
  registrationId: string;
  registeredAt: string;
}): string => {
  const {
    adminName,
    registrantName,
    registrantNik,
    registrantEmail,
    registrantUsername,
    registrationId,
    registeredAt,
  } = opts;

  const baseUrl = getBaseUrl();
  const approveUrl = `${baseUrl}/admin/registrations/${registrationId}/approve`;
  const rejectUrl  = `${baseUrl}/admin/registrations/${registrationId}/reject`;
  const panelUrl   = `${baseUrl}/admin`;

  return /* html */ `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Permintaan Akun Baru – PEAF System</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8; }
    .wrapper { max-width: 620px; margin: 32px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.10); }
    
    /* Header */
    .header { background: linear-gradient(135deg, #1a3a6b 0%, #0e5cb5 60%, #1976d2 100%); padding: 36px 40px 28px; text-align: center; }
    .header-logo { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 18px; }
    .header-logo-icon { width: 44px; height: 44px; background: rgba(255,255,255,0.18); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
    .header p  { color: rgba(255,255,255,0.80); font-size: 13px; margin-top: 4px; }

    /* Badge */
    .badge-wrap { background: #fff8e1; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; margin: 28px 40px 0; padding: 14px 18px; display: flex; align-items: center; gap: 12px; }
    .badge-icon { font-size: 22px; flex-shrink: 0; }
    .badge-text { font-size: 14px; color: #92400e; font-weight: 600; line-height: 1.4; }

    /* Body */
    .body { padding: 28px 40px; }
    .greeting { font-size: 15px; color: #1e293b; line-height: 1.6; margin-bottom: 20px; }
    
    /* Info card */
    .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px 24px; margin-bottom: 28px; }
    .info-card h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-bottom: 16px; font-weight: 600; }
    .info-row { display: flex; align-items: flex-start; margin-bottom: 12px; gap: 12px; }
    .info-row:last-child { margin-bottom: 0; }
    .info-label { font-size: 13px; color: #64748b; min-width: 110px; flex-shrink: 0; }
    .info-value { font-size: 14px; color: #1e293b; font-weight: 600; word-break: break-all; }
    .info-divider { border: none; border-top: 1px solid #e2e8f0; margin: 12px 0; }

    /* CTA Buttons */
    .cta-section { text-align: center; margin-bottom: 24px; }
    .cta-label { font-size: 14px; color: #475569; margin-bottom: 18px; }
    .btn-group { display: inline-flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
    .btn { display: inline-block; text-decoration: none; font-size: 15px; font-weight: 600; padding: 13px 32px; border-radius: 8px; letter-spacing: 0.3px; cursor: pointer; }
    .btn-approve { background: linear-gradient(135deg, #16a34a, #15803d); color: #ffffff; }
    .btn-reject  { background: #ffffff; color: #dc2626; border: 2px solid #dc2626; }
    .btn-panel   { background: #f1f5f9; color: #334155; font-size: 13px; padding: 10px 22px; }

    /* Divider */
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }

    /* Info note */
    .note { font-size: 12.5px; color: #64748b; line-height: 1.6; background: #f1f5f9; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; }
    .note strong { color: #334155; }

    /* Footer */
    .footer { background: #1e293b; padding: 22px 40px; text-align: center; }
    .footer p { color: #94a3b8; font-size: 12px; line-height: 1.7; }
    .footer strong { color: #cbd5e1; }
    .footer a { color: #60a5fa; text-decoration: none; }
  </style>
</head>
<body>
<div class="wrapper">
  <!-- HEADER -->
  <div class="header">
    <div class="header-logo">
      <div class="header-logo-icon">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
    </div>
    <h1>PEAF System</h1>
    <p>PT Indofood CBP Sukses Makmur Tbk – Plant Asset Engineering Form</p>
  </div>

  <!-- ALERT BADGE -->
  <div class="badge-wrap">
    <div class="badge-icon">🔔</div>
    <div class="badge-text">Ada permintaan akun baru yang memerlukan persetujuan Anda</div>
  </div>

  <!-- BODY -->
  <div class="body">
    <p class="greeting">
      Halo <strong>${adminName}</strong>,<br/><br/>
      Seorang pengguna baru telah mendaftarkan akun pada <strong>PEAF System</strong> dan 
      sedang menunggu persetujuan admin. Silakan tinjau informasi pendaftar di bawah ini 
      dan ambil tindakan yang sesuai.
    </p>

    <!-- Info Pendaftar -->
    <div class="info-card">
      <h3>📋 Informasi Pendaftar</h3>
      <div class="info-row">
        <span class="info-label">Nama Lengkap</span>
        <span class="info-value">${registrantName}</span>
      </div>
      <hr class="info-divider" />
      <div class="info-row">
        <span class="info-label">NIK</span>
        <span class="info-value">${registrantNik}</span>
      </div>
      <hr class="info-divider" />
      <div class="info-row">
        <span class="info-label">Username</span>
        <span class="info-value">${registrantUsername}</span>
      </div>
      <hr class="info-divider" />
      <div class="info-row">
        <span class="info-label">Email</span>
        <span class="info-value">${registrantEmail}</span>
      </div>
      <hr class="info-divider" />
      <div class="info-row">
        <span class="info-label">Waktu Daftar</span>
        <span class="info-value">${registeredAt}</span>
      </div>
    </div>

    <!-- CTA Buttons -->
    <div class="cta-section">
      <p class="cta-label">Pilih tindakan untuk permintaan akun ini:</p>
      <div class="btn-group">
        <a href="${approveUrl}" class="btn btn-approve">✅ &nbsp;Approve</a>
        <a href="${rejectUrl}"  class="btn btn-reject">❌ &nbsp;Reject</a>
      </div>
      <br/><br/>
      <a href="${panelUrl}" class="btn btn-panel">🛠️ &nbsp;Buka Admin Panel</a>
    </div>

    <hr class="divider" />

    <div class="note">
      <strong>ℹ️ Catatan:</strong> Tombol Approve / Reject di atas akan mengarahkan Anda ke halaman 
      PEAF System. Anda tetap perlu login sebagai admin untuk memproses persetujuan tersebut. 
      Jika Anda bukan admin yang bertanggung jawab atas akun ini, abaikan email ini.
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <p>
      Email ini dikirim secara otomatis oleh <strong>PEAF System</strong><br/>
      PT Indofood CBP Sukses Makmur Tbk &bull; Plant Asset Engineering<br/>
      Jangan balas email ini &bull; <a href="${panelUrl}">Kunjungi PEAF System</a>
    </p>
  </div>
</div>
</body>
</html>
`.trim();
};

// ─── Kirim Email Notifikasi Registrasi ke Admin ───────────────────────────────
export const sendNewRegistrationEmailToAdmin = async (opts: {
  adminEmail: string;
  adminName: string;
  registrantName: string;
  registrantNik: string;
  registrantEmail: string;
  registrantUsername: string;
  registrationId: string;
  registeredAt?: string;
}): Promise<void> => {
  const registeredAt =
    opts.registeredAt ||
    new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Makassar',
      dateStyle: 'long',
      timeStyle: 'short',
    });

  const html = buildNewRegistrationEmailHtml({ ...opts, registeredAt });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'PEAF System <noreply@indofood.co.id>',
    to: opts.adminEmail,
    subject: `[PEAF] Permintaan Akun Baru – ${opts.registrantName} (${opts.registrantNik})`,
    html,
  });

  console.log(
    `[EMAIL] Notifikasi registrasi dikirim ke admin ${opts.adminEmail} untuk pendaftar ${opts.registrantName}`
  );
};
