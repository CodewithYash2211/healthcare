import React from 'react';
import { TelemedicineSession } from './TelemedicineSession';
import { Patient, TelemedicineSession as SessionType } from '../types';

interface DoctorCallInterfaceProps {
  session: SessionType;
  onClose: () => void;
}

/**
 * Specialized wrapper for the Doctor's side of a telemedicine call.
 * This can be extended with doctor-specific tools like prescription entry,
 * advanced vitals history, or referral forms.
 */
export const DoctorCallInterface = ({ session, onClose }: DoctorCallInterfaceProps) => {
  // Map the session data back to a Patient object for the interface
  const patientData: Partial<Patient> = {
    id: session.patientId,
    name: session.patientName || 'Unknown Patient',
    // Vitals will be synced via Firestore in TelemedicineSession
  };

  return (
    <TelemedicineSession 
      patient={patientData as Patient}
      sessionType={session.type}
      existingSessionId={session.id}
      symptoms={session.symptoms}
      onClose={onClose}
    />
  );
};
