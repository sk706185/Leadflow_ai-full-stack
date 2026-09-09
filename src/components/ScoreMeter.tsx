import React from 'react';

interface ScoreMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showBar?: boolean;
}

export const ScoreMeter: React.FC<ScoreMeterProps> = ({
  score,
  size = 'md',
  showBar = false,
}) => {
  // Color configuration based on 3-tier scoring system
  const getConfig = (s: number) => {
    if (s >= 80) {
      return {
        text: 'text-emerald-700',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/25',
        bar: 'bg-emerald-600',
        ring: 'text-emerald-500',
        badgeBg: 'bg-emerald-600',
        label: 'Exceptional Fit',
        tier: 'High Priority',
        accentLight: 'bg-emerald-50',
      };
    }
    if (s >= 50) {
      return {
        text: 'text-amber-700',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/25',
        bar: 'bg-amber-500',
        ring: 'text-amber-500',
        badgeBg: 'bg-amber-500',
        label: 'Moderate Fit',
        tier: 'Medium Priority',
        accentLight: 'bg-amber-50',
      };
    }
    return {
      text: 'text-slate-600',
      bg: 'bg-slate-500/10',
      border: 'border-slate-300',
      bar: 'bg-slate-400',
      ring: 'text-slate-400',
      badgeBg: 'bg-slate-400',
      label: 'Low Alignment',
      tier: 'Low Priority',
      accentLight: 'bg-slate-50',
    };
  };

  const config = getConfig(score);

  if (size === 'lg') {
    // Large Hero Radial Meter for Lead Details and Overview
    const radius = 48;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

    return (
      <div id="score-meter-lg" className="flex items-center gap-6 p-1">
        {/* Radial Circular Gauge */}
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
            {/* Background Track */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              className="text-slate-200/80"
              strokeWidth="9"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              className={`${config.ring} transition-all duration-1000 ease-out`}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          {/* Inner Numerical Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className={`text-3xl font-black tracking-tight font-mono ${config.text}`}>
              {score}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest -mt-0.5">
              / 100
            </span>
          </div>
        </div>

        {/* Descriptor Details */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
            <span>Score Evaluation</span>
          </div>
          <div className={`text-xl font-extrabold tracking-tight ${config.text}`}>
            {config.label}
          </div>
          <p className="text-xs text-slate-500 max-w-[220px] leading-relaxed">
            Algorithmic evaluation matched against 5 targeted Home Services acquisition rules.
          </p>
        </div>
      </div>
    );
  }

  // Size 'md' or 'sm' (Default used in tables and card rows)
  return (
    <div id="score-meter-pill" className="flex flex-col gap-1 min-w-[90px]">
      <div className="flex items-center gap-2">
        {/* The Lead Score Badge — High Visual Weight */}
        <div
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border font-mono font-black text-xs transition-colors shadow-2xs ${config.bg} ${config.text} ${config.border}`}
        >
          <span className="text-sm font-extrabold leading-none">{score}</span>
          <span className="text-[10px] font-medium opacity-60">/100</span>
        </div>

        {/* Tier Label (Optional micro tag on medium size) */}
        {size === 'md' && (
          <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">
            {config.tier}
          </span>
        )}
      </div>

      {showBar && (
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${config.bar}`}
            style={{ width: `${Math.max(6, Math.min(100, score))}%` }}
          />
        </div>
      )}
    </div>
  );
};
