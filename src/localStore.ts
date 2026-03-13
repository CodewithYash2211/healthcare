/**
 * Local data store — replaces Firebase Firestore entirely.
 * All data is persisted in localStorage so it survives page refreshes.
 */

import { Patient, HealthCase } from './types';

// ── Storage keys ──────────────────────────────────────────────────────────────
const PATIENTS_KEY = 'hc_patients';
const CASES_KEY = 'hc_cases';

// ── Helpers ───────────────────────────────────────────────────────────────────
function load<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

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

// ── Patients ──────────────────────────────────────────────────────────────────
export function getPatients(): Patient[] {
  return load<Patient>(PATIENTS_KEY);
}

export function addPatient(data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Patient {
  const patients = getPatients();
  const newPatient: Patient = {
    ...data,
    id: uid(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  patients.push(newPatient);
  save(PATIENTS_KEY, patients);
  notify();
  return newPatient;
}

export function updatePatient(id: string, data: Partial<Patient>) {
  const patients = getPatients().map(p =>
    p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
  );
  save(PATIENTS_KEY, patients);
  notify();
}

export function getPatientById(id: string): Patient | undefined {
  return getPatients().find(p => p.id === id);
}

// ── Cases ─────────────────────────────────────────────────────────────────────
export function getCases(): HealthCase[] {
  return load<HealthCase>(CASES_KEY);
}

export function addCase(data: Omit<HealthCase, 'id' | 'timestamp'>): HealthCase {
  const cases = getCases();
  const newCase: HealthCase = {
    ...data,
    id: uid(),
    syncStatus: 'pending',
    timestamp: new Date().toISOString(),
  };
  cases.push(newCase);
  save(CASES_KEY, cases);
  notify();
  return newCase;
}

export function updateCase(id: string, data: Partial<HealthCase>) {
  const cases = getCases().map(c =>
    c.id === id ? { ...c, ...data } : c
  );
  save(CASES_KEY, cases);
  notify();
}
