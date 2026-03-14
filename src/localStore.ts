/**
 * Local data store — rebuilt as a Firestore real-time sync layer.
 * Replaces pure localStorage to support Firebase cloud persistence natively.
 */

import { Patient, HealthCase, Hospital, Doctor, Appointment, AiDiagnosis, Referral } from './types';
import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// ── In-Memory State ───────────────────────────────────────────────────────────
let patients: Patient[] = [];
let cases: HealthCase[] = [];
let hospitals: Hospital[] = [];
let doctors: Doctor[] = [];
let appointments: Appointment[] = [];
let aiDiagnoses: AiDiagnosis[] = [];
let referrals: Referral[] = [];

// ── Simple pub-sub so pages can react to changes ──────────────────────────────
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(fn => fn());
}

// ── Error Handling for Cloud Writes ───────────────────────────────────────────
function handleWriteError(err: any, context: string) {
  console.error(`[Firestore Write Error - ${context}]:`, err);
  alert(`Firebase Database Error (${context}):\n\nThe data was saved to your local browser cache but FAILED to upload to the cloud.\n\nReason: ${err.message}\n\nFIX: Go to your Firebase Console -> Firestore Database -> Rules, and ensure 'allow read, write: if true;' is set for testing.`);
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
      patients = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Partial<Patient> & { id: string }) as Patient);
      console.log("[Firestore] Fetch success! Correct patient data returned:", patients.length, "patients read.");
      notify();
    }, (error) => console.error("Firestore patients sync error:", error));

    onSnapshot(collection(db, 'reports'), (snapshot) => {
      cases = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Partial<HealthCase> & { id: string }) as HealthCase);
      console.log("[Firestore] Fetch success! Correct report cases returned:", cases.length, "cases read.");
      notify();
    }, (error) => console.error("Firestore cases sync error:", error));

    onSnapshot(collection(db, 'hospitals'), (snapshot) => {
      hospitals = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Partial<Hospital> & { id: string }) as Hospital);
      notify();
    }, (error) => console.error("Firestore hospitals sync error:", error));

    onSnapshot(collection(db, 'doctors'), (snapshot) => {
      doctors = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Partial<Doctor> & { id: string }) as Doctor);
      notify();
    }, (error) => console.error("Firestore doctors sync error:", error));

    onSnapshot(collection(db, 'appointments'), (snapshot) => {
      appointments = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Partial<Appointment> & { id: string }) as Appointment);
      notify();
    }, (error) => console.error("Firestore appointments sync error:", error));

    onSnapshot(collection(db, 'aiDiagnoses'), (snapshot) => {
      aiDiagnoses = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Partial<AiDiagnosis> & { id: string }) as AiDiagnosis);
      notify();
    }, (error) => console.error("Firestore aiDiagnoses sync error:", error));

    onSnapshot(collection(db, 'referrals'), (snapshot) => {
      referrals = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any) as Referral);
      console.log("[Firestore] Referrals updated:", referrals.length);
      notify();
    }, (error) => console.error("Firestore referrals sync error:", error));

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

export async function addPatient(data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
  const newRef = doc(collection(db, 'patients'));
  const newPatient: Patient = {
    ...data,
    id: newRef.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  try {
    await setDoc(newRef, newPatient);
    return newPatient;
  } catch (err) {
    handleWriteError(err, 'Add Patient');
    throw err;
  }
}

export async function updatePatient(id: string, data: Partial<Patient>): Promise<void> {
  const ref = doc(db, 'patients', id);
  try {
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
      await updateDoc(ref, { 
        ...data, 
        updatedAt: new Date().toISOString() 
      });
    } else {
      // Fallback: create if missing
      await setDoc(ref, {
        ...data,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (err) {
    handleWriteError(err, 'Update Patient');
    throw err;
  }
}

export function getPatientById(id: string): Patient | undefined {
  return patients.find(p => p.id === id);
}

// ── Cases (Reports) ───────────────────────────────────────────────────────────
export function getCases(): HealthCase[] {
  return cases;
}

export async function addCase(data: Omit<HealthCase, 'id' | 'timestamp'>): Promise<HealthCase> {
  const newRef = doc(collection(db, 'reports'));
  const newCase: HealthCase = {
    ...data,
    id: newRef.id,
    syncStatus: 'synced', // Firestore handles offline queuing implicitly
    timestamp: new Date().toISOString(),
  };
  
  try {
    await setDoc(newRef, newCase);
    return newCase;
  } catch (err) {
    handleWriteError(err, 'Add Case (Report)');
    throw err;
  }
}

export async function updateCase(id: string, data: Partial<HealthCase>): Promise<void> {
  const ref = doc(db, 'reports', id);
  try {
    await updateDoc(ref, data);
  } catch (err) {
    handleWriteError(err, 'Update Case (Report)');
    throw err;
  }
}

// ── Extended Collections ──────────────────────────────────────────────────────
export function getHospitals(): Hospital[] {
  return hospitals;
}

export function getDoctors(): Doctor[] {
  return doctors;
}

export function getAppointments(): Appointment[] {
  return appointments;
}

export function getAiDiagnoses(): AiDiagnosis[] {
  return aiDiagnoses;
}

export function getReferrals(): Referral[] {
  return referrals;
}

export async function addHospital(data: Omit<Hospital, 'id'>): Promise<Hospital> {
  const newRef = doc(collection(db, 'hospitals'));
  const newHosp = { ...data, id: newRef.id } as Hospital;
  try {
    await setDoc(newRef, newHosp);
    return newHosp;
  } catch (err) {
    handleWriteError(err, 'Add Hospital');
    throw err;
  }
}

export async function addDoctor(data: Omit<Doctor, 'id'>): Promise<Doctor> {
  const newRef = doc(collection(db, 'doctors'));
  const newDoc = { ...data, id: newRef.id } as Doctor;
  try {
    await setDoc(newRef, newDoc);
    return newDoc;
  } catch (err) {
    handleWriteError(err, 'Add Doctor');
    throw err;
  }
}

export async function addAiDiagnosis(data: Omit<AiDiagnosis, 'id' | 'timestamp'>): Promise<AiDiagnosis> {
  const newRef = doc(collection(db, 'aiDiagnoses'));
  const newDiag = { ...data, id: newRef.id, timestamp: new Date().toISOString() } as AiDiagnosis;
  try {
    await setDoc(newRef, newDiag);
    return newDiag;
  } catch (err) {
    handleWriteError(err, 'Add AI Diagnosis');
    throw err;
  }
}

export async function addReferral(data: Omit<Referral, 'id' | 'createdAt' | 'status'>): Promise<Referral> {
  const newRef = doc(collection(db, 'referrals'));
  const newReferral: Referral = {
    ...data,
    id: newRef.id,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(newRef, newReferral);
    
    // Also update patient status
    await updatePatient(data.patientId, { status: 'Referred' as any });
    
    return newReferral;
  } catch (err) {
    handleWriteError(err, 'Add Referral');
    throw err;
  }
}
