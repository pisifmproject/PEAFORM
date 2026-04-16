import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate.js';
import * as formService from '../services/form-service.js';
import * as userService from '../services/user-service.js';
import * as notificationService from '../services/notification-service.js';
import { renameUploadedFile } from '../config/upload.js';

export const createForm = async (req: AuthRequest, res: Response) => {
  try {
    const {
      applicant_name,
      department,
      plant_location,
      submission_date,
      work_category,
      project_description,
      technical_impact,
      supporting_documents,
      pr_number,
      budget_estimate,
      purchasing_status,
    } = req.body;

    const form = await formService.createForm({
      applicant_id: req.user!.id,
      applicant_name,
      department,
      plant_location,
      submission_date: new Date(submission_date),
      work_category,
      project_description,
      technical_impact,
      supporting_documents: [], // Will be updated after renaming files
      pr_number,
      budget_estimate,
      purchasing_status,
    });

    // Rename uploaded files with document number
    const renamedDocuments = [];
    if (supporting_documents && Array.isArray(supporting_documents)) {
      for (const doc of supporting_documents) {
        try {
          const newFilename = renameUploadedFile(
            doc.filename,
            form.document_no,
            doc.originalName.replace(/\.[^/.]+$/, '') // Remove extension from original name
          );
          
          renamedDocuments.push({
            filename: newFilename,
            originalName: doc.originalName,
            path: doc.path.replace(doc.filename, newFilename),
            size: doc.size,
            mimetype: doc.mimetype,
          });
        } catch (error) {
          console.error('Error renaming file:', error);
          // Keep original filename if rename fails
          renamedDocuments.push(doc);
        }
      }
    }

    // Update form with renamed documents
    await formService.updateFormDocuments(form.id, renamedDocuments);

    // Notify HODs at the same plant
    await notificationService.notifyApprovers(
      'hod',
      plant_location,
      `New PEAF request requires your approval (${form.document_no})`,
      form.id
    );

    res.json({ success: true, id: form.id, document_no: form.document_no });
  } catch (error: any) {
    console.error('Create form error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getForms = async (req: AuthRequest, res: Response) => {
  try {
    const user = await userService.findUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const forms = await formService.getFormsByUser(user.id, user.role, user.plant || undefined);

    res.json(forms);
  } catch (error: any) {
    console.error('Get forms error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getFormById = async (req: AuthRequest, res: Response) => {
  try {
    const form = await formService.getFormById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const user = await userService.findUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Access control
    if (user.role === 'user' && form.applicant_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (['hod', 'hse', 'factory_manager'].includes(user.role)) {
      if (form.plant_location !== user.plant) {
        return res.status(403).json({ error: 'Forbidden: This request is for a different plant.' });
      }
    }

    const approvals = await formService.getFormApprovals(req.params.id);

    res.json({ form, approvals });
  } catch (error: any) {
    console.error('Get form by id error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const approveForm = async (req: AuthRequest, res: Response) => {
  try {
    const { status, notes } = req.body;

    const form = await formService.getFormById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const user = await userService.findUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Plant check for specific roles
    if (['hod', 'hse', 'factory_manager'].includes(user.role)) {
      if (form.plant_location !== user.plant) {
        return res.status(403).json({ error: 'You can only approve requests for your assigned plant.' });
      }
    }

    // Determine the role for this approval
    let approval_role = user.role;
    if (user.role === 'admin') {
      if (form.status === 'pending_hod') approval_role = 'hod';
      else if (form.status === 'pending_hse') approval_role = 'hse';
      else if (form.status === 'pending_factory_manager') approval_role = 'factory_manager';
      else if (form.status === 'pending_engineering_manager') approval_role = 'engineering_manager';
    }

    await formService.createApproval({
      form_id: req.params.id,
      role: approval_role,
      approver_id: user.id,
      status,
      notes,
    });

    if (status === 'Rejected') {
      await formService.updateFormStatus(form.id, 'rejected');

      // Notify applicant
      await notificationService.createNotification({
        user_id: form.applicant_id,
        message: `Your PEAF request (${form.document_no}) was rejected by ${user.name}.`,
        form_id: form.id,
      });
    } else if (status === 'Approved' || status === 'Approved with Conditions') {
      const current_status = form.status;

      // Notify applicant of progress
      await notificationService.createNotification({
        user_id: form.applicant_id,
        message: `Your PEAF request (${form.document_no}) was ${status.toLowerCase()} by ${user.name}.`,
        form_id: form.id,
      });

      let next_role = '';
      let new_status = '';

      if (current_status === 'pending_hod') {
        new_status = 'pending_hse';
        next_role = 'hse';
      } else if (current_status === 'pending_hse') {
        new_status = 'pending_factory_manager';
        next_role = 'factory_manager';
      } else if (current_status === 'pending_factory_manager') {
        new_status = 'pending_engineering_manager';
        next_role = 'engineering_manager';
      } else if (current_status === 'pending_engineering_manager') {
        new_status = 'approved';

        // Notify applicant of final approval
        await notificationService.createNotification({
          user_id: form.applicant_id,
          message: `Your PEAF request (${form.document_no}) is fully approved!`,
          form_id: form.id,
        });
      }

      await formService.updateFormStatus(form.id, new_status);

      if (next_role) {
        await notificationService.notifyApprovers(
          next_role,
          form.plant_location,
          `New PEAF request requires your approval (${form.document_no})`,
          form.id
        );
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Approve form error:', error);
    res.status(500).json({ error: error.message });
  }
};
