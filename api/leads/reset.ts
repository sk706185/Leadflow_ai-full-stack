import { resetAllLeads } from '../_lib/leadsService';
import { setCorsHeaders } from '../_utils';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const leads = await resetAllLeads();
    return res.status(200).json({ message: 'Reset to 5 initial seed leads successfully', leads });
  } catch (error: any) {
    console.error('API /api/leads/reset error:', error);
    return res.status(500).json({ error: error?.message || 'Internal Server Error' });
  }
}
