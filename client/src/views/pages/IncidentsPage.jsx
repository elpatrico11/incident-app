
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
} from '@mui/material';

import useIncidents from '../../controllers/hooks/useIncidents';
import ControlsBar from '../components/common/ControlsBar';
import IncidentCard from '../components/common/IncidentCard';
import PaginationControls from '../components/common/PaginationControls';
import Loader from '../components/common/Loader';

const IncidentsPage = () => {
  const {
    // Data
    incidents,
    categories,
    totalPages,

    // Loading and Error
    loadingIncidents,
    loadingCategories,
    error,

    // Filters, Sort, Search, Pagination
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    sortOption,
    setSortOption,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    itemsPerPageOptions,

    // Misc
    statusColors,
    noIncidentsMessage,
  } = useIncidents();

  if (loadingIncidents || loadingCategories) {
    return (
      <div className="container mx-auto mt-8 px-4 p-4 lg:px-8 bg-gray-900 min-h-screen mb-12 flex justify-center items-center">
        {/* Custom Loader */}
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto mt-8 px-4 p-4 lg:px-8 bg-gray-900 min-h-screen mb-12">
        <Alert severity="error" className="mb-4">{error}</Alert>
      </div>
    );
  }

  return (
    <Container className="mt-24 px-4 p-4 lg:px-8 bg-gray-900 min-h-screen mb-24">
      <Typography variant="h2" className="text-4xl mb-6 text-center text-white mt-8">
        Wszystkie Incydenty
      </Typography>

      {/* Controls: Filters, Sort, Search, Items Per Page */}
      <ControlsBar
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        categories={categories}
        sortOption={sortOption}
        setSortOption={setSortOption}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        itemsPerPageOptions={itemsPerPageOptions}
      />

      {/* Incident Cards */}
      {incidents.length === 0 ? (
        <Box className="text-center text-white text-lg">
          {noIncidentsMessage}
        </Box>
      ) : (
        <>
          <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {incidents.map((incident) => (
              <IncidentCard
                key={incident._id}
                incident={incident}
                statusColors={statusColors}
              />
            ))}
          </Box>

          {/* Pagination Controls */}
          <PaginationControls
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        </>
      )}
    </Container>
  );
};

export default IncidentsPage;
