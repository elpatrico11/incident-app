import React from 'react';
import PropTypes from 'prop-types';
import { SORT_OPTIONS, STATUS_OPTIONS } from '../../../../constants/incidentConstants';

const Filters = ({
  filterStatus,
  setFilterStatus,
  filterCategory,
  setFilterCategory,
  categories,
  sortOption,
  setSortOption,
  searchQuery,
  setSearchQuery,
  itemsPerPage,
  setItemsPerPage,
  itemsPerPageOptions,
  setCurrentPage,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      {/* Status Filtering */}
      <select
        value={filterStatus}
        onChange={(e) => {
          setFilterStatus(e.target.value);
          setCurrentPage(1);
        }}
        className="select select-bordered w-48 bg-gray-800 text-white"
      >
        <option value="All">Wszystkie Statusy</option>
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      {/* Category Filtering */}
      <select
        value={filterCategory}
        onChange={(e) => {
          setFilterCategory(e.target.value);
          setCurrentPage(1);
        }}
        className="select select-bordered w-48 bg-gray-800 text-white"
      >
        <option value="All">Wszystkie Kategorie</option>
        {categories.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>

      {/* Sorting */}
      <select
        value={sortOption}
        onChange={(e) => {
          setSortOption(e.target.value);
          setCurrentPage(1);
        }}
        className="select select-bordered w-48 bg-gray-800 text-white"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Searching */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1);
        }}
        placeholder="Szukaj zgłoszeń..."
        className="input input-bordered w-48 bg-gray-800 text-white"
      />

      {/* Items per page */}
      <select
        value={itemsPerPage}
        onChange={(e) => {
          setItemsPerPage(Number(e.target.value));
          setCurrentPage(1);
        }}
        className="select select-bordered w-48 bg-gray-800 text-white"
      >
        {itemsPerPageOptions.map((option) => (
          <option key={option} value={option}>
            {option} na stronę
          </option>
        ))}
      </select>
    </div>
  );
};

Filters.propTypes = {
  filterStatus: PropTypes.string.isRequired,
  setFilterStatus: PropTypes.func.isRequired,
  filterCategory: PropTypes.string.isRequired,
  setFilterCategory: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
  sortOption: PropTypes.string.isRequired,
  setSortOption: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  setItemsPerPage: PropTypes.func.isRequired,
  itemsPerPageOptions: PropTypes.array.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
};

export default Filters;
