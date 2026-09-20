import React from 'react';

const badgeStyles = {
  // Severity
  critical: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  high: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  low: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  info: 'bg-slate-500/15 text-slate-300 border-slate-500/30',

  // Status
  open: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  resolved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  in_progress: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  anchored: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  verified: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  failed: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  running: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 animate-pulse',
};

export const StatusBadge = ({ status = 'info', label, className = '' }) => {
  const normalizedKey = status.toString().toLowerCase().replace(/\s+/g, '_');
  const style = badgeStyles[normalizedKey] || badgeStyles.info;
  const displayLabel = label || status;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border ${style} ${className}`}
    >
      {displayLabel}
    </span>
  );
};

export default StatusBadge;


