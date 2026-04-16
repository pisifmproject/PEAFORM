# PEAFORM Approval Flow Documentation

## Overview
PEAFORM menggunakan sistem approval bertingkat dengan validasi ketat untuk memastikan setiap request diproses sesuai hierarki dan plant yang tepat.

---

## Approval Workflow

### 1. **User Submit Request**
- User membuat request dengan memilih **Plant Location** (Plant Cikupa, Plant Cikokol, atau Plant Semarang)
- Status awal: `pending_hod`
- Notifikasi dikirim ke **semua HOD di plant yang sama**

### 2. **Department Head (HOD) Approval**
**Validasi:**
- ✅ HOD hanya bisa melihat request dari **plant mereka sendiri**
- ✅ HOD dari plant lain **tidak bisa melihat** request ini
- ✅ Status form harus `pending_hod`
- ✅ HOD tidak bisa approve jika sudah pernah approve sebelumnya

**Action:**
- Jika **Approved/Approved with Conditions**: Status berubah ke `pending_hse`, notifikasi ke HSE di plant yang sama
- Jika **Rejected**: Status berubah ke `rejected`, workflow berhenti

### 3. **HSE Approval**
**Validasi:**
- ✅ HSE hanya bisa melihat request dari **plant mereka sendiri**
- ✅ Status form harus `pending_hse` (HOD sudah approve)
- ✅ HSE **tidak bisa approve** jika HOD belum approve
- ✅ HSE tidak bisa approve jika sudah pernah approve sebelumnya

**Action:**
- Jika **Approved/Approved with Conditions**: Status berubah ke `pending_factory_manager`, notifikasi ke Factory Manager di plant yang sama
- Jika **Rejected**: Status berubah ke `rejected`, workflow berhenti

### 4. **Factory Manager Approval**
**Validasi:**
- ✅ Factory Manager hanya bisa melihat request dari **plant mereka sendiri**
- ✅ Status form harus `pending_factory_manager` (HSE sudah approve)
- ✅ Factory Manager **tidak bisa approve** jika HSE belum approve
- ✅ Factory Manager tidak bisa approve jika sudah pernah approve sebelumnya

**Action:**
- Jika **Approved/Approved with Conditions**: Status berubah ke `pending_engineering_manager`, notifikasi ke Engineering Manager
- Jika **Rejected**: Status berubah ke `rejected`, workflow berhenti

### 5. **Engineering Manager Approval (Final)**
**Validasi:**
- ✅ Status form harus `pending_engineering_manager` (Factory Manager sudah approve)
- ✅ Engineering Manager **tidak bisa approve** jika Factory Manager belum approve
- ✅ Engineering Manager tidak bisa approve jika sudah pernah approve sebelumnya

**Action:**
- Jika **Approved/Approved with Conditions**: 
  - Status berubah ke `approved` (FINAL)
  - **BROADCAST** notifikasi ke **semua approver di plant yang sama**:
    - HOD di plant tersebut
    - HSE di plant tersebut
    - Factory Manager di plant tersebut
  - Notifikasi ke applicant bahwa request fully approved
- Jika **Rejected**: Status berubah ke `rejected`, workflow berhenti

---

## Access Control Rules

### Plant-Based Access
| Role | Access Rule |
|------|-------------|
| **User** | Hanya bisa melihat request yang mereka buat sendiri |
| **HOD** | Hanya bisa melihat request dari plant mereka |
| **HSE** | Hanya bisa melihat request dari plant mereka |
| **Factory Manager** | Hanya bisa melihat request dari plant mereka |
| **Engineering Manager** | Bisa melihat semua request dari semua plant |
| **Admin** | Bisa melihat dan approve semua request |

### Approval Stage Validation
- ❌ **HSE tidak bisa approve** jika status masih `pending_hod`
- ❌ **Factory Manager tidak bisa approve** jika status masih `pending_hse`
- ❌ **Engineering Manager tidak bisa approve** jika status masih `pending_factory_manager`
- ❌ **Approver tidak bisa approve 2x** untuk request yang sama

---

## Status Flow Diagram

```
User Submit
    ↓
pending_hod (HOD Plant A only)
    ↓ [Approved]
pending_hse (HSE Plant A only)
    ↓ [Approved]
pending_factory_manager (Factory Mgr Plant A only)
    ↓ [Approved]
pending_engineering_manager (Engineering Manager)
    ↓ [Approved]
approved (BROADCAST to all Plant A approvers)
```

**Rejected at any stage:**
```
Any Stage → [Rejected] → rejected (END)
```

---

## Notification System

### 1. **New Request Created**
- Notifikasi ke: **Semua HOD di plant yang sama**

### 2. **HOD Approved**
- Notifikasi ke: **Semua HSE di plant yang sama**
- Notifikasi ke: **Applicant** (progress update)

### 3. **HSE Approved**
- Notifikasi ke: **Semua Factory Manager di plant yang sama**
- Notifikasi ke: **Applicant** (progress update)

### 4. **Factory Manager Approved**
- Notifikasi ke: **Engineering Manager**
- Notifikasi ke: **Applicant** (progress update)

### 5. **Engineering Manager Approved (FINAL)**
- Notifikasi ke: **Semua HOD di plant yang sama**
- Notifikasi ke: **Semua HSE di plant yang sama**
- Notifikasi ke: **Semua Factory Manager di plant yang sama**
- Notifikasi ke: **Applicant** (final approval)

### 6. **Rejected at Any Stage**
- Notifikasi ke: **Applicant** (rejection notice)

---

## Error Messages

| Error | Meaning |
|-------|---------|
| `You can only approve requests for your assigned plant.` | User mencoba approve request dari plant lain |
| `You have already approved this request.` | User sudah pernah approve request ini |
| `You cannot approve this request at this stage. Please wait for the previous approver.` | User mencoba approve sebelum atasan sebelumnya approve |
| `Forbidden: This request is for a different plant.` | User mencoba melihat request dari plant lain |

---

## Example Scenario

**Scenario:** User Satu (Plant Cikupa) membuat request

1. ✅ **HOD Plant Cikupa** melihat request → Approve
2. ❌ **HOD Plant Cikokol** tidak bisa melihat request ini
3. ✅ **HSE Plant Cikupa** melihat request → Approve
4. ❌ **HSE Plant Semarang** tidak bisa melihat request ini
5. ✅ **Factory Manager Plant Cikupa** melihat request → Approve
6. ✅ **Engineering Manager** melihat request → Approve (FINAL)
7. 📢 **BROADCAST**: Notifikasi dikirim ke:
   - HOD Plant Cikupa
   - HSE Plant Cikupa
   - Factory Manager Plant Cikupa
   - User Satu (applicant)

---

## Technical Implementation

### Backend Validation (`form-controller.ts`)
```typescript
// 1. Plant check
if (['hod', 'hse', 'factory_manager'].includes(user.role)) {
  if (form.plant_location !== user.plant) {
    return res.status(403).json({ error: 'You can only approve requests for your assigned plant.' });
  }
}

// 2. Already approved check
const userAlreadyApproved = existingApprovals.some(
  (a: any) => a.approver_id === user.id && (a.status === 'Approved' || a.status === 'Approved with Conditions')
);

// 3. Workflow stage check
const canApprove = 
  (form.status === 'pending_hod' && (user.role === 'hod' || user.role === 'admin')) ||
  (form.status === 'pending_hse' && (user.role === 'hse' || user.role === 'admin')) ||
  (form.status === 'pending_factory_manager' && (user.role === 'factory_manager' || user.role === 'admin')) ||
  (form.status === 'pending_engineering_manager' && (user.role === 'engineering_manager' || user.role === 'admin'));
```

### Frontend Validation (`RequestDetail.tsx`)
```typescript
const checkCanApprove = () => {
  if (!user || user.role === 'user') return false;
  if (form.status === 'rejected' || form.status === 'approved') return false;
  if (approvals.some((a: any) => a.approver_id === user.id && a.status === 'Approved')) return false;
  if (user.role === 'admin') return true;
  if (form.status === 'pending_hod' && user.role === 'hod') return true;
  if (form.status === 'pending_hse' && user.role === 'hse') return true;
  if (form.status === 'pending_factory_manager' && user.role === 'factory_manager') return true;
  if (form.status === 'pending_engineering_manager' && user.role === 'engineering_manager') return true;
  return false;
};
```

---

## Summary

✅ **Plant Isolation**: Setiap plant hanya melihat request mereka sendiri  
✅ **Sequential Approval**: Atasan berikutnya tidak bisa approve sebelum atasan sebelumnya  
✅ **No Duplicate Approval**: User tidak bisa approve 2x untuk request yang sama  
✅ **Final Broadcast**: Ketika Engineering Manager approve, semua approver di plant tersebut mendapat notifikasi  
✅ **Role-Based Access**: Setiap role hanya bisa approve di stage yang sesuai  

---

**Last Updated:** April 16, 2026  
**Version:** 1.0  
**Branch:** develop
