import React from 'react';
import { RiskCategory } from '../types';
import { ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';

interface RiskBadgeProps {
  category: RiskCategory | string;
  score?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  category,
  score,
  showIcon = true,
  size = 'md',
}) => {
  const normCat = (category || '').toUpperCase();

  let styles = 'bg-white/5 text-slate-300 border-white/10';
  let icon = <ShieldCheck className="w-3.5 h-3.5" />;

  if (normCat.includes('HIGH')) {
    styles = 'bg-[#FB7185]/15 text-[#FB7185] border-[#FB7185]/35 shadow-[0_0_12px_rgba(251,113,133,0.2)]';
    icon = <AlertCircle className="w-3.5 h-3.5 text-[#FB7185]" />;
  } else if (normCat.includes('MEDIUM')) {
    styles = 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/35 shadow-[0_0_12px_rgba(251,191,36,0.2)]';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-[#FBBF24]" />;
  } else if (normCat.includes('LOW')) {
    styles = 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/35 shadow-[0_0_12px_rgba(52,211,153,0.2)]';
    icon = <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />;
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md ${styles} ${sizeClasses} transition-all duration-200`}
    >
      {showIcon && icon}
      <span className="tracking-wide">{category}</span>
      {score !== undefined && (
        <span className="font-mono opacity-90 pl-0.5">({score}%)</span>
      )}
    </span>
  );
};
