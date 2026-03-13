import { Patient, HealthCase, Hospital } from '../types';

export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Ramesh Kumar',
    age: 45,
    gender: 'male',
    contact: '9876543210',
    village: 'Sonapur',
    medicalHistory: 'Hypertension',
    vitals: { temp: 98.6, bp: '140/90', pulse: 72, weight: 65 },
    workerId: 'worker1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Sunita Devi',
    age: 32,
    gender: 'female',
    contact: '9876543211',
    village: 'Rampur',
    medicalHistory: 'None',
    vitals: { temp: 101.2, bp: '110/70', pulse: 88, weight: 54 },
    workerId: 'worker1',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export const mockHospitals: Hospital[] = [
  {
    id: 'h1',
    name: 'District General Hospital',
    location: 'District Center',
    specialists: ['Dermatology', 'Cardiology', 'Pediatrics'],
    distance: '12 km'
  },
  {
    id: 'h2',
    name: 'Community Health Center',
    location: 'Tehsil Road',
    specialists: ['General Medicine', 'Maternity'],
    distance: '5 km'
  }
];

export const mockCases: HealthCase[] = [
  {
    id: 'c1',
    patientId: '2',
    workerId: 'worker1',
    symptoms: 'High fever and persistent cough for 3 days.',
    status: 'pending',
    timestamp: new Date(),
  }
];
