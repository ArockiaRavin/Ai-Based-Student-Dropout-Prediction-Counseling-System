import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Building,
  Shield,
  ShieldCheck,
  HeartHandshake,
  Eye,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  Calendar,
  Sparkles,
  Save,
  Clock,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DepartmentSelect } from '../components/DepartmentSelect';
import { api } from '../api';
import { User } from '../types';

export const ProfilePage: React.FC = () => {
  const { user: authUser, updateProfile, refreshProfile } = useAuth();
  
  // Local profile state
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form fields
  const [name, setName] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  
  // Password change fields
  const [showPasswordChange, setShowPasswordChange] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Fetch real authenticated profile from database using authenticated user session
  const loadProfile = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await api.getMe();
      if (res && res.user) {
        setProfile(res.user);
        setName(res.user.name || '');
        setDepartment(res.user.department || '');
      } else {
        setFetchError('User profile details could not be retrieved from the database.');
      }
    } catch (err: any) {
      console.error('Failed to load user profile:', err);
      // If authUser is in context, load that as safe fallback without hardcoding fake name
      if (authUser) {
        setProfile(authUser);
        setName(authUser.name || '');
        setDepartment(authUser.department || '');
      } else {
        setFetchError(err.message || 'Unable to connect to the authentication service.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Full name cannot be blank.', 'error');
      return;
    }

    if (showPasswordChange && newPassword) {
      if (!currentPassword) {
        showToast('Please enter your current password to authorize a password change.', 'error');
        return;
      }
      if (newPassword.length < 8) {
        showToast('New password must be at least 8 characters in length.', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        showToast('New password and confirm password do not match.', 'error');
        return;
      }
    }

    setSaving(true);
    try {
      const payload: { name: string; department: string; current_password?: string; new_password?: string } = {
        name: name.trim(),
        department: department.trim()
      };

      if (showPasswordChange && newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const updated = await updateProfile(payload);
      setProfile(updated);
      showToast('Your profile information was saved successfully.');

      // Clear password fields
      if (showPasswordChange && newPassword) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordChange(false);
      }

      await refreshProfile();
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[65vh] space-y-4 text-slate-300">
        <div className="relative">
          <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
          <div className="absolute inset-0 blur-lg bg-cyan-400/30 rounded-full animate-pulse" />
        </div>
        <p className="text-sm font-medium tracking-wide">Loading authentic profile records from database...</p>
      </div>
    );
  }

  if (fetchError && !profile) {
    return (
      <div className="p-8 max-w-xl mx-auto mt-12 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(244,63,94,0.2)]">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Profile Details Unavailable</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{fetchError}</p>
        </div>
        <button
          onClick={loadProfile}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-lg transition-all"
        >
          Retry Fetching Profile
        </button>
      </div>
    );
  }

  const role = profile?.role || 'Viewer';
  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ED';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto text-slate-100">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-xl animate-in fade-in slide-in-from-top-4 ${
            toast.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="pb-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-cyan-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                User Profile &amp; Institutional Identity
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Manage your authenticated identity, departmental affiliation, and account security.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-medium text-slate-400 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            User ID: #{profile?.id || 'AUTH'}
          </span>
          <button
            type="button"
            onClick={loadProfile}
            title="Refresh profile from database"
            className="p-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Profile Card & Role Clearance (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main User Identity Card */}
          <div className="p-6 rounded-3xl bg-[#0B1224]/85 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-xl text-white shadow-xl ${
                    role === 'Administrator'
                      ? 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                      : role === 'Counselor'
                      ? 'bg-gradient-to-tr from-cyan-600 to-teal-500 shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                      : 'bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                  }`}
                >
                  {initials}
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0B1224]" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-white truncate">
                  {profile?.name}
                </h3>
                <p className="text-xs text-slate-400 truncate mt-0.5">{profile?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono border flex items-center gap-1 ${
                      role === 'Administrator'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                        : role === 'Counselor'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                    }`}
                  >
                    {role === 'Administrator' ? (
                      <ShieldCheck className="w-3 h-3 text-cyan-300" />
                    ) : role === 'Counselor' ? (
                      <HeartHandshake className="w-3 h-3 text-cyan-300" />
                    ) : (
                      <Eye className="w-3 h-3 text-purple-300" />
                    )}
                    {role}
                  </span>

                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metadata */}
            <div className="pt-4 border-t border-white/10 space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-slate-400 flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-cyan-400" />
                  Department:
                </span>
                <span className="font-semibold text-white text-right truncate max-w-[200px]" title={profile?.department}>
                  {profile?.department || 'Not Assigned'}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-slate-400 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  Email Verification:
                </span>
                <span className="font-medium text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Verified
                </span>
              </div>

              {profile?.created_at && (
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Account Enrolled:
                  </span>
                  <span className="font-mono text-slate-300 text-[11px]">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}

              {profile?.last_login && (
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Last Active:
                  </span>
                  <span className="font-mono text-slate-300 text-[11px]">
                    {profile.last_login}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Role Clearance & Permissions Card */}
          <div className="p-6 rounded-3xl bg-[#0B1224]/85 border border-white/10 backdrop-blur-xl shadow-2xl space-y-4 text-xs">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-2.5 border-b border-white/10">
              <Shield className="w-4 h-4 text-indigo-400" />
              Role Clearance &amp; System Permissions
            </h4>

            <div className="space-y-2.5 text-slate-300 text-[11px]">
              {role === 'Administrator' ? (
                <>
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Full Administrative Clearance:</strong> Provision users, assign roles, configure risk thresholds, and inspect security audit logs.</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Student Records Management:</strong> Create, edit, and archive institutional student records across all departments.</span>
                  </div>
                </>
              ) : role === 'Counselor' ? (
                <>
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Counselor Operations:</strong> Access student 360° risk profiles, record counseling sessions, and track intervention plans.</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>AI Risk Predictions:</strong> Review risk factor breakdowns, retention recommendations, and early warnings.</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400">
                    <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <span>User management and system configuration are restricted to Administrators.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <CheckCircle2 className="w-4 h-4 text-purple-300 shrink-0 mt-0.5" />
                    <span><strong>Faculty Viewer Clearance:</strong> Read-only access to retention dashboards, department analytics, and model telemetry.</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400">
                    <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <span>Modifications to student records, counseling notes, or system configurations are restricted.</span>
                  </div>
                </>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-300">Policy Note:</span> Role assignments are governed by institutional policy and can only be altered by authorized Administrators via Identity Management.
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleSaveProfile}
            className="p-6 sm:p-7 rounded-3xl bg-[#0B1224]/85 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6 text-xs"
          >
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2.5 border-b border-white/10">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Edit Authorized Profile Information
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                You can update your display name and academic department. All updates are securely recorded to the institutional database.
              </p>
            </div>

            {/* Profile Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="w-full bg-[#070B18] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-400 font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5 flex items-center justify-between">
                  <span>Institutional Email Address</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-500" /> Managed ID
                  </span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full bg-[#070B18]/60 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-slate-400 font-mono cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Institutional email is linked to your campus credentials and cannot be edited directly.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Academic Department
                </label>
                <DepartmentSelect
                  value={department}
                  onChange={setDepartment}
                  label="Select Academic Department"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5 flex items-center justify-between">
                  <span>Assigned Account Role</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-500" /> Admin Assigned
                  </span>
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={role}
                    disabled
                    className="w-full bg-[#070B18]/60 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-slate-400 font-semibold cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Change Password Section Toggle */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-indigo-400" />
                    Security Credentials &amp; Password
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Update your password securely using PBKDF2 cryptography.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-indigo-300 border border-indigo-500/20 transition-colors"
                >
                  {showPasswordChange ? 'Cancel Password Change' : 'Change Password'}
                </button>
              </div>

              {showPasswordChange && (
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3.5 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Current Password <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full bg-[#070B18] border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        New Password (min 8 chars) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full bg-[#070B18] border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Confirm New Password <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full bg-[#070B18] border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Action */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={loadProfile}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-semibold transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2 disabled:opacity-60 transition-all hover:scale-[1.02]"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
