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
      margins: { top: 40, bottom: 40, left: 40, right: 40 }
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=PEAF_${form.document_no.replace(/\//g, '_')}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);

    // Helper functions
    const drawBox = (x: number, y: number, width: number, height: number) => {
      doc.rect(x, y, width, height).stroke();
    };

    const drawHeaderBox = (x: number, y: number, width: number, height: number, text: string) => {
      doc.rect(x, y, width, height).fillAndStroke('#f0f0f0', '#000000');
      doc.fillColor('#000000').fontSize(9).font('Helvetica-Bold').text(text, x + 5, y + 5, { width: width - 10 });
    };

    // ===== PAGE 1 =====
    
    // Outer border
    drawBox(margin, margin, contentWidth, pageHeight - (margin * 2));

    let currentY = margin + 10;
    
    // Company header
    doc.fontSize(16).font('Helvetica-Bold').text('PT INDOFOOD FRITOLAY MAKMUR', margin + 10, currentY, { align: 'center', width: contentWidth - 20 });
    currentY += 20;
    doc.fontSize(14).font('Helvetica-Bold').text('PROJECT & ENGINEERING APPROVAL FORM', margin + 10, currentY, { align: 'center', width: contentWidth - 20 });
    currentY += 15;
    doc.fontSize(10).font('Helvetica').text('(PEAF)', margin + 10, currentY, { align: 'center', width: contentWidth - 20 });
    currentY += 20;

    // Document number box
    doc.rect(margin + 10, currentY, contentWidth - 20, 25).stroke();
    doc.fontSize(10).font('Helvetica-Bold').text('Document No:', margin + 15, currentY + 8);
    doc.fontSize(11).font('Helvetica-Bold').text(form.document_no, margin + 100, currentY + 8);
    doc.fontSize(9).font('Helvetica').text(`Submitted on ${format(new Date(form.submission_date), 'MMMM dd, yyyy')}`, margin + 250, currentY + 8);
    currentY += 35;

    // Section I: Applicant Information
    drawHeaderBox(margin + 10, currentY, contentWidth - 20, 20, 'I. APPLICANT INFORMATION');
    currentY += 25;

    const infoBoxHeight = 80;
    doc.rect(margin + 10, currentY, contentWidth - 20, infoBoxHeight).stroke();
    
    let infoY = currentY + 8;
    doc.fontSize(9).font('Helvetica-Bold').text('Applicant Name:', margin + 15, infoY);
    doc.fontSize(9).font('Helvetica').text(form.applicant_name, margin + 120, infoY);
    infoY += 15;
    
    doc.fontSize(9).font('Helvetica-Bold').text('Department:', margin + 15, infoY);
    doc.fontSize(9).font('Helvetica').text(form.department, margin + 120, infoY);
    infoY += 15;
    
    doc.fontSize(9).font('Helvetica-Bold').text('Plant / Location:', margin + 15, infoY);
    doc.fontSize(9).font('Helvetica').text(form.plant_location, margin + 120, infoY);
    infoY += 15;
    
    doc.fontSize(9).font('Helvetica-Bold').text('Work Category:', margin + 15, infoY);
    currentY += infoBoxHeight + 5;

    // Work category boxes
    const workCategories = form.work_category as string[];
    const categoryBoxHeight = Math.max(40, workCategories.length * 12 + 20);
    doc.rect(margin + 10, currentY, contentWidth - 20, categoryBoxHeight).stroke();
    let catY = currentY + 8;
    workCategories.forEach((cat: string) => {
      doc.fontSize(8).font('Helvetica').text(`• ${cat}`, margin + 15, catY, { width: contentWidth - 30 });
      catY += 12;
    });
    currentY += categoryBoxHeight + 10;

    // Section II: Project Description
    drawHeaderBox(margin + 10, currentY, contentWidth - 20, 20, 'II. PROJECT DESCRIPTION & SCOPE OF WORK');
    currentY += 25;

    const descHeight = 80;
    doc.rect(margin + 10, currentY, contentWidth - 20, descHeight).stroke();
    doc.fontSize(9).font('Helvetica').text(form.project_description, margin + 15, currentY + 8, { 
      width: contentWidth - 30, 
      align: 'justify',
      lineGap: 2
    });
    currentY += descHeight + 10;

    // Sections III & IV side by side
    const halfWidth = (contentWidth - 30) / 2;
    
    // Section III: Technical Impact (Left)
    drawHeaderBox(margin + 10, currentY, halfWidth, 20, 'III. TECHNICAL IMPACT');
    drawHeaderBox(margin + 15 + halfWidth, currentY, halfWidth, 20, 'IV. SUPPORTING DOCUMENTS');
    currentY += 25;

    const technicalImpacts = form.technical_impact as string[];
    const supportingDocs = form.supporting_documents as any[];
    const sideBoxHeight = 120;

    // Technical Impact box
    doc.rect(margin + 10, currentY, halfWidth, sideBoxHeight).stroke();
    let impactY = currentY + 8;
    if (technicalImpacts && technicalImpacts.length > 0) {
      technicalImpacts.slice(0, 8).forEach((impact: string) => {
        doc.fontSize(7).font('Helvetica').text(`• ${impact.substring(0, 50)}${impact.length > 50 ? '...' : ''}`, margin + 15, impactY, { width: halfWidth - 10 });
        impactY += 12;
      });
    } else {
      doc.fontSize(8).font('Helvetica').text('No technical impacts', margin + 15, impactY);
    }

    // Supporting Documents box
    doc.rect(margin + 15 + halfWidth, currentY, halfWidth, sideBoxHeight).stroke();
    let docsY = currentY + 8;
    if (supportingDocs && supportingDocs.length > 0) {
      supportingDocs.slice(0, 8).forEach((doc_file: any, index: number) => {
        doc.fontSize(7).font('Helvetica').text(
          `${index + 1}. ${doc_file.originalName.substring(0, 35)}${doc_file.originalName.length > 35 ? '...' : ''}`, 
          margin + 20 + halfWidth, 
          docsY, 
          { width: halfWidth - 10 }
        );
        docsY += 12;
      });
    } else {
      doc.fontSize(8).font('Helvetica').text('No documents', margin + 20 + halfWidth, docsY);
    }
    currentY += sideBoxHeight + 10;

    // ===== PAGE 2 =====
    doc.addPage();
    currentY = margin + 10;

    // Outer border for page 2
    drawBox(margin, margin, contentWidth, pageHeight - (margin * 2));

    // Section V: Engineering Verification
    drawHeaderBox(margin + 10, currentY, contentWidth - 20, 20, 'V. ENGINEERING VERIFICATION');
    currentY += 25;

    const peApproval = approvals.find((a: any) => a.role === 'engineering_manager');
    const engHeight = 60;
    doc.rect(margin + 10, currentY, contentWidth - 20, engHeight).stroke();
    let engY = currentY + 8;
    
    if (peApproval) {
      doc.fontSize(9).font('Helvetica-Bold').text('Evaluation Notes:', margin + 15, engY);
      engY += 15;
      doc.fontSize(8).font('Helvetica').text(peApproval.notes || 'No notes provided.', margin + 15, engY, { width: contentWidth - 30 });
      engY += 25;
      doc.fontSize(9).font('Helvetica-Bold').text('Status:', margin + 15, engY);
      doc.fontSize(9).font('Helvetica').text(peApproval.status, margin + 60, engY);
    } else {
      doc.fontSize(8).font('Helvetica').text('Waiting for Engineering Manager verification...', margin + 15, engY);
    }
    currentY += engHeight + 10;

    // Section VI: Authorization Matrix
    drawHeaderBox(margin + 10, currentY, contentWidth - 20, 20, 'VI. AUTHORIZATION MATRIX');
    currentY += 25;

    const roles = [
      { role: 'Head of Department', key: 'hod' },
      { role: 'HSE', key: 'hse' },
      { role: 'Factory Manager', key: 'factory_manager' },
      { role: 'Project & Engineering Manager', key: 'engineering_manager' }
    ];

    // Table header
    const colWidths = [130, 130, 80, 175];
    const tableX = margin + 10;
    let tableY = currentY;

    doc.rect(tableX, tableY, colWidths[0], 25).fillAndStroke('#e0e0e0', '#000000');
    doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold').text('Role', tableX + 5, tableY + 8);
    
    doc.rect(tableX + colWidths[0], tableY, colWidths[1], 25).fillAndStroke('#e0e0e0', '#000000');
    doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold').text('Approver Name', tableX + colWidths[0] + 5, tableY + 8);
    
    doc.rect(tableX + colWidths[0] + colWidths[1], tableY, colWidths[2], 25).fillAndStroke('#e0e0e0', '#000000');
    doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold').text('Signature', tableX + colWidths[0] + colWidths[1] + 5, tableY + 8);
    
    doc.rect(tableX + colWidths[0] + colWidths[1] + colWidths[2], tableY, colWidths[3], 25).fillAndStroke('#e0e0e0', '#000000');
    doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold').text('Date', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableY + 8);
    
    tableY += 25;

    // Data rows
    roles.forEach((row) => {
      const approval = approvals.find((a: any) => a.role === row.key);
      const rowHeight = 30;

      doc.rect(tableX, tableY, colWidths[0], rowHeight).stroke();
      doc.fontSize(8).font('Helvetica').text(row.role, tableX + 5, tableY + 10, { width: colWidths[0] - 10 });

      doc.rect(tableX + colWidths[0], tableY, colWidths[1], rowHeight).stroke();
      doc.fontSize(8).font('Helvetica').text(approval ? (approval.approver_name || 'System User') : '-', tableX + colWidths[0] + 5, tableY + 10, { width: colWidths[1] - 10 });

      doc.rect(tableX + colWidths[0] + colWidths[1], tableY, colWidths[2], rowHeight).stroke();
      if (approval) {
        doc.fontSize(7).font('Helvetica').text('✓ Verified', tableX + colWidths[0] + colWidths[1] + 5, tableY + 10);
      } else {
        doc.fontSize(8).font('Helvetica').text('-', tableX + colWidths[0] + colWidths[1] + 5, tableY + 10);
      }

      doc.rect(tableX + colWidths[0] + colWidths[1] + colWidths[2], tableY, colWidths[3], rowHeight).stroke();
      if (approval) {
        doc.fontSize(8).font('Helvetica').text(format(new Date(approval.created_at), 'MMM dd, yyyy'), tableX + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableY + 10);
      } else {
        doc.fontSize(8).font('Helvetica').text('-', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableY + 10);
      }

      tableY += rowHeight;
    });
    currentY = tableY + 10;

    // Section VII: Administration & Procurement
    drawHeaderBox(margin + 10, currentY, contentWidth - 20, 20, 'VII. ADMINISTRATION & PROCUREMENT');
    currentY += 25;

    const adminHeight = 60;
    doc.rect(margin + 10, currentY, contentWidth - 20, adminHeight).stroke();
    let adminY = currentY + 8;
    
    doc.fontSize(9).font('Helvetica-Bold').text('PR Number:', margin + 15, adminY);
    doc.fontSize(9).font('Helvetica').text(form.pr_number || 'Not Assigned', margin + 120, adminY);
    adminY += 15;
    
    doc.fontSize(9).font('Helvetica-Bold').text('Budget Estimate:', margin + 15, adminY);
    doc.fontSize(9).font('Helvetica').text(form.budget_estimate || 'Not Provided', margin + 120, adminY);
    adminY += 15;
    
    doc.fontSize(9).font('Helvetica-Bold').text('Purchasing Status:', margin + 15, adminY);
    doc.fontSize(9).font('Helvetica').text(form.purchasing_status || 'Pending', margin + 120, adminY);
    currentY += adminHeight + 10;

    // Section VIII: HSE Evaluation
    drawHeaderBox(margin + 10, currentY, contentWidth - 20, 20, 'VIII. HSE EVALUATION');
    currentY += 25;

    const hseApproval = approvals.find((a: any) => a.role === 'hse');
    const hseHeight = 50;
    doc.rect(margin + 10, currentY, contentWidth - 20, hseHeight).stroke();
    let hseY = currentY + 8;
    
    if (hseApproval) {
      doc.fontSize(9).font('Helvetica-Bold').text('HSE Notes:', margin + 15, hseY);
      hseY += 15;
      doc.fontSize(8).font('Helvetica').text(hseApproval.notes || 'No notes provided.', margin + 15, hseY, { width: contentWidth - 30 });
    } else {
      doc.fontSize(8).font('Helvetica').text('Waiting for HSE evaluation...', margin + 15, hseY);
    }
    currentY += hseHeight + 10;

    // Footer
    doc.fontSize(7).font('Helvetica').text(
      `Generated on ${format(new Date(), 'MMMM dd, yyyy HH:mm')} | PEAF System`,
      margin + 10,
      pageHeight - margin - 20,
      { align: 'center', width: contentWidth - 20 }
    );

    // Finalize PDF
    doc.end();
  } catch (error: any) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: error.message });
  }
};
