import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate.js';
import * as formService from '../services/form-service.js';
import PDFDocument from 'pdfkit';
import { format } from 'date-fns';

export const downloadFormPDF = async (req: AuthRequest, res: Response) => {
  try {
    const form = await formService.getFormById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Check if form is approved
    if (form.status !== 'approved') {
      return res.status(403).json({ error: 'Only approved forms can be downloaded as PDF' });
    }

    const approvals = await formService.getFormApprovals(req.params.id);

    // Create PDF document
    const doc = new PDFDocument({ 
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=PEAF_${form.document_no.replace(/\//g, '_')}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add content to PDF
    // Header
    doc.fontSize(18).font('Helvetica-Bold').text('PROJECT & ENGINEERING APPROVAL FORM', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('(PEAF)', { align: 'center' });
    doc.moveDown();

    // Document Number
    doc.fontSize(10).font('Helvetica-Bold').text(`Document No: ${form.document_no}`, { align: 'right' });
    doc.moveDown();

    // Section I: Applicant Information
    doc.fontSize(12).font('Helvetica-Bold').text('I. APPLICANT INFORMATION');
    doc.moveDown(0.5);
    
    doc.fontSize(10).font('Helvetica');
    doc.text(`Applicant Name: ${form.applicant_name}`);
    doc.text(`Department: ${form.department}`);
    doc.text(`Plant / Location: ${form.plant_location}`);
    doc.text(`Submission Date: ${format(new Date(form.submission_date), 'MMMM dd, yyyy')}`);
    doc.moveDown(0.5);
    
    doc.text('Work Category:');
    (form.work_category as string[]).forEach((cat: string) => {
      doc.text(`  • ${cat}`, { indent: 20 });
    });
    doc.moveDown();

    // Section II: Project Description
    doc.fontSize(12).font('Helvetica-Bold').text('II. PROJECT DESCRIPTION & SCOPE OF WORK');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(form.project_description, { align: 'justify' });
    doc.moveDown();

    // Section III: Technical Impact
    doc.fontSize(12).font('Helvetica-Bold').text('III. TECHNICAL IMPACT ANALYSIS');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    const technicalImpacts = form.technical_impact as string[];
    if (technicalImpacts && technicalImpacts.length > 0) {
      technicalImpacts.forEach((impact: string) => {
        doc.text(`  • ${impact}`, { indent: 20 });
      });
    } else {
      doc.text('No technical impacts selected.');
    }
    doc.moveDown();

    // Section IV: Supporting Documents
    doc.fontSize(12).font('Helvetica-Bold').text('IV. SUPPORTING DOCUMENTS');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    const supportingDocs = form.supporting_documents as any[];
    if (supportingDocs && supportingDocs.length > 0) {
      supportingDocs.forEach((doc_file: any, index: number) => {
        doc.text(`  ${index + 1}. ${doc_file.originalName} (${(doc_file.size / 1024).toFixed(2)} KB)`, { indent: 20 });
      });
    } else {
      doc.text('No supporting documents uploaded.');
    }
    doc.moveDown();

    // Section VII: Administration & Procurement
    doc.fontSize(12).font('Helvetica-Bold').text('VII. ADMINISTRATION & PROCUREMENT');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    doc.text(`PR Number: ${form.pr_number || 'Not Assigned'}`);
    doc.text(`Budget Estimate: ${form.budget_estimate || 'Not Provided'}`);
    doc.text(`Purchasing Status: ${form.purchasing_status || 'Pending'}`);
    doc.moveDown();

    // Section VI: Authorization Matrix
    doc.addPage();
    doc.fontSize(12).font('Helvetica-Bold').text('VI. AUTHORIZATION MATRIX');
    doc.moveDown(0.5);

    const roles = [
      { role: 'Head of Department (User)', key: 'hod' },
      { role: 'HSE', key: 'hse' },
      { role: 'Factory Manager', key: 'factory_manager' },
      { role: 'Project & Engineering Manager', key: 'engineering_manager' }
    ];

    roles.forEach((row) => {
      const approval = approvals.find((a: any) => a.role === row.key);
      doc.fontSize(10).font('Helvetica-Bold').text(row.role);
      if (approval) {
        doc.fontSize(9).font('Helvetica');
        doc.text(`  Approver: ${approval.approver_name || 'System User'}`, { indent: 20 });
        doc.text(`  Status: ${approval.status}`, { indent: 20 });
        doc.text(`  Date: ${format(new Date(approval.created_at), 'MMM dd, yyyy')}`, { indent: 20 });
        if (approval.notes) {
          doc.text(`  Notes: ${approval.notes}`, { indent: 20 });
        }
      } else {
        doc.fontSize(9).font('Helvetica').text('  Pending approval', { indent: 20 });
      }
      doc.moveDown(0.5);
    });

    // Footer
    doc.moveDown();
    doc.fontSize(8).font('Helvetica').text(
      `Generated on ${format(new Date(), 'MMMM dd, yyyy HH:mm')} | PEAF System`,
      { align: 'center' }
    );

    // Finalize PDF
    doc.end();
  } catch (error: any) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: error.message });
  }
};
