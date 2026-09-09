import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Users,
  Calendar,
  UserCheck,
  Globe,
  MapPin,
} from 'lucide-react';
import { Lead, LeadFormData, LeadSource } from '../types.ts';
import { evaluateLead } from '../scoring.ts';
import { PriorityBadge } from './PriorityBadge.tsx';
import { validateUrlInput, normalizeUrl } from '../utils/url.ts';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeadFormData) => Promise<void>;
  initialLead?: Lead | null;
}

const COMMON_HOME_SERVICES = [
  'HVAC & Climate Solutions',
  'Residential Roofing & Gutters',
  'Plumbing & Trenchless Sewer',
  'Electrical & Smart Home',
  'Home Restoration & Remediation',
  'Solar & Energy Storage',
  'Landscaping & Tree Care',
];

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialLead,
}) => {
  const isEditing = Boolean(initialLead);

  const [formData, setFormData] = useState<LeadFormData>({
    companyName: '',
    website: '',
    linkedin: '',
    industry: 'Home Services',
    service: 'HVAC & Climate Solutions',
    location: '',
    employeeCount: 25,
    revenue: 3500000,
    yearFounded: 2010,
    ceoName: '',
    ceoAge: 48,
    source: 'MANUAL',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (initialLead) {
      setFormData({
        companyName: initialLead.companyName,
        website: initialLead.website,
        linkedin: initialLead.linkedin,
        industry: initialLead.industry,
        service: initialLead.service,
        location: initialLead.location,
        employeeCount: initialLead.employeeCount,
        revenue: initialLead.revenue,
        yearFounded: initialLead.yearFounded,
        ceoName: initialLead.ceoName,
        ceoAge: initialLead.ceoAge,
        source: initialLead.source,
      });
    } else {
      setFormData({
        companyName: '',
        website: '',
        linkedin: '',
        industry: 'Home Services',
        service: 'HVAC & Climate Solutions',
        location: 'Austin, TX',
        employeeCount: 25,
        revenue: 3500000,
        yearFounded: 2010,
        ceoName: '',
        ceoAge: 48,
        source: 'MANUAL',
      });
    }
    setErrors({});
  }, [initialLead, isOpen]);

  // Real-time evaluation preview
  const previewEval = evaluateLead({
    industry: formData.industry,
    employeeCount: Number(formData.employeeCount) || 0,
    revenue: Number(formData.revenue) || 0,
    yearFounded: Number(formData.yearFounded) || 0,
    ceoAge: Number(formData.ceoAge) || 0,
  });

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!formData.industry.trim()) {
      newErrors.industry = 'Industry is required';
    }
    if (formData.employeeCount < 0) {
      newErrors.employeeCount = 'Must be non-negative';
    }
    if (formData.revenue < 0) {
      newErrors.revenue = 'Must be non-negative';
    }
    if (formData.yearFounded < 1800 || formData.yearFounded > new Date().getFullYear()) {
      newErrors.yearFounded = `Valid year between 1800 and ${new Date().getFullYear()}`;
    }
    if (formData.ceoAge < 18 || formData.ceoAge > 110) {
      newErrors.ceoAge = 'Valid age between 18 and 110';
    }

    // URL validation
    if (formData.website && formData.website.trim()) {
      const v = validateUrlInput(formData.website, { isLinkedIn: false, label: 'Website URL' });
      if (!v.isValid && v.error) {
        newErrors.website = v.error;
      }
    }
    if (formData.linkedin && formData.linkedin.trim()) {
      const v = validateUrlInput(formData.linkedin, { isLinkedIn: true, label: 'LinkedIn URL' });
      if (!v.isValid && v.error) {
        newErrors.linkedin = v.error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const normalizedWebsite = formData.website && formData.website.trim() ? normalizeUrl(formData.website) : '';
    const normalizedLinkedin = formData.linkedin && formData.linkedin.trim() ? normalizeUrl(formData.linkedin) : '';

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...formData,
        website: normalizedWebsite,
        linkedin: normalizedLinkedin,
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err?.message || 'Failed to save lead' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="lead-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div
        id="lead-modal-container"
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-3xl overflow-hidden my-6 transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit Company Lead' : 'Add Target Company'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Evaluated deterministically through the acquisition scoring model.
              </p>
            </div>
          </div>
          <button
            id="modal-close-button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Score Preview Strip — Strongest Visual Element in Modal */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-300">Live Scoring:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-emerald-400 tracking-tight font-mono">
                {previewEval.leadScore}
                <span className="text-xs font-normal text-slate-400">/100</span>
              </span>
              <PriorityBadge priority={previewEval.priority} size="sm" />
            </div>
          </div>

          <div className="text-xs text-slate-300 flex items-center gap-2">
            <span>Criteria Passing:</span>
            <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {previewEval.detailedCriteria.filter((c) => c.matched).length} / 5 Rules Met
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(85vh-160px)] overflow-y-auto">
          {errors.form && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Section 1: Company Profile */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
              1. Company Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-company-name"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Apex HVAC & Climate Solutions"
                  className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
                    errors.companyName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.companyName && <p className="text-[11px] text-rose-500 mt-1">{errors.companyName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location / Headquarters
                </label>
                <input
                  id="input-location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Austin, TX"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company Website URL <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  id="input-website"
                  type="text"
                  value={formData.website}
                  onChange={(e) => {
                    setFormData({ ...formData, website: e.target.value });
                    if (errors.website) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.website;
                        return copy;
                      });
                    }
                  }}
                  placeholder="e.g. https://apexsolutions.com"
                  className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
                    errors.website ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.website ? (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.website}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Enter valid domain or URL. Leave blank if not available.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  LinkedIn Profile URL <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  id="input-linkedin"
                  type="text"
                  value={formData.linkedin}
                  onChange={(e) => {
                    setFormData({ ...formData, linkedin: e.target.value });
                    if (errors.linkedin) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.linkedin;
                        return copy;
                      });
                    }
                  }}
                  placeholder="e.g. https://linkedin.com/company/apex-solutions"
                  className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
                    errors.linkedin ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.linkedin ? (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.linkedin}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Must be a valid linkedin.com URL or left empty.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Industry & Specialization */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
              2. Industry & Service Specialization
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Industry <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Home Services (+25 pts)
                  </span>
                </div>
                <input
                  id="input-industry"
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g. Home Services"
                  className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                    errors.industry ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.industry && <p className="text-[11px] text-rose-500 mt-1">{errors.industry}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Core Service Focus
                </label>
                <input
                  id="input-service"
                  type="text"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  placeholder="e.g. Residential Plumbing & HVAC"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financials & Operations */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
              3. Operational Scale & Financials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Annual Revenue ($)</label>
                  <span className="text-[10px] text-slate-400 font-mono">$1M–$10M</span>
                </div>
                <input
                  id="input-revenue"
                  type="number"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  ${(formData.revenue / 1_000_000).toFixed(2)}M
                  {formData.revenue >= 1_000_000 && formData.revenue <= 10_000_000 ? (
                    <span className="text-emerald-600 font-semibold ml-1">✓ In range (+20 pts)</span>
                  ) : (
                    <span className="text-slate-400 ml-1">✗ Outside target</span>
                  )}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Team Headcount</label>
                  <span className="text-[10px] text-slate-400 font-mono">10–50 HC</span>
                </div>
                <input
                  id="input-employee-count"
                  type="number"
                  value={formData.employeeCount}
                  onChange={(e) => setFormData({ ...formData, employeeCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {formData.employeeCount >= 10 && formData.employeeCount <= 50 ? (
                    <span className="text-emerald-600 font-semibold">✓ Meets criteria (+20 pts)</span>
                  ) : (
                    <span className="text-slate-400">✗ Outside 10–50 range</span>
                  )}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Year Founded</label>
                  <span className="text-[10px] text-slate-400 font-mono">&gt; 2000</span>
                </div>
                <input
                  id="input-year-founded"
                  type="number"
                  value={formData.yearFounded}
                  onChange={(e) => setFormData({ ...formData, yearFounded: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {formData.yearFounded > 2000 ? (
                    <span className="text-emerald-600 font-semibold">✓ Founded &gt; 2000 (+15 pts)</span>
                  ) : (
                    <span className="text-slate-400">✗ Prior to 2000</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Executive Leadership & Provenance */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
              4. Executive Leadership & Record Source
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CEO / Founder Name</label>
                <input
                  id="input-ceo-name"
                  type="text"
                  value={formData.ceoName}
                  onChange={(e) => setFormData({ ...formData, ceoName: e.target.value })}
                  placeholder="e.g. Marcus Vance"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">CEO Age</label>
                  <span className="text-[10px] text-slate-400 font-mono">Age 45+</span>
                </div>
                <input
                  id="input-ceo-age"
                  type="number"
                  value={formData.ceoAge}
                  onChange={(e) => setFormData({ ...formData, ceoAge: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {formData.ceoAge >= 45 ? (
                    <span className="text-emerald-600 font-semibold">✓ Senior Age 45+ (+20 pts)</span>
                  ) : (
                    <span className="text-slate-400">✗ Below 45 threshold</span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Acquisition Source</label>
                <select
                  id="input-source"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="MANUAL">MANUAL</option>
                  <option value="SAASQUATCH">SAASQUATCH</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200/80 flex items-center justify-end gap-3">
            <button
              id="modal-cancel-button"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="modal-submit-button"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating & Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isEditing ? 'Update & Recalculate' : 'Save & Score Lead'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
