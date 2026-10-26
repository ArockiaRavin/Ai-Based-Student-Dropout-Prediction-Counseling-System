import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  MailCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Loader2,
  Mail
} from 'lucide-react';
import { api } from '../api';

export const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tokenFromUrl = queryParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [resendEmail, setResendEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendStatus, setResendStatus] = useState<{ message: string; token?: string } | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (tokenFromUrl) {
      handleVerify(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async (tokenToUse?: string) => {
    const t = tokenToUse || token;
    if (!t.trim()) {
      setErrorMessage('Please enter or provide a valid verification token.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      await api.verifyEmail(t.trim());
      setIsVerified(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification token is invalid or has expired.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim() || !resendEmail.includes('@')) {
      setErrorMessage('Please enter a valid academic email address.');
      return;
    }

    setErrorMessage('');
    try {
      const res = await api.resendVerification(resendEmail.trim().toLowerCase());
      setResendStatus({ message: res.message, token: res.verification_token });
      setCooldown(60);
      if (res.verification_token) {
        setToken(res.verification_token);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend verification.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070B18] text-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative tech-grid selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden">
      {/* Background glow */}
      <div className="fixed top-[-10%] left-1/4 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-1/4 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />

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
              <p className="text-xs text-slate-400 tracking-wide">Academic Identity Verification</p>
            </div>
          </Link>
          <h2 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-white">
            Verify Your Academic Email
          </h2>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            Confirm your institutional email address to activate your Counselor or Viewer profile.
          </p>
        </div>

        {/* Card Container */}
        <div className="mt-8 glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10 relative backdrop-blur-2xl">
          {isVerified ? (
            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(52,211,153,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Email Address Confirmed!</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Your academic credentials have been verified. You may now sign in to your workspace.
                </p>
              </div>

              <div className="pt-3">
                <Link
                  to="/login?verified=true"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {/* Token confirmation form */}
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-300">
                  Verification Token / Code
                </label>
                <div className="relative">
                  <MailCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="Paste 24-character token"
                    className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleVerify()}
                  disabled={isVerifying || !token.trim()}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01]"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Verifying Token...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Email Address</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Resend Verification Section */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="text-xs font-semibold text-slate-300">
                  Didn't receive the verification token?
                </div>

                {resendStatus && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
                    <p>{resendStatus.message}</p>
                    {resendStatus.token && (
                      <p className="font-mono text-[10px] text-cyan-300">
                        Token: {resendStatus.token}
                      </p>
                    )}
                  </div>
                )}

                <form onSubmit={handleResend} className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={e => setResendEmail(e.target.value)}
                      placeholder="Enter account email"
                      className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={cooldown > 0}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white transition-all disabled:opacity-50 shrink-0"
                  >
                    {cooldown > 0 ? `Wait ${cooldown}s` : 'Resend'}
                  </button>
                </form>
              </div>

              <div className="pt-2 text-center">
                <Link to="/login" className="text-xs text-slate-400 hover:text-white transition-colors">
                  ← Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
