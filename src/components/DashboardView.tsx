import React from 'react';
import {
  TrendingUp,
  Award,
  BarChart3,
  ArrowUpRight,
  Plus,
  Building2,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Layers,
  Flame,
} from 'lucide-react';
import { Lead } from '../types.ts';
import { PriorityBadge } from './PriorityBadge.tsx';
import { ScoreMeter } from './ScoreMeter.tsx';

interface DashboardViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onNavigateToLeads: (filterPriority?: 'HIGH' | 'MEDIUM' | 'LOW') => void;
  onOpenAddModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  onSelectLead,
  onNavigateToLeads,
  onOpenAddModal,
}) => {
  const totalLeads = leads.length;
  const highPriority = leads.filter((l) => l.priority === 'HIGH');
  const mediumPriority = leads.filter((l) => l.priority === 'MEDIUM');
  const lowPriority = leads.filter((l) => l.priority === 'LOW');

  const highCount = highPriority.length;
  const mediumCount = mediumPriority.length;
  const lowCount = lowPriority.length;

  const averageScore =
    totalLeads > 0
      ? Math.round(leads.reduce((acc, curr) => acc + curr.leadScore, 0) / totalLeads)
      : 0;

  const highPct = totalLeads > 0 ? Math.round((highCount / totalLeads) * 100) : 0;
  const mediumPct = totalLeads > 0 ? Math.round((mediumCount / totalLeads) * 100) : 0;
  const lowPct = totalLeads > 0 ? Math.round((lowCount / totalLeads) * 100) : 0;

  // Recent leads sorted by latest updated/created
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div id="dashboard-view" className="space-y-8 animate-fadeIn">
      {/* Dashboard Top Header & Quick Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pipeline Intelligence</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live Evaluation
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Automated underwriting & quantitative ranking for Home Services acquisitions against strict investment criteria.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="dashboard-view-all-leads-btn"
            onClick={() => onNavigateToLeads()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs hover:border-slate-300 cursor-pointer"
          >
            <span>Browse Directory</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            id="dashboard-add-lead-btn"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-xs hover:shadow-sm cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Evaluated */}
        <div
          id="stat-card-total"
          onClick={() => onNavigateToLeads()}
          className="bg-white p-5 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all cursor-pointer shadow-2xs group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Evaluated Leads
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
              {totalLeads}
            </span>
            <span className="text-xs text-slate-400 font-medium">Companies</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-[11px] text-slate-500 justify-between">
            <span>Persistent Database</span>
            <span className="text-slate-900 font-semibold flex items-center gap-0.5">
              Explore All <ArrowUpRight className="w-3 h-3 text-slate-400" />
            </span>
          </div>
        </div>

        {/* High Priority (Lead Score 80-100) */}
        <div
          id="stat-card-high"
          onClick={() => onNavigateToLeads('HIGH')}
          className="bg-white p-5 rounded-xl border border-emerald-200/90 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              High Fit (80–100)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-900 tracking-tight font-mono">
              {highCount}
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
              {highPct}% of pipe
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-100/70 flex items-center text-[11px] text-slate-500 justify-between">
            <span>Threshold: &ge;80 pts</span>
            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
              Top Targets <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Medium Priority (Lead Score 50-79) */}
        <div
          id="stat-card-medium"
          onClick={() => onNavigateToLeads('MEDIUM')}
          className="bg-white p-5 rounded-xl border border-amber-200/90 hover:border-amber-300 transition-all cursor-pointer shadow-2xs group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Medium Fit (50–79)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-900 tracking-tight font-mono">
              {mediumCount}
            </span>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
              {mediumPct}% of pipe
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-amber-100/70 flex items-center text-[11px] text-slate-500 justify-between">
            <span>Threshold: 50–79 pts</span>
            <span className="text-amber-700 font-bold flex items-center gap-0.5">
              Review Queue <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Average Pipeline Score */}
        <div
          id="stat-card-avg"
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Portfolio Quality
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
              {averageScore}
            </span>
            <span className="text-xs font-semibold text-slate-400">/100 avg</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-[11px] text-slate-500 justify-between">
            <span>Overall Alignment</span>
            <span className="font-bold text-slate-800">
              {averageScore >= 80 ? 'Exceptional' : averageScore >= 50 ? 'Promising' : 'Developing'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Priority Distribution & Target Rules Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Priority Distribution Visualizer (7 cols) */}
        <div
          id="priority-distribution-card"
          className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Pipeline Health Distribution
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proportion of target companies qualifying for acquisition outreach.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                {totalLeads} Total Leads
              </span>
            </div>

            {/* Segmented Stacked Progress Bar */}
            <div className="mt-6 space-y-4">
              <div className="h-5 w-full bg-slate-100 rounded-lg overflow-hidden flex shadow-inner">
                {highCount > 0 && (
                  <div
                    className="bg-emerald-600 transition-all duration-700 flex items-center justify-center text-[10px] font-bold text-white tracking-wider font-mono"
                    style={{ width: `${highPct}%` }}
                    title={`High Fit: ${highCount} (${highPct}%)`}
                  >
                    {highPct >= 14 && `${highPct}%`}
                  </div>
                )}
                {mediumCount > 0 && (
                  <div
                    className="bg-amber-500 transition-all duration-700 flex items-center justify-center text-[10px] font-bold text-white tracking-wider font-mono"
                    style={{ width: `${mediumPct}%` }}
                    title={`Medium Fit: ${mediumCount} (${mediumPct}%)`}
                  >
                    {mediumPct >= 14 && `${mediumPct}%`}
                  </div>
                )}
                {lowCount > 0 && (
                  <div
                    className="bg-slate-400 transition-all duration-700 flex items-center justify-center text-[10px] font-bold text-white tracking-wider font-mono"
                    style={{ width: `${lowPct}%` }}
                    title={`Low Fit: ${lowCount} (${lowPct}%)`}
                  >
                    {lowPct >= 14 && `${lowPct}%`}
                  </div>
                )}
                {totalLeads === 0 && (
                  <div className="w-full flex items-center justify-center text-xs text-slate-400 font-medium">
                    No leads recorded yet
                  </div>
                )}
              </div>

              {/* 3 Clickable Priority Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  onClick={() => onNavigateToLeads('HIGH')}
                  className="p-3.5 rounded-xl border border-emerald-200/70 bg-emerald-50/40 hover:bg-emerald-50 text-left transition-all cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      High Fit
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                      {highCount}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">Score: 80–100</div>
                  <div className="text-xs font-bold text-emerald-700 mt-0.5">
                    {highPct}% of pipeline
                  </div>
                </button>

                <button
                  onClick={() => onNavigateToLeads('MEDIUM')}
                  className="p-3.5 rounded-xl border border-amber-200/70 bg-amber-50/40 hover:bg-amber-50 text-left transition-all cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Medium Fit
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100/80 px-1.5 py-0.5 rounded">
                      {mediumCount}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">Score: 50–79</div>
                  <div className="text-xs font-bold text-amber-700 mt-0.5">
                    {mediumPct}% of pipeline
                  </div>
                </button>

                <button
                  onClick={() => onNavigateToLeads('LOW')}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100 text-left transition-all cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      Low Fit
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800 bg-slate-200/80 px-1.5 py-0.5 rounded">
                      {lowCount}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">Score: &lt;50</div>
                  <div className="text-xs font-bold text-slate-600 mt-0.5">
                    {lowPct}% of pipeline
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Real-time algorithmically evaluated</span>
            <button
              onClick={() => onNavigateToLeads()}
              className="text-slate-900 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Filter in Leads Directory <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scoring Engine Target Criteria (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Scoring Criteria Rules
                </h2>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                100 pts total
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Every prospect is scored deterministically based on these 5 acquisition thresholds:
            </p>

            <ul className="mt-4 space-y-2 text-xs">
              <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/70">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-800">Target Industry</span>
                  <span className="text-[11px] text-slate-500">(Home Services)</span>
                </div>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded text-xs">
                  +25 pts
                </span>
              </li>

              <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/70">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-800">Headcount</span>
                  <span className="text-[11px] text-slate-500">(10–50 Employees)</span>
                </div>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded text-xs">
                  +20 pts
                </span>
              </li>

              <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/70">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-800">Annual Revenue</span>
                  <span className="text-[11px] text-slate-500">($1M–$10M)</span>
                </div>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded text-xs">
                  +20 pts
                </span>
              </li>

              <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/70">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-800">Year Founded</span>
                  <span className="text-[11px] text-slate-500">(Founded &gt; 2000)</span>
                </div>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded text-xs">
                  +15 pts
                </span>
              </li>

              <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/70">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-800">Executive Experience</span>
                  <span className="text-[11px] text-slate-500">(CEO Age 45+)</span>
                </div>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded text-xs">
                  +20 pts
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Targeting Formula: Linear Additive</span>
            <span className="font-semibold text-slate-800">Rule Threshold: 80+ High</span>
          </div>
        </div>
      </div>

      {/* Recent Evaluated Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Recent Opportunities</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest prospective companies evaluated by the algorithm.
            </p>
          </div>
          <button
            onClick={() => onNavigateToLeads()}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 group cursor-pointer"
          >
            <span>Open All Leads ({leads.length})</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-slate-400" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Industry & Focus</th>
                <th className="py-3 px-4">Financials & Team</th>
                <th className="py-3 px-4 min-w-[140px]">Lead Score</th>
                <th className="py-3 px-4">Priority Status</th>
                <th className="py-3 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  {/* Company Name & Location */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs group-hover:bg-emerald-600 transition-colors">
                        {lead.companyName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {lead.companyName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          {lead.location || 'Location N/A'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Industry & Service */}
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-800">{lead.industry}</span>
                    <div className="text-[11px] text-slate-400">{lead.service}</div>
                  </td>

                  {/* Revenue & Team */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">
                      ${(lead.revenue / 1_000_000).toFixed(1)}M Annual
                    </div>
                    <div className="text-[11px] text-slate-400">{lead.employeeCount} team members</div>
                  </td>

                  {/* Lead Score — Strongest Visual Element */}
                  <td className="py-3.5 px-4">
                    <ScoreMeter score={lead.leadScore} showBar={true} size="md" />
                  </td>

                  {/* Priority Status */}
                  <td className="py-3.5 px-4">
                    <PriorityBadge priority={lead.priority} size="sm" />
                  </td>

                  {/* Details Link */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                      <span>View details</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </td>
                </tr>
              ))}

              {recentLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 space-y-2">
                    <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-600">No leads evaluated yet</p>
                    <p className="text-xs text-slate-400">
                      Click "+ Add Lead" to evaluate your first target company.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
