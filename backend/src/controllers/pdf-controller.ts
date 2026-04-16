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

    const pageWidth = 595.28; // A4 width in points
    const pageHeight = 841.89; // A4 height in points
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);

    // Helper function to draw a box
    const drawBox = (x: number, y: number, width: number, height: number) => {
      doc.rect(x, y, width, height).stroke();
    };

    // Helper function to draw filled header box
    const drawHeaderBox = (x: number, y: number, width: number, height: number, text: string) => {
      doc.rect(x, y, width, height).fillAndStroke('#f0f0f0', '#000000');
      doc.fillColor('#000000').fontSize(9).font('Helvetica-Bold').text(text, x + 5, y + 5, { width: width - 10 });
    };

    // ===== PAGE 1 =====
    
    // Outer border
    drawBox(margin, margin, contentWidth, pageHeight - (margin * 2));

    // Header section
    let currentY = margin + 10;
    
    // Company header area (placeholder for logo)
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
    currentY += 35;

    // Section I: Applicant Information
    drawHeaderBox(margin + 10, currentY, contentWidth - 20, 20, 'I. APPLICANT INFORMATION');
    currentY += 25;

    const infoBoxHeight = 100;
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
    
    doc.fontSize(9).font('Helvetica-Bold').text('Submission Date:', margin + 15, infoY);
    doc.fontSize(9).font('Helvetica').text(format(new Date(form.submission_date), 'MMMM dd, yyyy'), margin + 120, infoY);
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

    // Section III: Technical Impact
    drawHeaderBox(margin + 10, currentY, contentWidth - 20, 20, 'III. TECHNICAL IMPACT ANALYSIS');
    currentY += 25;

    const technicalImpacts = form.technical_impact as string[];
    const impactHeight = Math.max(40, technicalImpacts.length * 12 + 20);
    doc.rect(margin + 10, currentY, contentWidth - 20, impactHeight).stroke();
    let impactY = currentY + 8;
    if (technicalImpacts && technicalImpacts.length > 0) {
      technicalImpacts.forEach((impact: string) => {
        doc.fontSize(8).font('Helvetica').text(`• ${impact}`, margin + 15, impactY, { width: contentWidth - 30 });
        impactY += 12;
      });
    } else {
      doc.fontSize(8).font('Helvetica').text('No technical impacts selected.', margin + 15, impactY);
    }
    currentY += impactHeight + 10;

    // ===== PAGE 2 =====
    doc.addPage();
    currentY = margin + 10;

    // Outer border for page 2
    drawBox(margin, margin, contentWidth, pageHeight - (margin * 2));

    // Section IV: Supporting Documents
    drawHeaderBox(margin + 10, currentY, contentWidth - 20, 20, 'IV. SUPPORTING DOCUMENTS');
    currentY += 25;

    const supportingDocs = form.supporting_documents as any[];
    const docsHeight = Math.max(40, (supportingDocs?.length || 1) * 12 + 20);
    doc.rect(margin + 10, currentY, contentWidth - 20, docsHeight).stroke();
    let docsY = currentY + 8;
    if (supportingDocs && supportingDocs.length > 0) {
      supportingDocs.forEach((doc_file: any, index: number) => {
        doc.fontSize(8).font('Helvetica').text(
          `${index + 1}. ${doc_file.originalName} (${(doc_file.size / 1024).toFixed(2)} KB)`, 
          margin + 15, 
          docsY, 
          { width: contentWidth - 30 }
        );
        docsY += 12;
      });
    } else {
      doc.fontSize(8).font('Helvetica').text('No supporting documents uploaded.', margin + 15, docsY);
    }
    currentY += docsHeight + 10;

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
    const colWidths = [120, 120, 80, 195];
    const tableX = margin + 10;
    let tableY = currentY;

    // Header row
    doc.rect(tableX, tableY, colWidths[0], 25).fillAndStroke('#e0e0e0', '#000000');
    doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold').text('Role', tableX + 5, tableY + 8);
    
    doc.rect(tableX + colWidths[0], tableY, colWidths[1], 25).fillAndStroke('#e0e0e0', '#000000');
    doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold').text('Approver Name', tableX + colWidths[0] + 5, tableY + 8);
    
    doc.rect(tableX + colWidths[0] + colWidths[1], tableY, colWidths[2], 25).fillAndStroke('#e0e0e0', '#000000');
    doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold').text('Status', tableX + colWidths[0] + colWidths[1] + 5, tableY + 8);
    
    doc.rect(tableX + colWidths[0] + colWidths[1] + colWidths[2], tableY, colWidths[3], 25).fillAndStroke('#e0e0e0', '#000000');
    doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold').text('Date & Notes', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableY + 8);
    
    tableY += 25;

    // Data rows
    roles.forEach((row) => {
      const approval = approvals.find((a: any) => a.role === row.key);
      const rowHeight = 40;

      doc.rect(tableX, tableY, colWidths[0], rowHeight).stroke();
      doc.fontSize(8).font('Helvetica').text(row.role, tableX + 5, tableY + 5, { width: colWidths[0] - 10 });

      doc.rect(tableX + colWidths[0], tableY, colWidths[1], rowHeight).stroke();
      doc.fontSize(8).font('Helvetica').text(approval ? (approval.approver_name || 'System User') : '-', tableX + colWidths[0] + 5, tableY + 5, { width: colWidths[1] - 10 });

      doc.rect(tableX + colWidths[0] + colWidths[1], tableY, colWidths[2], rowHeight).stroke();
      doc.fontSize(8).font('Helvetica').text(approval ? approval.status : 'Pending', tableX + colWidths[0] + colWidths[1] + 5, tableY + 5, { width: colWidths[2] - 10 });

      doc.rect(tableX + colWidths[0] + colWidths[1] + colWidths[2], tableY, colWidths[3], rowHeight).stroke();
      if (approval) {
        const dateText = format(new Date(approval.created_at), 'MMM dd, yyyy');
        const notesText = approval.notes ? `\n${approval.notes}` : '';
        doc.fontSize(7).font('Helvetica').text(dateText + notesText, tableX + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableY + 5, { width: colWidths[3] - 10 });
      } else {
        doc.fontSize(8).font('Helvetica').text('-', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableY + 5);
      }

      tableY += rowHeight;
    });

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
