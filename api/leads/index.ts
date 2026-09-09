import { getLeadsList, createNewLead } from '../_lib/leadsService';
import { setCorsHeaders, parseBody } from '../_utils';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const leads = await getLeadsList(req.query || {});
      return res.status(200).json(leads);
    }

    if (req.method === 'POST') {
      const body = parseBody(req);
      const result = await createNewLead(body);
      if (result.error) {
        return res.status(result.status).json({ error: result.error });
      }
      return res.status(result.status).json(result.data);
    }

    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error: any) {
    console.error('API /api/leads error:', error);
    return res.status(500).json({ error: error?.message || 'Internal Server Error' });
  }
}
