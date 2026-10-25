import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  LineChart,
  BrainCircuit,
  HeartHandshake,
  CheckSquare,
  FileSpreadsheet,
  Cpu,
  Settings,
  Presentation,
  Home,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, role } = useAuth();

  const navItems = [
    { name: 'Public Portal', path: '/', icon: Home, end: true },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Risk Analysis', path: '/risk-analysis', icon: LineChart },
    { name: 'AI Risk Prediction', path: '/predictions', icon: BrainCircuit },
    { name: 'Counselor Center', path: '/counselor-center', icon: HeartHandshake },
    { name: 'Intervention Tracking', path: '/interventions', icon: CheckSquare },
    { name: 'Analytics & Reports', path: '/reports', icon: FileSpreadsheet },
    { name: 'Model Insights', path: '/model-insights', icon: Cpu },
    { name: 'Presentation Mode', path: '/presentation', icon: Presentation },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B1224]/95 backdrop-blur-2xl border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* User profile card in sidebar */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/[0.02]">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'ED'}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0B1224]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{user?.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-cyan-400 font-mono tracking-wider font-semibold uppercase">{role}</span>
              <span className="text-[10px] text-slate-500">• Online</span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
            <span>Navigation Workspace</span>
            <Sparkles className="w-3 h-3 text-indigo-400 opacity-60" />
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/30 to-indigo-500/10 text-white font-semibold border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-white border border-transparent hover:border-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-indigo-400'
                    }`} />
                    <span className="truncate">{item.name}</span>
                    {item.path === '/presentation' && (
                      <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                        18 SLIDES
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Disclaimer footer in sidebar */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02]">
          <div className="flex items-start gap-2.5 text-[11px] text-slate-400 leading-relaxed p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-200">Decision Support:</strong> AI models generate risk likelihoods to assist faculty; human judgment is mandatory.
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
