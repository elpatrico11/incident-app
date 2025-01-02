import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { STATUS_OPTIONS } from '../../../../constants/incidentConstants'; 

const IncidentCard = ({ incident, getStatusColor, onStatusChange, onDelete }) => {
  return (
    <div className="card bg-gray-800 text-gray-100 shadow-md rounded-lg border border-gray-700 transform transition-transform duration-300 hover:scale-105 hover:border-primary">
      {incident.images?.length > 0 ? (
        <img
          src={incident.images[0]}
          alt={incident.category}
          className="h-48 w-full object-cover rounded-t-lg"
        />
      ) : (
        <div className="h-48 bg-gray-700 flex items-center justify-center rounded-t-lg">
          <span className="text-5xl">?</span>
        </div>
      )}
      <div className="flex-grow p-4 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">
            {incident.category || 'Brak Kategorii'}
          </h3>
          {/* Status Badge */}
          <span
            className={`px-2 py-1 text-xs font-semibold text-white rounded ${getStatusColor(
              incident.status
            )}`}
          >
            {incident.status}
          </span>
        </div>
        
        <p className="text-sm mb-2">
          {incident.description
            ? `${incident.description.substring(0, 100)}...`
            : 'Brak dostępnego opisu.'}
        </p>
        <p className="text-xs text-gray-400 mb-2">
          Dodane:{' '}
          {new Date(incident.createdAt).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>

        <div className="mt-4 space-y-2">
          {/* Details Button */}
          <Link to={`/incidents/${incident._id}`} className="w-full">
            <button className="btn btn-primary btn-sm w-full">Szczegóły</button>
          </Link>
          
          {/* New: Edit Button */}
          <Link to={`/incidents/${incident._id}/edit`} className="w-full">
            <button className="btn btn-accent btn-sm w-full">Edytuj</button>
          </Link>

          {/* Update Status */}
          <select
            value={incident.status || 'Nowe'}
            onChange={(e) => onStatusChange(incident._id, e.target.value)}
            className="select select-bordered select-sm w-full bg-gray-800 text-white"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(incident._id)}
            className="btn btn-error btn-outline btn-sm w-full"
          >
            Usuń
          </button>
        </div>
      </div>
    </div>
  );
};

IncidentCard.propTypes = {
  incident: PropTypes.object.isRequired,
  getStatusColor: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default IncidentCard;
