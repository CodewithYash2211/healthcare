import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <Layout>{children}</Layout>;
};

const DashboardRouter = () => {
  const { user } = useAuth();
  return user?.role === 'worker' ? <WorkerDashboard /> : <DoctorDashboard />;
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } />

              <Route path="/patients" element={
                <ProtectedRoute>
                  <Patients />
                </ProtectedRoute>
              } />

              <Route path="/patients/:id" element={
                <ProtectedRoute>
                  <PatientDetails />
                </ProtectedRoute>
              } />

              <Route path="/ai-assistant" element={
                <ProtectedRoute>
                  <AIAssistant />
                </ProtectedRoute>
              } />

              <Route path="/skin-check" element={
                <ProtectedRoute>
                  <SkinCheck />
                </ProtectedRoute>
              } />

              <Route path="/hospitals" element={
                <ProtectedRoute>
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
                <ProtectedRoute>
                  <PatientQueue />
                </ProtectedRoute>
              } />

              <Route path="/map" element={
                <ProtectedRoute>
                  <MapView />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

