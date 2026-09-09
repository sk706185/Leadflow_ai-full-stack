import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { evaluateLead } from './src/scoring.ts';
import { Lead, LeadFormData } from './src/types.ts';
import { isValidExternalUrl, normalizeUrl, validateUrlInput } from './src/utils/url.ts';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'leads.json');

const INITIAL_SEED_LEADS: Lead[] = [
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
      yearFounded: 1996, // Before 2000 -> misses 15 pts -> 85 score
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
      employeeCount: 68, // Outside 10-50 -> misses 20 pts
      revenue: 8900000,
      yearFounded: 2016,
      ceoAge: 41, // Under 45 -> misses 20 pts -> 60 score
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
      employeeCount: 8, // Under 10 -> misses 20 pts
      revenue: 850000, // Under $1M -> misses 20 pts
      yearFounded: 2019,
      ceoAge: 38, // Under 45 -> misses 20 pts -> 40 score
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

// Persistent file-backed storage
function loadLeadsFromDisk(): Lead[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Sanitize any existing records: strip placeholder domains like example.com
        let modified = false;
        const sanitized = parsed.map((lead: Lead) => {
          const validWebsite = isValidExternalUrl(lead.website) ? normalizeUrl(lead.website) : '';
          const validLinkedin = isValidExternalUrl(lead.linkedin) ? normalizeUrl(lead.linkedin) : '';
          if (validWebsite !== lead.website || validLinkedin !== lead.linkedin) {
            modified = true;
          }
          return {
            ...lead,
            website: validWebsite,
            linkedin: validLinkedin,
          };
        });
        if (modified) {
          fs.writeFileSync(DB_FILE, JSON.stringify(sanitized, null, 2), 'utf-8');
        }
        return sanitized;
      }
    }
    // If file doesn't exist or empty, write initial seeds
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_SEED_LEADS, null, 2), 'utf-8');
    return INITIAL_SEED_LEADS;
  } catch (err) {
    console.error('Error loading leads from file storage:', err);
    return INITIAL_SEED_LEADS;
  }
}

function saveLeadsToDisk(leads: Lead[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(leads, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving leads to file storage:', err);
  }
}

let leadsDatabase: Lead[] = loadLeadsFromDisk();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'LeadFlow AI API',
      totalLeads: leadsDatabase.length,
      timestamp: new Date().toISOString(),
    });
  });

  // Evaluate lead criteria on the fly without saving (useful for live scoring preview)
  app.post('/api/evaluate', (req, res) => {
    try {
      const { industry, employeeCount, revenue, yearFounded, ceoAge } = req.body;
      const evaluation = evaluateLead({
        industry: String(industry || ''),
        employeeCount: Number(employeeCount) || 0,
        revenue: Number(revenue) || 0,
        yearFounded: Number(yearFounded) || 0,
        ceoAge: Number(ceoAge) || 0,
      });
      res.json(evaluation);
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Evaluation failed' });
    }
  });

  // GET all leads with optional filtering and sorting
  app.get('/api/leads', (req, res) => {
    let result = [...leadsDatabase];
    const { search, priority, source, industry, sortBy } = req.query;

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
      // Default sort by score descending
      result.sort((a, b) => (b.leadScore ?? 0) - (a.leadScore ?? 0));
    }

    res.json(result);
  });

  // GET single lead by ID
  app.get('/api/leads/:id', (req, res) => {
    const lead = leadsDatabase.find((l) => l.id === req.params.id);
    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }
    res.json(lead);
  });

  // POST create new lead
  app.post('/api/leads', (req, res) => {
    const body: LeadFormData = req.body;

    // Backend validation
    if (!body.companyName || !body.companyName.trim()) {
      res.status(400).json({ error: 'Company Name is required' });
      return;
    }
    if (!body.industry || !body.industry.trim()) {
      res.status(400).json({ error: 'Industry is required' });
      return;
    }

    // URL validation & normalization
    const websiteValidation = validateUrlInput(body.website, { isLinkedIn: false, label: 'Website URL' });
    if (!websiteValidation.isValid) {
      res.status(400).json({ error: websiteValidation.error });
      return;
    }

    const linkedinValidation = validateUrlInput(body.linkedin, { isLinkedIn: true, label: 'LinkedIn URL' });
    if (!linkedinValidation.isValid) {
      res.status(400).json({ error: linkedinValidation.error });
      return;
    }

    const employeeCount = Number(body.employeeCount) || 0;
    const revenue = Number(body.revenue) || 0;
    const yearFounded = Number(body.yearFounded) || 0;
    const ceoAge = Number(body.ceoAge) || 0;

    // Run scoring engine
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

    leadsDatabase.unshift(newLead);
    saveLeadsToDisk(leadsDatabase);

    res.status(201).json(newLead);
  });

  // PUT update lead
  app.put('/api/leads/:id', (req, res) => {
    const index = leadsDatabase.findIndex((l) => l.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    const body: LeadFormData = req.body;
    if (!body.companyName || !body.companyName.trim()) {
      res.status(400).json({ error: 'Company Name is required' });
      return;
    }

    const currentLead = leadsDatabase[index];

    // URL validation & normalization if provided
    let websiteValue = currentLead.website;
    if (body.website !== undefined) {
      const websiteValidation = validateUrlInput(body.website, { isLinkedIn: false, label: 'Website URL' });
      if (!websiteValidation.isValid) {
        res.status(400).json({ error: websiteValidation.error });
        return;
      }
      websiteValue = websiteValidation.normalized;
    }

    let linkedinValue = currentLead.linkedin;
    if (body.linkedin !== undefined) {
      const linkedinValidation = validateUrlInput(body.linkedin, { isLinkedIn: true, label: 'LinkedIn URL' });
      if (!linkedinValidation.isValid) {
        res.status(400).json({ error: linkedinValidation.error });
        return;
      }
      linkedinValue = linkedinValidation.normalized;
    }

    const employeeCount = body.employeeCount !== undefined ? Number(body.employeeCount) : currentLead.employeeCount;
    const revenue = body.revenue !== undefined ? Number(body.revenue) : currentLead.revenue;
    const yearFounded = body.yearFounded !== undefined ? Number(body.yearFounded) : currentLead.yearFounded;
    const ceoAge = body.ceoAge !== undefined ? Number(body.ceoAge) : currentLead.ceoAge;
    const industry = body.industry ? body.industry.trim() : currentLead.industry;

    // Recalculate score with updated attributes
    const evaluation = evaluateLead({
      industry,
      employeeCount,
      revenue,
      yearFounded,
      ceoAge,
    });

    const updatedLead: Lead = {
      ...currentLead,
      companyName: body.companyName.trim(),
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

    leadsDatabase[index] = updatedLead;
    saveLeadsToDisk(leadsDatabase);

    res.json(updatedLead);
  });

  // DELETE lead
  app.delete('/api/leads/:id', (req, res) => {
    const index = leadsDatabase.findIndex((l) => l.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    const deleted = leadsDatabase.splice(index, 1)[0];
    saveLeadsToDisk(leadsDatabase);

    res.json({ message: 'Lead successfully deleted', lead: deleted });
  });

  // Reset to initial seed leads
  app.post('/api/leads/reset', (_req, res) => {
    leadsDatabase = [...INITIAL_SEED_LEADS];
    saveLeadsToDisk(leadsDatabase);
    res.json({ message: 'Reset to 5 initial seed leads successfully', leads: leadsDatabase });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LeadFlow AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start LeadFlow AI server:', err);
});
