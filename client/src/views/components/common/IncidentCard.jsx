import React from 'react';
import { Link } from 'react-router-dom';

const IncidentCard = ({ incident, statusColors }) => {
  return (
    <div
      key={incident._id}
      className="card bg-gray-800 text-gray-100 shadow-md rounded-lg border border-gray-700 flex flex-col max-w-sm"
    >
      {incident.images && incident.images.length > 0 ? (
        <img
          src={incident.images[0]}
          alt={incident.category}
          className="h-40 w-full object-cover rounded-t-lg" 
        />
      ) : (
        <div className="h-40 bg-gray-700 flex items-center justify-center rounded-t-lg">
          <span className="text-5xl">?</span>
        </div>
      )}
      <div className="flex-grow p-3 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold mb-2">
            <Link
              to={`/incidents/${incident._id}`}
              className="text-white hover:underline"
            >
              {incident.category || 'Brak Kategorii'}
            </Link>
          </h3>
          <p className="text-sm mb-4">
            {incident.description.length > 100
              ? `${incident.description.substring(0, 100)}...`
              : incident.description}
          </p>
        </div>
        <div className="mt-auto">
          <div className="flex items-center mb-2">
            <span
              className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                statusColors[incident.statusCategory] || statusColors.default
              }`}
            >
              {incident.status}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Dodane:{' '}
            {new Date(incident.createdAt).toLocaleDateString('pl-PL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <Link to={`/incidents/${incident._id}`}>
            <button className="btn btn-primary w-full text-sm py-1 px-1">
              Szczegóły
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default IncidentCard;
