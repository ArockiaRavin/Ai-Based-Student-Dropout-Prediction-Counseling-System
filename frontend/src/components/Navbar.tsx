import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Bell,
  Search,
  Presentation,
  Shield,
  UserCheck,
  Eye,
  CheckCircle,
  Menu,
  X,
  Sparkles,
  Users,
  LogOut,
  LogIn,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { NotificationItem } from '../types';
import { UserManagementModal } from './UserManagementModal';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, role, loginAs, logout, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    if (!localStorage.getItem('eduretain_token')) return;
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unread_count || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/students?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const markRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#070B18]/85 backdrop-blur-xl border-b border-white/10 px-4 lg:px-6 py-2.5 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 lg:hidden focus:outline-none transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 opacity-30 blur-xs group-hover:opacity-60 transition-opacity -z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                  EduRetain
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> AI SaaS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
                Dropout Prediction &amp; Counseling
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Global Search */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search student ID, name, or department..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:bg-white/[0.07] focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </form>

        {/* Right: Date, Presentation Button, Alerts, Role Switcher */}
        <div className="flex items-center gap-2.5">
          <span className="hidden xl:inline-block text-xs font-mono font-medium text-slate-400 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/10">
            {todayStr}
          </span>

          {/* Presentation Mode Quick Button */}
          <Link
            to="/presentation"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all hover:scale-[1.02]"
          >
            <Presentation className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline">Presentation Mode</span>
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 relative transition-colors border border-transparent hover:border-white/10"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(251,113,133,0.8)] animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2 border border-white/15">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                  <span className="font-semibold text-xs text-white flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-indigo-400" />
                    Counselor Alerts &amp; Notifications ({unreadCount} unread)
                  </span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-white/5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition-colors flex items-start gap-2.5 ${
                          n.is_read ? 'bg-transparent opacity-60' : 'bg-indigo-500/10'
                        }`}
                      >
                        <div className="p-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0 mt-0.5 shadow-[0_0_10px_rgba(251,113,133,0.2)]">
                          <Bell className="w-3 h-3" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white">{n.title}</p>
                          <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                            <span className="text-[10px] text-slate-400 font-mono">{n.created_at}</span>
                            {!n.is_read && (
                              <button
                                onClick={() => markRead(n.id)}
                                className="text-[10px] font-medium text-cyan-400 hover:text-cyan-300"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Admin Manage Users Quick Button */}
          {isAdmin && (
            <Link
              to="/manage-users"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/30 text-xs font-semibold shadow-[0_0_12px_rgba(99,102,241,0.25)] transition-all hover:scale-[1.02]"
              title="Manage Users & Assign Roles"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Manage Users</span>
            </Link>
          )}

          {/* Role Switcher for Demonstration */}
          <div className="flex items-center border border-white/10 rounded-xl p-1 bg-white/[0.03] text-xs backdrop-blur-md">
            <button
              onClick={() => loginAs('Administrator')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                role === 'Administrator'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Administrator Role"
            >
              Admin
            </button>
            <button
              onClick={() => loginAs('Counselor')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                role === 'Counselor'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Counselor Role"
            >
              Counselor
            </button>
            <button
              onClick={() => loginAs('Viewer')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                role === 'Viewer'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Faculty Viewer Role"
            >
              Viewer
            </button>
          </div>

          {/* Profile Navigation Button */}
          {user && (
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs text-white border border-white/10 transition-all hover:border-indigo-500/40 group"
              title="My Account Profile"
            >
              <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3 h-3 text-white" />}
              </div>
              <span className="hidden md:inline font-medium text-slate-200 group-hover:text-white max-w-[110px] truncate">
                {user.name}
              </span>
            </Link>
          )}

          {/* Sign Out / Sign In Action */}
          {user ? (
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
              title={`Sign Out (${user.name})`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white border border-white/10"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Admin User Management Modal */}
      {isAdmin && (
        <UserManagementModal
          isOpen={showUserManagement}
          onClose={() => setShowUserManagement(false)}
        />
      )}
    </header>
  );
};
