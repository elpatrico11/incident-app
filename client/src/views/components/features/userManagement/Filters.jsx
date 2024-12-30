import React from 'react';
import PropTypes from 'prop-types';
import { SORT_OPTIONS } from '../../../../constants/userConstants';

const Filters = ({
  searchTerm,
  setSearchTerm,
  sortConfig,
  handleSort,
  itemsPerPage,
  handleItemsPerPageChange,
  itemsPerPageOptions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between mb-4">
      {/* Searching */}
      <div className="mb-2 sm:mb-0">
        <input
          type="text"
          placeholder="Wyszukaj użytkownika..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered bg-gray-600 text-white w-full max-w-xs"
        />
      </div>
      
      {/* Sorting */}
      <div className="mb-2 sm:mb-0">
        <select
          value={`${sortConfig.key}_${sortConfig.direction}`}
          onChange={(e) => {
            const [key, direction] = e.target.value.split('_');
            handleSort(key, direction);
          }}
          className="select select-bordered bg-gray-600 text-white w-full max-w-xs"
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Items Per Page */}
      <div>
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="select select-bordered bg-gray-600 text-white w-full max-w-xs"
        >
          {itemsPerPageOptions.map(option => (
            <option key={option} value={option}>
              {option} na stronę
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

Filters.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  sortConfig: PropTypes.object.isRequired,
  handleSort: PropTypes.func.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  handleItemsPerPageChange: PropTypes.func.isRequired,
  itemsPerPageOptions: PropTypes.array.isRequired,
};

export default Filters;
