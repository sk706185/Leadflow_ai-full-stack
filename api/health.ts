import { getFirestoreInstance } from './_lib/firestore';
import { setCorsHeaders } from './_utils';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const firestoreConnected = getFirestoreInstance() !== null;

  return res.status(200).json({
    status: 'ok',
    service: 'LeadFlow AI API (Vercel Serverless Function)',
    database: firestoreConnected ? 'Firebase Firestore (Live Connected)' : 'File/Memory Storage (Fallback)',
    timestamp: new Date().toISOString(),
  });
}
