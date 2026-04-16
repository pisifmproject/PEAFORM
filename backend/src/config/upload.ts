import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Base upload directory from environment variable
const UPLOAD_BASE_DIR = process.env.UPLOAD_DIR || 'C:/Users/netcom/Documents/ifm_septian/project/DocPEAForm';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_BASE_DIR)) {
  fs.mkdirSync(UPLOAD_BASE_DIR, { recursive: true });
  console.log(`Created upload directory: ${UPLOAD_BASE_DIR}`);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_BASE_DIR);
  },
  filename: (req, file, cb) => {
    // Get document number from request body
    const documentNo = req.body.document_no || 'TEMP';
    
    // Clean document number (remove slashes for filename)
    const cleanDocNo = documentNo.replace(/\//g, '_');
    
    // Get original filename without extension
    const originalName = path.parse(file.originalname).name;
    
    // Get file extension
    const ext = path.extname(file.originalname);
    
    // Generate filename: documentNo_originalName_timestamp.ext
    const timestamp = Date.now();
    const filename = `${cleanDocNo}_${originalName}_${timestamp}${ext}`;
    
    cb(null, filename);
  }
});

// File filter - only allow specific file types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/zip',
    'application/x-zip-compressed'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Word, Excel, Images, and ZIP files are allowed.'));
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

// Helper function to get file path
export const getFilePath = (filename: string): string => {
  return path.join(UPLOAD_BASE_DIR, filename);
};

// Helper function to delete file
export const deleteFile = (filename: string): void => {
  const filePath = getFilePath(filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Helper function to rename file after document number is generated
export const renameUploadedFile = (oldFilename: string, documentNo: string, originalName: string): string => {
  const oldPath = getFilePath(oldFilename);
  
  if (!fs.existsSync(oldPath)) {
    throw new Error('File not found');
  }

  // Clean document number
  const cleanDocNo = documentNo.replace(/\//g, '_');
  
  // Get file extension
  const ext = path.extname(oldFilename);
  
  // Generate new filename
  const newFilename = `${cleanDocNo}_${originalName}${ext}`;
  const newPath = getFilePath(newFilename);
  
  // Rename file
  fs.renameSync(oldPath, newPath);
  
  return newFilename;
};

export { UPLOAD_BASE_DIR };
