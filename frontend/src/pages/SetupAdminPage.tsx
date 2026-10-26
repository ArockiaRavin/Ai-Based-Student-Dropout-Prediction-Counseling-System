import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  GraduationCap,
  Sparkles,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Terminal,
  FileCode2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { DepartmentSelect } from '../components/DepartmentSelect';

export const SetupAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { setupInitialAdmin } = useAuth();

  const [setupAvailable, setSetupAvailable] = useState<boolean | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);

  // Form inputs
  const [setupKey, setSetupKey] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering (CSE)');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Status & feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ name: string; email: string } | null>(null);

  // Check setup availability on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setCheckingStatus(true);
    setErrorMessage('');
    try {
      const res = await api.getSetupAdminStatus();
      setSetupAvailable(res.setup_available);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to check administrator setup status.');
      setSetupAvailable(false);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!setupKey.trim()) {
      setErrorMessage('Please enter the Server Setup Key.');
      return;
    }
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid institutional email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Administrator password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your entries.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await setupInitialAdmin({
        setup_key: setupKey.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        department
      });

      setSuccessInfo({
        name: res.user.name,
        email: res.user.email
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Initial administrator setup failed. Verify your Server Setup Key.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B18] text-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative tech-grid selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden">
      {/* Cinematic ambient background glow */}
      <div className="fixed top-[-10%] right-1/4 w-[650px] h-[650px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl px-4">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="flex items-center gap-3 group mb-2">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_25px_rgba(99,102,241,0.5)] group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 opacity-40 blur-xs group-hover:opacity-75 transition-opacity -z-10" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl text-white tracking-tight">EduRetain</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> Root Setup
                </span>
              </div>
              <p className="text-xs text-slate-400 tracking-wide">Initial Administrator Provisioning</p>
            </div>
          </Link>
          <h2 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-white">
            Primary Administrator Account Initialization
          </h2>
          <p className="mt-1 text-xs text-slate-400 max-w-md">
            Authorize and claim the first administrator account for this instance. This setup permanently secures the system.
          </p>
        </div>

        {/* Card Container */}
        <div className="mt-8 glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10 relative backdrop-blur-2xl">
          {checkingStatus ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-xs text-slate-400 font-mono">Verifying system clearance status...</p>
            </div>
          ) : successInfo ? (
            <div className="text-center py-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_35px_rgba(52,211,153,0.35)]">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Administrator Provisioned!</h3>
                <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
                  Administrator clearance granted for <strong className="text-cyan-300">{successInfo.name}</strong> ({successInfo.email}). Initial setup is now permanently locked.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-400 font-mono">
                Redirecting to Administrator Dashboard in 2 seconds...
              </div>
            </div>
          ) : !setupAvailable ? (
            <div className="text-center py-6 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.25)]">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Initial Setup Locked</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-md mx-auto">
                  An administrator account has already been claimed for this system. The initial setup endpoint has been permanently deactivated for security.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-left space-y-2 text-slate-300 font-mono">
                <div className="flex items-center gap-2 text-indigo-400 font-bold">
                  <Terminal className="w-4 h-4" />
                  <span>Server Administrator Recovery:</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  If you need to provision or reset an administrator account, connect directly to the server host machine and run:
                </p>
                <div className="bg-black/60 p-2.5 rounded-lg border border-white/10 text-[11px] text-cyan-300 select-all">
                  python backend/setup_admin.py --force-unlock
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:scale-[1.02] text-center"
                >
                  Sign In to Administrator Portal
                </Link>
                <Link
                  to="/"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold text-center transition-all"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Security Banner */}
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-2.5">
                <KeyRound className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-white block">Server Setup Key Required</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Check <code className="bg-black/40 px-1.5 py-0.5 rounded text-cyan-300">backend/.admin_setup_key</code> on your server, or run <code className="bg-black/40 px-1.5 py-0.5 rounded text-cyan-300">python backend/setup_admin.py --show-key</code> in terminal.
                  </p>
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Server Setup Key */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Server Setup Key <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showKey ? 'text' : 'password'}
                    required
                    value={setupKey}
                    onChange={e => setSetupKey(e.target.value)}
                    placeholder="SETUP-..."
                    className="w-full glass-input rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 2. Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Administrator Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Dr. Rajesh Sharma"
                      className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Institutional Email <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@institution.edu"
                      className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Academic Department (Comprehensive Categorized & Searchable) */}
              <DepartmentSelect
                value={department}
                onChange={setDepartment}
                required
                label="Academic Department"
              />

              {/* 4. Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Password (min 8 chars) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full glass-input rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Confirm Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Provisioning Administrator Account...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Provision Administrator Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Already have an administrator account? <span className="text-indigo-400 font-semibold">Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
