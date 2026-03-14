import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PatientProvider } from './contexts/PatientContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { OTPVerification } from './pages/OTPVerification';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { PatientDetails } from './pages/PatientDetails';
import { Patients } from './pages/Patients';
import { AIAssistant } from './pages/AIAssistant';
import { SkinCheck } from './pages/SkinCheck';
import { Hospitals } from './pages/Hospitals';
import { Settings } from './pages/Settings';
import { Reports } from './pages/Reports';
import { MapView } from './pages/MapView';
import { PatientQueue } from './pages/PatientQueue';

const DashboardRouter = () => {
  const { user } = useAuth();
  return user?.role === 'worker' ? <WorkerDashboard /> : <DoctorDashboard />;
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <PatientProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/verify-otp" element={<OTPVerification />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                } />

                <Route path="/patients" element={
                  <ProtectedRoute allowedRole="worker">
                    <Patients />
                  </ProtectedRoute>
                } />

                <Route path="/patients/:patientId" element={
                  <ProtectedRoute>
                    <PatientDetails />
                  </ProtectedRoute>
                } />

                <Route path="/ai-assistant" element={
                  <ProtectedRoute allowedRole="worker">
                    <AIAssistant />
                  </ProtectedRoute>
                } />

                <Route path="/skin-check" element={
                  <ProtectedRoute allowedRole="worker">
                    <SkinCheck />
                  </ProtectedRoute>
                } />

                <Route path="/hospitals" element={
                  <ProtectedRoute allowedRole="worker">
                    <Hospitals />
                  </ProtectedRoute>
                } />

                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />

                <Route path="/reports" element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                } />
                
                <Route path="/pending-cases" element={
                  <ProtectedRoute allowedRole="doctor">
                    <PatientQueue />
                  </ProtectedRoute>
                } />

                <Route path="/map" element={
                  <ProtectedRoute allowedRole="doctor">
                    <MapView />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Router>
          </PatientProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

