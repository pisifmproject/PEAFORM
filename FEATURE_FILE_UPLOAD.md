# File Upload Feature Documentation

## Overview

PEAFORM system now supports complete file upload functionality for supporting documents. Users can upload, view, and download documents related to their PEAF requests.

## Features Implemented

### Backend (API)

#### 1. File Upload Endpoint
- **URL**: `POST /api/forms/upload`
- **Authentication**: Required
- **Content-Type**: `multipart/form-data`
- **Max Files**: 10 files per request
- **Max Size**: 10MB per file
- **Supported Types**: PDF, Word, Excel, Images, ZIP

**Request**:
```bash
POST /api/forms/upload
Content-Type: multipart/form-data

files: [File, File, ...]
```

**Response**:
```json
{
  "success": true,
  "files": [
    {
      "filename": "temp_document_1713168000000.pdf",
      "originalName": "document.pdf",
      "path": "C:/Users/netcom/Documents/ifm_septian/project/DocPEAForm/temp_document_1713168000000.pdf",
      "size": 1024000,
      "mimetype": "application/pdf"
    }
  ]
}
```

#### 2. File Download Endpoint
- **URL**: `GET /api/forms/download/:filename`
- **Authentication**: Required
- **Response**: File download

**Example**:
```bash
GET /api/forms/download/001_PEAF_IFM_MFG-PE_IV_2026_document.pdf
```

#### 3. Auto-Rename on Form Creation
When a form is created:
1. Document number is generated
2. Uploaded files are renamed with format: `{document_no}_{original_name}_{timestamp}.ext`
3. Database is updated with new file information

### Frontend (UI)

#### 1. FileUpload Component
**Location**: `frontend/src/components/FileUpload.tsx`

**Features**:
- ✅ Drag & drop support
- ✅ Multiple file selection
- ✅ File type validation
- ✅ File size validation
- ✅ Upload progress indication
- ✅ File list with remove option
- ✅ File type icons
- ✅ File size formatting

**Props**:
```typescript
interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  existingFiles?: UploadedFile[];
}
```

**Usage**:
```tsx
<FileUpload
  onFilesUploaded={(files) => setFormData({ ...formData, supporting_documents: files })}
  existingFiles={formData.supporting_documents}
/>
```

#### 2. CreateRequest Page Updates
**Location**: `frontend/src/pages/CreateRequest.tsx`

**Changes**:
- Replaced checkbox list with FileUpload component
- Updated form data structure to store file objects
- Integrated file upload before form submission

#### 3. RequestDetail Page Updates
**Location**: `frontend/src/pages/RequestDetail.tsx`

**Changes**:
- Display uploaded files with icons and sizes
- Add download button for each file
- Show file metadata (name, size)

## File Storage

### Directory Structure
```
C:\Users\netcom\Documents\ifm_septian\project\DocPEAForm\
├── 001_PEAF_IFM_MFG-PE_IV_2026_layout_drawing_1713168000000.pdf
├── 001_PEAF_IFM_MFG-PE_IV_2026_quotation_1713168001000.xlsx
└── 002_PEAF_IFM_MFG-PE_IV_2026_specification_1713168002000.pdf
```

### File Naming Convention
```
{document_no}_{original_filename}_{timestamp}.{extension}
```

**Example**:
- Document No: `001/PEAF/IFM/MFG-PE/IV/2026`
- Original File: `layout drawing.pdf`
- Result: `001_PEAF_IFM_MFG-PE_IV_2026_layout_drawing_1713168000000.pdf`

## Database Schema

Files are stored in `supporting_documents` field as JSONB array:

```json
[
  {
    "filename": "001_PEAF_IFM_MFG-PE_IV_2026_layout_drawing.pdf",
    "originalName": "layout drawing.pdf",
    "path": "C:/Users/netcom/Documents/ifm_septian/project/DocPEAForm/001_PEAF_IFM_MFG-PE_IV_2026_layout_drawing.pdf",
    "size": 1024000,
    "mimetype": "application/pdf"
  }
]
```

## User Workflow

### 1. Upload Files
1. User navigates to Create Request page
2. Scrolls to "Supporting Documents" section
3. Clicks "Choose Files" or drags files to upload area
4. Files are uploaded immediately
5. Upload progress is shown
6. Uploaded files appear in the list

### 2. Submit Form
1. User fills in all form fields
2. Clicks "Submit Request"
3. Backend generates document number
4. Files are renamed with document number
5. Form is saved with file information

### 3. View/Download Files
1. User opens request detail page
2. Scrolls to "Supporting Documents" section
3. Sees list of uploaded files with icons
4. Clicks "Download" button to download file
5. File opens in new tab or downloads

## Security

### Authentication
- ✅ All endpoints require authentication
- ✅ Cookie-based session management
- ✅ JWT token validation

### File Validation
- ✅ File type whitelist (PDF, Word, Excel, Images, ZIP)
- ✅ File size limit (10MB per file)
- ✅ Maximum file count (10 files per form)

### Access Control
- ✅ Users can only access their own files
- ✅ Approvers can access files for forms they need to approve
- ✅ Admin can access all files

### Storage Security
- ✅ Files stored outside web root
- ✅ Files served through authenticated endpoint
- ✅ No direct file access via URL

## Error Handling

### Upload Errors
```typescript
// File too large
"File {filename} exceeds 10MB limit"

// Too many files
"Maximum 10 files allowed"

// Invalid file type
"Invalid file type. Only PDF, Word, Excel, Images, and ZIP files are allowed."

// Upload failed
"Upload failed: {error message}"
```

### Download Errors
```typescript
// File not found
"File not found"

// Access denied
"Forbidden"
```

## Testing

### Manual Testing

#### 1. Upload Test
```bash
# Test single file upload
curl -X POST http://10.125.48.102:3002/api/forms/upload \
  -H "Cookie: token=YOUR_TOKEN" \
  -F "files=@/path/to/file.pdf"

# Test multiple files
curl -X POST http://10.125.48.102:3002/api/forms/upload \
  -H "Cookie: token=YOUR_TOKEN" \
  -F "files=@/path/to/file1.pdf" \
  -F "files=@/path/to/file2.xlsx"
```

#### 2. Download Test
```bash
curl -X GET http://10.125.48.102:3002/api/forms/download/filename.pdf \
  -H "Cookie: token=YOUR_TOKEN" \
  --output downloaded.pdf
```

### UI Testing

1. **Upload via Drag & Drop**
   - Drag files to upload area
   - Verify files appear in list
   - Verify upload progress

2. **Upload via File Picker**
   - Click "Choose Files"
   - Select multiple files
   - Verify files are uploaded

3. **Remove Files**
   - Hover over uploaded file
   - Click X button
   - Verify file is removed

4. **Submit Form**
   - Upload files
   - Fill form
   - Submit
   - Verify files are saved

5. **View Files**
   - Open request detail
   - Verify files are displayed
   - Verify file icons and sizes

6. **Download Files**
   - Click download button
   - Verify file downloads correctly

## Maintenance

### Backup
Include upload directory in backup:
```
C:\Users\netcom\Documents\ifm_septian\project\DocPEAForm
```

### Cleanup
Files are not automatically deleted. Manual cleanup needed for:
- Deleted forms
- Failed uploads
- Test files

### Monitoring
Check upload directory size regularly:
```powershell
Get-ChildItem "C:\Users\netcom\Documents\ifm_septian\project\DocPEAForm" | Measure-Object -Property Length -Sum
```

## Future Enhancements

### Potential Improvements
- [ ] File preview (PDF, images)
- [ ] Bulk download (ZIP all files)
- [ ] File versioning
- [ ] Automatic cleanup of orphaned files
- [ ] File compression
- [ ] Virus scanning
- [ ] Cloud storage integration (S3, Azure Blob)
- [ ] File sharing via link
- [ ] File comments/annotations

## Troubleshooting

### Upload Fails
1. Check file size (< 10MB)
2. Check file type (allowed types only)
3. Check network connection
4. Check backend logs
5. Verify upload directory exists and is writable

### Download Fails
1. Check file exists in upload directory
2. Check user has permission
3. Check backend logs
4. Verify file path in database

### Files Not Renamed
1. Check form creation succeeded
2. Check document number was generated
3. Check backend logs for rename errors
4. Verify file exists in upload directory

## Branch Information

- **Main Branch**: Production-ready code
- **Develop Branch**: File upload feature implementation
- **Feature Branch**: `develop`

## Deployment

### Backend
```bash
cd backend
npm install
npm run build
pm2 restart peaform-backend --update-env
```

### Frontend
```bash
cd frontend
npm install
npm run build
# Copy dist/* to C:\xampp\htdocs\peaform
```

## Documentation

- Backend API: `backend/FILE_UPLOAD.md`
- This Document: `FEATURE_FILE_UPLOAD.md`
- README: `README.md`

## Support

For issues or questions:
1. Check logs: `backend/logs/`
2. Check upload directory: `C:\Users\netcom\Documents\ifm_septian\project\DocPEAForm`
3. Review documentation
4. Contact development team
