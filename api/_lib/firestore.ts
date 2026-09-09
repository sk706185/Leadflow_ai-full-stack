import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { Lead } from './types';

let firebaseApp: App | null = null;
let firestoreDb: Firestore | null = null;
let hasAttemptedInit = false;

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'leads.json');

/**
 * Lazy initialization of Firebase Admin SDK.
 * Safely initializes with service account credentials, individual env vars, or ADC.
 * Returns null if credentials are not configured, falling back to disk/memory storage.
 */
export function getFirestoreInstance(): Firestore | null {
  if (hasAttemptedInit) {
    return firestoreDb;
  }

  hasAttemptedInit = true;

  try {
    if (getApps().length > 0) {
      firebaseApp = getApps()[0];
      firestoreDb = getFirestore(firebaseApp);
      return firestoreDb;
    }

    // 1. Check for single JSON service account environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        firebaseApp = initializeApp({
          credential: cert(sa),
          projectId: sa.project_id || process.env.FIREBASE_PROJECT_ID,
        });
        firestoreDb = getFirestore(firebaseApp);
        console.log('[Firestore] Successfully initialized with FIREBASE_SERVICE_ACCOUNT');
        return firestoreDb;
      } catch (saErr) {
        console.error('[Firestore] Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', saErr);
      }
    }

    // 2. Check for individual private key and client email
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCP_PROJECT;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      // Unescape newlines if stored with escaped \n in Vercel or .env
      privateKey = privateKey.replace(/\\n/g, '\n');

      firebaseApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
      firestoreDb = getFirestore(firebaseApp);
      console.log(`[Firestore] Successfully connected to project: ${projectId}`);
      return firestoreDb;
    }

    // 3. Fallback to ambient Google Cloud / ADC credentials if projectId is present
    if (projectId) {
      try {
        firebaseApp = initializeApp({ projectId });
        firestoreDb = getFirestore(firebaseApp);
        console.log(`[Firestore] Initialized with ambient credentials for project: ${projectId}`);
        return firestoreDb;
      } catch (adcErr) {
        console.warn('[Firestore] ADC initialization failed:', adcErr);
      }
    }

    console.warn(
      '[Firestore] No Firebase credentials detected. Falling back to local file storage (data/leads.json). ' +
      'To use live Firestore on Vercel, provide FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.'
    );
    return null;
  } catch (err) {
    console.error('[Firestore] Initialization error:', err);
    return null;
  }
}

// Fallback disk helpers for local dev or when Firebase env vars are pending
export function getLocalDiskLeads(): Lead[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Firestore Fallback] Failed to read leads from disk:', err);
  }
  return [];
}

export function saveLocalDiskLeads(leads: Lead[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(leads, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Firestore Fallback] Failed to write leads to disk (normal in read-only serverless):', err);
  }
}

/**
 * Fetch all leads: from Firestore if connected, otherwise from disk.
 */
export async function getAllLeads(initialSeeds: Lead[]): Promise<Lead[]> {
  const db = getFirestoreInstance();

  if (db) {
    try {
      const snapshot = await db.collection('leads').get();
      if (!snapshot.empty) {
        const leads: Lead[] = [];
        snapshot.forEach((doc) => {
          leads.push(doc.data() as Lead);
        });
        return leads;
      }

      // If Firestore collection is empty, auto-seed with verified initial leads
      console.log('[Firestore] Leads collection is empty. Seeding initial leads to Firestore...');
      const batch = db.batch();
      for (const lead of initialSeeds) {
        const docRef = db.collection('leads').doc(lead.id);
        batch.set(docRef, lead);
      }
      await batch.commit();
      console.log(`[Firestore] Successfully seeded ${initialSeeds.length} leads to Firestore.`);
      return [...initialSeeds];
    } catch (err) {
      console.error('[Firestore] Error fetching leads from collection:', err);
      // Fallback to disk if query fails
    }
  }

  const diskLeads = getLocalDiskLeads();
  if (diskLeads.length > 0) {
    return diskLeads;
  }
  saveLocalDiskLeads(initialSeeds);
  return [...initialSeeds];
}

/**
 * Get single lead by ID
 */
export async function getLeadById(id: string, initialSeeds: Lead[]): Promise<Lead | null> {
  const db = getFirestoreInstance();

  if (db) {
    try {
      const doc = await db.collection('leads').doc(id).get();
      if (doc.exists) {
        return doc.data() as Lead;
      }
      return null;
    } catch (err) {
      console.error(`[Firestore] Error fetching lead ${id}:`, err);
    }
  }

  const all = await getAllLeads(initialSeeds);
  return all.find((l) => l.id === id) || null;
}

/**
 * Create a new lead
 */
export async function createLead(lead: Lead, initialSeeds: Lead[]): Promise<Lead> {
  const db = getFirestoreInstance();

  if (db) {
    try {
      await db.collection('leads').doc(lead.id).set(lead);
      return lead;
    } catch (err) {
      console.error('[Firestore] Error creating lead in Firestore:', err);
      throw err;
    }
  }

  const all = await getAllLeads(initialSeeds);
  all.unshift(lead);
  saveLocalDiskLeads(all);
  return lead;
}

/**
 * Update an existing lead
 */
export async function updateLead(id: string, updatedLead: Lead, initialSeeds: Lead[]): Promise<Lead | null> {
  const db = getFirestoreInstance();

  if (db) {
    try {
      const docRef = db.collection('leads').doc(id);
      const existing = await docRef.get();
      if (!existing.exists) {
        return null;
      }
      await docRef.set(updatedLead, { merge: true });
      return updatedLead;
    } catch (err) {
      console.error(`[Firestore] Error updating lead ${id}:`, err);
      throw err;
    }
  }

  const all = await getAllLeads(initialSeeds);
  const index = all.findIndex((l) => l.id === id);
  if (index === -1) {
    return null;
  }
  all[index] = updatedLead;
  saveLocalDiskLeads(all);
  return updatedLead;
}

/**
 * Delete a lead by ID
 */
export async function deleteLead(id: string, initialSeeds: Lead[]): Promise<Lead | null> {
  const db = getFirestoreInstance();

  if (db) {
    try {
      const docRef = db.collection('leads').doc(id);
      const existing = await docRef.get();
      if (!existing.exists) {
        return null;
      }
      const data = existing.data() as Lead;
      await docRef.delete();
      return data;
    } catch (err) {
      console.error(`[Firestore] Error deleting lead ${id}:`, err);
      throw err;
    }
  }

  const all = await getAllLeads(initialSeeds);
  const index = all.findIndex((l) => l.id === id);
  if (index === -1) {
    return null;
  }
  const [removed] = all.splice(index, 1);
  saveLocalDiskLeads(all);
  return removed;
}

/**
 * Reset leads collection to initial seeds
 */
export async function resetLeads(initialSeeds: Lead[]): Promise<Lead[]> {
  const db = getFirestoreInstance();

  if (db) {
    try {
      const existing = await db.collection('leads').get();
      const batch = db.batch();
      existing.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      for (const lead of initialSeeds) {
        const docRef = db.collection('leads').doc(lead.id);
        batch.set(docRef, lead);
      }
      await batch.commit();
      return [...initialSeeds];
    } catch (err) {
      console.error('[Firestore] Error resetting leads collection:', err);
    }
  }

  saveLocalDiskLeads(initialSeeds);
  return [...initialSeeds];
}
