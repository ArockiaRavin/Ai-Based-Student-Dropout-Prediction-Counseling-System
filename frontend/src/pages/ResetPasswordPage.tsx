import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { api } from '../api';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialToken = queryParams.get('token') || '';

  const [resetToken, setResetToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!resetToken.trim()) {
      setErrorMessage('A valid password reset token is required.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters in length.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);

    try {
      await api.resetPassword(resetToken.trim(), newPassword);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update password. The token may be expired or invalid.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B18] text-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative tech-grid selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden">
      {/* Background Glow */}
      <div className="fixed top-[-10%] right-1/4 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-1/4 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />

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
              <span className="font-extrabold text-2xl text-white tracking-tight">EduRetain</span>
              <p className="text-xs text-slate-400 tracking-wide">Set New Credentials</p>
            </div>
          </Link>
          <h2 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-white">
            Choose a New Password
          </h2>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            Enter your new secure password below to complete password recovery.
          </p>
        </div>

        {/* Card Container */}
        <div className="mt-8 glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10 relative backdrop-blur-2xl">
          {isSuccess ? (
            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(52,211,153,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Password Successfully Updated!</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Your password has been changed. You can now sign in with your new credentials.
                </p>
              </div>

              <div className="pt-3">
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
                >
                  <span>Sign In Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {/* Reset Token Input (Hidden if provided via query, or visible for editing) */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password Reset Token
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={e => setResetToken(e.target.value)}
                    placeholder="Paste reset token"
                    className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full glass-input rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white absolute right-2.5 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm &amp; Update Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 text-center">
                <Link to="/login" className="text-xs text-slate-400 hover:text-white transition-colors">
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
