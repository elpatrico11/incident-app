import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReportPage from "./pages/ReportPage";
import IncidentsPage from "./pages/IncidentsPage";
import MapPage from "./pages/MapPage";
import IncidentDetailPage from "./pages/IncidentDetailPage";
import useAuthStore from "./store/useAuthStore";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";
import MyIncidentPage from "./pages/MyIncidentPage";
import EditIncidentPage from "./pages/EditIncidentPage";
import AdminPage from "./pages/AdminPage";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box"; // Import Box for centering
import VerifyEmail from "./pages/VerifyEmail";
import ResendVerification from "./pages/ResendVerification";

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
    <div className="bg-gray-800 text-white min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
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
            <Route path="/my-incidents" element={<MyIncidentPage />} />
            <Route path="/incidents/:id/edit" element={<EditIncidentPage />} />
          </Route>
          {/* Protected Routes for Admin Users */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/admin/*" element={<AdminPage />} />
          </Route>
          {/* Redirect for Unknown Routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
