
import React from 'react';
import FilterBar from './FilterBar';
import SortBar from './SortBar';
import SearchBar from './SearchBar';
import ItemsPerPageSelector from './ItemsPerPageSelector';

/**
 * ControlsBar component that includes filters, sorting, searching, and items per page selection.
 */
const ControlsBar = ({
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
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
      {/* Filter by Status and Category */}
      <FilterBar
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        categories={categories}
      />

      {/* Sort Options */}
      <SortBar sortOption={sortOption} setSortOption={setSortOption} />

      {/* Search Bar */}
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Items Per Page */}
      <ItemsPerPageSelector
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        itemsPerPageOptions={itemsPerPageOptions}
      />
    </div>
  );
};

export default ControlsBar;
