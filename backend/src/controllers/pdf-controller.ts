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

    if (form.status !== 'approved') {
      return res.status(403).json({ error: 'Only approved forms can be downloaded as PDF' });
    }

    const approvals = await formService.getFormApprovals(req.params.id);

    const doc = new PDFDocument({ 
      size: 'A4',
      margins: { top: 40, bottom: 40, left: 40, right: 40 }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=PEAF_${form.document_no.replace(/\//g, '_')}.pdf`);

    doc.pipe(res);

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);
    const labelWidth = 120;
    const valueWidth = contentWidth - labelWidth - 30;

    // Helper: Check for page break
    const checkPageBreak = (y: number, requiredSpace: number): number => {
      if (y + requiredSpace > pageHeight - margin - 20) {
        doc.addPage();
        doc.lineWidth(0.7);
        doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2)).stroke();
        return margin + 10;
      }
      return y;
    };

    // Helper: Draw thin section header (SAP-style)
    const drawSectionHeader = (y: number, text: string): number => {
      y = checkPageBreak(y, 18 + 40); // Header + space for at least 1 field
      doc.rect(margin + 10, y, contentWidth - 20, 18)
         .fillAndStroke('#e6e6e6', '#000000');
      doc.fillColor('#000000')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text(text.toUpperCase(), margin + 15, y + 5);
      return y + 18;
    };

    // Helper: Draw field with label and value (grid-based)
    const drawField = (y: number, label: string, value: string, fullWidth = false): number => {
      const padding = 8;
      const textWidth = fullWidth ? contentWidth - 30 : valueWidth;
      
      const valueHeight = doc.heightOfString(value, { 
        width: textWidth, 
        lineGap: 2 
      });
      const boxHeight = Math.max(18, valueHeight + padding * 2);

      y = checkPageBreak(y, boxHeight);

      doc.lineWidth(0.5);
      doc.rect(margin + 10, y, contentWidth - 20, boxHeight).stroke();

      if (fullWidth) {
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#000000')
           .text(value, margin + 15, y + padding, { 
             width: textWidth, 
             align: 'justify',
             lineGap: 2
           });
      } else {
        doc.moveTo(margin + 10 + labelWidth, y)
           .lineTo(margin + 10 + labelWidth, y + boxHeight)
           .stroke();

        doc.fontSize(8)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text(label, margin + 15, y + padding, { width: labelWidth - 10 });

        doc.fontSize(9)
           .font('Helvetica')
           .text(value, margin + 15 + labelWidth, y + padding, { 
             width: textWidth, 
             lineGap: 2 
           });
      }

      return y + boxHeight;
    };

    // Helper: Draw bullet list field
    const drawListField = (y: number, label: string, items: string[]): number => {
      const padding = 8;
      const bulletText = items.map(item => `• ${item}`).join('\n');
      
      const textHeight = doc.heightOfString(bulletText, { 
        width: valueWidth, 
        lineGap: 2 
      });
      const boxHeight = Math.max(18, textHeight + padding * 2);

      y = checkPageBreak(y, boxHeight);

      doc.lineWidth(0.5);
      doc.rect(margin + 10, y, contentWidth - 20, boxHeight).stroke();

      doc.moveTo(margin + 10 + labelWidth, y)
         .lineTo(margin + 10 + labelWidth, y + boxHeight)
         .stroke();

      doc.fontSize(8)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text(label, margin + 15, y + padding, { width: labelWidth - 10 });

      doc.fontSize(8)
         .font('Helvetica')
         .text(bulletText, margin + 15 + labelWidth, y + padding, { 
           width: valueWidth, 
           lineGap: 2 
         });

      return y + boxHeight;
    };

    // ===== PAGE 1 =====
    
    // Outer border
    doc.lineWidth(0.7);
    doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2)).stroke();

    let currentY = margin + 20;
    
    // Company header
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('PROJECT & ENGINEERING APPROVAL FORM', margin + 10, currentY, { 
         align: 'center', 
         width: contentWidth - 20,
         underline: true
       });
    currentY += 15;
    
    // doc.fontSize(10)
    //    .font('Helvetica')
    //    .text('(PEAF)', margin + 10, currentY, { 
    //      align: 'center', 
    //      width: contentWidth - 20 
    //    });
    currentY += 25;

    // Document number box
    doc.lineWidth(0.5);
    doc.rect(margin + 10, currentY, contentWidth - 20, 22).stroke();
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .text('Document No:', margin + 15, currentY + 7);
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text(form.document_no, margin + 100, currentY + 7);
    doc.fontSize(8)
       .font('Helvetica')
       .text(`Submitted: ${format(new Date(form.submission_date), 'MMM dd, yyyy')}`, 
             margin + 10, currentY + 7, { align: 'right', width: contentWidth - 25 });
    currentY += 27;

    // Section I: Applicant Information
    currentY = drawSectionHeader(currentY, 'I. Applicant Information');
    currentY = drawField(currentY, 'Applicant Name', form.applicant_name);
    currentY = drawField(currentY, 'Department', form.department);
    currentY = drawField(currentY, 'Plant / Location', form.plant_location);
    
    // Work Category as list field
    const workCategories = form.work_category as string[];
    currentY = drawListField(currentY, 'Work Category', workCategories);
    currentY += 5;

    // Section II: Project Description
    currentY = drawSectionHeader(currentY, 'II. Project Description & Scope of Work');
    currentY = drawField(currentY, '', form.project_description, true);
    currentY += 5;

    // Section III & IV: Two-column layout
    const technicalImpacts = form.technical_impact as string[];
    const impactText = technicalImpacts && technicalImpacts.length > 0 
      ? technicalImpacts.map(item => `• ${item}`).join('\n')
      : 'No technical impacts selected.';
    
    const halfWidth = (contentWidth - 20) / 2;
    const impactHeight = doc.heightOfString(impactText, { width: halfWidth - 10, lineGap: 2 });

    const supportingDocs = form.supporting_documents as any[];
    const menus = supportingDocs ? supportingDocs.filter(d => d.isMenu) : [];
    const docsText = menus.length > 0
      ? menus.map((d: any, i: number) => `${i + 1}. ${d.type}`).join('\n')
      : 'No supporting documents selected.';
    
    const docsHeight = doc.heightOfString(docsText, { width: halfWidth - 10, lineGap: 2 });

    const maxHeight = Math.max(impactHeight, docsHeight) + 16;
    
    // Check page break for section header + double boxes early
    currentY = checkPageBreak(currentY, 18 + maxHeight + 5);

    // Left Header (III)
    doc.lineWidth(0.5);
    doc.rect(margin + 10, currentY, halfWidth, 18).fillAndStroke('#e6e6e6', '#000000');
    doc.fillColor('#000000').fontSize(9).font('Helvetica-Bold').text('III. TECHNICAL IMPACT ANALYSIS', margin + 15, currentY + 5);

    // Right Header (IV)
    doc.rect(margin + 10 + halfWidth, currentY, halfWidth, 18).fillAndStroke('#e6e6e6', '#000000');
    doc.fillColor('#000000').fontSize(9).font('Helvetica-Bold').text('IV. SUPPORTING DOCUMENTS', margin + 15 + halfWidth, currentY + 5);

    currentY += 18;

    // Draw left box (Technical Impact)
    doc.rect(margin + 10, currentY, halfWidth, maxHeight).stroke();
    doc.fontSize(8)
       .font('Helvetica')
       .text(impactText, margin + 15, currentY + 8, { 
         width: halfWidth - 10, 
         lineGap: 2 
       });

    // Draw right box (Supporting Documents)
    doc.rect(margin + 10 + halfWidth, currentY, halfWidth, maxHeight).stroke();
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#000000')
       .text(docsText, margin + 15 + halfWidth, currentY + 8, { 
         width: halfWidth - 10, 
         lineGap: 2 
       });

    currentY += maxHeight + 5;

    // Section V: Engineering Verification
    const peApproval = approvals.find((a: any) => a.role === 'engineering_manager');
    const engNotesText = peApproval ? (peApproval.notes || 'No notes provided.') : 'Waiting for Engineering Manager verification...';
    const engStatusText = peApproval && peApproval.status ? `Status: ${peApproval.status.charAt(0).toUpperCase() + peApproval.status.slice(1)}` : '';

    const engNotesHeight = doc.heightOfString(engNotesText, { width: contentWidth - 30, lineGap: 2 });
    const engStatusHeight = engStatusText ? doc.heightOfString(engStatusText, { width: contentWidth - 30, lineGap: 2 }) : 0;
    
    const engPadding = 8;
    const engBoxHeight = Math.max(18, engNotesHeight + (engStatusText ? engStatusHeight + 10 : 0) + engPadding * 2);

    currentY = checkPageBreak(currentY, 18 + engBoxHeight + 5);
    currentY = drawSectionHeader(currentY, 'V. Engineering Verification');

    doc.lineWidth(0.5);
    doc.rect(margin + 10, currentY, contentWidth - 20, engBoxHeight).stroke();
    
    doc.fontSize(9).font('Helvetica').fillColor('#000000')
       .text(engNotesText, margin + 15, currentY + engPadding, { width: contentWidth - 30, align: 'justify', lineGap: 2 });
       
    if (engStatusText) {
      doc.font('Helvetica-Bold').text(engStatusText, margin + 15, currentY + engPadding + engNotesHeight + 10, { width: contentWidth - 30, align: 'justify' });
    }
    currentY += engBoxHeight + 5;

    const roles = [
      { role: 'Head of Department', key: 'hod' },
      { role: 'HSE', key: 'hse' },
      { role: 'Factory Manager', key: 'factory_manager' },
      { role: 'Project & Engineering Manager', key: 'engineering_manager' }
    ];

    // Section VI: Authorization Matrix
    currentY = checkPageBreak(currentY, 18 + 20 + (roles.length * 25) + 5);
    currentY = drawSectionHeader(currentY, 'VI. Authorization Matrix');

    const tWidth = contentWidth - 20;
    const colWidths = [125, 125, 90, tWidth - 340];
    const tableX = margin + 10;
    let tableY = currentY;

    // Table header
    doc.lineWidth(0.5);
    doc.rect(tableX, tableY, colWidths[0], 20).fillAndStroke('#e6e6e6', '#000000');
    doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold')
       .text('Role', tableX + 5, tableY + 6);
    
    doc.rect(tableX + colWidths[0], tableY, colWidths[1], 20).fillAndStroke('#e6e6e6', '#000000');
    doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold')
       .text('Approver Name', tableX + colWidths[0] + 5, tableY + 6);
    
    doc.rect(tableX + colWidths[0] + colWidths[1], tableY, colWidths[2], 20)
       .fillAndStroke('#e6e6e6', '#000000');
    doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold')
       .text('Signature', tableX + colWidths[0] + colWidths[1] + 5, tableY + 6);
    
    doc.rect(tableX + colWidths[0] + colWidths[1] + colWidths[2], tableY, colWidths[3], 20)
       .fillAndStroke('#e6e6e6', '#000000');
    doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold')
       .text('Date', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableY + 6);
    
    tableY += 20;

    // Table rows
    roles.forEach((row) => {
      const approval = approvals.find((a: any) => a.role === row.key);
      const rowHeight = 25;

      doc.rect(tableX, tableY, colWidths[0], rowHeight).stroke();
      doc.fontSize(8).font('Helvetica')
         .fillColor('#000000')
         .text(row.role, tableX + 5, tableY + 8, { width: colWidths[0] - 10 });

      doc.rect(tableX + colWidths[0], tableY, colWidths[1], rowHeight).stroke();
      doc.fontSize(8).font('Helvetica')
         .text(approval ? (approval.approver_name || 'System User') : '-', 
               tableX + colWidths[0] + 5, tableY + 8, { width: colWidths[1] - 10 });

      doc.rect(tableX + colWidths[0] + colWidths[1], tableY, colWidths[2], rowHeight).stroke();
      doc.fontSize(7).font('Helvetica')
         .text(approval ? 'Verified via PEAF System' : '-', 
               tableX + colWidths[0] + colWidths[1] + 5, tableY + 5, { width: colWidths[2] - 10 });

      doc.rect(tableX + colWidths[0] + colWidths[1] + colWidths[2], tableY, colWidths[3], rowHeight).stroke();
      doc.fontSize(8).font('Helvetica')
         .text(approval ? format(new Date(approval.created_at), 'MMM dd, yyyy') : '-', 
               tableX + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableY + 8);

      tableY += rowHeight;
    });
    currentY = tableY + 5;

    // Section VII: Administration & Procurement
    currentY = drawSectionHeader(currentY, 'VII. Administration & Procurement');
    currentY = drawField(currentY, 'PR Number', form.pr_number || 'Not Assigned');
    currentY = drawField(currentY, 'Budget Estimate', form.budget_estimate || 'Not Provided');
    currentY = drawField(currentY, 'Purchasing Status', form.purchasing_status || 'Pending');
    currentY += 5;

    // Section VIII: HSE Evaluation
    currentY = drawSectionHeader(currentY, 'VIII. HSE Evaluation');
    const hseApproval = approvals.find((a: any) => a.role === 'hse');
    const hseNotes = hseApproval 
      ? (hseApproval.notes || 'No notes provided.')
      : 'Waiting for HSE evaluation...';
    currentY = drawField(currentY, '', hseNotes, true);

    // Footer
    doc.fontSize(7)
       .font('Helvetica')
       .fillColor('#666666')
       .text(
         `Generated on ${format(new Date(), 'MMMM dd, yyyy HH:mm')} | PEAF System`,
         margin + 10,
         pageHeight - margin - 15,
         { align: 'center', width: contentWidth - 20 }
       );

    doc.end();
  } catch (error: any) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: error.message });
  }
};
