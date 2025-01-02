import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReportPage from "./views/pages/ReportPage";
import IncidentsPage from "./views/pages/IncidentsPage";
import MapPage from "./pages/MapPage";
import IncidentDetailPage from "./views/pages/IncidentDetailPage";
import ProfilePage from "./views/pages/ProfilePage";
import MyIncidentsPage from "./views/pages/MyIncidentsPage";
import EditIncidentPage from "./pages/EditIncidentPage";
import VerifyEmail from "./pages/VerifyEmail";
import ResendVerification from "./pages/ResendVerification";

import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminPage from "./views/pages/AdminPage";
import UserManagement from "./views/pages/UserManagement";
import EditUser from "./views/pages/EditUser";
import IncidentManagement from "./views/pages/IncidentManagement";
import Reports from "./views/pages/ReportManagement";

import useAuthStore from "./store/useAuthStore";

import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const App = () => {
  const initializeUser = useAuthStore((state) => state.initializeUser);
  const loading = useAuthStore((state) => state.loading);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  if (loading) {
    // Render a loading spinner while initializing
    return (
      <Box
        className="bg-gray-800 text-white min-h-screen flex items-center justify-center"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />

        {/* Protected Routes for Authenticated Users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-incidents" element={<MyIncidentsPage />} />
          <Route path="/incidents/:id/edit" element={<EditIncidentPage />} />
        </Route>

        {/* Protected Routes for Admin Users */}
        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/admin" element={<AdminPage />}>
            {/* Nested Admin Routes */}
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="users/:id/edit" element={<EditUser />} />
            <Route path="incidents" element={<IncidentManagement />} />
            <Route path="reports" element={<Reports />} />
            {/* Add more nested routes as needed */}
          </Route>
        </Route>

        {/* Redirect for Unknown Routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </DashboardLayout>
  );
};

export default App;
