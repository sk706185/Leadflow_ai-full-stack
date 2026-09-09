import { evaluateLead } from '../src/scoring';
import { setCorsHeaders, parseBody } from './_utils';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const body = parseBody(req);
    const { industry, employeeCount, revenue, yearFounded, ceoAge } = body;
    const evaluation = evaluateLead({
      industry: String(industry || ''),
      employeeCount: Number(employeeCount) || 0,
      revenue: Number(revenue) || 0,
      yearFounded: Number(yearFounded) || 0,
      ceoAge: Number(ceoAge) || 0,
    });
    return res.status(200).json(evaluation);
  } catch (error: any) {
    return res.status(400).json({ error: error?.message || 'Evaluation failed' });
  }
}
