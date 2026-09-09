import React from 'react';
import { LeadPriority } from '../types.ts';

interface PriorityBadgeProps {
  priority: LeadPriority;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-bold tracking-wider',
    md: 'text-xs px-2.5 py-1 font-bold tracking-wide',
    lg: 'text-xs px-3 py-1.5 font-bold tracking-wide',
  };

  if (priority === 'HIGH') {
    return (
      <span
        id={`priority-badge-${priority.toLowerCase()}`}
        className={`inline-flex items-center gap-1.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300/70 ${sizeClasses[size]} whitespace-nowrap shadow-2xs`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        HIGH FIT
      </span>
    );
  }

  if (priority === 'MEDIUM') {
    return (
      <span
        id={`priority-badge-${priority.toLowerCase()}`}
        className={`inline-flex items-center gap-1.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300/70 ${sizeClasses[size]} whitespace-nowrap shadow-2xs`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        MEDIUM FIT
      </span>
    );
  }

  return (
    <span
      id={`priority-badge-${priority.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300/80 ${sizeClasses[size]} whitespace-nowrap shadow-2xs`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      LOW FIT
    </span>
  );
};
