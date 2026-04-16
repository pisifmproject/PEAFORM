import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowLeft, 
  FileText, 
  User, 
  Briefcase, 
  MapPin, 
  Calendar,
  Settings,
  ShieldCheck,
  FileCheck,
  History,
  AlertCircle,
  ChevronRight,
  Info,
  Eye,
  Download,
  X
} from 'lucide-react';

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Approval state
  const [approvalStatus, setApprovalStatus] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // File preview state
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetch(`/api/forms/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch request');
        return res.json();
      })
      .then(data => setData(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleViewFile = (file: any) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const handleDownloadFile = (filename: string) => {
    window.open(`/api/forms/download/${filename}`, '_blank');
  };

  const getFilePreviewUrl = (file: any) => {
    return `/api/forms/download/${file.filename}`;
  };

  const canPreviewFile = (mimetype: string) => {
    return mimetype.includes('pdf') || mimetype.includes('image');
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalStatus) return setError('Please select an approval status');
    
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/forms/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: approvalStatus, notes: approvalNotes })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit approval');
      }

      // Refresh data
      const updatedRes = await fetch(`/api/forms/${id}`);
      const updatedData = await updatedRes.json();
      setData(updatedData);
      setApprovalStatus('');
      setApprovalNotes('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-10 w-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-500">Loading request details...</span>
        </div>
      </Layout>
    );
  }

  if (error && !data) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-700">
          <AlertCircle className="h-6 w-6 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      </Layout>
    );
  }

  const { form, approvals } = data;
  const hseApproval = approvals.find((a: any) => a.role === 'hse');
  const peApproval = approvals.find((a: any) => a.role === 'engineering_manager');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': 
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
            Approved
          </span>
        );
      case 'rejected': 
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold bg-rose-50 text-rose-700 border border-rose-100">
            <XCircle className="w-4 h-4" />
            Rejected
          </span>
        );
      default: 
        let label = 'Pending';
        if (status === 'pending_hod') label = 'Pending Dept. Head';
        if (status === 'pending_hse') label = 'Pending HSE';
        if (status === 'pending_factory_manager') label = 'Pending Factory Mgr';
        if (status === 'pending_engineering_manager') label = 'Pending PE Mgr';
        
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold bg-amber-50 text-amber-700 border border-amber-100">
            <Clock className="w-4 h-4" />
            {label}
          </span>
        );
    }
  };

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

  const canApprove = checkCanApprove();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-5xl mx-auto space-y-8 pb-20"
      >
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</span>
            {getStatusBadge(form.status)}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          {/* Form Header */}
          <div className="bg-slate-900 px-8 py-10 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-blue-400 font-bold tracking-widest text-xs uppercase">Project & Engineering Approval Form</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">PEAF Request Details</h1>
              <div className="mt-6 flex flex-wrap items-center gap-6 text-slate-400 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Document No:</span>
                  <span className="font-mono text-blue-400 font-bold">{form.document_no || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Submitted on {format(new Date(form.submission_date), 'MMMM dd, yyyy')}</span>
                </div>
              </div>
            </div>
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          </div>

          <div className="p-8 space-y-12">
            {/* I. APPLICANT INFORMATION */}
            <motion.section variants={sectionVariants}>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">I. Applicant Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <InfoItem label="Applicant Name" value={form.applicant_name} icon={<User className="w-4 h-4" />} />
                <InfoItem label="Department" value={form.department} icon={<Briefcase className="w-4 h-4" />} />
                <InfoItem label="Plant / Location" value={form.plant_location} icon={<MapPin className="w-4 h-4" />} />
              </div>
              <div className="mt-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Work Category</h3>
                <div className="flex flex-wrap gap-2">
                  {form.work_category.map((cat: string) => (
                    <span key={cat} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* II. PROJECT DESCRIPTION */}
            <motion.section variants={sectionVariants}>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">II. Project Description & Scope</h2>
              </div>
              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">{form.project_description}</p>
              </div>
            </motion.section>

            {/* III & IV. ANALYSIS & DOCUMENTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.section variants={sectionVariants}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">III. Technical Impact</h2>
                </div>
                <div className="space-y-2">
                  {form.technical_impact.length > 0 ? form.technical_impact.map((impact: string) => (
                    <div key={impact} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium text-slate-700">{impact}</span>
                    </div>
                  )) : (
                    <p className="text-sm text-slate-400 italic">No technical impacts selected.</p>
                  )}
                </div>
              </motion.section>

              <motion.section variants={sectionVariants}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <FileCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">IV. Supporting Documents</h2>
                </div>
                <div className="space-y-2">
                  {form.supporting_documents && form.supporting_documents.length > 0 ? form.supporting_documents.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{doc.originalName}</p>
                          <p className="text-xs text-slate-500">{(doc.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canPreviewFile(doc.mimetype) && (
                          <button
                            type="button"
                            onClick={() => handleViewFile(doc)}
                            className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(doc.filename)}
                          className="px-3 py-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </button>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-slate-400 italic">No supporting documents uploaded.</p>
                  )}
                </div>
              </motion.section>
            </div>

            {/* V. ENGINEERING VERIFICATION */}
            <motion.section variants={sectionVariants} className="pt-8 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">V. Engineering Verification</h2>
              </div>
              
              {form.status === 'pending_engineering_manager' && user?.role === 'engineering_manager' ? (
                <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-700 mb-6">
                    <Info className="w-4 h-4" />
                    <p className="text-sm font-bold">Verification Required</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Technical Evaluation Notes</label>
                      <textarea
                        rows={4}
                        value={approvalNotes}
                        onChange={e => setApprovalNotes(e.target.value)}
                        className="w-full p-4 bg-white border border-blue-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm"
                        placeholder="Enter detailed technical evaluation..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-4">Final Decision</label>
                      <div className="flex flex-wrap gap-4">
                        {['Approved', 'Approved with Conditions', 'Rejected'].map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setApprovalStatus(status)}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all border ${
                              approvalStatus === status 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' 
                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={handleApprove}
                        disabled={submitting || !approvalStatus}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {submitting ? 'Processing...' : 'Submit Verification'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : peApproval ? (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evaluation Notes</span>
                    <p className="mt-2 text-sm text-slate-700 italic leading-relaxed">{peApproval.notes || 'No notes provided.'}</p>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                    <span className={`text-sm font-bold ${peApproval.status === 'Rejected' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {peApproval.status}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <p className="text-sm text-slate-500 font-medium italic">Waiting for Engineering Manager verification...</p>
                </div>
              )}
            </motion.section>

            {/* VI. AUTHORIZATION TABLE */}
            <motion.section variants={sectionVariants}>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">VI. Authorization Matrix</h2>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approver Name</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Digital Signature</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { role: 'Head of Department (User)', key: 'hod' },
                      { role: 'HSE', key: 'hse' },
                      { role: 'Factory Manager', key: 'factory_manager' },
                      { role: 'Project & Engineering Manager', key: 'engineering_manager' }
                    ].map((row) => {
                      const app = approvals.find((a: any) => a.role === row.key);
                      return (
                        <tr key={row.key} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-slate-700">{row.role}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{app ? app.approver_name || 'System User' : '-'}</td>
                          <td className="px-6 py-4">
                            {app ? (
                              <div className="flex items-center gap-2 text-blue-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-xs font-serif italic font-bold">Verified via PEAF System</span>
                              </div>
                            ) : (
                              <span className="text-slate-300 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {app ? format(new Date(app.created_at), 'MMM dd, yyyy') : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.section>

            {/* VII. ADMINISTRATION */}
            <motion.section variants={sectionVariants}>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">VII. Administration & Procurement</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <InfoItem label="PR Number" value={form.pr_number || 'Not Assigned'} />
                <InfoItem label="Budget Estimate" value={form.budget_estimate || 'Not Provided'} />
                <InfoItem label="Purchasing Status" value={form.purchasing_status || 'Pending'} />
              </div>
            </motion.section>

            {/* VIII. HSE NOTES */}
            <motion.section variants={sectionVariants} className="pt-8 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-50 p-2 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">VIII. HSE Evaluation</h2>
              </div>
              
              {form.status === 'pending_hse' && user?.role === 'hse' ? (
                <div className="bg-emerald-50/50 p-8 rounded-3xl border border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-700 mb-6">
                    <Info className="w-4 h-4" />
                    <p className="text-sm font-bold">HSE Input Required</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">HSE Evaluation Notes</label>
                      <textarea
                        rows={4}
                        value={approvalNotes}
                        onChange={e => setApprovalNotes(e.target.value)}
                        className="w-full p-4 bg-white border border-emerald-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all text-sm"
                        placeholder="Enter safety evaluation notes..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-4">Approval Status</label>
                      <div className="flex flex-wrap gap-4">
                        {['Approved', 'Approved with Conditions', 'Rejected'].map((status) => {
                          if ((status === 'Approved' || status === 'Approved with Conditions') && !approvalNotes.trim()) return null;
                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setApprovalStatus(status)}
                              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all border ${
                                approvalStatus === status 
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200' 
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                              }`}
                            >
                              {status}
                            </button>
                          );
                        })}
                      </div>
                      {!approvalNotes.trim() && (
                        <p className="text-xs text-rose-500 font-bold mt-3 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Please enter evaluation notes to enable approval options.
                        </p>
                      )}
                    </div>
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={handleApprove}
                        disabled={submitting || !approvalStatus}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {submitting ? 'Processing...' : 'Submit HSE Notes'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : hseApproval ? (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">HSE Notes</span>
                  <p className="mt-2 text-sm text-slate-700 italic leading-relaxed whitespace-pre-wrap">{hseApproval.notes || 'No notes provided.'}</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <p className="text-sm text-slate-500 font-medium italic">Waiting for HSE evaluation...</p>
                </div>
              )}
            </motion.section>

            {/* DETAILED LOG */}
            {approvals.length > 0 && (
              <motion.section variants={sectionVariants} className="pt-12 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <History className="w-5 h-5 text-slate-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Approval History Log</h2>
                </div>
                <div className="space-y-6">
                  {approvals.map((approval: any, idx: number) => (
                    <div key={approval.id} className="relative pl-8 border-l-2 border-slate-100 pb-6 last:pb-0">
                      <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white shadow-sm ${
                        approval.status === 'Approved' || approval.status === 'Approved with Conditions' ? 'bg-emerald-500' :
                        approval.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'
                      }`} />
                      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{approval.role.replace('_', ' ')}</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                            <span className={`text-sm font-bold ${
                              approval.status === 'Rejected' ? 'text-rose-600' : 'text-emerald-600'
                            }`}>{approval.status}</span>
                          </div>
                          <span className="text-xs font-medium text-slate-400">{format(new Date(approval.created_at), 'MMM dd, yyyy • HH:mm')}</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed italic">"{approval.notes || 'No comments provided.'}"</p>
                        <div className="mt-4 flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {approval.approver_name?.charAt(0) || 'S'}
                          </div>
                          <span className="text-xs font-bold text-slate-700">{approval.approver_name || 'System User'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Generic Approval Form (Fallback) */}
            {canApprove && !((form.status === 'pending_hse' && user?.role === 'hse') || (form.status === 'pending_engineering_manager' && user?.role === 'engineering_manager')) && (
              <motion.section variants={sectionVariants} className="pt-12 border-t border-slate-100">
                <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Submit Approval Decision</h2>
                  <form onSubmit={handleApprove} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Notes / Reason</label>
                      <textarea
                        rows={4}
                        required
                        value={approvalNotes}
                        onChange={e => setApprovalNotes(e.target.value)}
                        className="w-full p-4 bg-white border border-blue-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm"
                        placeholder="Enter your approval or rejection notes..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-4">Decision</label>
                      <div className="flex flex-wrap gap-4">
                        {['Approved', 'Approved with Conditions', 'Rejected'].map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setApprovalStatus(status)}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all border ${
                              approvalStatus === status 
                                ? status === 'Rejected' ? 'bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-200' : 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={submitting || !approvalStatus}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {submitting ? 'Processing...' : 'Submit Decision'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.section>
            )}
          </div>
        </div>
      </motion.div>

      {/* File Preview Modal */}
      <AnimatePresence>
        {showPreview && previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" 
              onClick={() => setShowPreview(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{previewFile.originalName}</h3>
                    <p className="text-xs text-slate-500">{(previewFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadFile(previewFile.filename)}
                    className="px-3 py-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 overflow-auto bg-slate-100 p-4">
                {previewFile.mimetype.includes('pdf') ? (
                  <iframe
                    src={getFilePreviewUrl(previewFile)}
                    className="w-full h-full min-h-[600px] bg-white rounded-lg shadow-inner"
                    title={previewFile.originalName}
                  />
                ) : previewFile.mimetype.includes('image') ? (
                  <div className="flex items-center justify-center h-full">
                    <img
                      src={getFilePreviewUrl(previewFile)}
                      alt={previewFile.originalName}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <FileText className="h-16 w-16 text-slate-300 mb-4" />
                    <p className="text-sm font-medium text-slate-600 mb-2">Preview not available for this file type</p>
                    <p className="text-xs text-slate-400 mb-4">Please download the file to view it</p>
                    <button
                      onClick={() => handleDownloadFile(previewFile.filename)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download File
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

function InfoItem({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}
