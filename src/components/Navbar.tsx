import React from 'react';
import { Menu, Plus, Sparkles, ChevronRight, Database, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'leads' | 'details';
  onNavigate: (view: 'dashboard' | 'leads') => void;
  onOpenAddModal: () => void;
  onOpenMobileSidebar: () => void;
  activeLeadName?: string;
  totalLeadsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAddModal,
  onOpenMobileSidebar,
  activeLeadName,
  totalLeadsCount,
}) => {
  return (
    <header
      id="main-topbar"
      className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
    >
      {/* Left: Mobile hamburger + Workspace Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-menu-button"
          onClick={onOpenMobileSidebar}
          aria-label="Open Navigation Menu"
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Hierarchy */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <button
            onClick={() => onNavigate('dashboard')}
            className="hover:text-slate-900 transition-colors flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Pipeline</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

          {currentView === 'dashboard' && (
            <span className="text-slate-900 font-bold">Intelligence Overview</span>
          )}

          {currentView === 'leads' && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-900 font-bold">Leads Directory</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[11px] font-mono">
                {totalLeadsCount}
              </span>
            </div>
          )}

          {currentView === 'details' && (
            <>
              <button
                onClick={() => onNavigate('leads')}
                className="hover:text-slate-900 transition-colors"
              >
                Leads
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-bold max-w-[180px] sm:max-w-[280px] truncate">
                {activeLeadName || 'Company Audit'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right Area: Engine status pill & Add Lead Button */}
      <div className="flex items-center gap-3">
        {/* Real-time System Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-600 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="tracking-tight">Persistent Storage Active</span>
        </div>

        {/* Primary Action Button */}
        <button
          id="add-lead-topbar-button"
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
          <span>Add Lead</span>
        </button>
      </div>
    </header>
  );
};
