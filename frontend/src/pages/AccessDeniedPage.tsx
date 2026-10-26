import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, LayoutDashboard, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();

  const getAuthorizedDashboard = () => {
    if (role === 'Administrator') return '/dashboard';
    if (role === 'Counselor') return '/counselor-center';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-[#070B18] text-[#F8FAFC] flex flex-col justify-center items-center px-4 relative tech-grid selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background glow */}
      <div className="fixed top-1/4 left-1/3 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-md w-full glass-panel rounded-2xl p-8 border border-rose-500/30 text-center shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(251,113,133,0.3)] mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
          HTTP 403 • Access Restricted
        </span>

        <h1 className="text-xl sm:text-2xl font-bold text-white mt-4">
          Insufficient Permissions
        </h1>

        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          Your current authenticated profile (<strong className="text-cyan-300">{user?.name || role}</strong>, assigned as <strong className="text-indigo-300">{role}</strong>) does not hold the authorized clearance level to view or perform operations on this URL.
        </p>

        <div className="my-6 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-left text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span>Current Role:</span>
            <span className="font-semibold text-white px-2 py-0.5 rounded bg-white/10">{role}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Department:</span>
            <span className="text-slate-200">{user?.department || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Clearance Scope:</span>
            <span className="text-cyan-400">
              {role === 'Administrator' ? 'Full Institution System Control' : role === 'Counselor' ? 'Assigned Student Interventions' : 'Read-Only Academic Viewer'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={getAuthorizedDashboard()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Authorized Dashboard</span>
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
