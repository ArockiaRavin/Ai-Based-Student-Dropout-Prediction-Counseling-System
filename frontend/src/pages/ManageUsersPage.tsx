import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Loader2,
  History,
  Lock,
  Mail,
  User as UserIcon,
  Building,
  ArrowLeft,
  Edit2,
  KeyRound,
  Check,
  Eye,
  RefreshCw,
  Copy,
  Calendar,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { api } from '../api';
import { User, AuditLogItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { DepartmentSelect } from '../components/DepartmentSelect';

export const ManageUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Active Tab: 'users' | 'add' | 'audit'
  const [activeTab, setActiveTab] = useState<'users' | 'add' | 'audit'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'deactivated'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Administrator' | 'Counselor' | 'Viewer'>('all');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedEmailId, setCopiedEmailId] = useState<number | null>(null);

  // New user form state
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'Administrator' | 'Counselor' | 'Viewer'>('Counselor');
  const [newDepartment, setNewDepartment] = useState('Computer Science & Engineering');
  const [newStatus, setNewStatus] = useState<'active' | 'pending'>('active');
  const [adminVerificationPassword, setAdminVerificationPassword] = useState('');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // View User Details state
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Edit user state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'pending' | 'deactivated'>('active');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Admin promotion verification modal state
  const [promotionPending, setPromotionPending] = useState<{
    userId: number;
    userName: string;
    targetRole: 'Administrator' | 'Counselor' | 'Viewer';
  } | null>(null);
  const [promotionAdminPassword, setPromotionAdminPassword] = useState('');
  const [isVerifyingPromotion, setIsVerifyingPromotion] = useState(false);

  // Delete user confirmation modal state
  const [deletePendingUser, setDeletePendingUser] = useState<User | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const [userRes, settingsRes] = await Promise.all([
        api.getUsers(),
        api.getSettings().catch(() => ({ audit_logs: [] }))
      ]);
      setUsers(userRes.users || []);
      setAuditLogs(settingsRes.audit_logs || []);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to load user management data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyEmail = (email: string, id: number) => {
    navigator.clipboard.writeText(email);
    setCopiedEmailId(id);
    setTimeout(() => setCopiedEmailId(null), 2000);
  };

  const handleStatusChange = async (userId: number, newStat: 'active' | 'pending' | 'deactivated') => {
    try {
      await api.updateUserStatus(userId, newStat);
      setStatusMessage({ type: 'success', text: `User status successfully updated to '${newStat}'.` });
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, status: newStat } : u)));
      if (viewingUser && viewingUser.id === userId) {
        setViewingUser(prev => (prev ? { ...prev, status: newStat } : null));
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update user status.' });
    }
  };

  const initiateRoleChange = (userId: number, role: 'Administrator' | 'Counselor' | 'Viewer') => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    if (role === 'Administrator') {
      setPromotionPending({ userId, userName: targetUser.name, targetRole: role });
      setPromotionAdminPassword('');
    } else {
      executeRoleChange(userId, role);
    }
  };

  const executeRoleChange = async (
    userId: number,
    role: 'Administrator' | 'Counselor' | 'Viewer',
    adminPw?: string
  ) => {
    try {
      setIsVerifyingPromotion(true);
      await api.updateUserRole(userId, role, adminPw);
      setStatusMessage({ type: 'success', text: `User role successfully assigned as '${role}'.` });
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role } : u)));
      if (viewingUser && viewingUser.id === userId) {
        setViewingUser(prev => (prev ? { ...prev, role } : null));
      }
      setPromotionPending(null);
      setPromotionAdminPassword('');
      loadData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update user role.' });
    } finally {
      setIsVerifyingPromotion(false);
    }
  };

  const handleStartEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditDepartment(user.department);
    setEditStatus(user.status || 'active');
  };

  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSavingEdit(true);
    setStatusMessage(null);
    try {
      const res = await api.updateUserDetails(editingUser.id, {
        name: editName.trim(),
        department: editDepartment,
        status: editStatus
      });
      setStatusMessage({ type: 'success', text: `User profile for '${editName}' successfully updated.` });
      setUsers(prev =>
        prev.map(u =>
          u.id === editingUser.id
            ? { ...u, name: editName.trim(), department: editDepartment, status: editStatus }
            : u
        )
      );
      if (viewingUser && viewingUser.id === editingUser.id) {
        setViewingUser(prev =>
          prev ? { ...prev, name: editName.trim(), department: editDepartment, status: editStatus } : null
        );
      }
      setEditingUser(null);
      loadData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update user details.' });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deletePendingUser) return;
    setIsDeletingUser(true);
    try {
      await api.deleteUser(deletePendingUser.id);
      setStatusMessage({
        type: 'success',
        text: `User account '${deletePendingUser.name}' was permanently deleted.`
      });
      setUsers(prev => prev.filter(u => u.id !== deletePendingUser.id));
      if (viewingUser && viewingUser.id === deletePendingUser.id) {
        setViewingUser(null);
      }
      setDeletePendingUser(null);
      loadData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete user account.' });
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword) {
      setStatusMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (newRole === 'Administrator' && !adminVerificationPassword) {
      setStatusMessage({
        type: 'error',
        text: 'Administrator password confirmation is strictly required to provision an Administrator account.'
      });
      return;
    }

    setIsSubmittingNew(true);
    setStatusMessage(null);
    try {
      const usernameGenerated =
        newUsername.trim() ||
        newEmail
          .split('@')[0]
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '_');

      await api.createUser({
        username: usernameGenerated,
        name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword,
        role: newRole,
        department: newDepartment,
        status: newStatus,
        admin_password: newRole === 'Administrator' ? adminVerificationPassword : undefined
      });

      setStatusMessage({
        type: 'success',
        text: `User account for '${newName.trim()}' (${newRole}) created successfully in database.`
      });

      // Reset form
      setNewName('');
      setNewEmail('');
      setNewUsername('');
      setNewPassword('');
      setAdminVerificationPassword('');
      setNewRole('Counselor');
      setNewStatus('active');
      setActiveTab('users');
      loadData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to create user account.' });
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.username && u.username.toLowerCase().includes(query)) ||
      (u.department && u.department.toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.status === 'active') ||
      (statusFilter === 'pending' && u.status === 'pending') ||
      (statusFilter === 'deactivated' && u.status === 'deactivated');

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const adminCount = users.filter(u => u.role === 'Administrator').length;
  const counselorCount = users.filter(u => u.role === 'Counselor').length;
  const viewerCount = users.filter(u => u.role === 'Viewer').length;
  const pendingCount = users.filter(u => u.status === 'pending').length;
  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || roleFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setRoleFilter('all');
  };

  return (
    <div className="w-full min-h-full pb-16 bg-[#070B18]">
      {/* Outer Container with responsive padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-white font-medium">User Management</span>
        </nav>

        {/* Primary Page Header */}
        <div className="bg-[#0B1224] rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_25px_rgba(99,102,241,0.4)] shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  User Management
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {users.length} Total Accounts
                </span>
                {pendingCount > 0 && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                    <Clock className="w-3 h-3" /> {pendingCount} Pending Review
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Administrators can manage accounts and permissions, provision new staff, assign department roles, and audit security events.
              </p>
            </div>
          </div>

          {/* Action Buttons: Refresh & Back to Dashboard */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5"
              title="Refresh User List"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('add')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create User</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#0B1224] rounded-2xl border border-white/10 p-4 shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Administrators</div>
              <div className="text-xl font-bold text-white mt-0.5">{adminCount}</div>
            </div>
          </div>

          <div className="bg-[#0B1224] rounded-2xl border border-white/10 p-4 shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Counselors</div>
              <div className="text-xl font-bold text-white mt-0.5">{counselorCount}</div>
            </div>
          </div>

          <div className="bg-[#0B1224] rounded-2xl border border-white/10 p-4 shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Viewers</div>
              <div className="text-xl font-bold text-white mt-0.5">{viewerCount}</div>
            </div>
          </div>

          <div className="bg-[#0B1224] rounded-2xl border border-white/10 p-4 shadow-lg flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              pendingCount > 0
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}>
              {pendingCount > 0 ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pending Review</div>
              <div className="text-xl font-bold text-white mt-0.5">{pendingCount}</div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'users'
                ? 'bg-[#0B1224] text-white border border-white/10 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>User Accounts</span>
            <span className="text-xs px-2 py-0.2 rounded-full bg-white/10 text-slate-300 font-mono">
              {users.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'add'
                ? 'bg-[#0B1224] text-white border border-white/10 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Provision New User</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'audit'
                ? 'bg-[#0B1224] text-white border border-white/10 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <History className="w-4 h-4 text-purple-400" />
            <span>Security Audit Trail</span>
            <span className="text-xs px-2 py-0.2 rounded-full bg-white/10 text-slate-300 font-mono">
              {auditLogs.length}
            </span>
          </button>
        </div>

        {/* Global Status Message Banner */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3 transition-all shadow-lg ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/80 border border-rose-500/40 text-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            )}
            <span className="flex-1 font-medium">{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: USER ACCOUNTS TABLE */}
        {activeTab === 'users' && (
          <div className="bg-[#0B1224] rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
            {/* Search and Filters Bar */}
            <div className="p-4 sm:p-5 border-b border-white/10 bg-white/[0.01] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by user name, email, department..."
                  className="w-full bg-[#070B18] border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-md text-slate-400 hover:text-white absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters & Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Role Filter */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Filter className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Role:</span>
                  <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value as any)}
                    className="bg-[#070B18] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                  >
                    <option value="all">All Roles ({users.length})</option>
                    <option value="Administrator">Administrator ({adminCount})</option>
                    <option value="Counselor">Counselor ({counselorCount})</option>
                    <option value="Viewer">Viewer ({viewerCount})</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Status:</span>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as any)}
                    className="bg-[#070B18] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="pending">Pending Only</option>
                    <option value="deactivated">Deactivated Only</option>
                  </select>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-2.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* User Table (Desktop & Laptop View) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#070B18]/70 border-b border-white/10 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Academic Department</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4">Last Active</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-[#0B1224]">
                  {isLoading && users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-400">
                        <Loader2 className="w-7 h-7 animate-spin mx-auto text-cyan-400 mb-2" />
                        <span>Loading institutional users from database...</span>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <UserX className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                        <p className="text-sm font-semibold text-slate-300">No matching user accounts found</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Try adjusting your search query or role/status filters.
                        </p>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-3 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white"
                          >
                            Reset All Filters
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => {
                      const isSelf = currentUser?.id === u.id;
                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          {/* Column 1: User */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-md ${
                                  u.role === 'Administrator'
                                    ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500'
                                    : u.role === 'Counselor'
                                    ? 'bg-gradient-to-tr from-cyan-600 to-teal-500'
                                    : 'bg-gradient-to-tr from-purple-600 to-indigo-500'
                                }`}
                              >
                                {u.name
                                  ? u.name
                                      .split(' ')
                                      .map(n => n[0])
                                      .join('')
                                      .slice(0, 2)
                                      .toUpperCase()
                                  : 'U'}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-white flex items-center gap-1.5 truncate">
                                  <span>{u.name}</span>
                                  {isSelf && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono truncate">
                                  @{u.username || u.email.split('@')[0]}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Column 2: Email */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
                              <span className="truncate max-w-[220px]" title={u.email}>
                                {u.email}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyEmail(u.email, u.id)}
                                className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                                title="Copy Email"
                              >
                                {copiedEmailId === u.id ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Column 3: Role */}
                          <td className="py-3.5 px-4">
                            <select
                              value={u.role}
                              disabled={isSelf}
                              onChange={e => initiateRoleChange(u.id, e.target.value as any)}
                              className={`px-2.5 py-1 rounded-xl text-xs font-bold border focus:outline-none transition-colors cursor-pointer disabled:cursor-not-allowed ${
                                u.role === 'Administrator'
                                  ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40'
                                  : u.role === 'Counselor'
                                  ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40'
                                  : 'bg-purple-500/20 text-purple-200 border-purple-500/40'
                              }`}
                              title={isSelf ? 'You cannot alter your own clearance level' : 'Select role clearance'}
                            >
                              <option value="Administrator" className="bg-[#0B1224] text-white">
                                Administrator
                              </option>
                              <option value="Counselor" className="bg-[#0B1224] text-white">
                                Counselor
                              </option>
                              <option value="Viewer" className="bg-[#0B1224] text-white">
                                Viewer
                              </option>
                            </select>
                          </td>

                          {/* Column 4: Academic Department */}
                          <td className="py-3.5 px-4 text-slate-300">
                            <span
                              className="truncate max-w-[200px] block text-xs"
                              title={u.department || 'Not Assigned'}
                            >
                              {u.department || 'General Administration'}
                            </span>
                          </td>

                          {/* Column 5: Account Status */}
                          <td className="py-3.5 px-4">
                            {u.status === 'pending' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                <Clock className="w-3.5 h-3.5 shrink-0" /> Pending Review
                              </span>
                            ) : u.status === 'deactivated' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                <UserX className="w-3.5 h-3.5 shrink-0" /> Deactivated
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Active
                              </span>
                            )}
                          </td>

                          {/* Column 6: Last Active */}
                          <td className="py-3.5 px-4 text-slate-400 text-xs font-mono">
                            {u.last_login ? u.last_login.split('T')[0] : 'Never'}
                          </td>

                          {/* Column 7: Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Details Button */}
                              <button
                                type="button"
                                onClick={() => setViewingUser(u)}
                                className="p-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors"
                                title="View full user profile"
                              >
                                <Eye className="w-4 h-4 text-cyan-400" />
                              </button>

                              {/* Edit User Button */}
                              <button
                                type="button"
                                onClick={() => handleStartEdit(u)}
                                className="p-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors"
                                title="Edit user details"
                              >
                                <Edit2 className="w-4 h-4 text-indigo-400" />
                              </button>

                              {/* Approve Button if Pending */}
                              {u.status === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(u.id, 'active')}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all flex items-center gap-1"
                                  title="Approve this account"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                              )}

                              {/* Deactivate Button if Active */}
                              {u.status === 'active' && !isSelf && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(u.id, 'deactivated')}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all"
                                  title="Deactivate account"
                                >
                                  Deactivate
                                </button>
                              )}

                              {/* Reactivate Button if Deactivated */}
                              {u.status === 'deactivated' && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(u.id, 'active')}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-all"
                                  title="Reactivate account"
                                >
                                  Reactivate
                                </button>
                              )}

                              {/* Delete User Button */}
                              {!isSelf && (
                                <button
                                  type="button"
                                  onClick={() => setDeletePendingUser(u)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                  title="Delete user account"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div className="p-4 border-t border-white/10 bg-[#070B18]/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Showing {filteredUsers.length} of {users.length} institutional accounts.</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/[0.05] text-white text-xs font-semibold flex items-center gap-2 transition-all"
                >
                  <ArrowLeft className="w-4 h-4 text-cyan-400" />
                  <span>Back to Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROVISION NEW USER FORM */}
        {activeTab === 'add' && (
          <div className="bg-[#0B1224] rounded-2xl border border-white/10 shadow-xl p-6 sm:p-8 max-w-3xl mx-auto">
            <div className="mb-6 pb-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Provision New User Account
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Create verified Administrator, Counselor, or Viewer accounts with assigned departments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Users
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Account Clearance Role <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['Administrator', 'Counselor', 'Viewer'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewRole(r)}
                      className={`p-3.5 rounded-2xl border text-left text-xs font-semibold transition-all ${
                        newRole === r
                          ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                          : 'border-white/10 bg-[#070B18] text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{r}</span>
                        {newRole === r && <Check className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal mt-1 leading-snug">
                        {r === 'Administrator'
                          ? 'Full system control, users & thresholds'
                          : r === 'Counselor'
                          ? 'Students, risk predictions & sessions'
                          : 'Institutional reports & dashboards'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enhanced Re-auth if Administrator is chosen */}
              {newRole === 'Administrator' && (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4 text-cyan-400" />
                    <span>Administrator Re-Authentication Required</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Granting Administrator clearance provides full administrative rights. Please enter your active administrator password to authorize this action:
                  </p>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={adminVerificationPassword}
                      onChange={e => setAdminVerificationPassword(e.target.value)}
                      placeholder="Enter your Administrator password"
                      className="w-full bg-[#070B18] border border-indigo-500/50 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>
              )}

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="e.g. Dr. Samantha Rao"
                      className="w-full bg-[#070B18] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Institutional Email <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      placeholder="e.g. samantha.rao@eduretain.edu"
                      className="w-full bg-[#070B18] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
                    />
                  </div>
                </div>
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Username <span className="text-slate-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    placeholder="Leave blank to auto-generate"
                    className="w-full bg-[#070B18] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Initial Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-[#070B18] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
                    />
                  </div>
                </div>
              </div>

              {/* Department */}
              <DepartmentSelect
                value={newDepartment}
                onChange={setNewDepartment}
                label="Academic Department"
                required
              />

              {/* Account Status on creation */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Initial Account Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="radio"
                      name="newStatus"
                      checked={newStatus === 'active'}
                      onChange={() => setNewStatus('active')}
                      className="accent-indigo-500"
                    />
                    <span>Active Immediately</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="radio"
                      name="newStatus"
                      checked={newStatus === 'pending'}
                      onChange={() => setNewStatus('pending')}
                      className="accent-amber-500"
                    />
                    <span>Pending Administrative Approval</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-lg disabled:opacity-60 flex items-center gap-2"
                >
                  {isSubmittingNew ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Provisioning Account...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Provision {newRole} Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: SECURITY AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="bg-[#0B1224] rounded-2xl border border-white/10 shadow-xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-400" />
                  Security &amp; Administrative Audit Trail
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time cryptographic audit log of user lifecycle changes, account status updates, and role promotions.
                </p>
              </div>
              <button
                type="button"
                onClick={loadData}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
              >
                Refresh Logs
              </button>
            </div>

            <div className="border border-white/10 rounded-2xl overflow-hidden overflow-x-auto max-h-[60vh]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#070B18] border-b border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px] bg-[#0B1224]">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-sans">
                        No security audit logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                        <td className="py-2.5 px-4 font-semibold text-white whitespace-nowrap">{log.user_name}</td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-cyan-300">
                          {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                        </td>
                        <td className="py-2.5 px-4 text-slate-300 font-sans text-xs">{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: VIEW USER DETAILS */}
      {viewingUser &&
        createPortal(
          <div
            onClick={() => setViewingUser(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-[#0B1224] text-white rounded-3xl border border-white/15 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white ${
                      viewingUser.role === 'Administrator'
                        ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500'
                        : viewingUser.role === 'Counselor'
                        ? 'bg-gradient-to-tr from-cyan-600 to-teal-500'
                        : 'bg-gradient-to-tr from-purple-600 to-indigo-500'
                    }`}
                  >
                    {viewingUser.name ? viewingUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{viewingUser.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">User ID: #{viewingUser.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingUser(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3.5 text-xs">
                <div className="p-3 rounded-xl bg-[#070B18] border border-white/5 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Email Address</span>
                  <div className="text-white font-mono truncate">{viewingUser.email}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#070B18] border border-white/5 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Username</span>
                  <div className="text-white font-mono truncate">@{viewingUser.username || 'N/A'}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#070B18] border border-white/5 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Role Clearance</span>
                  <div className="text-white font-semibold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{viewingUser.role}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#070B18] border border-white/5 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Account Status</span>
                  <div>
                    {viewingUser.status === 'pending' ? (
                      <span className="text-amber-400 font-semibold">Pending Review</span>
                    ) : viewingUser.status === 'deactivated' ? (
                      <span className="text-rose-400 font-semibold">Deactivated</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">Active</span>
                    )}
                  </div>
                </div>

                <div className="col-span-2 p-3 rounded-xl bg-[#070B18] border border-white/5 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Department</span>
                  <div className="text-white font-medium flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{viewingUser.department || 'Not Assigned'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#070B18] border border-white/5 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Created Date</span>
                  <div className="text-slate-300 font-mono text-[11px]">
                    {viewingUser.created_at ? viewingUser.created_at.split('T')[0] : 'N/A'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#070B18] border border-white/5 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Last Login</span>
                  <div className="text-slate-300 font-mono text-[11px]">
                    {viewingUser.last_login ? viewingUser.last_login.split('T')[0] : 'Never'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    const u = viewingUser;
                    setViewingUser(null);
                    handleStartEdit(u);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit User</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingUser(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 text-white text-xs font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL 2: EDIT USER */}
      {editingUser &&
        createPortal(
          <div
            onClick={() => setEditingUser(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-[#0B1224] text-white rounded-3xl border border-white/15 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-cyan-400" />
                  Edit Profile: {editingUser.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveUserEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Display Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-[#070B18] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <DepartmentSelect
                  value={editDepartment}
                  onChange={setEditDepartment}
                  label="Academic Department"
                  required
                />

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Account Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as any)}
                    className="w-full bg-[#070B18] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="active">Active (Full Access)</option>
                    <option value="pending">Pending Review (Limited Access)</option>
                    <option value="deactivated">Deactivated (Login Blocked)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-md disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {isSavingEdit ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL 3: PROMOTION VERIFICATION */}
      {promotionPending &&
        createPortal(
          <div
            onClick={() => {
              setPromotionPending(null);
              setPromotionAdminPassword('');
            }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-[#0B1224] text-white rounded-3xl border border-indigo-500/40 p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-indigo-400">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                  <ShieldAlert className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Administrator Authorization</h3>
                  <p className="text-[11px] text-slate-400">Privileged Role Assignment</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Promoting <strong>{promotionPending.userName}</strong> to{' '}
                <span className="text-indigo-300 font-bold">{promotionPending.targetRole}</span> grants full administrative clearance. Please enter your administrator password to confirm:
              </p>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={promotionAdminPassword}
                  onChange={e => setPromotionAdminPassword(e.target.value)}
                  placeholder="Enter your Administrator password"
                  className="w-full bg-[#070B18] border border-indigo-500/50 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPromotionPending(null);
                    setPromotionAdminPassword('');
                  }}
                  className="flex-1 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isVerifyingPromotion || !promotionAdminPassword}
                  onClick={() =>
                    executeRoleChange(
                      promotionPending.userId,
                      promotionPending.targetRole,
                      promotionAdminPassword
                    )
                  }
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-md disabled:opacity-60"
                >
                  {isVerifyingPromotion ? 'Verifying...' : 'Confirm Promotion'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL 4: DELETE USER CONFIRMATION */}
      {deletePendingUser &&
        createPortal(
          <div
            onClick={() => setDeletePendingUser(null)}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-[#0B1224] text-white rounded-3xl border border-rose-500/40 p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0 border border-rose-500/30">
                  <AlertTriangle className="w-5 h-5 text-rose-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Delete User Account</h3>
                  <p className="text-[11px] text-slate-400">Permanent Action</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete the account for{' '}
                <strong className="text-white">{deletePendingUser.name}</strong> ({deletePendingUser.email})?
              </p>
              <p className="text-[11px] text-slate-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                This will revoke their clearance and remove their login credentials from the database.
              </p>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletePendingUser(null)}
                  className="flex-1 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingUser}
                  onClick={confirmDeleteUser}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-md disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {isDeletingUser ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete User</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
