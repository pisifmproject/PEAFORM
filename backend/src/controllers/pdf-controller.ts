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

    // Helper: Draw thin section header (SAP-style)
    const drawSectionHeader = (y: number, text: string): number => {
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
      
      // Calculate dynamic height
      const valueHeight = doc.heightOfString(value, { 
        width: textWidth, 
        lineGap: 2 
      });
      const boxHeight = Math.max(18, valueHeight + padding * 2);

      // Draw box
      doc.lineWidth(0.5);
      doc.rect(margin + 10, y, contentWidth - 20, boxHeight).stroke();

      if (fullWidth) {
        // Full width field (no label column)
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#000000')
           .text(value, margin + 15, y + padding, { 
             width: textWidth, 
             align: 'justify',
             lineGap: 2
           });
      } else {
        // Grid layout: label | value
        // Draw vertical separator
        doc.moveTo(margin + 10 + labelWidth, y)
           .lineTo(margin + 10 + labelWidth, y + boxHeight)
           .stroke();

        // Label
        doc.fontSize(8)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text(label, margin + 15, y + padding, { width: labelWidth - 10 });

        // Value
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

      doc.lineWidth(0.5);
      doc.rect(margin + 10, y, contentWidth - 20, boxHeight).stroke();

      // Draw vertical separator
      doc.moveTo(margin + 10 + labelWidth, y)
         .lineTo(margin + 10 + labelWidth, y + boxHeight)
         .stroke();

      // Label
      doc.fontSize(8)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text(label, margin + 15, y + padding, { width: labelWidth - 10 });

      // Bullet list
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

    let currentY = margin + 10;
    
    // Company header
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('PT INDOFOOD FRITOLAY MAKMUR', margin + 10, currentY, { 
         align: 'center', 
         width: contentWidth - 20 
       });
    currentY += 20;
    
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('PROJECT & ENGINEERING APPROVAL FORM', margin + 10, currentY, { 
         align: 'center', 
         width: contentWidth - 20 
       });
    currentY += 15;
    
    doc.fontSize(10)
       .font('Helvetica')
       .text('(PEAF)', margin + 10, currentY, { 
         align: 'center', 
         width: contentWidth - 20 
       });
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
             margin + 250, currentY + 7);
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
    currentY = drawSectionHeader(currentY, 'III. Technical Impact Analysis');
    const sectionIIIStartY = currentY;

    // Technical Impact (Left column)
    const technicalImpacts = form.technical_impact as string[];
    const impactText = technicalImpacts && technicalImpacts.length > 0 
      ? technicalImpacts.map(item => `• ${item}`).join('\n')
      : 'No technical impacts selected.';
    
    const halfWidth = (contentWidth - 30) / 2;
    const impactHeight = doc.heightOfString(impactText, { 
      width: halfWidth - 10, 
      lineGap: 2 
    });

    // Supporting Documents (Right column)
    const supportingDocs = form.supporting_documents as any[];
    const docsText = supportingDocs && supportingDocs.length > 0
      ? supportingDocs.map((d: any, i: number) => `${i + 1}. ${d.originalName}`).join('\n')
      : 'No supporting documents uploaded.';
    
    const docsHeight = doc.heightOfString(docsText, { 
      width: halfWidth - 10, 
      lineGap: 2 
    });

    const maxHeight = Math.max(impactHeight, docsHeight) + 16;

    // Draw left box (Technical Impact)
    doc.lineWidth(0.5);
    doc.rect(margin + 10, currentY, halfWidth, maxHeight).stroke();
    doc.fontSize(8)
       .font('Helvetica')
       .text(impactText, margin + 15, currentY + 8, { 
         width: halfWidth - 10, 
         lineGap: 2 
       });

    // Draw right box header
    doc.rect(margin + 15 + halfWidth, sectionIIIStartY - 18, halfWidth, 18)
       .fillAndStroke('#e6e6e6', '#000000');
    doc.fillColor('#000000')
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('IV. SUPPORTING DOCUMENTS', margin + 20 + halfWidth, sectionIIIStartY - 13);

    // Draw right box (Supporting Documents)
    doc.rect(margin + 15 + halfWidth, currentY, halfWidth, maxHeight).stroke();
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#000000')
       .text(docsText, margin + 20 + halfWidth, currentY + 8, { 
         width: halfWidth - 10, 
         lineGap: 2 
       });

    currentY += maxHeight + 5;

    // Check if we need a new page
    if (currentY > pageHeight - 200) {
      doc.addPage();
      currentY = margin + 10;
      doc.lineWidth(0.7);
      doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2)).stroke();
    }

    // ===== PAGE 2 (if needed) or continue =====

    // Section V: Engineering Verification
    currentY = drawSectionHeader(currentY, 'V. Engineering Verification');
    const peApproval = approvals.find((a: any) => a.role === 'engineering_manager');
    const engNotes = peApproval 
      ? `${peApproval.notes || 'No notes provided.'}\n\nStatus: ${peApproval.status}`
      : 'Waiting for Engineering Manager verification...';
    currentY = drawField(currentY, '', engNotes, true);
    currentY += 5;

    // Section VI: Authorization Matrix
    currentY = drawSectionHeader(currentY, 'VI. Authorization Matrix');

    const roles = [
      { role: 'Head of Department', key: 'hod' },
      { role: 'HSE', key: 'hse' },
      { role: 'Factory Manager', key: 'factory_manager' },
      { role: 'Project & Engineering Manager', key: 'engineering_manager' }
    ];

    const colWidths = [130, 130, 80, 175];
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
         .text(approval ? '✓ Verified' : '-', 
               tableX + colWidths[0] + colWidths[1] + 5, tableY + 8);

      doc.rect(tableX + colWidths[0] + colWidths[1] + colWidths[2], tableY, colWidths[3], rowHeight).stroke();
      doc.fontSize(8).font('Helvetica')
         .text(approval ? format(new Date(approval.created_at), 'MMM dd, yyyy') : '-', 
               tableX + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableY + 8);

      tableY += rowHeight;
    });
    currentY = tableY + 5;

    // Check if we need a new page
    if (currentY > pageHeight - 150) {
      doc.addPage();
      currentY = margin + 10;
      doc.lineWidth(0.7);
      doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2)).stroke();
    }

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
