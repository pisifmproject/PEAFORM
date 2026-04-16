# File Upload Documentation

## Overview

PEAFORM system supports file upload for supporting documents. Files are stored physically in the server and their paths are saved in the database.

## Configuration

### Upload Directory
Files are stored in: `C:\Users\netcom\Documents\ifm_septian\project\DocPEAForm`

This can be configured via environment variable:
```env
UPLOAD_DIR=C:/Users/netcom/Documents/ifm_septian/project/DocPEAForm
```

### File Naming Convention
Files are automatically renamed with the format:
```
{document_no}_{original_filename}_{timestamp}.{extension}
```

Example:
- Original: `layout_drawing.pdf`
- Document No: `001/PEAF/IFM/MFG-PE/IV/2026`
- Result: `001_PEAF_IFM_MFG-PE_IV_2026_layout_drawing_1713168000000.pdf`

## Allowed File Types

- **PDF**: `application/pdf`
- **Word**: `.doc`, `.docx`
- **Excel**: `.xls`, `.xlsx`
- **Images**: `.jpg`, `.jpeg`, `.png`
- **ZIP**: `.zip`

## File Size Limit

Maximum file size: **10 MB** per file

## API Endpoints

### 1. Upload Files

**Endpoint**: `POST /api/forms/upload`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body** (form-data):
- `files`: Multiple files (max 10 files)

**Response**:
```json
{
  "success": true,
  "files": [
    {
      "filename": "temp_layout_drawing_1713168000000.pdf",
      "originalName": "layout_drawing.pdf",
      "path": "C:/Users/netcom/Documents/ifm_septian/project/DocPEAForm/temp_layout_drawing_1713168000000.pdf",
      "size": 1024000,
      "mimetype": "application/pdf"
    }
  ]
}
```

### 2. Create Form with Documents

**Endpoint**: `POST /api/forms`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body**:
```json
{
  "applicant_name": "John Doe",
  "department": "Production",
  "plant_location": "Plant Cikupa",
  "submission_date": "2026-04-15",
  "work_category": ["New Installation / Asset"],
  "project_description": "Installation of new machine",
  "technical_impact": ["Utility (Electricity/Water/Air)"],
  "supporting_documents": [
    {
      "filename": "temp_layout_drawing_1713168000000.pdf",
      "originalName": "layout_drawing.pdf",
      "path": "C:/Users/netcom/Documents/ifm_septian/project/DocPEAForm/temp_layout_drawing_1713168000000.pdf",
      "size": 1024000,
      "mimetype": "application/pdf"
    }
  ],
  "pr_number": "PR-2026-001",
  "budget_estimate": "Rp 500.000.000",
  "purchasing_status": "Not Started"
}
```

**Response**:
```json
{
  "success": true,
  "id": "uuid-here",
  "document_no": "001/PEAF/IFM/MFG-PE/IV/2026"
}
```

**Note**: Files will be automatically renamed with the document number after form creation.

### 3. Download File

**Endpoint**: `GET /api/forms/download/:filename`

**Headers**:
```
Authorization: Bearer {token}
```

**Response**: File download

## Workflow

1. **User uploads files** via `/api/forms/upload`
   - Files are saved with temporary names
   - Server returns file information

2. **User submits form** via `/api/forms`
   - Include uploaded file information in `supporting_documents`
   - Server generates document number
   - Files are renamed with document number
   - Database stores file information

3. **User/Approver downloads files** via `/api/forms/download/:filename`
   - Authenticated users can download files
   - Files are served with original names

## Database Schema

Files are stored in `supporting_documents` field as JSONB:

```json
[
  {
    "filename": "001_PEAF_IFM_MFG-PE_IV_2026_layout_drawing_1713168000000.pdf",
    "originalName": "layout_drawing.pdf",
    "path": "C:/Users/netcom/Documents/ifm_septian/project/DocPEAForm/001_PEAF_IFM_MFG-PE_IV_2026_layout_drawing_1713168000000.pdf",
    "size": 1024000,
    "mimetype": "application/pdf"
  }
]
```

## Security

- ✅ Authentication required for all endpoints
- ✅ File type validation
- ✅ File size limit (10MB)
- ✅ Files stored outside web root
- ✅ Access control based on user role

## Error Handling

### Invalid File Type
```json
{
  "error": "Invalid file type. Only PDF, Word, Excel, Images, and ZIP files are allowed."
}
```

### File Too Large
```json
{
  "error": "File too large"
}
```

### File Not Found
```json
{
  "error": "File not found"
}
```

## Frontend Integration Example

```typescript
// 1. Upload files
const formData = new FormData();
files.forEach(file => {
  formData.append('files', file);
});

const uploadResponse = await fetch('/api/forms/upload', {
  method: 'POST',
  credentials: 'include',
  body: formData
});

const { files: uploadedFiles } = await uploadResponse.json();

// 2. Submit form with uploaded files
const formData = {
  // ... other form fields
  supporting_documents: uploadedFiles
};

const response = await fetch('/api/forms', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});

// 3. Download file
window.open(`/api/forms/download/${filename}`, '_blank');
```

## Maintenance

### Check Upload Directory
```bash
ls C:\Users\netcom\Documents\ifm_septian\project\DocPEAForm
```

### Clean Old Files (Manual)
Files are not automatically deleted. Manual cleanup may be needed for:
- Deleted forms
- Failed uploads
- Test files

### Backup
Include upload directory in backup strategy:
```
C:\Users\netcom\Documents\ifm_septian\project\DocPEAForm
```
