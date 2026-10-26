import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  HeartHandshake,
  BarChart3,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAs } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedDemoRole, setSelectedDemoRole] = useState<'Administrator' | 'Counselor' | 'Viewer' | null>(null);

  // Read query params for redirect or verification message
  const params = new URLSearchParams(location.search);
  const redirectPath = params.get('redirect') || '/dashboard';
  const verifiedNotice = params.get('verified') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Please enter your email address or username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await login(identifier.trim(), password);
      // Route based on role
      if (user.role === 'Administrator') {
        navigate('/dashboard');
      } else if (user.role === 'Counselor') {
        navigate('/counselor-center');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoRole: 'Administrator' | 'Counselor' | 'Viewer') => {
    setSelectedDemoRole(demoRole);
    setIsLoading(true);
    setErrorMessage('');
    try {
      await loginAs(demoRole);
      if (demoRole === 'Administrator') {
        navigate('/dashboard');
      } else if (demoRole === 'Counselor') {
        navigate('/counselor-center');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
      setSelectedDemoRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B18] text-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative tech-grid selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden">
      {/* Cinematic ambient background glow */}
      <div className="fixed top-[-10%] left-1/4 w-[650px] h-[650px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 left-[-10%] w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
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
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> AI SaaS
                </span>
              </div>
              <p className="text-xs text-slate-400 tracking-wide">Dropout Prediction &amp; Counseling System</p>
            </div>
          </Link>
          <h2 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-white">
            Sign In to Your Workspace
          </h2>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            Access authorized student retention analytics, ML risk scoring, and student counseling records.
          </p>
        </div>

        {/* Card Container */}
        <div className="mt-8 glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10 relative backdrop-blur-2xl">
          {verifiedNotice && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 shadow-[0_0_15px_rgba(52,211,153,0.15)]">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Your email has been verified. You may now sign in.</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 shadow-[0_0_15px_rgba(251,113,133,0.15)]">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Username */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="admin@eduretain.edu or username"
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full glass-input rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-white/10 border-white/20 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-indigo-600"
                />
                <span className="text-xs text-slate-400 select-none">Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                Quick Demo Accounts
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">1-Click Sign In</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Administrator')}
                disabled={isLoading}
                className="p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-left transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200">Admin</span>
                  <Shield className="w-3 h-3 text-indigo-400" />
                </div>
                <p className="text-[11px] font-semibold text-white truncate">Dr. Ramanathan</p>
                <p className="text-[9px] text-slate-400">Full System Control</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Counselor')}
                disabled={isLoading}
                className="p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-left transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/30 text-cyan-200">Counselor</span>
                  <HeartHandshake className="w-3 h-3 text-cyan-400" />
                </div>
                <p className="text-[11px] font-semibold text-white truncate">Prof. Krishnan</p>
                <p className="text-[9px] text-slate-400">Student Interventions</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Viewer')}
                disabled={isLoading}
                className="p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-left transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200">Viewer</span>
                  <BarChart3 className="w-3 h-3 text-purple-400" />
                </div>
                <p className="text-[11px] font-semibold text-white truncate">Dr. Amitava Sen</p>
                <p className="text-[9px] text-slate-400">Read-Only Analytics</p>
              </button>
            </div>
          </div>

          {/* Registration link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              New faculty or counselor?{' '}
              <Link to="/register" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Public portal footer link */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← Return to Public Portal Overview
          </Link>
        </div>
      </div>
    </div>
  );
};
