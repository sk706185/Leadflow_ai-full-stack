import React from 'react';
import {
  LayoutDashboard,
  TableProperties,
  Plus,
  Sparkles,
  Award,
  TrendingUp,
  Filter,
  CheckCircle2,
  X,
  Database,
  Building2,
} from 'lucide-react';
import { LeadPriority } from '../types.ts';

interface SidebarProps {
  currentView: 'dashboard' | 'leads' | 'details';
  onNavigate: (view: 'dashboard' | 'leads') => void;
  onOpenAddModal: () => void;
  totalLeadsCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  activePriorityFilter: 'ALL' | LeadPriority;
  onFilterPriority: (priority: 'ALL' | LeadPriority) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenAddModal,
  totalLeadsCount,
  highCount,
  mediumCount,
  lowCount,
  activePriorityFilter,
  onFilterPriority,
  isMobileOpen,
  onCloseMobile,
}) => {
  const handleSelectNav = (view: 'dashboard' | 'leads') => {
    onNavigate(view);
    onCloseMobile();
  };

  const handleSelectFilter = (priority: 'ALL' | LeadPriority) => {
    onFilterPriority(priority);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 select-none">
      {/* Brand & Workspace Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700/80 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-white tracking-tight">LeadFlow AI</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">B2B Scoring Platform</div>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="p-4 border-b border-slate-800/50">
        <button
          id="sidebar-add-lead-btn"
          onClick={() => {
            onOpenAddModal();
            onCloseMobile();
          }}
          className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main Section */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Main Workspace
          </div>

          <button
            id="sidebar-nav-dashboard"
            onClick={() => handleSelectNav('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              currentView === 'dashboard'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard
                className={`w-4 h-4 ${currentView === 'dashboard' ? 'text-emerald-400' : 'text-slate-400'}`}
              />
              <span>Dashboard</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">⌘1</span>
          </button>

          <button
            id="sidebar-nav-leads"
            onClick={() => handleSelectNav('leads')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              currentView === 'leads' || currentView === 'details'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <TableProperties
                className={`w-4 h-4 ${
                  currentView === 'leads' || currentView === 'details'
                    ? 'text-emerald-400'
                    : 'text-slate-400'
                }`}
              />
              <span>Leads Directory</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-800 border border-slate-700 text-slate-300">
              {totalLeadsCount}
            </span>
          </button>
        </div>

        {/* Priority Filter Shortcuts */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Pipeline Filters
          </div>

          <button
            onClick={() => handleSelectFilter('ALL')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentView === 'leads' && activePriorityFilter === 'ALL'
                ? 'bg-slate-800/80 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>All Opportunities</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{totalLeadsCount}</span>
          </button>

          <button
            onClick={() => handleSelectFilter('HIGH')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentView === 'leads' && activePriorityFilter === 'HIGH'
                ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/40'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>High Fit (80–100)</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold font-mono bg-emerald-900/40 text-emerald-300">
              {highCount}
            </span>
          </button>

          <button
            onClick={() => handleSelectFilter('MEDIUM')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentView === 'leads' && activePriorityFilter === 'MEDIUM'
                ? 'bg-amber-950/50 text-amber-300 border border-amber-800/40'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Medium Fit (50–79)</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold font-mono bg-amber-900/40 text-amber-300">
              {mediumCount}
            </span>
          </button>

          <button
            onClick={() => handleSelectFilter('LOW')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentView === 'leads' && activePriorityFilter === 'LOW'
                ? 'bg-slate-800 text-slate-200'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span>Low Fit (&lt;50)</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold font-mono bg-slate-800 text-slate-400">
              {lowCount}
            </span>
          </button>
        </div>
      </div>

      {/* Target Criteria Mini Card pinned to bottom */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Target Thesis
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Live
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-[11px] space-y-1 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Industry:</span>
            <span className="font-semibold text-white">Home Services</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Revenue:</span>
            <span className="font-semibold text-white">$1M–$10M</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Headcount:</span>
            <span className="font-semibold text-white">10–50 HC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Executive:</span>
            <span className="font-semibold text-white">Age 45+</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside
        id="app-desktop-sidebar"
        className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:fixed lg:inset-y-0 z-30 border-r border-slate-800"
      >
        {content}
      </aside>

      {/* Mobile Drawer Backdrop & Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 z-10 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
