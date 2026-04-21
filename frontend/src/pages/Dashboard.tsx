import { API_BASE_URL } from '../lib/api';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  ArrowUpDown, 
  Search,
  Plus,
  ChevronRight,
  BarChart3,
  AlertCircle,
  MapPin,
  Download
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlant, setFilterPlant] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const plants = ['Plant Cikupa', 'Plant Cikokol', 'Plant Semarang'];

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/forms`, { credentials: 'include' })
      .then(res => {
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        if (Array.isArray(data)) {
          setForms(data);
        } else {
          console.error('Expected array of forms, got:', data);
          setForms([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = forms.length;
    const approved = forms.filter(f => f.status === 'approved').length;
    const rejected = forms.filter(f => f.status === 'rejected').length;
    const pending = total - approved - rejected;
    return { total, approved, rejected, pending };
  }, [forms]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': 
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'rejected': 
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
            <XCircle className="w-3.5 h-3.5" />
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
            <Clock className="w-3.5 h-3.5" />
            {label}
          </span>
        );
    }
  };

  const filteredAndSortedForms = useMemo(() => {
    let result = [...forms];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f => 
        (f.document_no?.toLowerCase().includes(q)) ||
        (f.applicant_name?.toLowerCase().includes(q)) ||
        (f.department?.toLowerCase().includes(q)) ||
        (f.project_description?.toLowerCase().includes(q)) ||
        (f.plant_location?.toLowerCase().includes(q))
      );
    }

    // Filter Status
    if (filterStatus === 'approved') {
      result = result.filter(f => f.status === 'approved');
    } else if (filterStatus === 'pending') {
      result = result.filter(f => f.status !== 'approved' && f.status !== 'rejected');
    } else if (filterStatus === 'rejected') {
      result = result.filter(f => f.status === 'rejected');
    }

    // Filter Plant (Admin Only)
    if (user?.role === 'admin' && filterPlant !== 'all') {
      result = result.filter(f => f.plant_location === filterPlant);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'document_no') {
        const docA = a.document_no || '';
        const docB = b.document_no || '';
        return docA.localeCompare(docB);
      }
      return 0;
    });

    return result;
  }, [forms, filterStatus, filterPlant, sortBy, searchQuery]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage and track all PEAF requests in real-time.</p>
          </div>
          <Link
            to="/create-request"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Create New Request
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Total Requests" 
            value={stats.total} 
            icon={<FileText className="w-6 h-6 text-blue-600" />}
            color="bg-blue-50"
          />
          <StatCard 
            label="Pending Approval" 
            value={stats.pending} 
            icon={<Clock className="w-6 h-6 text-amber-600" />}
            color="bg-amber-50"
          />
          <StatCard 
            label="Fully Approved" 
            value={stats.approved} 
            icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
            color="bg-emerald-50"
          />
          <StatCard 
            label="Rejected" 
            value={stats.rejected} 
            icon={<XCircle className="w-6 h-6 text-rose-600" />}
            color="bg-rose-50"
          />
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by document no, applicant, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Plant Filter (Admin Only) */}
            {user?.role === 'admin' && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 min-w-[160px]">
                <MapPin className="h-4 w-4 text-slate-400" />
                <select
                  value={filterPlant}
                  onChange={(e) => setFilterPlant(e.target.value)}
                  className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer w-full"
                >
                  <option value="all">All Plants</option>
                  {plants.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 min-w-[160px]">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer w-full"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 min-w-[160px]">
              <ArrowUpDown className="h-4 w-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer w-full"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="document_no">Document No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-10 w-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-sm font-bold text-slate-500">Loading requests...</span>
            </div>
          ) : filteredAndSortedForms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                <AlertCircle className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No requests found</h3>
              <p className="text-slate-500 max-w-xs mt-1">Try adjusting your filters or search query to find what you're looking for.</p>
              <button 
                onClick={() => {setFilterStatus('all'); setSearchQuery('');}}
                className="mt-6 text-blue-600 font-bold text-sm hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Document No</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applicant</th>
                    {user?.role === 'admin' && (
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plant</th>
                    )}
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAndSortedForms.map((form) => (
                    <motion.tr 
                      key={form.id}
                      variants={itemVariants}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono font-bold text-slate-900">
                          {form.document_no || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {form.applicant_name?.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{form.applicant_name}</span>
                        </div>
                      </td>
                      {user?.role === 'admin' && (
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">{form.plant_location || '-'}</span>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{form.department}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">
                          {form.submission_date ? format(new Date(form.submission_date), 'MMM dd, yyyy') : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(form.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {form.status === 'approved' && (
                            <button
                              onClick={() => window.open(`${API_BASE_URL}/api/forms/${form.id}/pdf`, '_blank')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                            >
                              <Download className="w-3.5 h-3.5" />
                              PDF
                            </button>
                          )}
                          <Link 
                            to={`/request/${form.id}`}
                            className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            View Details
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </Layout>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
      }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5"
    >
      <div className={`${color} p-4 rounded-2xl`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{value}</h3>
      </div>
    </motion.div>
  );
}
