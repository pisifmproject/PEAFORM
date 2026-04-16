import { Router } from 'express';
import * as formController from '../controllers/form-controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { upload } from '../config/upload.js';

const router = Router();

// Upload endpoint - handle multiple files
router.post('/upload', authenticate, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.json({ success: true, files: uploadedFiles });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download endpoint
router.get('/download/:filename', authenticate, (req, res) => {
  try {
    const { getFilePath } = require('../config/upload.js');
    const filePath = getFilePath(req.params.filename);
    
    res.download(filePath, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(404).json({ error: 'File not found' });
      }
    });
  } catch (error: any) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, formController.createForm);
router.get('/', authenticate, formController.getForms);
router.get('/:id', authenticate, formController.getFormById);
router.post('/:id/approve', authenticate, formController.approveForm);

export default router;
