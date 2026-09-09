import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div id="dashboard-skeleton" className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-slate-200 rounded-md" />
          <div className="h-4 w-96 bg-slate-100 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-32 bg-slate-200 rounded-lg" />
          <div className="h-9 w-28 bg-slate-200 rounded-lg" />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 bg-slate-200 rounded" />
              <div className="w-8 h-8 rounded-lg bg-slate-100" />
            </div>
            <div className="h-8 w-20 bg-slate-200 rounded" />
            <div className="pt-3 border-t border-slate-100 flex justify-between">
              <div className="h-3 w-28 bg-slate-100 rounded" />
              <div className="h-3 w-16 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Distribution & Rules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="h-5 w-48 bg-slate-200 rounded" />
          <div className="h-6 w-full bg-slate-100 rounded-lg" />
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-20 bg-slate-50 rounded-lg border border-slate-100" />
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="h-5 w-36 bg-slate-200 rounded" />
          <div className="space-y-2.5 pt-2">
            {[...Array(5)].map((_, k) => (
              <div key={k} className="h-8 bg-slate-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="h-5 w-40 bg-slate-200 rounded" />
        <div className="space-y-3">
          {[...Array(4)].map((_, l) => (
            <div key={l} className="h-12 bg-slate-50 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div id="table-skeleton" className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-2">
          <div className="h-7 w-52 bg-slate-200 rounded-md" />
          <div className="h-4 w-80 bg-slate-100 rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-28 bg-slate-200 rounded-lg" />
          <div className="h-9 w-28 bg-slate-200 rounded-lg" />
          <div className="h-9 w-28 bg-slate-200 rounded-lg" />
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="h-20 bg-white rounded-xl border border-slate-200/80 p-4" />

      {/* Table rows */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="h-11 bg-slate-50 border-b border-slate-200" />
        <div className="divide-y divide-slate-100 p-2 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-50/70 rounded-md flex items-center px-4 justify-between">
              <div className="h-4 w-44 bg-slate-200 rounded" />
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-4 w-20 bg-slate-100 rounded" />
              <div className="h-6 w-16 bg-slate-200 rounded" />
              <div className="h-6 w-20 bg-slate-100 rounded" />
              <div className="h-4 w-12 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
