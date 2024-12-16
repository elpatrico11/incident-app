// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const ProtectedRoute = ({ roles = [] }) => {
  const { user, loading } = useAuthStore();

  console.log('ProtectedRoute - user:', user);
  console.log('ProtectedRoute - loading:', loading);

  if (loading) {
    return <div>Ładowanie...</div>; // Możesz zastąpić to spinnerem
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
