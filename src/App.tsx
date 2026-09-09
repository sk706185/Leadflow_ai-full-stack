import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, RefreshCw, Sparkles, Building2 } from 'lucide-react';
import { Lead, LeadFormData, LeadPriority } from './types.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { Navbar } from './components/Navbar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { LeadsTableView } from './components/LeadsTableView.tsx';
import { LeadDetailsView } from './components/LeadDetailsView.tsx';
import { LeadModal } from './components/LeadModal.tsx';
import { DeleteConfirmModal } from './components/DeleteConfirmModal.tsx';
import { DashboardSkeleton, TableSkeleton } from './components/SkeletonLoader.tsx';

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Navigation and Views
  const [currentView, setCurrentView] = useState<'dashboard' | 'leads' | 'details'>('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [tablePriorityFilter, setTablePriorityFilter] = useState<'ALL' | LeadPriority>('ALL');

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Counts for sidebar badges
  const highCount = leads.filter((l) => l.priority === 'HIGH').length;
  const mediumCount = leads.filter((l) => l.priority === 'MEDIUM').length;
  const lowCount = leads.filter((l) => l.priority === 'LOW').length;

  // Fetch leads from backend
  const fetchLeads = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/leads');
      if (!res.ok) {
        throw new Error(`Failed to load leads (${res.status} ${res.statusText})`);
      }
      const data: Lead[] = await res.json();
      setLeads(data);
    } catch (err: any) {
      console.error('Error fetching leads:', err);
      setError(err?.message || 'Could not connect to the backend server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when inside an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        setCurrentView('dashboard');
      } else if ((e.metaKey || e.ctrlKey) && e.key === '2') {
        e.preventDefault();
        setCurrentView('leads');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Selected lead object for details view
  const activeLead = leads.find((l) => l.id === selectedLeadId) || null;

  // Handle Create or Update Lead
  const handleSaveLead = async (formData: LeadFormData) => {
    if (leadToEdit) {
      // UPDATE
      const res = await fetch(`/api/leads/${leadToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update lead');
      }
      const updatedLead: Lead = await res.json();
      setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
    } else {
      // CREATE
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create lead');
      }
      const newLead: Lead = await res.json();
      setLeads((prev) => [newLead, ...prev]);
    }
    setLeadToEdit(null);
  };

  // Handle Delete Lead
  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/leads/${leadToDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete lead');
      }
      setLeads((prev) => prev.filter((l) => l.id !== leadToDelete.id));
      if (selectedLeadId === leadToDelete.id) {
        setSelectedLeadId(null);
        setCurrentView('leads');
      }
      setLeadToDelete(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete lead');
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset Seed Data
  const handleResetSeedData = async () => {
    try {
      setError(null);
      const res = await fetch('/api/leads/reset', {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to reset leads');
      const data = await res.json();
      setLeads(data.leads || []);
      if (selectedLeadId && !data.leads?.some((l: Lead) => l.id === selectedLeadId)) {
        setSelectedLeadId(null);
        setCurrentView('leads');
      }
    } catch (err: any) {
      setError(err?.message || 'Error resetting seed leads');
    }
  };

  // Navigation handlers
  const handleSelectLead = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setCurrentView('details');
  };

  const handleOpenAddModal = () => {
    setLeadToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lead: Lead) => {
    setLeadToEdit(lead);
    setIsModalOpen(true);
  };

  const handleNavigate = (view: 'dashboard' | 'leads') => {
    if (view === 'leads') {
      setTablePriorityFilter('ALL');
    }
    setCurrentView(view);
  };

  const handleDashboardNavigateToLeads = (priority?: 'HIGH' | 'MEDIUM' | 'LOW') => {
    setTablePriorityFilter(priority || 'ALL');
    setCurrentView('leads');
  };

  const handleSidebarFilterPriority = (priority: 'ALL' | LeadPriority) => {
    setTablePriorityFilter(priority);
    setCurrentView('leads');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white flex">
      {/* Enterprise Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAddModal={handleOpenAddModal}
        totalLeadsCount={leads.length}
        highCount={highCount}
        mediumCount={mediumCount}
        lowCount={lowCount}
        activePriorityFilter={tablePriorityFilter}
        onFilterPriority={handleSidebarFilterPriority}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Frame (offset on desktop by sidebar width) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Workspace Topbar */}
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenAddModal={handleOpenAddModal}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          activeLeadName={activeLead?.companyName}
          totalLeadsCount={leads.length}
        />

        {/* Main Workspace Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Global Error Notification Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5 text-xs font-semibold">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchLeads}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
                <button
                  onClick={() => setError(null)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Loading Skeletons */}
          {isLoading && leads.length === 0 ? (
            currentView === 'dashboard' ? (
              <DashboardSkeleton />
            ) : (
              <TableSkeleton />
            )
          ) : (
            <>
              {/* View 1: Dashboard */}
              {currentView === 'dashboard' && (
                <DashboardView
                  leads={leads}
                  onSelectLead={handleSelectLead}
                  onNavigateToLeads={handleDashboardNavigateToLeads}
                  onOpenAddModal={handleOpenAddModal}
                />
              )}

              {/* View 2: Leads Management Table */}
              {currentView === 'leads' && (
                <LeadsTableView
                  leads={leads}
                  onSelectLead={handleSelectLead}
                  onEditLead={handleOpenEditModal}
                  onDeleteLead={(lead) => setLeadToDelete(lead)}
                  onOpenAddModal={handleOpenAddModal}
                  onResetSeedData={handleResetSeedData}
                  initialPriorityFilter={tablePriorityFilter}
                />
              )}

              {/* View 3: Lead Details Audit View */}
              {currentView === 'details' && activeLead && (
                <LeadDetailsView
                  lead={activeLead}
                  onBack={() => setCurrentView('leads')}
                  onEdit={handleOpenEditModal}
                  onDelete={(lead) => setLeadToDelete(lead)}
                />
              )}

              {/* Fallback if details view was active but lead was removed */}
              {currentView === 'details' && !activeLead && (
                <div className="py-16 text-center space-y-3 bg-white rounded-xl border border-slate-200/80 p-8 shadow-2xs">
                  <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                  <h2 className="text-base font-bold text-slate-800">Lead record not found</h2>
                  <p className="text-xs text-slate-500">
                    The requested company lead is no longer in the active pipeline.
                  </p>
                  <button
                    onClick={() => setCurrentView('leads')}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Return to Leads Directory
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {/* Global Modal: Add / Edit Lead */}
        <LeadModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setLeadToEdit(null);
          }}
          onSubmit={handleSaveLead}
          initialLead={leadToEdit}
        />

        {/* Global Modal: Delete Confirmation */}
        <DeleteConfirmModal
          isOpen={Boolean(leadToDelete)}
          onClose={() => setLeadToDelete(null)}
          onConfirm={handleConfirmDelete}
          lead={leadToDelete}
          isDeleting={isDeleting}
        />

        {/* Bottom Workspace Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-5 mt-auto text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-bold text-slate-900">LeadFlow AI</span>
              <span className="text-slate-400">• Intelligent B2B Lead Scoring Engine</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Target: Home Services • 10–50 HC • $1M–$10M Revenue • Founded &gt; 2000 • CEO Age 45+
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
