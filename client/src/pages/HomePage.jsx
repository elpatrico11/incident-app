import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="bg-gray-800 text-white min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Witaj w IncidentApp
      </h1>
      <p className="text-lg mb-8 text-center">
        Zgłaszaj incydenty, przeglądaj zgłoszenia i pomagaj w utrzymaniu bezpieczeństwa w swoim mieście.
      </p>
      <div className="flex space-x-4">
        <Link
          to="/report"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Dodaj zgłoszenie
        </Link>
        <Link
          to="/incidents"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
        >
          Przeglądaj incydenty
        </Link>
        <Link
          to="/map"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded"
        >
          Mapa incydentów
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
