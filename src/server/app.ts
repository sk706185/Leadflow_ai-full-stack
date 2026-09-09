import express from 'express';
import { evaluateLead } from '../scoring';
import {
  getLeadsList,
  getLead,
  createNewLead,
  updateExistingLead,
  deleteExistingLead,
  resetAllLeads,
} from './leadsService';
import { getFirestoreInstance } from './firestore';

export function createExpressApp() {
  const app = express();

  // Permissive CORS middleware for cross-origin or Vercel preview environments
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    next();
  });

  app.use(express.json());

  // Define API Router
  const apiRouter = express.Router();

  // Health check
  apiRouter.get('/health', async (_req, res) => {
    const firestoreConnected = getFirestoreInstance() !== null;
    const all = await getLeadsList();
    res.json({
      status: 'ok',
      service: 'LeadFlow AI API',
      database: firestoreConnected ? 'Firebase Firestore (Live Connected)' : 'File/Memory Storage (Fallback)',
      totalLeads: all.length,
      timestamp: new Date().toISOString(),
    });
  });

  // Evaluate lead criteria on the fly without saving
  apiRouter.post('/evaluate', (req, res) => {
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
  apiRouter.get('/leads', async (req, res) => {
    try {
      const result = await getLeadsList(req.query as any);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch leads' });
    }
  });

  // GET single lead by ID
  apiRouter.get('/leads/:id', async (req, res) => {
    try {
      const lead = await getLead(req.params.id);
      if (!lead) {
        res.status(404).json({ error: 'Lead not found' });
        return;
      }
      res.json(lead);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch lead' });
    }
  });

  // POST create new lead
  apiRouter.post('/leads', async (req, res) => {
    try {
      const result = await createNewLead(req.body);
      if (result.error) {
        res.status(result.status).json({ error: result.error });
        return;
      }
      res.status(result.status).json(result.data);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to create lead' });
    }
  });

  // PUT update lead
  apiRouter.put('/leads/:id', async (req, res) => {
    try {
      const result = await updateExistingLead(req.params.id, req.body);
      if (result.error) {
        res.status(result.status).json({ error: result.error });
        return;
      }
      res.status(result.status).json(result.data);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to update lead' });
    }
  });

  // DELETE lead
  apiRouter.delete('/leads/:id', async (req, res) => {
    try {
      const result = await deleteExistingLead(req.params.id);
      if (result.error) {
        res.status(result.status).json({ error: result.error });
        return;
      }
      res.status(result.status).json(result.data);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to delete lead' });
    }
  });

  // Reset to initial seed leads
  apiRouter.post('/leads/reset', async (_req, res) => {
    try {
      const leads = await resetAllLeads();
      res.json({ message: 'Reset to 5 initial seed leads successfully', leads });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to reset leads' });
    }
  });

  // Mount router at BOTH '/api' AND root '/'
  // This guarantees that whether Vercel passes '/api/health' or strips it to '/health', both succeed!
  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  return app;
}

export const app = createExpressApp();
