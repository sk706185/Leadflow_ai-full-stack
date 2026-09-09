import React from 'react';
import {
  ArrowLeft,
  Building2,
  Globe,
  Linkedin,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  UserCheck,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Layers,
  Award,
} from 'lucide-react';
import { Lead } from '../types.ts';
import { PriorityBadge } from './PriorityBadge.tsx';
import { ScoreMeter } from './ScoreMeter.tsx';
import { isValidExternalUrl, normalizeUrl } from '../utils/url.ts';

interface LeadDetailsViewProps {
  lead: Lead;
  onBack: () => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

export const LeadDetailsView: React.FC<LeadDetailsViewProps> = ({
  lead,
  onBack,
  onEdit,
  onDelete,
}) => {
  const hasValidWebsite = isValidExternalUrl(lead.website);
  const normalizedWebsite = hasValidWebsite ? normalizeUrl(lead.website) : '';

  const hasValidLinkedIn = isValidExternalUrl(lead.linkedin);
  const normalizedLinkedIn = hasValidLinkedIn ? normalizeUrl(lead.linkedin) : '';

  const formattedRevenue =
    lead.revenue >= 1_000_000
      ? `$${(lead.revenue / 1_000_000).toFixed(2)} Million`
      : `$${(lead.revenue / 1_000).toFixed(0)}k`;

  const companyAge = new Date().getFullYear() - lead.yearFounded;

  return (
    <div id="lead-details-view" className="space-y-6 animate-fadeIn">
      {/* Top Bar with Back Button and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <button
          id="back-to-leads-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200/90 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs w-fit cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Directory</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            id="details-edit-btn"
            onClick={() => onEdit(lead)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Lead</span>
          </button>
          <button
            id="details-delete-btn"
            onClick={() => onDelete(lead)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Hero Card: Company Identity & The Lead Score as Centerpiece */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Company Identity */}
          <div className="space-y-3.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                {lead.industry}
              </span>
              <PriorityBadge priority={lead.priority} size="md" />
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-50 text-slate-600 border border-slate-200 uppercase">
                Source: {lead.source}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {lead.companyName.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {lead.companyName}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Prospect Record #{lead.id}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-600 pt-1">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Layers className="w-4 h-4 text-slate-400" />
                {lead.service}
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-4 h-4 text-slate-400" />
                {lead.location || 'United States'}
              </span>
              {hasValidWebsite ? (
                <a
                  id="details-website-link"
                  href={normalizedWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 underline font-semibold transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Website</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              ) : (
                <span
                  id="details-website-disabled"
                  className="flex items-center gap-1 text-slate-400 cursor-not-allowed select-none"
                  title="Website not available"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-slate-400 font-normal">Website not available</span>
                </span>
              )}

              {hasValidLinkedIn ? (
                <a
                  id="details-linkedin-link"
                  href={normalizedLinkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-700 hover:text-blue-800 underline font-semibold transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              ) : (
                <span
                  id="details-linkedin-disabled"
                  className="flex items-center gap-1 text-slate-400 cursor-not-allowed select-none"
                  title="LinkedIn not available"
                >
                  <Linkedin className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-slate-400 font-normal">LinkedIn not available</span>
                </span>
              )}
            </div>
          </div>

          {/* Right: Prominent Lead Score Radial Display (Strongest Visual Element) */}
          <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/90 shrink-0 shadow-2xs">
            <ScoreMeter score={lead.leadScore} size="lg" />
          </div>
        </div>
      </div>

      {/* Two Columns: Explainable Scoring Breakdown (7 cols) & Core Company Metrics (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Explainable Scoring Rules Assessment */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Explainable Score Breakdown
              </h2>
            </div>
            <span className="text-xs font-mono font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
              Score: {lead.leadScore}/100
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Deterministic audit demonstrating precisely how {lead.companyName} scored on each individual acquisition rule.
          </p>

          {/* Criteria Cards */}
          <div className="space-y-2.5">
            {lead.detailedCriteria && lead.detailedCriteria.length > 0 ? (
              lead.detailedCriteria.map((c) => (
                <div
                  key={c.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    c.matched
                      ? 'bg-emerald-50/40 border-emerald-200/80 shadow-2xs'
                      : 'bg-slate-50/70 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {c.matched ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{c.criterionName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({c.targetRule})
                          </span>
                        </div>
                        <p
                          className={`text-xs mt-1 font-medium ${
                            c.matched ? 'text-emerald-800' : 'text-slate-600'
                          }`}
                        >
                          {c.reason}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-mono font-bold ${
                          c.matched
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        +{c.pointsAwarded} / {c.maxPoints} pts
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Fallback if detailedCriteria array is empty
              lead.scoreReasons.map((reason, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
                    reason.startsWith('✓')
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span>{reason}</span>
                </div>
              ))
            )}
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200/80 flex items-center justify-between">
            <span className="font-semibold">Pipeline Recommendation:</span>
            <span className="font-bold text-slate-900">
              {lead.priority === 'HIGH'
                ? 'Immediate Outreach (Tier 1 Acquisition Target)'
                : lead.priority === 'MEDIUM'
                ? 'Secondary Review (Qualifies with Exceptions)'
                : 'Sub-Threshold / Pass'}
            </span>
          </div>
        </div>

        {/* Right Column: Company Metrics & Executive Leadership */}
        <div className="lg:col-span-5 space-y-6">
          {/* Key Metric Cards */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Company Metrics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Employee Count */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-medium flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Employees
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Target 10–50</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900">{lead.employeeCount}</div>
                <div className="mt-1 text-[11px]">
                  {lead.employeeCount >= 10 && lead.employeeCount <= 50 ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Meets criteria (+20 pts)
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-slate-400" /> Outside 10–50 target
                    </span>
                  )}
                </div>
              </div>

              {/* Annual Revenue */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-medium flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    Revenue
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Target $1M–$10M</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900">{formattedRevenue}</div>
                <div className="mt-1 text-[11px]">
                  {lead.revenue >= 1_000_000 && lead.revenue <= 10_000_000 ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Meets criteria (+20 pts)
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-slate-400" /> Outside target range
                    </span>
                  )}
                </div>
              </div>

              {/* Year Founded */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Founded
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Post-2000</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900">{lead.yearFounded}</div>
                <div className="mt-1 text-[11px]">
                  {lead.yearFounded > 2000 ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Founded post-2000 (+15 pts)
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-slate-400" /> Founded &le; 2000
                    </span>
                  )}
                </div>
              </div>

              {/* Company Age */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-medium flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Operating Age
                  </span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900">{companyAge} yrs</div>
                <div className="mt-1 text-[11px] text-slate-500">Operating in {lead.location}</div>
              </div>
            </div>
          </div>

          {/* Executive Leadership Details */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Executive Leadership
            </h2>

            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    {lead.ceoName ? lead.ceoName.charAt(0) : 'E'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {lead.ceoName || 'Executive Not Listed'}
                    </div>
                    <div className="text-xs text-slate-500">Chief Executive Officer / Principal</div>
                  </div>
                </div>

                <span className="font-mono text-sm font-bold px-2 py-0.5 rounded bg-slate-200/80 text-slate-800">
                  Age: {lead.ceoAge}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200/70 text-xs">
                {lead.ceoAge >= 45 ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Meets senior executive experience threshold (&ge; 45 yrs, +20 pts)
                  </span>
                ) : (
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                    Below 45+ target succession threshold
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
