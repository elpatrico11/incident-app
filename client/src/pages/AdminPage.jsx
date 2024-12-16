import React from 'react';
import { Link, Routes, Route, Navigate } from 'react-router-dom';
import UserManagement from './admin/UserManagement';
import IncidentManagement from './admin/IncidentManagement';
import Reports from './admin/Reports'; 

const AdminPage = () => {
  return (
    <div className="container mx-auto mt-8 px-4">
      <h2 className="text-4xl mb-6 text-center text-white">
        Panel Administratora
      </h2>
      
      {/* Nawigacja do podsekcji */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 justify-center">
        <Link to="users" className="btn btn-primary w-full">
          Zarządzanie Użytkownikami
        </Link>
        <Link to="incidents" className="btn btn-secondary w-full">
          Zarządzanie Zgłoszeniami
        </Link>
        <Link to="reports" className="btn btn-accent w-full">
          Raporty
        </Link>
      </div>
      
      {/* Zagnieżdżone trasy */}
      <Routes>
        <Route path="/" element={<Navigate to="users" replace />} />
        <Route path="users/*" element={<UserManagement />} />
        <Route path="incidents/*" element={<IncidentManagement />} />
        <Route path="reports/*" element={<Reports />} />
        {/* Dodaj więcej tras w razie potrzeby */}
      </Routes>
    </div>
  );
};

export default AdminPage;
