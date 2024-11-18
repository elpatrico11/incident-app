import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import IncidentsPage from "./pages/IncidentsPage";
import MapPage from "./pages/MapPage";
import ReportPage from "./pages/ReportPage";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <div className="bg-gray-800 text-white min-h-screen flex flex-col dark">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <ReportPage />
              </ProtectedRoute>
            }
          />
          <Route path="/map" element={<MapPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
