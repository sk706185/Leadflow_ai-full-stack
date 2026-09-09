import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  RotateCcw,
  Eye,
  Edit2,
  Trash2,
  Building2,
  X,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  Globe,
  Linkedin,
  ExternalLink,
} from 'lucide-react';
import { Lead, LeadPriority } from '../types.ts';
import { PriorityBadge } from './PriorityBadge.tsx';
import { ScoreMeter } from './ScoreMeter.tsx';
import { isValidExternalUrl, normalizeUrl } from '../utils/url.ts';

interface LeadsTableViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onOpenAddModal: () => void;
  onResetSeedData: () => Promise<void>;
  initialPriorityFilter?: 'ALL' | LeadPriority;
}

interface FilterState {
  search: string;
  priority: 'ALL' | LeadPriority;
  source: 'ALL' | 'SAASQUATCH' | 'MANUAL' | 'OTHER';
  industry: string;
  sortBy: 'score_desc' | 'score_asc' | 'revenue_desc' | 'name_asc' | 'created_desc';
}

export const LeadsTableView: React.FC<LeadsTableViewProps> = ({
  leads,
  onSelectLead,
  onEditLead,
  onDeleteLead,
  onOpenAddModal,
  onResetSeedData,
  initialPriorityFilter = 'ALL',
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    priority: initialPriorityFilter,
    source: 'ALL',
    industry: 'ALL',
    sortBy: 'score_desc',
  });

  const [isResetting, setIsResetting] = useState(false);

  // Sync initialPriorityFilter if prop changes
  useEffect(() => {
    if (initialPriorityFilter) {
      setFilters((prev) => ({ ...prev, priority: initialPriorityFilter }));
    }
  }, [initialPriorityFilter]);

  // Extract unique industries for filter dropdown
  const uniqueIndustries = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.industry) set.add(l.industry);
    });
    return Array.from(set).sort();
  }, [leads]);

  // Counts for quick priority pills
  const counts = useMemo(() => {
    return {
      all: leads.length,
      high: leads.filter((l) => l.priority === 'HIGH').length,
      medium: leads.filter((l) => l.priority === 'MEDIUM').length,
      low: leads.filter((l) => l.priority === 'LOW').length,
    };
  }, [leads]);

  // Filter and sort logic
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        // Search filter
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matches =
            (lead.companyName || '').toLowerCase().includes(q) ||
            (lead.service || '').toLowerCase().includes(q) ||
            (lead.location || '').toLowerCase().includes(q) ||
            (lead.ceoName || '').toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Priority filter
        if (filters.priority !== 'ALL') {
          if ((lead.priority || '').toUpperCase() !== filters.priority.toUpperCase()) return false;
        }

        // Source filter
        if (filters.source !== 'ALL') {
          if ((lead.source || '').toUpperCase() !== filters.source.toUpperCase()) return false;
        }

        // Industry filter
        if (filters.industry !== 'ALL') {
          if ((lead.industry || '').toLowerCase() !== filters.industry.toLowerCase()) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'score_desc':
            return (b.leadScore ?? 0) - (a.leadScore ?? 0);
          case 'score_asc':
            return (a.leadScore ?? 0) - (b.leadScore ?? 0);
          case 'name_asc':
            return (a.companyName || '').localeCompare(b.companyName || '');
          case 'revenue_desc':
            return (b.revenue ?? 0) - (a.revenue ?? 0);
          case 'created_desc':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return (b.leadScore ?? 0) - (a.leadScore ?? 0);
        }
      });
  }, [leads, filters]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;
    const headers = [
      'Company Name',
      'Industry',
      'Service',
      'Location',
      'Employees',
      'Revenue',
      'Year Founded',
      'CEO Name',
      'CEO Age',
      'Lead Score',
      'Priority',
      'Source',
      'Website',
      'LinkedIn',
    ];

    const rows = filteredLeads.map((l) => [
      `"${l.companyName.replace(/"/g, '""')}"`,
      `"${l.industry.replace(/"/g, '""')}"`,
      `"${l.service.replace(/"/g, '""')}"`,
      `"${l.location.replace(/"/g, '""')}"`,
      l.employeeCount,
      l.revenue,
      l.yearFounded,
      `"${l.ceoName.replace(/"/g, '""')}"`,
      l.ceoAge,
      l.leadScore,
      l.priority,
      l.source,
      `"${(l.website || '').replace(/"/g, '""')}"`,
      `"${(l.linkedin || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LeadFlow_AI_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetDemo = async () => {
    try {
      setIsResetting(true);
      await onResetSeedData();
    } finally {
      setIsResetting(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      priority: 'ALL',
      source: 'ALL',
      industry: 'ALL',
      sortBy: 'score_desc',
    });
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.priority !== 'ALL' ||
    filters.source !== 'ALL' ||
    filters.industry !== 'ALL';

  return (
    <div id="leads-management-view" className="space-y-6 animate-fadeIn">
      {/* Title & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leads Directory</h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredLeads.length} of {leads.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Manage, evaluate, and filter prospects algorithmically against your acquisition criteria.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="reset-seed-data-btn"
            onClick={handleResetDemo}
            disabled={isResetting}
            title="Reload initial 5 example Home Services leads"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isResetting ? 'Resetting...' : 'Reset 5 Seeds'}</span>
          </button>

          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            id="leads-add-lead-btn"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-xs hover:shadow-sm cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Modern Filter Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3.5">
        {/* Row 1: Priority Tab Buttons */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-100">
          <button
            onClick={() => setFilters({ ...filters, priority: 'ALL' })}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filters.priority === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
            }`}
          >
            <span>All Leads</span>
            <span
              className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                filters.priority === 'ALL' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setFilters({ ...filters, priority: 'HIGH' })}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filters.priority === 'HIGH'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/70'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>High Fit (80–100)</span>
            <span
              className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                filters.priority === 'HIGH'
                  ? 'bg-emerald-900 text-emerald-100'
                  : 'bg-emerald-200/80 text-emerald-900 font-bold'
              }`}
            >
              {counts.high}
            </span>
          </button>

          <button
            onClick={() => setFilters({ ...filters, priority: 'MEDIUM' })}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filters.priority === 'MEDIUM'
                ? 'bg-amber-700 text-white shadow-2xs'
                : 'bg-amber-50/70 text-amber-800 hover:bg-amber-100 border border-amber-200/70'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Medium Fit (50–79)</span>
            <span
              className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                filters.priority === 'MEDIUM'
                  ? 'bg-amber-800 text-amber-100'
                  : 'bg-amber-200/80 text-amber-900 font-bold'
              }`}
            >
              {counts.medium}
            </span>
          </button>

          <button
            onClick={() => setFilters({ ...filters, priority: 'LOW' })}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filters.priority === 'LOW'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Low Fit (&lt;50)</span>
            <span
              className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                filters.priority === 'LOW'
                  ? 'bg-slate-700 text-slate-200'
                  : 'bg-slate-200 text-slate-700 font-bold'
              }`}
            >
              {counts.low}
            </span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* Row 2: Search Input & Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="leads-search-input"
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search companies, services, location, CEO..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200/90 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>

          {/* Priority Dropdown (synced with tabs) */}
          <div className="md:col-span-2">
            <select
              id="filter-priority-select"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value as any })}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200/90 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority (80–100)</option>
              <option value="MEDIUM">Medium Priority (50–79)</option>
              <option value="LOW">Low Priority (&lt;50)</option>
            </select>
          </div>

          {/* Source Dropdown */}
          <div className="md:col-span-2">
            <select
              id="filter-source-select"
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value as any })}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200/90 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              <option value="ALL">All Sources</option>
              <option value="SAASQUATCH">SAASQUATCH</option>
              <option value="MANUAL">MANUAL</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          {/* Industry Dropdown */}
          <div className="md:col-span-2">
            <select
              id="filter-industry-select"
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200/90 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              <option value="ALL">All Industries</option>
              {uniqueIndustries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-2">
            <select
              id="sort-by-select"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200/90 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              <option value="score_desc">Score: High to Low</option>
              <option value="score_asc">Score: Low to High</option>
              <option value="revenue_desc">Revenue: High to Low</option>
              <option value="name_asc">Company Name (A–Z)</option>
              <option value="created_desc">Recently Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Leads Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="leads-data-table" className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200/80 sticky top-0 z-10 backdrop-blur-xs">
              <tr>
                <th className="py-3 px-4 font-bold text-slate-700">Company Name</th>
                <th className="py-3 px-4 font-bold text-slate-700">Industry & Focus</th>
                <th className="py-3 px-4 font-bold text-slate-700">Headcount</th>
                <th className="py-3 px-4 font-bold text-slate-700">Annual Revenue</th>
                <th className="py-3 px-4 font-bold text-slate-700 min-w-[150px]">
                  Lead Score
                </th>
                <th className="py-3 px-4 font-bold text-slate-700">Priority</th>
                <th className="py-3 px-4 font-bold text-slate-700">Source</th>
                <th className="py-3 px-4 font-bold text-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  id={`lead-row-${lead.id}`}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Company Name */}
                  <td className="py-3.5 px-4">
                    <div
                      onClick={() => onSelectLead(lead)}
                      className="cursor-pointer flex items-center gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs group-hover:bg-emerald-600 transition-colors">
                        {lead.companyName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {lead.companyName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span>{lead.location || 'Location N/A'} • {lead.service}</span>
                          {isValidExternalUrl(lead.website) && (
                            <a
                              id={`table-website-${lead.id}`}
                              href={normalizeUrl(lead.website)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-0.5 text-emerald-700 hover:text-emerald-800 underline font-medium"
                              title={`Visit Website: ${lead.website}`}
                            >
                              <Globe className="w-3 h-3 text-emerald-600" />
                              <span>Website</span>
                            </a>
                          )}
                          {isValidExternalUrl(lead.linkedin) && (
                            <a
                              id={`table-linkedin-${lead.id}`}
                              href={normalizeUrl(lead.linkedin)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-0.5 text-blue-700 hover:text-blue-800 underline font-medium"
                              title={`Visit LinkedIn: ${lead.linkedin}`}
                            >
                              <Linkedin className="w-3 h-3 text-blue-600" />
                              <span>LinkedIn</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Industry */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        lead.industry.toLowerCase() === 'home services'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {lead.industry}
                    </span>
                  </td>

                  {/* Headcount */}
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    <div className="font-bold text-slate-900">{lead.employeeCount}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {lead.employeeCount >= 10 && lead.employeeCount <= 50 ? 'Ideal 10–50' : 'Outside range'}
                    </div>
                  </td>

                  {/* Revenue */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="font-bold text-slate-900 font-mono">
                      {lead.revenue >= 1_000_000
                        ? `$${(lead.revenue / 1_000_000).toFixed(2)}M`
                        : `$${(lead.revenue / 1_000).toFixed(0)}k`}
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {lead.revenue >= 1_000_000 && lead.revenue <= 10_000_000
                        ? 'Target $1M–$10M'
                        : 'Outside target'}
                    </div>
                  </td>

                  {/* Lead Score — Centerpiece Visual Element */}
                  <td className="py-3.5 px-4">
                    <ScoreMeter score={lead.leadScore} showBar={true} size="md" />
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4">
                    <PriorityBadge priority={lead.priority} size="sm" />
                  </td>

                  {/* Source */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-semibold uppercase">
                      {lead.source}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        id={`btn-view-${lead.id}`}
                        onClick={() => onSelectLead(lead)}
                        title="View Evaluation Audit"
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        id={`btn-edit-${lead.id}`}
                        onClick={() => onEditLead(lead)}
                        title="Edit Lead"
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        id={`btn-delete-${lead.id}`}
                        onClick={() => onDeleteLead(lead)}
                        title="Delete Lead"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="font-bold text-slate-800 text-sm">No matching company leads</div>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      No companies in the pipeline match the selected priority or search criteria.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <button
                        onClick={clearFilters}
                        className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Reset filters
                      </button>
                      <button
                        onClick={onOpenAddModal}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        Add new lead
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Information Bar */}
        <div className="p-3.5 bg-slate-50/60 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
          <div>
            Displaying <span className="font-bold text-slate-800">{filteredLeads.length}</span> active
            records
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Scores recalculated on any parameter edit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
