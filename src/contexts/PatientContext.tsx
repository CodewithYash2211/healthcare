import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Patient } from '../types';
import { getPatients, subscribe, addPatient as fsAddPatient, updatePatient as fsUpdatePatient } from '../localStore';

interface PatientContextType {
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePatient: (patientId: string, updatedData: Partial<Patient>) => Promise<void>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const refresh = () => {
      setPatients([...getPatients()]);
    };
    refresh();
    const unsubscribe = subscribe(refresh);
    return () => unsubscribe();
  }, []);

  const addPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    await fsAddPatient(patientData);
  };

  const updatePatient = async (patientId: string, updatedData: Partial<Patient>) => {
    await fsUpdatePatient(patientId, updatedData);
  };

  return (
    <PatientContext.Provider value={{ patients, addPatient, updatePatient }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatients = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
};
