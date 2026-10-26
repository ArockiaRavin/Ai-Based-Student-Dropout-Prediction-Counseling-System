import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('Administrator' | 'Counselor' | 'Viewer')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, token, isAuthenticated, isPendingApproval, isDeactivated, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070B18] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <span className="text-xs text-slate-400 font-mono tracking-wider">Verifying Authorized Session...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to /login
  if (!user && !token) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Account pending administrator approval
  if (isPendingApproval) {
    return (
      <div className="min-h-screen bg-[#070B18] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel rounded-2xl p-8 border border-amber-500/30 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-white">Account Pending Approval</h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Your registration as <strong className="text-amber-300">{role}</strong> has been received and is currently under review by institutional management.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Account deactivated
  if (isDeactivated) {
    return (
      <div className="min-h-screen bg-[#070B18] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel rounded-2xl p-8 border border-rose-500/30 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-white">Account Deactivated</h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            This profile has been deactivated by a system administrator. Please reach out to student affairs support.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check role authorization
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};
