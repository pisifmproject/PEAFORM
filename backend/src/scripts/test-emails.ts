import 'dotenv/config';
import { 
  sendApprovalRequestEmail, 
  sendStatusUpdateEmail 
} from '../services/email-service.js';

async function runTest() {
  const targetEmail = 'septian.jumantoro@icbp.indofood.co.id';
  const dummyData = {
    approverName: 'Bapak Budi (HSE Manager)',
    applicantName: 'Septian Jumantoro',
    documentNo: 'PEAF-2026-05-001',
    formId: '12345-abcde',
    plantLocation: 'Cikupa',
    workCategory: 'Mechanical, Electrical',
    projectDescription: 'Pemasangan jalur pipa baru dan instalasi panel listrik untuk area produksi Cikupa.'
  };

  console.log('Sending Approval Request Email...');
  try {
    await sendApprovalRequestEmail({
      ...dummyData,
      approverEmail: targetEmail
    });
    console.log('✅ Approval Request Email sent successfully!');
  } catch (err) {
    console.error('❌ Error sending Approval Request Email:', err);
  }

  console.log('\nSending Status Update Email (APPROVED)...');
  try {
    await sendStatusUpdateEmail({
      applicantEmail: targetEmail,
      applicantName: dummyData.applicantName,
      documentNo: dummyData.documentNo,
      formId: dummyData.formId,
      status: 'Approved',
      approverName: dummyData.approverName,
      notes: 'Desain dan RAB sudah sesuai, silakan dilanjutkan ke tahap berikutnya.'
    });
    console.log('✅ Status Update Email (APPROVED) sent successfully!');
  } catch (err) {
    console.error('❌ Error sending Status Update Email (APPROVED):', err);
  }

  console.log('\nSending Status Update Email (REJECTED)...');
  try {
    await sendStatusUpdateEmail({
      applicantEmail: targetEmail,
      applicantName: dummyData.applicantName,
      documentNo: dummyData.documentNo,
      formId: dummyData.formId,
      status: 'Rejected',
      approverName: 'Bapak Anton (Factory Manager)',
      notes: 'Budget melebihi plafon tahunan. Harap direvisi dan dikirim ulang dengan penyesuaian biaya.'
    });
    console.log('✅ Status Update Email (REJECTED) sent successfully!');
  } catch (err) {
    console.error('❌ Error sending Status Update Email (REJECTED):', err);
  }

  console.log('\nAll test emails completed.');
  process.exit(0);
}

runTest();
