import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const AdminPage = () => {
  return (
    <div className="container mx-auto mt-8 px-4">
      {/* Panel Title */}
      <h2 className="text-4xl mb-6 text-center text-white">
        Panel Administratora
      </h2>
      
      {/* Navigation Buttons */}
      <div className="flex justify-center space-x-4 mb-8">
        <Link to="users" className="btn btn-primary flex justify-center items-center w-1/4 h-12">
          Zarządzanie Użytkownikami
        </Link>
        <Link to="incidents" className="btn btn-secondary flex justify-center items-center w-1/4 h-12">
          Zarządzanie Zgłoszeniami
        </Link>
        <Link to="reports" className="btn btn-accent flex justify-center items-center w-1/4 h-12">
          Raporty
        </Link>
      </div>
      
      {/* Render Selected Admin Section */}
      <Outlet />
    </div>
  );
};

export default AdminPage;
