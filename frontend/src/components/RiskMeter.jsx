import React from 'react';

export const RiskMeter = ({ score = 0, size = 180 }) => {
  const cleanScore = Math.max(0, Math.min(100, Math.round(score)));

  // Color mapping based on score
  let strokeColor = '#10b981'; // green
  let glowColor = 'rgba(16, 185, 129, 0.4)';
  let level = 'LOW RISK';
  let levelColor = 'text-emerald-400';

  if (cleanScore > 80) {
    strokeColor = '#f43f5e'; // red/rose
    glowColor = 'rgba(244, 63, 94, 0.4)';
    level = 'CRITICAL RISK';
    levelColor = 'text-rose-400';
  } else if (cleanScore > 60) {
    strokeColor = '#f97316'; // orange
    glowColor = 'rgba(249, 115, 22, 0.4)';
    level = 'HIGH RISK';
    levelColor = 'text-orange-400';
  } else if (cleanScore > 30) {
    strokeColor = '#f59e0b'; // amber
    glowColor = 'rgba(245, 158, 11, 0.4)';
    level = 'MODERATE RISK';
    levelColor = 'text-amber-400';
  }

  // Calculate arc parameters
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Use a 240 degree gauge arc
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * cleanScore) / 100;

  return (
    <div className="flex flex-col items-center justify-center relative p-3 rounded-full bg-gradient-to-b from-[#0e171a] to-[#04070a] border border-[#1b2b2f] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_4px_16px_rgba(0,0,0,0.6)]">
      <svg width={size} height={size} className="rotate-[150deg] overflow-visible">
        <defs>
          <radialGradient id="meterDepth" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#04070a" />
            <stop offset="100%" stopColor="#0e171a" />
          </radialGradient>
        </defs>
        {/* Beveled Backplate */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - 2}
          fill="url(#meterDepth)"
        />
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#152327"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Value Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 12px ${glowColor})`,
            transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.4s ease',
          }}
        />
      </svg>

      {/* Center Score Readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
        <span className="text-4xl font-bold font-mono text-white tracking-tight">
          {cleanScore}
        </span>
        <span className="text-[10px] font-mono text-slate-400 tracking-wider">
          OUT OF 100
        </span>
        <span className={`text-[11px] font-mono font-bold mt-1 tracking-wider ${levelColor}`}>
          {level}
        </span>
      </div>
    </div>
  );
};

export default RiskMeter;


