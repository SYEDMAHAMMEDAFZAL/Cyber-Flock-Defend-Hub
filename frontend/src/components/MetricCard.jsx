import React from 'react';

const colorStyles = {
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    glow: 'hover:shadow-[0_0_24px_rgba(0,229,153,0.2)]',
  },
  cyan: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    glow: 'hover:shadow-[0_0_24px_rgba(0,229,153,0.2)]',
  },
  rose: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    glow: 'hover:shadow-[0_0_24px_rgba(244,63,94,0.2)]',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    glow: 'hover:shadow-[0_0_24px_rgba(245,158,11,0.2)]',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    glow: 'hover:shadow-[0_0_24px_rgba(168,85,247,0.2)]',
  },
};

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'emerald',
  badge,
  trend,
}) => {
  const styles = colorStyles[variant] || colorStyles.emerald;

  return (
    <div
      className={`card-3d rounded-xl p-5 transition-all duration-200 ${styles.glow} relative overflow-hidden`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg ${styles.bg} ${styles.text}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1.5">
        <h3 className="text-2xl font-bold font-mono text-white tracking-tight">
          {value}
        </h3>
        {badge && (
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${styles.bg} ${styles.text} font-semibold`}>
            {badge}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          {trend && (
            <span
              className={`font-mono font-medium ${
                trend.startsWith('+') ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {trend}
            </span>
          )}
          {subtitle && <span className="truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default MetricCard;

