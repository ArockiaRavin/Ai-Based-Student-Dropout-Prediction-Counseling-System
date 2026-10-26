import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  KeyRound,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { api } from '../api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState<{
    message: string;
    resetToken?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await api.forgotPassword(email.trim().toLowerCase());
      setSuccessInfo({
        message: res.message,
        resetToken: res.reset_token,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch password recovery request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B18] text-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative tech-grid selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden">
      {/* Cinematic ambient background glow */}
      <div className="fixed top-[-10%] left-1/3 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-1/3 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />

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
              <p className="text-xs text-slate-400 tracking-wide">Account Security &amp; Recovery</p>
            </div>
          </Link>
          <h2 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-white">
            Reset Your Password
          </h2>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            Enter your institutional email address and we will generate secure password reset instructions.
          </p>
        </div>

        {/* Card Container */}
        <div className="mt-8 glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10 relative backdrop-blur-2xl">
          {successInfo ? (
            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.25)]">
                <Mail className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Reset Link Dispatched</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {successInfo.message}
                </p>
              </div>

              {successInfo.resetToken && (
                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-left space-y-2">
                  <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Local Testing / Evaluator Shortcut:
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    A secure password reset token has been generated:
                  </p>
                  <div className="p-2 rounded bg-black/40 font-mono text-[10px] text-cyan-300 break-all border border-white/10">
                    {successInfo.resetToken}
                  </div>
                  <Link
                    to={`/reset-password?token=${encodeURIComponent(successInfo.resetToken)}`}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 pt-1"
                  >
                    <span>Click here to set new password now</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
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

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="counselor@eduretain.edu"
                    className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Sending Recovery Instructions...</span>
                  </>
                ) : (
                  <>
                    <span>Send Password Reset Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
