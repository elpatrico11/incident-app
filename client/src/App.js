import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
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

const App = () => {
  const initializeUser = useAuthStore((state) => state.initializeUser);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  return (
    <div className="bg-gray-800 text-white min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/incidents/:id" element={<IncidentDetailPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-incidents"
            element={
              <ProtectedRoute>
                <MyIncidentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incidents/:id/edit"
            element={
              <ProtectedRoute>
                <EditIncidentPage />
              </ProtectedRoute>
            }
          />

          {/* Dodaj kolejne trasy */}
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
