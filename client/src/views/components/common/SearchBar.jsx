
import React from 'react';


const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Szukaj..."
      className="input input-bordered w-48 bg-gray-800 text-white"
    />
  );
};

export default SearchBar;
