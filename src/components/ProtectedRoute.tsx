import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from './Layout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'doctor' | 'worker';
}

export const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  
  return <Layout>{children}</Layout>;
};
