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
  const panelUrl   = `${baseUrl}/admin`;

  return /* html */ `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Account Request – PEAF</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-spacing: 0; border-collapse: collapse; }
    td { padding: 0; }
    img { border: 0; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f4f6f8; padding-bottom: 40px; }
    .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border: 1px solid #e2e8f0; }
    .header { background-color: #0e5cb5; padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; margin: 0; padding: 0; font-family: Arial, sans-serif; font-weight: bold; }
    .header p { color: #e0e7ff; font-size: 14px; margin: 8px 0 0 0; font-family: Arial, sans-serif; }
    .content { padding: 30px; }
    .alert-box { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 25px; }
    .alert-text { color: #92400e; font-size: 14px; font-weight: bold; font-family: Arial, sans-serif; margin: 0; }
    .greeting { font-size: 15px; color: #334155; line-height: 1.6; font-family: Arial, sans-serif; margin: 0 0 20px 0; }
    .info-table { width: 100%; border: 1px solid #e2e8f0; background-color: #f8fafc; }
    .info-header { background-color: #f1f5f9; padding: 12px 15px; font-size: 14px; font-weight: bold; color: #475569; font-family: Arial, sans-serif; border-bottom: 1px solid #e2e8f0; }
    .info-cell-label { padding: 12px 15px; font-size: 14px; color: #64748b; font-family: Arial, sans-serif; width: 35%; border-bottom: 1px solid #e2e8f0; }
    .info-cell-value { padding: 12px 15px; font-size: 14px; color: #1e293b; font-weight: bold; font-family: Arial, sans-serif; border-bottom: 1px solid #e2e8f0; }
    .action-container { text-align: center; margin: 30px 0; }
    .btn { display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: bold; text-decoration: none; font-family: Arial, sans-serif; text-align: center; margin: 0 5px; }
    .btn-approve { background-color: #16a34a; color: #ffffff; border: 1px solid #16a34a; }
    .btn-reject { background-color: #ffffff; color: #dc2626; border: 1px solid #dc2626; }
    .btn-panel { background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; margin-top: 15px; }
    .note { background-color: #f1f5f9; padding: 15px; font-size: 13px; color: #475569; font-family: Arial, sans-serif; line-height: 1.5; }
    .footer { background-color: #1e293b; padding: 20px; text-align: center; }
    .footer p { color: #94a3b8; font-size: 12px; font-family: Arial, sans-serif; line-height: 1.6; margin: 0; }
    .footer a { color: #60a5fa; text-decoration: none; }
  </style>
</head>
<body>
  <center class="wrapper">
    <table class="main" width="100%">
      <!-- Header -->
      <tr>
        <td class="header">
          <h1>PEAF</h1>
          <p>PT Indofood Fortuna Makmur</p>
        </td>
      </tr>
      
      <!-- Content -->
      <tr>
        <td class="content">
          
          <!-- Alert Box -->
          <div class="alert-box">
            <p class="alert-text">Notification: There is a new account request requiring your approval</p>
          </div>

          <!-- Greeting -->
          <p class="greeting">
            Hello <strong>${adminName}</strong>,<br/><br/>
            A new user has registered an account on the <strong>PEAF System</strong> and 
            is waiting for admin approval. Please review the registrant information below 
            and take appropriate action.
          </p>

          <!-- Info Table -->
          <table class="info-table" width="100%">
            <tr>
              <td colspan="2" class="info-header">Registrant Information</td>
            </tr>
            <tr>
              <td class="info-cell-label">Full Name</td>
              <td class="info-cell-value">${registrantName}</td>
            </tr>
            <tr>
              <td class="info-cell-label">NIK</td>
              <td class="info-cell-value">${registrantNik}</td>
            </tr>
            <tr>
              <td class="info-cell-label">Username</td>
              <td class="info-cell-value">${registrantUsername}</td>
            </tr>
            <tr>
              <td class="info-cell-label">Email</td>
              <td class="info-cell-value"><a href="mailto:${registrantEmail}" style="color: #0ea5e9; text-decoration: none;">${registrantEmail}</a></td>
            </tr>
            <tr>
              <td class="info-cell-label" style="border-bottom: none;">Registration Time</td>
              <td class="info-cell-value" style="border-bottom: none;">${registeredAt}</td>
            </tr>
          </table>

          <!-- Actions -->
          <div class="action-container">
            <p style="margin-top: 0; margin-bottom: 15px; font-family: Arial, sans-serif; font-size: 14px; color: #475569;">Please open the Admin Panel to approve or reject this account request:</p>
            <table width="100%">
              <tr>
                <td align="center">
                  <a href="${panelUrl}" class="btn btn-panel" style="background-color: #0e5cb5; color: #ffffff; border: none; padding: 14px 30px; font-weight: bold; font-size: 15px; text-decoration: none; border-radius: 4px;">Open Admin Panel</a>
                </td>
              </tr>
            </table>
          </div>

          <!-- Note -->
          <div class="note">
            <strong>Note:</strong> The button above will redirect you to the PEAF System page. You need to log in as an admin to process the approval. If you are not the responsible admin for this account, please ignore this email.
          </div>

        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td class="footer">
          <p>
            This email was sent automatically by <strong>PEAF</strong><br/>
            PT Indofood Fortuna Makmur<br/>
            Please do not reply to this email &bull; <a href="${panelUrl}">Visit PEAF website</a>
          </p>
        </td>
      </tr>
    </table>
  </center>
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
    from: process.env.SMTP_FROM || 'PEAF <noreply@indofood.co.id>',
    to: opts.adminEmail,
    subject: `[PEAF] New Account Request – ${opts.registrantName} (${opts.registrantNik})`,
    html,
  });

  console.log(
    `[EMAIL] Notifikasi registrasi dikirim ke admin ${opts.adminEmail} untuk pendaftar ${opts.registrantName}`
  );
};

// ─── Template: Notifikasi Approval ke User ────────────────────────────────────
const buildApprovalEmailHtml = (opts: {
  userName: string;
  userNik: string;
  userUsername: string;
  approvedAt: string;
}): string => {
  const { userName, userNik, userUsername, approvedAt } = opts;
  const loginUrl = getBaseUrl() + '/login';

  return /* html */ `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Account Has Been Approved – PEAF System</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, sans-serif; }
    table { border-spacing: 0; border-collapse: collapse; }
    td { padding: 0; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f4f6f8; padding-bottom: 40px; }
    .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border: 1px solid #e2e8f0; }
    .header { background-color: #0e5cb5; padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; margin: 0; padding: 0; font-family: Arial, sans-serif; font-weight: bold; }
    .header p { color: #e0e7ff; font-size: 14px; margin: 8px 0 0 0; font-family: Arial, sans-serif; }
    .content { padding: 30px; }
    .success-box { background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin-bottom: 25px; }
    .success-text { color: #166534; font-size: 14px; font-weight: bold; font-family: Arial, sans-serif; margin: 0; }
    .greeting { font-size: 15px; color: #334155; line-height: 1.6; font-family: Arial, sans-serif; margin: 0 0 20px 0; }
    .info-table { width: 100%; border: 1px solid #e2e8f0; background-color: #f8fafc; }
    .info-header { background-color: #f1f5f9; padding: 12px 15px; font-size: 14px; font-weight: bold; color: #475569; font-family: Arial, sans-serif; border-bottom: 1px solid #e2e8f0; }
    .info-cell-label { padding: 12px 15px; font-size: 14px; color: #64748b; font-family: Arial, sans-serif; width: 35%; border-bottom: 1px solid #e2e8f0; }
    .info-cell-value { padding: 12px 15px; font-size: 14px; color: #1e293b; font-weight: bold; font-family: Arial, sans-serif; border-bottom: 1px solid #e2e8f0; }
    .action-container { text-align: center; margin: 30px 0; }
    .btn-login { display: inline-block; padding: 14px 36px; font-size: 15px; font-weight: bold; text-decoration: none; font-family: Arial, sans-serif; background-color: #0e5cb5; color: #ffffff; border: 1px solid #0e5cb5; }
    .note { background-color: #f1f5f9; padding: 15px; font-size: 13px; color: #475569; font-family: Arial, sans-serif; line-height: 1.5; }
    .footer { background-color: #1e293b; padding: 20px; text-align: center; }
    .footer p { color: #94a3b8; font-size: 12px; font-family: Arial, sans-serif; line-height: 1.6; margin: 0; }
    .footer a { color: #60a5fa; text-decoration: none; }
  </style>
</head>
<body>
  <center class="wrapper">
    <table class="main" width="100%">
      <!-- Header -->
      <tr>
        <td class="header">
          <h1>PEAF</h1>
          <p>PT Indofood Fortuna Makmur</p>
        </td>
      </tr>

      <!-- Content -->
      <tr>
        <td class="content">

          <!-- Success Box -->
          <div class="success-box">
            <p class="success-text">Congratulations! Your account has been approved by the Administrator</p>
          </div>

          <!-- Greeting -->
          <p class="greeting">
            Hello <strong>${userName}</strong>,<br/><br/>
            Your account registration on the <strong>PEAF System</strong> has been verified and
            approved by the Administrator. You can now log in using the 
            following account information:
          </p>

          <!-- Info Table -->
          <table class="info-table" width="100%">
            <tr>
              <td colspan="2" class="info-header">Your Account Information</td>
            </tr>
            <tr>
              <td class="info-cell-label">Full Name</td>
              <td class="info-cell-value">${userName}</td>
            </tr>
            <tr>
              <td class="info-cell-label">NIK</td>
              <td class="info-cell-value">${userNik}</td>
            </tr>
            <tr>
              <td class="info-cell-label">Username</td>
              <td class="info-cell-value">${userUsername}</td>
            </tr>
            <tr>
              <td class="info-cell-label">Password</td>
              <td class="info-cell-value">Use the password you created during registration</td>
            </tr>
            <tr>
              <td class="info-cell-label" style="border-bottom: none;">Approval Date</td>
              <td class="info-cell-value" style="border-bottom: none;">${approvedAt}</td>
            </tr>
          </table>

          <!-- Login Button -->
          <div class="action-container">
            <a href="${loginUrl}" class="btn-login">Login to PEAF</a>
          </div>

          <!-- Note -->
          <div class="note">
            <strong>Note:</strong> Log in using your NIK or Username and the password you registered.
            If you encounter any issues logging in, please contact the system Administrator.
          </div>

        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td class="footer">
          <p>
            This email was sent automatically by <strong>PEAF</strong><br/>
            PT Indofood Fortuna Makmur<br/>
            Please do not reply to this email &bull; <a href="${loginUrl}">Visit PEAF website</a>
          </p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
`.trim();
};

// ─── Kirim Email Approval ke User ─────────────────────────────────────────────
export const sendApprovalEmailToUser = async (opts: {
  userEmail: string;
  userName: string;
  userNik: string;
  userUsername: string;
}): Promise<void> => {
  const approvedAt = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Makassar',
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const html = buildApprovalEmailHtml({ ...opts, approvedAt });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'PEAF <noreply@indofood.co.id>',
    to: opts.userEmail,
    subject: `[PEAF] Your Account Has Been Approved – Welcome to PEAF System`,
    html,
  });

  console.log(`[EMAIL] Notifikasi approval dikirim ke user ${opts.userEmail} (${opts.userName})`);
};

// ─── Template: Permintaan Approval ke Approver ───────────────────────────────
export const buildApprovalRequestEmailHtml = (opts: {
  approverName: string;
  applicantName: string;
  documentNo: string;
  formId: string;
  plantLocation: string;
  workCategory: string;
  projectDescription: string;
}): string => {
  const { approverName, applicantName, documentNo, formId, plantLocation, workCategory, projectDescription } = opts;
  const baseUrl = getBaseUrl();
  const requestUrl = `${baseUrl}/dashboard/request/${formId}`;

  return /* html */ `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PEAF Approval Request – ${documentNo}</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-spacing: 0; border-collapse: collapse; }
    td { padding: 0; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f4f6f8; padding-bottom: 40px; }
    .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border: 1px solid #e2e8f0; }
    .header { background-color: #0e5cb5; padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; margin: 0; padding: 0; font-family: Arial, sans-serif; font-weight: bold; }
    .header p { color: #e0e7ff; font-size: 14px; margin: 8px 0 0 0; font-family: Arial, sans-serif; }
    .content { padding: 30px; }
    .alert-box { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 25px; }
    .alert-text { color: #92400e; font-size: 14px; font-weight: bold; font-family: Arial, sans-serif; margin: 0; }
    .greeting { font-size: 15px; color: #334155; line-height: 1.6; font-family: Arial, sans-serif; margin: 0 0 20px 0; }
    .info-table { width: 100%; border: 1px solid #e2e8f0; background-color: #f8fafc; }
    .info-header { background-color: #f1f5f9; padding: 12px 15px; font-size: 14px; font-weight: bold; color: #475569; font-family: Arial, sans-serif; border-bottom: 1px solid #e2e8f0; }
    .info-cell-label { padding: 12px 15px; font-size: 14px; color: #64748b; font-family: Arial, sans-serif; width: 35%; border-bottom: 1px solid #e2e8f0; }
    .info-cell-value { padding: 12px 15px; font-size: 14px; color: #1e293b; font-weight: bold; font-family: Arial, sans-serif; border-bottom: 1px solid #e2e8f0; }
    .action-container { text-align: center; margin: 30px 0; }
    .btn-panel { display: inline-block; background-color: #0e5cb5; color: #ffffff !important; border: none; padding: 14px 30px; font-weight: bold; font-size: 15px; text-decoration: none; border-radius: 4px; font-family: Arial, sans-serif; }
    .note { background-color: #f1f5f9; padding: 15px; font-size: 13px; color: #475569; font-family: Arial, sans-serif; line-height: 1.5; }
    .footer { background-color: #1e293b; padding: 20px; text-align: center; }
    .footer p { color: #94a3b8; font-size: 12px; font-family: Arial, sans-serif; line-height: 1.6; margin: 0; }
    .footer a { color: #60a5fa; text-decoration: none; }
  </style>
</head>
<body>
  <center class="wrapper">
    <table class="main" width="100%">
      <tr>
        <td class="header">
          <h1>PEAF</h1>
          <p>PT Indofood Fortuna Makmur</p>
        </td>
      </tr>
      <tr>
        <td class="content">
          <div class="alert-box">
            <p class="alert-text">Notification: New PEAF Request Awaiting Your Approval</p>
          </div>
          <p class="greeting">
            Hello <strong>${approverName}</strong>,<br/><br/>
            There is a new PEAF (Project & Engineering Approval Form) request from <strong>${applicantName}</strong> that requires your review and approval.
          </p>
          <table class="info-table" width="100%">
            <tr><td colspan="2" class="info-header">Request Details</td></tr>
            <tr><td class="info-cell-label">Document No.</td><td class="info-cell-value">${documentNo}</td></tr>
            <tr><td class="info-cell-label">Plant Location</td><td class="info-cell-value">${plantLocation}</td></tr>
            <tr><td class="info-cell-label">Category</td><td class="info-cell-value">${workCategory}</td></tr>
            <tr><td class="info-cell-label" style="border-bottom: none;">Description</td><td class="info-cell-value" style="border-bottom: none;">${projectDescription || '-'}</td></tr>
          </table>
          <div class="action-container">
            <p style="margin-top: 0; margin-bottom: 15px; font-family: Arial, sans-serif; font-size: 14px; color: #475569;">Click the button below to view full details, add notes, or provide your approval/rejection:</p>
            <a href="${requestUrl}" class="btn-panel">View Details & Approve</a>
          </div>
          <div class="note">
            <strong>Note:</strong> The button above will redirect you to the request detail page. You need to log in using your account to process it.
          </div>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p>This email was sent automatically by <strong>PEAF</strong><br/>PT Indofood Fortuna Makmur<br/>Please do not reply to this email &bull; <a href="${baseUrl}">Visit PEAF website</a></p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
`;
};

export const sendApprovalRequestEmail = async (opts: {
  approverEmail: string;
  approverName: string;
  applicantName: string;
  documentNo: string;
  formId: string;
  plantLocation: string;
  workCategory: string;
  projectDescription: string;
}): Promise<void> => {
  const html = buildApprovalRequestEmailHtml(opts);
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'PEAF <noreply@indofood.co.id>',
    to: opts.approverEmail,
    subject: `[PEAF] Approval Required: ${opts.documentNo} from ${opts.applicantName}`,
    html,
  });
  console.log(`[EMAIL] Approval request dikirim ke ${opts.approverEmail} (${opts.approverName})`);
};

// ─── Template: Status Update ke Requester ─────────────────────────────────────
export const buildStatusUpdateEmailHtml = (opts: {
  applicantName: string;
  documentNo: string;
  formId: string;
  status: string; // 'Approved', 'Approved with Conditions', 'Rejected', etc.
  approverName: string;
  notes: string;
}): string => {
  const { applicantName, documentNo, formId, status, approverName, notes } = opts;
  const baseUrl = getBaseUrl();
  const requestUrl = `${baseUrl}/dashboard/request/${formId}`;
  
  const isApproved = status === 'Approved' || status === 'Approved with Conditions';
  const isFullyApproved = status === 'Fully Approved';
  const boxColor = (isApproved || isFullyApproved) ? '#f0fdf4' : '#fef2f2';
  const borderColor = (isApproved || isFullyApproved) ? '#16a34a' : '#ef4444';
  const textColor = (isApproved || isFullyApproved) ? '#166534' : '#991b1b';
  const titleText = isFullyApproved ? 'Your Request Has Been Fully Approved' : (isApproved ? 'Your Request Has Been Approved' : 'Your Request Has Been Rejected');
  const actionWord = isFullyApproved ? 'fully approved' : (isApproved ? 'approved' : 'rejected');

  return /* html */ `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PEAF Request Status – ${documentNo}</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-spacing: 0; border-collapse: collapse; }
    td { padding: 0; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f4f6f8; padding-bottom: 40px; }
    .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border: 1px solid #e2e8f0; }
    .header { background-color: #0e5cb5; padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; margin: 0; padding: 0; font-family: Arial, sans-serif; font-weight: bold; }
    .header p { color: #e0e7ff; font-size: 14px; margin: 8px 0 0 0; font-family: Arial, sans-serif; }
    .content { padding: 30px; }
    .status-box { background-color: ${boxColor}; border-left: 4px solid ${borderColor}; padding: 15px; margin-bottom: 25px; }
    .status-text { color: ${textColor}; font-size: 14px; font-weight: bold; font-family: Arial, sans-serif; margin: 0; }
    .greeting { font-size: 15px; color: #334155; line-height: 1.6; font-family: Arial, sans-serif; margin: 0 0 20px 0; }
    .info-table { width: 100%; border: 1px solid #e2e8f0; background-color: #f8fafc; }
    .info-header { background-color: #f1f5f9; padding: 12px 15px; font-size: 14px; font-weight: bold; color: #475569; font-family: Arial, sans-serif; border-bottom: 1px solid #e2e8f0; }
    .info-cell-label { padding: 12px 15px; font-size: 14px; color: #64748b; font-family: Arial, sans-serif; width: 35%; border-bottom: 1px solid #e2e8f0; }
    .info-cell-value { padding: 12px 15px; font-size: 14px; color: #1e293b; font-weight: bold; font-family: Arial, sans-serif; border-bottom: 1px solid #e2e8f0; }
    .action-container { text-align: center; margin: 30px 0; }
    .btn-panel { display: inline-block; background-color: #0e5cb5; color: #ffffff !important; border: none; padding: 14px 30px; font-weight: bold; font-size: 15px; text-decoration: none; border-radius: 4px; font-family: Arial, sans-serif; }
    .footer { background-color: #1e293b; padding: 20px; text-align: center; }
    .footer p { color: #94a3b8; font-size: 12px; font-family: Arial, sans-serif; line-height: 1.6; margin: 0; }
    .footer a { color: #60a5fa; text-decoration: none; }
  </style>
</head>
<body>
  <center class="wrapper">
    <table class="main" width="100%">
      <tr>
        <td class="header">
          <h1>PEAF</h1>
          <p>PT Indofood Fortuna Makmur</p>
        </td>
      </tr>
      <tr>
        <td class="content">
          <div class="status-box">
            <p class="status-text">${titleText}</p>
          </div>
          <p class="greeting">
            Hello <strong>${applicantName}</strong>,<br/><br/>
            Your PEAF request with Document No. <strong>${documentNo}</strong> has been ${actionWord} by <strong>${approverName}</strong>.
          </p>
          <table class="info-table" width="100%">
            <tr><td colspan="2" class="info-header">Approval Information</td></tr>
            <tr><td class="info-cell-label">Status</td><td class="info-cell-value">${status}</td></tr>
            <tr><td class="info-cell-label">By</td><td class="info-cell-value">${approverName}</td></tr>
            <tr><td class="info-cell-label" style="border-bottom: none;">Notes</td><td class="info-cell-value" style="border-bottom: none;">${notes || '-'}</td></tr>
          </table>
          <div class="action-container">
            <a href="${requestUrl}" class="btn-panel">View Details</a>
          </div>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p>This email was sent automatically by <strong>PEAF</strong><br/>PT Indofood Fortuna Makmur<br/>Please do not reply to this email &bull; <a href="${baseUrl}">Visit PEAF website</a></p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
`;
};

export const sendStatusUpdateEmail = async (opts: {
  applicantEmail: string;
  applicantName: string;
  documentNo: string;
  formId: string;
  status: string;
  approverName: string;
  notes: string;
}): Promise<void> => {
  const html = buildStatusUpdateEmailHtml(opts);
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'PEAF <noreply@indofood.co.id>',
    to: opts.applicantEmail,
    subject: `[PEAF] Status Update: ${opts.documentNo} - ${opts.status}`,
    html,
  });
  console.log(`[EMAIL] Status update dikirim ke ${opts.applicantEmail} (${opts.applicantName})`);
};

