import { evaluateLead } from '../scoring';
import { Lead, LeadFormData } from '../types';
import { validateUrlInput } from '../utils/url';
import * as firestoreRepo from './firestore';

export const INITIAL_SEED_LEADS: Lead[] = [
  (() => {
    const evalResult = evaluateLead({
      industry: 'Home Services',
      employeeCount: 28,
      revenue: 4500000,
      yearFounded: 2008,
      ceoAge: 52,
    });
    return {
      id: 'lead-seed-1',
      companyName: 'Apex Service Partners',
      website: 'https://apexservicepartners.com',
      linkedin: 'https://www.linkedin.com/company/apex-service-partners/',
      industry: 'Home Services',
      service: 'HVAC & Climate Control',
      location: 'Austin, TX',
      employeeCount: 28,
      revenue: 4500000,
      yearFounded: 2008,
      ceoName: 'Marcus Vance',
      ceoAge: 52,
      leadScore: evalResult.leadScore,
      priority: evalResult.priority,
      scoreReasons: evalResult.scoreReasons,
      detailedCriteria: evalResult.detailedCriteria,
      source: 'SAASQUATCH',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    };
  })(),
  (() => {
    const evalResult = evaluateLead({
      industry: 'Home Services',
      employeeCount: 42,
      revenue: 7800000,
      yearFounded: 2012,
      ceoAge: 49,
    });
    return {
      id: 'lead-seed-2',
      companyName: 'Tecta America Corp.',
      website: 'https://www.tectaamerica.com',
      linkedin: 'https://www.linkedin.com/company/tecta-america-corp/',
      industry: 'Home Services',
      service: 'Commercial Roofing & Solar',
      location: 'Denver, CO',
      employeeCount: 42,
      revenue: 7800000,
      yearFounded: 2012,
      ceoName: 'Elena Rostova',
      ceoAge: 49,
      leadScore: evalResult.leadScore,
      priority: evalResult.priority,
      scoreReasons: evalResult.scoreReasons,
      detailedCriteria: evalResult.detailedCriteria,
      source: 'MANUAL',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    };
  })(),
  (() => {
    const evalResult = evaluateLead({
      industry: 'Home Services',
      employeeCount: 18,
      revenue: 2600000,
      yearFounded: 1996,
      ceoAge: 57,
    });
    return {
      id: 'lead-seed-3',
      companyName: 'Neighborly',
      website: 'https://www.neighborly.com',
      linkedin: 'https://www.linkedin.com/company/neighborly/',
      industry: 'Home Services',
      service: 'Plumbing & Drain Services',
      location: 'Charlotte, NC',
      employeeCount: 18,
      revenue: 2600000,
      yearFounded: 1996,
      ceoName: 'Robert Sterling',
      ceoAge: 57,
      leadScore: evalResult.leadScore,
      priority: evalResult.priority,
      scoreReasons: evalResult.scoreReasons,
      detailedCriteria: evalResult.detailedCriteria,
      source: 'SAASQUATCH',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    };
  })(),
  (() => {
    const evalResult = evaluateLead({
      industry: 'Home Services',
      employeeCount: 68,
      revenue: 8900000,
      yearFounded: 2016,
      ceoAge: 41,
    });
    return {
      id: 'lead-seed-4',
      companyName: 'Servpro Industries',
      website: 'https://www.servpro.com',
      linkedin: 'https://www.linkedin.com/company/servpro-industries/',
      industry: 'Home Services',
      service: 'Restoration & Deep Cleaning',
      location: 'Seattle, WA',
      employeeCount: 68,
      revenue: 8900000,
      yearFounded: 2016,
      ceoName: 'David Zhao',
      ceoAge: 41,
      leadScore: evalResult.leadScore,
      priority: evalResult.priority,
      scoreReasons: evalResult.scoreReasons,
      detailedCriteria: evalResult.detailedCriteria,
      source: 'OTHER',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    };
  })(),
  (() => {
    const evalResult = evaluateLead({
      industry: 'Home Services',
      employeeCount: 8,
      revenue: 850000,
      yearFounded: 2019,
      ceoAge: 38,
    });
    return {
      id: 'lead-seed-5',
      companyName: 'Authority Brands',
      website: 'https://www.authoritybrands.com',
      linkedin: 'https://www.linkedin.com/company/authority-brands/',
      industry: 'Home Services',
      service: 'Electrical Wiring & Smart Home',
      location: 'Phoenix, AZ',
      employeeCount: 8,
      revenue: 850000,
      yearFounded: 2019,
      ceoName: 'Jason Miller',
      ceoAge: 38,
      leadScore: evalResult.leadScore,
      priority: evalResult.priority,
      scoreReasons: evalResult.scoreReasons,
      detailedCriteria: evalResult.detailedCriteria,
      source: 'MANUAL',
      createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    };
  })(),
];

export interface LeadsQueryParams {
  search?: string;
  priority?: string;
  source?: string;
  industry?: string;
  sortBy?: string;
}

export async function getLeadsList(params: LeadsQueryParams = {}): Promise<Lead[]> {
  const allLeads = await firestoreRepo.getAllLeads(INITIAL_SEED_LEADS);
  let result = [...allLeads];

  const { search, priority, source, industry, sortBy } = params;

  if (search && typeof search === 'string') {
    const query = search.trim().toLowerCase();
    result = result.filter(
      (lead) =>
        (lead.companyName || '').toLowerCase().includes(query) ||
        (lead.service || '').toLowerCase().includes(query) ||
        (lead.location || '').toLowerCase().includes(query) ||
        (lead.ceoName || '').toLowerCase().includes(query)
    );
  }

  if (priority && priority !== 'ALL' && typeof priority === 'string') {
    result = result.filter((lead) => (lead.priority || '').toUpperCase() === priority.toUpperCase());
  }

  if (source && source !== 'ALL' && typeof source === 'string') {
    result = result.filter((lead) => (lead.source || '').toUpperCase() === source.toUpperCase());
  }

  if (industry && industry !== 'ALL' && typeof industry === 'string') {
    const ind = industry.toLowerCase();
    result = result.filter((lead) => (lead.industry || '').toLowerCase().includes(ind));
  }

  if (sortBy && typeof sortBy === 'string') {
    switch (sortBy) {
      case 'score_desc':
        result.sort((a, b) => (b.leadScore ?? 0) - (a.leadScore ?? 0));
        break;
      case 'score_asc':
        result.sort((a, b) => (a.leadScore ?? 0) - (b.leadScore ?? 0));
        break;
      case 'name_asc':
        result.sort((a, b) => (a.companyName || '').localeCompare(b.companyName || ''));
        break;
      case 'revenue_desc':
        result.sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0));
        break;
      case 'created_desc':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        result.sort((a, b) => (b.leadScore ?? 0) - (a.leadScore ?? 0));
    }
  } else {
    result.sort((a, b) => (b.leadScore ?? 0) - (a.leadScore ?? 0));
  }

  return result;
}

export async function getLead(id: string): Promise<Lead | null> {
  return await firestoreRepo.getLeadById(id, INITIAL_SEED_LEADS);
}

export interface CreateLeadResult {
  status: number;
  data?: Lead;
  error?: string;
}

export async function createNewLead(body: Partial<LeadFormData>): Promise<CreateLeadResult> {
  if (!body.companyName || !body.companyName.trim()) {
    return { status: 400, error: 'Company Name is required' };
  }
  if (!body.industry || !body.industry.trim()) {
    return { status: 400, error: 'Industry is required' };
  }

  // URL validation & normalization
  const websiteValidation = validateUrlInput(body.website, { isLinkedIn: false, label: 'Website URL' });
  if (!websiteValidation.isValid) {
    return { status: 400, error: websiteValidation.error };
  }

  const linkedinValidation = validateUrlInput(body.linkedin, { isLinkedIn: true, label: 'LinkedIn URL' });
  if (!linkedinValidation.isValid) {
    return { status: 400, error: linkedinValidation.error };
  }

  const employeeCount = Number(body.employeeCount) || 0;
  const revenue = Number(body.revenue) || 0;
  const yearFounded = Number(body.yearFounded) || 0;
  const ceoAge = Number(body.ceoAge) || 0;

  const evaluation = evaluateLead({
    industry: body.industry,
    employeeCount,
    revenue,
    yearFounded,
    ceoAge,
  });

  const now = new Date().toISOString();
  const newLead: Lead = {
    id: `lead-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    companyName: body.companyName.trim(),
    website: websiteValidation.normalized,
    linkedin: linkedinValidation.normalized,
    industry: body.industry.trim(),
    service: body.service ? body.service.trim() : 'Home Services',
    location: body.location ? body.location.trim() : 'United States',
    employeeCount,
    revenue,
    yearFounded,
    ceoName: body.ceoName ? body.ceoName.trim() : 'Unknown',
    ceoAge,
    leadScore: evaluation.leadScore,
    priority: evaluation.priority,
    scoreReasons: evaluation.scoreReasons,
    detailedCriteria: evaluation.detailedCriteria,
    source: body.source || 'MANUAL',
    createdAt: now,
    updatedAt: now,
  };

  const saved = await firestoreRepo.createLead(newLead, INITIAL_SEED_LEADS);
  return { status: 201, data: saved };
}

export interface UpdateLeadResult {
  status: number;
  data?: Lead;
  error?: string;
}

export async function updateExistingLead(id: string, body: Partial<LeadFormData>): Promise<UpdateLeadResult> {
  const currentLead = await firestoreRepo.getLeadById(id, INITIAL_SEED_LEADS);
  if (!currentLead) {
    return { status: 404, error: 'Lead not found' };
  }

  if (body.companyName !== undefined && !body.companyName.trim()) {
    return { status: 400, error: 'Company Name cannot be empty' };
  }

  let websiteValue = currentLead.website;
  if (body.website !== undefined) {
    const websiteValidation = validateUrlInput(body.website, { isLinkedIn: false, label: 'Website URL' });
    if (!websiteValidation.isValid) {
      return { status: 400, error: websiteValidation.error };
    }
    websiteValue = websiteValidation.normalized;
  }

  let linkedinValue = currentLead.linkedin;
  if (body.linkedin !== undefined) {
    const linkedinValidation = validateUrlInput(body.linkedin, { isLinkedIn: true, label: 'LinkedIn URL' });
    if (!linkedinValidation.isValid) {
      return { status: 400, error: linkedinValidation.error };
    }
    linkedinValue = linkedinValidation.normalized;
  }

  const employeeCount = body.employeeCount !== undefined ? Number(body.employeeCount) : currentLead.employeeCount;
  const revenue = body.revenue !== undefined ? Number(body.revenue) : currentLead.revenue;
  const yearFounded = body.yearFounded !== undefined ? Number(body.yearFounded) : currentLead.yearFounded;
  const ceoAge = body.ceoAge !== undefined ? Number(body.ceoAge) : currentLead.ceoAge;
  const industry = body.industry ? body.industry.trim() : currentLead.industry;

  const evaluation = evaluateLead({
    industry,
    employeeCount,
    revenue,
    yearFounded,
    ceoAge,
  });

  const updatedLead: Lead = {
    ...currentLead,
    companyName: body.companyName ? body.companyName.trim() : currentLead.companyName,
    website: websiteValue,
    linkedin: linkedinValue,
    industry,
    service: body.service !== undefined ? body.service.trim() : currentLead.service,
    location: body.location !== undefined ? body.location.trim() : currentLead.location,
    employeeCount,
    revenue,
    yearFounded,
    ceoName: body.ceoName !== undefined ? body.ceoName.trim() : currentLead.ceoName,
    ceoAge,
    leadScore: evaluation.leadScore,
    priority: evaluation.priority,
    scoreReasons: evaluation.scoreReasons,
    detailedCriteria: evaluation.detailedCriteria,
    source: body.source || currentLead.source,
    updatedAt: new Date().toISOString(),
  };

  const saved = await firestoreRepo.updateLead(id, updatedLead, INITIAL_SEED_LEADS);
  if (!saved) {
    return { status: 404, error: 'Lead not found' };
  }
  return { status: 200, data: saved };
}

export interface DeleteLeadResult {
  status: number;
  data?: { message: string; lead: Lead };
  error?: string;
}

export async function deleteExistingLead(id: string): Promise<DeleteLeadResult> {
  const deleted = await firestoreRepo.deleteLead(id, INITIAL_SEED_LEADS);
  if (!deleted) {
    return { status: 404, error: 'Lead not found' };
  }
  return { status: 200, data: { message: 'Lead successfully deleted', lead: deleted } };
}

export async function resetAllLeads(): Promise<Lead[]> {
  return await firestoreRepo.resetLeads(INITIAL_SEED_LEADS);
}
