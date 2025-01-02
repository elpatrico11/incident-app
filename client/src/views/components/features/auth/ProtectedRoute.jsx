import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../../../models/stores/useAuthStore';

const ProtectedRoute = ({ roles = [] }) => {
  const { user, loading } = useAuthStore();


  if (loading) {
    return <div>Ładowanie...</div>; 
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length && !roles.includes(user.role)) {
    console.log('ProtectedRoute - user role not authorized:', user.role);
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
