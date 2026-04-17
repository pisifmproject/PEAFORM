import React, { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  UserPlus,
  Shield,
  MapPin,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  UserCheck,
  UserX,
} from "lucide-react";

const ROLES = [
  "admin",
  "user",
  "hod",
  "hse",
  "factory_manager",
  "engineering_manager",
];
const PLANTS = ["Plant Cikupa", "Plant Cikokol", "Plant Semarang"];

const ROLE_DISPLAY_NAMES: Record<string, string> = {
  admin: "ADMINISTRATOR",
  user: "USER",
  hod: "DEPARTMENT HEAD",
  hse: "HEALTH, SAFETY & ENVIRONMENT",
  factory_manager: "FACTORY MANAGER",
  engineering_manager: "PROJECT & ENGINEERING MANAGER",
};

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [pendingRegistrations, setPendingRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchPendingRegistrations();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users", { credentials: "include" });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRegistrations = async () => {
    try {
      const res = await fetch("/api/pending-registrations", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPendingRegistrations(data);
      }
    } catch (err: any) {
      console.error("Failed to fetch pending registrations:", err);
    }
  };

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const approvers = users.filter((u) =>
      ["hod", "hse", "factory_manager", "engineering_manager"].includes(u.role),
    ).length;
    const regular = total - admins - approvers;
    return { total, admins, approvers, regular };
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.nik?.toLowerCase().includes(q),
    );
  }, [users, searchQuery]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
        credentials: "include",
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to update role");

      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePlantChange = async (userId: string, newPlant: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/plant`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plant: newPlant }),
        credentials: "include",
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to update plant");

      setUsers(
        users.map((u) => (u.id === userId ? { ...u, plant: newPlant } : u)),
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
      )
    )
      return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }

      setUsers(users.filter((u) => u.id !== userId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApproveRegistration = async (id: string, name: string) => {
    if (!confirm(`Approve registration for "${name}"?`)) return;

    try {
      const res = await fetch(`/api/pending-registrations/${id}/approve`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to approve registration");

      setPendingRegistrations(pendingRegistrations.filter((p) => p.id !== id));
      fetchUsers(); // Refresh user list
      alert(`Registration for ${name} approved successfully!`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRejectRegistration = async (id: string, name: string) => {
    if (!confirm(`Reject registration for "${name}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/pending-registrations/${id}/reject`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to reject registration");

      setPendingRegistrations(pendingRegistrations.filter((p) => p.id !== id));
      alert(`Registration for ${name} rejected.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (user?.role !== "admin") {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-rose-50 p-6 rounded-full mb-4">
            <AlertCircle className="h-12 w-12 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
          <p className="mt-2 text-slate-500 max-w-xs">
            You do not have administrative permissions to view this panel.
          </p>
        </div>
      </Layout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
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
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Admin Panel
            </h1>
            <p className="text-slate-500 mt-1">
              Manage system users, roles, and global configurations.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard
            label="Total Users"
            value={stats.total}
            icon={<Users className="w-6 h-6 text-blue-600" />}
            color="bg-blue-50"
          />
          <AdminStatCard
            label="Administrators"
            value={stats.admins}
            icon={<Shield className="w-6 h-6 text-indigo-600" />}
            color="bg-indigo-50"
          />
          <AdminStatCard
            label="Approvers"
            value={stats.approvers}
            icon={<UserCheck className="w-6 h-6 text-emerald-600" />}
            color="bg-emerald-50"
          />
          <AdminStatCard
            label="Regular Users"
            value={stats.regular}
            icon={<UserPlus className="w-6 h-6 text-slate-600" />}
            color="bg-slate-50"
          />
        </div>

        {/* Search & Management */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name, NIK, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium"
            />
          </div>
        </div>

        {/* Pending Registrations */}
        {pendingRegistrations.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-2 rounded-lg">
                <UserPlus className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Pending Registrations</h3>
                <p className="text-sm text-slate-600">Review and approve new user registrations</p>
              </div>
            </div>
            <div className="space-y-3">
              {pendingRegistrations.map((pending) => (
                <div
                  key={pending.id}
                  className="bg-white p-4 rounded-xl border border-amber-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center text-base font-bold text-amber-700">
                      {pending.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{pending.name}</p>
                      <p className="text-xs text-slate-500">
                        {pending.email} • NIK: {pending.nik}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveRegistration(pending.id, pending.name)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectRegistration(pending.id, pending.name)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2"
                    >
                      <UserX className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-10 w-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-sm font-bold text-slate-500">
                Loading user data...
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      User Information
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      NIK
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Plant Assignment
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <motion.tr
                      key={u.id}
                      variants={itemVariants}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
                            {u.name?.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">
                              {u.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-slate-600">
                          {u.nik}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative min-w-[140px]">
                          <select
                            value={u.role}
                            onChange={(e) =>
                              handleRoleChange(u.id, e.target.value)
                            }
                            disabled={u.id === user.id}
                            className="w-full pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 cursor-pointer"
                          >
                            {ROLES.map((role) => (
                              <option key={role} value={role}>
                                {ROLE_DISPLAY_NAMES[role] ||
                                  role.replace("_", " ").toUpperCase()}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                            <MoreVertical className="h-3 w-3 text-slate-400" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {["hod", "hse", "factory_manager"].includes(u.role) ? (
                          <div className="relative min-w-[140px]">
                            <select
                              value={u.plant || ""}
                              onChange={(e) =>
                                handlePlantChange(u.id, e.target.value)
                              }
                              className="w-full pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                            >
                              <option value="">Select Plant</option>
                              {PLANTS.map((plant) => (
                                <option key={plant} value={plant}>
                                  {plant}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                              <MapPin className="h-3 w-3 text-slate-400" />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic font-medium">
                            Not Applicable
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.id !== user.id ? (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                            YOU
                          </span>
                        )}
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

function AdminStatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
      }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5"
    >
      <div className={`${color} p-4 rounded-2xl`}>{icon}</div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{value}</h3>
      </div>
    </motion.div>
  );
}
