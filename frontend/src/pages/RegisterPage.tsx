import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  User,
  Building,
  CheckCircle2,
  AlertCircle,
  HeartHandshake,
  BarChart3,
  ShieldAlert,
  Loader2,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DepartmentSelect } from '../components/DepartmentSelect';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering (CSE)');
  const [selectedRole, setSelectedRole] = useState<'Counselor' | 'Viewer'>('Counselor');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState<{
    status: string;
    message: string;
    verificationToken?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid academic email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }
    if (!acceptTerms) {
      setErrorMessage('You must acknowledge the Institutional Data Ethics & Student Privacy Terms.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: selectedRole,
        department,
      });

      setRegistrationSuccess({
        status: res.status,
        message: res.message,
        verificationToken: res.verification_token,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
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
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> AI SaaS
                </span>
              </div>
              <p className="text-xs text-slate-400 tracking-wide">Role-Based Account Provisioning</p>
            </div>
          </Link>
          <h2 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-white">
            Create Your Faculty or Counselor Account
          </h2>
          <p className="mt-1 text-xs text-slate-400 max-w-md">
            Join the early intervention retention network to identify at-risk students and coordinate targeted academic guidance.
          </p>
        </div>

        {/* Card Container */}
        <div className="mt-8 glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10 relative backdrop-blur-2xl">
          {registrationSuccess ? (
            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Account Created Successfully!</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-md mx-auto">
                  {registrationSuccess.message}
                </p>
              </div>

              {registrationSuccess.status === 'pending' && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs text-left space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-300">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    Status: Pending Administrator Approval
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Institutional policy requires manual role validation by campus administration. An email notification will be dispatched once your profile is verified.
                  </p>
                </div>
              )}

              {registrationSuccess.verificationToken && (
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-300 flex items-center justify-between">
                  <span className="font-mono text-[11px]">Verification Code:</span>
                  <span className="font-mono font-bold text-cyan-300 px-2 py-1 rounded bg-cyan-500/20 border border-cyan-500/30">
                    {registrationSuccess.verificationToken}
                  </span>
                </div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
                >
                  Proceed to Sign In
                </Link>
                {registrationSuccess.verificationToken && (
                  <Link
                    to={`/verify-email?token=${registrationSuccess.verificationToken}`}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] transition-all"
                  >
                    Verify Email Now
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 shadow-[0_0_15px_rgba(251,113,133,0.15)]">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {/* 1. ROLE SELECTION CARDS */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Requested Role:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Counselor Option */}
                  <div
                    onClick={() => setSelectedRole('Counselor')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedRole === 'Counselor'
                        ? 'border-cyan-500/60 bg-cyan-500/15 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <HeartHandshake className="w-4 h-4 text-cyan-400" />
                      {selectedRole === 'Counselor' && (
                        <div className="w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center text-black">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-xs text-white">Counselor</div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Record counseling sessions, track interventions &amp; manage assigned students.
                    </p>
                  </div>

                  {/* Viewer Option */}
                  <div
                    onClick={() => setSelectedRole('Viewer')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedRole === 'Viewer'
                        ? 'border-purple-500/60 bg-purple-500/15 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      {selectedRole === 'Viewer' && (
                        <div className="w-4 h-4 rounded-full bg-purple-400 flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-xs text-white">Viewer</div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Read-only access to academic risk distributions, model insights &amp; reports.
                    </p>
                  </div>

                  {/* Administrator Option (Locked - Explicitly explains why, with Owner Setup Link) */}
                  <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] relative group">
                    <div className="flex items-center justify-between mb-1.5">
                      <Shield className="w-4 h-4 text-slate-400" />
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="font-bold text-xs text-slate-300 flex items-center gap-1.5">
                      Administrator
                      <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 text-slate-400 font-mono">Provisioned</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Admin accounts cannot be self-registered. They must be provisioned by an existing admin.
                    </p>
                    <div className="mt-2 pt-2 border-t border-white/5">
                      <Link
                        to="/setup-admin"
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 transition-colors hover:underline"
                      >
                        <span>Initial Admin Setup</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Prof. Ramesh Chandra"
                      className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Institutional Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="r.chandra@eduretain.edu"
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

              {/* 4. Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
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

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={e => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 rounded bg-white/10 border-white/20 text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-600 mt-0.5"
                  />
                  <span className="text-[11px] text-slate-400 leading-relaxed select-none">
                    I agree to the <strong className="text-slate-300">FERPA/Academic Data Privacy Terms</strong> and understand that all student counseling and risk assessment data are confidential and strictly audited.
                  </span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create {selectedRole} Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Sign In link */}
          <div className="mt-6 text-center border-t border-white/10 pt-4">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                Sign In
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
