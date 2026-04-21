import { API_BASE_URL } from '../lib/api';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  User, 
  Briefcase, 
  Activity, 
  Paperclip, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Info,
  Upload,
  X
} from 'lucide-react';

const WORK_CATEGORIES = [
  'New Installation / Asset',
  'Machine / System Modification',
  'Capacity Expansion / Line Balancing',
  'Replacement (Obsolete / Breakdown)',
  'Civil Works (Building / Flooring / Drainage)',
  'Mechanical (Equipment / Piping / Structure)',
  'Electrical (Panel / Cabling / Power Distribution)',
  'Automation & Control (PLC / HMI / SCADA / Instrumentation)',
  'Utilities (Boiler, Compressor, HVAC, Water, WWTP)',
  'Safety Improvement / Compliance',
  'Other'
];

const TECHNICAL_IMPACTS = [
  'Electrical Load - Additional power requirement, panel upgrade, or new cabling',
  'Pneumatic System - Connection or load increase to compressed air system',
  'Water System - Process / clean water supply or discharge impact',
  'Production Capacity - Change in throughput, cycle time, or efficiency',
  'Product Quality - Potential impact to product specification or consistency',
  'Structural Integrity - Floor loading, wall penetration, or steel modification',
  'Layout Change - Equipment relocation or space utilization impact',
  'Control System - PLC, HMI, SCADA, or instrumentation modification',
  'Utility Consumption - Steam, gas, electricity, water usage increase/decrease',
  'Environmental Impact - Wastewater, emissions, noise, or dust generation',
  'Maintenance Requirement - New spare parts, maintenance skill, or frequency',
  'Safety Risk - New hazards introduced (mechanical, electrical, chemical, etc.)'
];

const SUPPORTING_DOCUMENTS = [
  'Technical Drawings (Layout / P&ID / Single Line Diagram)',
  'Equipment Datasheet / Specification',
  'Vendor Quotation (Minimum 2-3 suppliers if applicable)',
  'Technical Comparison Sheet (for vendor selection)',
  'Job Safety Analysis (JSA) / Risk Assessment',
  'Project Timeline (Schedule / Gantt Chart)',
  'Load Calculation (Electrical / Utility, if applicable)',
  'Cost Breakdown (CAPEX / OPEX estimation)',
  'Method Statement / Installation Procedure',
  'Layout Marking / Area Impact Sketch'
];

export default function CreateRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    applicant_name: user?.name || '',
    department: '',
    plant_location: '',
    submission_date: new Date().toISOString().split('T')[0],
    work_category: [] as string[],
    project_description: '',
    technical_impact: [] as string[],
    supporting_documents: {} as Record<string, any[]>, // Changed to object with document type as key
    pr_number: '',
    budget_estimate: '',
    purchasing_status: ''
  });

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [otherWorkCategory, setOtherWorkCategory] = useState('');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/departments`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setDepartments(data);
        }
      } catch (err) {
        console.error("Failed to fetch departments:", err);
      }
    };
    fetchDepartments();
  }, []);

  const handleCheckboxChange = (field: 'work_category' | 'technical_impact', value: string) => {
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const handleDocTypeToggle = (docType: string) => {
    if (selectedDocTypes.includes(docType)) {
      // Remove doc type and its files
      setSelectedDocTypes(prev => prev.filter(d => d !== docType));
      const newDocs = { ...formData.supporting_documents };
      delete newDocs[docType];
      setFormData({ ...formData, supporting_documents: newDocs });
    } else {
      // Add doc type
      setSelectedDocTypes(prev => [...prev, docType]);
    }
  };

  const handleFileUpload = async (docType: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingDoc(docType);
    setError('');

    try {
      const fileArray = Array.from(files);
      
      // Validate file sizes
      for (const file of fileArray) {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 10MB limit`);
        }
      }

      // Upload files
      const formData = new FormData();
      fileArray.forEach(file => formData.append('files', file));

      const res = await fetch(`${API_BASE_URL}/api/forms/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const result = await res.json();
      
      // Add uploaded files to the document type
      setFormData(prev => ({
        ...prev,
        supporting_documents: {
          ...prev.supporting_documents,
          [docType]: [...(prev.supporting_documents[docType] || []), ...result.files]
        }
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingDoc(null);
    }
  };

  const removeFile = (docType: string, fileIndex: number) => {
    setFormData(prev => ({
      ...prev,
      supporting_documents: {
        ...prev.supporting_documents,
        [docType]: prev.supporting_documents[docType].filter((_, i) => i !== fileIndex)
      }
    }));
  };

  const formatCurrency = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    // Format with dots
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatCurrency(rawValue);
    setFormData({ ...formData, budget_estimate: formatted });
  };

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    setError('');

    // Flatten supporting_documents from object to array
    const allFiles = Object.values(formData.supporting_documents).flat();
    const menuItems = selectedDocTypes.map(type => ({ isMenu: true, type }));

    let finalWorkCategory = [...formData.work_category];
    if (finalWorkCategory.includes('Other')) {
        finalWorkCategory = finalWorkCategory.map(c => c === 'Other' && otherWorkCategory.trim() ? `Other: ${otherWorkCategory}` : c);
    }

    // Prepend Rp. before sending to server
    const submitData = {
      ...formData,
      work_category: finalWorkCategory,
      supporting_documents: [...menuItems, ...allFiles],
      budget_estimate: formData.budget_estimate ? `Rp ${formData.budget_estimate}` : ''
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
        credentials: 'include'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit form');
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <Layout>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-5xl mx-auto pb-20"
      >
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create New Request</h1>
            <p className="text-slate-500 mt-1">Fill in the details for Project & Engineering Approval (PEAF).</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Document No Placeholder</span>
              <span className="text-sm font-mono font-medium text-slate-600">XX/PEAF/IFM/MFG-PE/XX/XXXX</span>
            </div>
            <Info className="h-4 w-4 text-slate-400" />
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmitClick} className="space-y-8">
          
          {/* Section 1: Applicant Information */}
          <motion.section variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-bold text-slate-800">I. APPLICANT INFORMATION</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Applicant Name</label>
                <input
                  type="text"
                  required
                  value={formData.applicant_name}
                  onChange={e => setFormData({...formData, applicant_name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department</label>
                <select
                  required
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 font-medium appearance-none"
                >
                  <option value="" disabled>Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plant / Location</label>
                <select
                  required
                  value={formData.plant_location}
                  onChange={e => setFormData({...formData, plant_location: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 font-medium appearance-none"
                >
                  <option value="" disabled>Select Plant / Location</option>
                  <option value="Plant Cikupa">Plant Cikupa</option>
                  <option value="Plant Cikokol">Plant Cikokol</option>
                  <option value="Plant Semarang">Plant Semarang</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submission Date</label>
                <input
                  type="date"
                  required
                  value={formData.submission_date}
                  onChange={e => setFormData({...formData, submission_date: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 font-medium"
                />
              </div>
              <div className="md:col-span-2 mt-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-4">Work Category</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {WORK_CATEGORIES.map((category) => (
                    <div key={category} className="flex flex-col gap-2">
                       <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                         <input
                           type="checkbox"
                           checked={formData.work_category.includes(category)}
                           onChange={() => handleCheckboxChange('work_category', category)}
                           className="h-5 w-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 transition-all"
                         />
                         <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{category}</span>
                       </label>
                       {category === 'Other' && formData.work_category.includes('Other') && (
                         <input
                           type="text"
                           value={otherWorkCategory}
                           onChange={(e) => setOtherWorkCategory(e.target.value)}
                           className="w-full px-4 py-2 mt-1 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                           placeholder="Please specify..."
                           required
                         />
                       )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section 2: Project Description */}
          <motion.section variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-bold text-slate-800">II. PROJECT DESCRIPTION & SCOPE OF WORK</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 italic mb-4">Provide clear project objectives, technical details, and business justification.</p>
              <textarea
                rows={6}
                required
                value={formData.project_description}
                onChange={e => setFormData({...formData, project_description: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900 font-medium resize-none"
                placeholder="Describe the project scope, objectives, and why it is needed..."
              />
            </div>
          </motion.section>

          {/* Section 3: Technical Impact */}
          <motion.section variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-bold text-slate-800">III. TECHNICAL IMPACT ANALYSIS</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 italic mb-4">Tick (✓) if applicable :</p>
              <div className="grid grid-cols-1 gap-3">
                {TECHNICAL_IMPACTS.map((impact) => (
                  <label key={impact} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.technical_impact.includes(impact)}
                      onChange={() => handleCheckboxChange('technical_impact', impact)}
                      className="mt-0.5 h-5 w-5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-all"
                    />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors leading-relaxed">{impact}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Section 4: Supporting Documents */}
          <motion.section variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
              <div className="bg-amber-600 p-2 rounded-lg">
                <Paperclip className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-bold text-slate-800">IV. REQUIRED SUPPORTING DOCUMENTS</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 italic mb-4">All documents must be attached :</p>
              <div className="grid grid-cols-1 gap-4">
                {SUPPORTING_DOCUMENTS.map((doc) => {
                  const isChecked = selectedDocTypes.includes(doc);
                  const files = formData.supporting_documents[doc] || [];
                  const isUploading = uploadingDoc === doc;
                  
                  return (
                    <div key={doc} className={`p-4 rounded-2xl border transition-all ${isChecked ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100 bg-white'}`}>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleDocTypeToggle(doc)}
                          className="h-5 w-5 rounded-md border-slate-300 text-amber-600 focus:ring-amber-500 transition-all"
                        />
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{doc}</span>
                      </label>
                      
                      <AnimatePresence>
                        {isChecked && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 pl-8 space-y-3">
                              {/* Upload Button */}
                              <div>
                                <input
                                  type="file"
                                  id={`file-${doc}`}
                                  multiple
                                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
                                  onChange={(e) => handleFileUpload(doc, e.target.files)}
                                  className="hidden"
                                />
                                <label
                                  htmlFor={`file-${doc}`}
                                  className={`inline-flex items-center gap-2 px-4 py-2 border border-amber-200 shadow-sm text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer ${
                                    isUploading 
                                      ? 'bg-amber-100 text-amber-600 cursor-wait' 
                                      : 'text-amber-700 bg-white hover:bg-amber-50'
                                  }`}
                                >
                                  {isUploading ? (
                                    <>
                                      <div className="h-4 w-4 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4" />
                                      Upload Document
                                    </>
                                  )}
                                </label>
                                <p className="text-xs text-slate-400 mt-1">PDF, Word, Excel, Images, ZIP • Max 10MB</p>
                              </div>

                              {/* Uploaded Files List */}
                              {files.length > 0 && (
                                <div className="space-y-2">
                                  {files.map((file: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between gap-3 p-2 bg-white border border-amber-100 rounded-lg group hover:border-amber-200">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <FileText className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium text-slate-900 truncate">{file.originalName}</p>
                                          <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => removeFile(doc, index)}
                                        className="flex-shrink-0 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* Section 7: Administration & Procurement */}
          <motion.section variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
              <div className="bg-slate-800 p-2 rounded-lg">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-bold text-slate-800">VII. ADMINISTRATION & PROCUREMENT</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">PR Number</label>
                <input
                  type="text"
                  value={formData.pr_number}
                  onChange={e => setFormData({...formData, pr_number: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all text-slate-900 font-medium"
                  placeholder="Enter PR number if available"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Budget Estimate</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold text-sm">Rp</span>
                  </div>
                  <input
                    type="text"
                    value={formData.budget_estimate}
                    onChange={handleBudgetChange}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all text-slate-900 font-medium"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Purchasing Status</label>
                <div className="flex flex-wrap gap-4">
                  {['Validated', 'Pending Technical Review'].map((status) => (
                    <label key={status} className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${formData.purchasing_status === status ? 'border-slate-800 bg-slate-800 text-white shadow-md' : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                      <input
                        type="radio"
                        name="purchasing_status"
                        value={status}
                        checked={formData.purchasing_status === status}
                        onChange={e => setFormData({...formData, purchasing_status: e.target.value})}
                        className="sr-only"
                      />
                      <span className="text-sm font-bold">{status}</span>
                      {formData.purchasing_status === status && <CheckCircle2 className="h-4 w-4" />}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Request
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" 
              onClick={() => setShowConfirmModal(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md overflow-hidden"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-50 p-4 rounded-2xl mb-6">
                  <FileText className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Submission</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                  Are you sure you want to submit this PEAF request? Please review all information before proceeding.
                </p>
                
                <div className="flex flex-col w-full gap-3">
                  <button
                    type="button"
                    onClick={confirmSubmit}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
                  >
                    Yes, Submit Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 py-3 rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
