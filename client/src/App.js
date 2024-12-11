import React from "react";
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

const App = () => {
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

          {/* Dodaj kolejne trasy */}
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
