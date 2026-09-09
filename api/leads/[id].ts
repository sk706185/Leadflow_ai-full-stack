import { getLead, updateExistingLead, deleteExistingLead } from '../_lib/leadsService';
import { setCorsHeaders, parseBody } from '../_utils';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // In Vercel serverless functions, dynamic route parameters in [id].ts are in req.query.id
  const id = req.query?.id as string;
  if (!id) {
    return res.status(400).json({ error: 'Lead ID parameter is required' });
  }

  try {
    if (req.method === 'GET') {
      const lead = await getLead(id);
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      return res.status(200).json(lead);
    }

    if (req.method === 'PUT') {
      const body = parseBody(req);
      const result = await updateExistingLead(id, body);
      if (result.error) {
        return res.status(result.status).json({ error: result.error });
      }
      return res.status(result.status).json(result.data);
    }

    if (req.method === 'DELETE') {
      const result = await deleteExistingLead(id);
      if (result.error) {
        return res.status(result.status).json({ error: result.error });
      }
      return res.status(result.status).json(result.data);
    }

    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error: any) {
    console.error(`API /api/leads/[id] error for ${id}:`, error);
    return res.status(500).json({ error: error?.message || 'Internal Server Error' });
  }
}
