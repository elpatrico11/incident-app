
import React from 'react';


const FilterBar = ({
  filterStatus,
  setFilterStatus,
  filterCategory,
  setFilterCategory,
  categories,
}) => {
  return (
    <>
      {/* Filter by Status */}
      <select
        value={filterStatus}
        onChange={(e) => {
          const selectedStatus = e.target.value;
          setFilterStatus(selectedStatus);
        }}
        className="select select-bordered w-32 bg-gray-800 text-white"
      >
        <option value="All">Wszystkie</option>
        <option value="Nowe">Nowe</option> 
        <option value="Weryfikacja">Weryfikacja</option>
        <option value="Potwierdzone">Potwierdzone</option>
        <option value="Wstrzymane">Wstrzymane</option>
        <option value="Eskalowane">Eskalowane</option>
        <option value="Rozwiązane">Rozwiązane</option>
        <option value="Nierozwiązane">Nierozwiązane</option>
        <option value="Zamknięte">Zamknięte</option>
        <option value="Odrzucone">Odrzucone</option>
      </select>

      {/* Filter by Category */}
      <select
        value={filterCategory}
        onChange={(e) => {
          setFilterCategory(e.target.value);
        }}
        className="select select-bordered w-40 bg-gray-800 text-white"
      >
        <option value="All">Wszystkie Kategorie</option>
        {categories.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
    </>
  );
};

export default FilterBar;
