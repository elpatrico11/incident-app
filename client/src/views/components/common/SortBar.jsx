
import React from 'react';


const SortBar = ({ sortOption, setSortOption }) => {
  return (
    <select
      value={sortOption}
      onChange={(e) => setSortOption(e.target.value)}
      className="select select-bordered w-40 bg-gray-800 text-white"
    >
      <option value="date_desc">Data (najnowsze)</option>
      <option value="date_asc">Data (najstarsze)</option>
      <option value="category_asc">Kategoria (A-Z)</option>
      <option value="category_desc">Kategoria (Z-A)</option>
    </select>
  );
};

export default SortBar;
