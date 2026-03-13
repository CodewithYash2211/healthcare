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
  status: 'pending' | 'reviewed' | 'referred';
  doctorGuidance?: string;
  doctorId?: string;
  referralHospital?: string;
  timestamp: any;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  specialists: string[];
  distance?: string;
}
