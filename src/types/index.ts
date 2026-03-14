export type UserRole = 'worker' | 'doctor';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  language: 'en' | 'hi' | 'mr';
  village?: string;
  specialization?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  contact: string;
  village: string;
  medicalHistory: string;
  vitals: {
    temp?: number;
    bp?: string;
    pulse?: number;
    weight?: number;
  };
  workerId: string;
  createdAt: any;
  updatedAt: any;
  location?: { lat: number; lng: number };
  status?: 'Waiting' | 'Reviewed' | 'Referred' | string;
}

export interface HealthCase {
  id: string;
  patientId: string;
  workerId: string;
  symptoms: string;
  voiceNoteUrl?: string;
  aiAnalysis?: string;
  skinConditionImage?: string;
  skinAnalysis?: string;
  status: 'pending' | 'reviewed' | 'referred' | 'pending_sync';
  doctorGuidance?: string;
  doctorId?: string;
  referralHospital?: string;
  syncStatus?: 'synced' | 'pending';
  timestamp: any;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  specialists: string[];
  distance?: string;
  type?: string;
  rating?: number;
  phone?: string;
  status?: string;
  address?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospitalId: string;
  email: string;
  phone: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface AiDiagnosis {
  id: string;
  patientId: string;
  caseId: string;
  symptoms: string;
  aiResult: string;
  confidenceScore?: number;
  timestamp: string;
}
export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  hospitalName: string;
  referredBy: string;
  status: 'Pending' | 'Completed' | 'Rejected';
  createdAt: string;
}

export interface TelemedicineSession {
  id: string;
  patientId: string;
  workerId: string;
  workerName?: string;
  patientName?: string;
  symptoms?: string;
  doctorId?: string;
  startTime: string;
  endTime?: string;
  type: 'voice' | 'video';
  status: 'active' | 'completed' | 'waiting' | 'declined';
  channelName: string;
  agoraUid?: string | number;
}
