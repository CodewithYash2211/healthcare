import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { PatientDetails } from './pages/PatientDetails';
import { Patients } from './pages/Patients';
import { AIAssistant } from './pages/AIAssistant';
import { SkinCheck } from './pages/SkinCheck';

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

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

