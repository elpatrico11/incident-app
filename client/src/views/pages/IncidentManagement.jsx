import React from 'react';
import useIncidentManagement from '../../controllers/hooks/useIncidentManagement';
import IncidentCard from '../components/features/incidentManagement/IncidentCard';
import Filters from '../components/features/incidentManagement/Filters';
import Pagination from '../components/features/incidentManagement/Pagination';
import DeleteModal from '../components/features/incidentManagement/DeleteModal';

const IncidentManagement = () => {
  const {
    // Data
    paginatedIncidents,
    categories,

    // Loading
    loadingIncidents,
    loadingCategories,

    // Feedback
    error,
    success,

    // Filters, Sorting, Pagination
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    currentPage,
    setCurrentPage,
    totalPages,
    sortOption,
    setSortOption,
    searchQuery,
    setSearchQuery,
    itemsPerPage,
    setItemsPerPage,
    itemsPerPageOptions,

    // Messages
    noIncidentsMessage,

    // Status Colors
    STATUS_COLORS,

    // Handlers
    handleStatusChange,

    // Delete Modal
    modalOpen,
    openModal,
    closeModal,
    confirmDelete,
  } = useIncidentManagement();

  if (loadingIncidents || loadingCategories) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="loading loading-spinner text-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:px-8 bg-gray-900 min-h-screen mb-12">
      <h2 className="text-3xl font-bold mb-6 text-center text-white">
        Zarządzanie Zgłoszeniami
      </h2>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}

      <h3 className="text-xl font-semibold mb-4 text-white text-center">
        Filtrowanie i Sortowanie zgłoszeń
      </h3>

      <Filters
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
        setCurrentPage={setCurrentPage}
      />

      {paginatedIncidents.length === 0 ? (
        <div className="text-center text-white text-lg">
          {noIncidentsMessage()}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedIncidents.map((incident) => (
              <IncidentCard
                key={incident._id}
                incident={incident}
                getStatusColor={(status) =>
                  STATUS_COLORS[status.toLowerCase()] || STATUS_COLORS.default
                }
                onStatusChange={handleStatusChange}
                onDelete={openModal}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={modalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default IncidentManagement;
