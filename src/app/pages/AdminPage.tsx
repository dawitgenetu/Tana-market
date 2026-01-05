import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// AdminPage redirects to dashboard for unified experience
export default function AdminPage() {
  const { user } = useAuth();
  
  // Redirect to dashboard - all admin features are accessible from there
  return <Navigate to="/dashboard" replace />;
}

