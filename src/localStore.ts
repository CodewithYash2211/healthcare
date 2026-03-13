/**
 * Local data store — rebuilt as a Firestore real-time sync layer.
 * Replaces pure localStorage to support Firebase cloud persistence natively.
 */

import { Patient, HealthCase } from './types';
import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';

// ── In-Memory State ───────────────────────────────────────────────────────────
let patients: Patient[] = [];
let cases: HealthCase[] = [];

// ── Simple pub-sub so pages can react to changes ──────────────────────────────
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(fn => fn());
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ── Firestore Listeners ───────────────────────────────────────────────────────
let isInitialized = false;

export function initStore() {
  if (isInitialized) return;
  isInitialized = true;

  try {
    onSnapshot(collection(db, 'patients'), (snapshot) => {
      patients = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Patient));
      notify();
    }, (error) => console.error("Firestore patients sync error:", error));

    onSnapshot(collection(db, 'reports'), (snapshot) => {
      cases = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HealthCase));
      notify();
    }, (error) => console.error("Firestore cases sync error:", error));
  } catch (error) {
    console.error("Firestore initialization error:", error);
  }
}

// Auto-initialize when imported
initStore();


// ── Patients ──────────────────────────────────────────────────────────────────
export function getPatients(): Patient[] {
  return patients;
}

export function addPatient(data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Patient {
  const newRef = doc(collection(db, 'patients'));
  const newPatient: Patient = {
    ...data,
    id: newRef.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Optimistic UI update
  patients = [...patients, newPatient];
  notify();
  
  // Fire and forget Firestore upload
  setDoc(newRef, newPatient).catch(console.error);
  return newPatient;
}

export function updatePatient(id: string, data: Partial<Patient>) {
  // Optimistic UI update
  patients = patients.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p);
  notify();
  
  const ref = doc(db, 'patients', id);
  updateDoc(ref, { ...data, updatedAt: new Date().toISOString() }).catch(console.error);
}

export function getPatientById(id: string): Patient | undefined {
  return patients.find(p => p.id === id);
}

// ── Cases ─────────────────────────────────────────────────────────────────────
export function getCases(): HealthCase[] {
  return cases;
}

export function addCase(data: Omit<HealthCase, 'id' | 'timestamp'>): HealthCase {
  const newRef = doc(collection(db, 'reports'));
  const newCase: HealthCase = {
    ...data,
    id: newRef.id,
    syncStatus: 'synced', // Firestore handles offline queuing implicitly
    timestamp: new Date().toISOString(),
  };
  
  // Optimistic UI update
  cases = [...cases, newCase];
  notify();
  
  setDoc(newRef, newCase).catch(console.error);
  return newCase;
}

export function updateCase(id: string, data: Partial<HealthCase>) {
  // Optimistic UI update
  cases = cases.map(c => c.id === id ? { ...c, ...data } : c);
  notify();
  
  const ref = doc(db, 'reports', id);
  updateDoc(ref, data).catch(console.error);
}
