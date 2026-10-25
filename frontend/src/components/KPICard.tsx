import React from 'react';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: 'indigo' | 'rose' | 'amber' | 'emerald' | 'teal' | 'blue';
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  accentColor = 'indigo',
  onClick,
}) => {
  const accentClasses = {
    indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(251,113,133,0.2)]',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(251,191,36,0.2)]',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.2)]',
    teal: 'bg-teal-500/15 text-teal-400 border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.2)]',
    blue: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]',
  }[accentColor];

  const glowBorderHover = {
    indigo: 'hover:border-indigo-500/40 hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)]',
    rose: 'hover:border-rose-500/40 hover:shadow-[0_8px_30px_rgba(251,113,133,0.15)]',
    amber: 'hover:border-amber-500/40 hover:shadow-[0_8px_30px_rgba(251,191,36,0.15)]',
    emerald: 'hover:border-emerald-500/40 hover:shadow-[0_8px_30px_rgba(52,211,153,0.15)]',
    teal: 'hover:border-teal-500/40 hover:shadow-[0_8px_30px_rgba(20,184,166,0.15)]',
    blue: 'hover:border-cyan-500/40 hover:shadow-[0_8px_30px_rgba(34,211,238,0.15)]',
  }[accentColor];

  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-2xl p-4 sm:p-5 transition-all duration-300 relative overflow-hidden group ${
        onClick ? 'cursor-pointer' : ''
      } ${glowBorderHover} hover:bg-white/[0.07] hover:-translate-y-0.5`}
    >
      {/* Subtle corner light reflection */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/[0.05] to-transparent pointer-events-none rounded-tr-2xl" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{title}</span>
        <div className={`p-2 rounded-xl border transition-transform duration-300 group-hover:scale-110 ${accentClasses}`}>
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">{value}</span>
        {trend && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
              trend.isPositive
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-400 truncate">{subtitle}</p>}
    </div>
  );
};
