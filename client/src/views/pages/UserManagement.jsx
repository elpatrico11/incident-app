import React, { useState } from 'react';
import useUserManagement from '../../controllers/hooks/useUserManagement';
import UserCard from '../components/features/userManagement/UserCard';
import Filters from '../components/features/userManagement/Filters';
import Pagination from '../components/features/userManagement/Pagination';
import DeleteModal from '../components/features/userManagement/DeleteModal';
import { CSVLink } from 'react-csv';

const UserManagement = () => {
  const {
    // Data
    paginatedUsers,
    totalPagesCount,
    users,
    
    // Loading
    loadingUsers,
    
    // Feedback
    error,
    success,
    
    // Filters, Sorting, Pagination
    sortConfig,
    handleSort,
    searchTerm,
    setSearchTerm,
    currentPage,
    handlePageChange,
    itemsPerPage,
    handleItemsPerPageChange,
    itemsPerPageOptions,
    
    // Handlers
    handleRoleChange,
    handleDeleteUser,
    
    // Current User
    currentUser,
  } = useUserManagement();

  // State for Delete Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Define headers for CSV
  const headers = [
    { label: 'Imię', key: 'firstName' },
    { label: 'Nazwisko', key: 'lastName' },
    { label: 'Email', key: 'email' },
    { label: 'Rola', key: 'role' },
  ];

  // Open Delete Modal
  const openModal = (userId, userEmail) => {
    setSelectedUserId(userId);
    setSelectedUserEmail(userEmail);
    setModalOpen(true);
  };

  // Close Delete Modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedUserId(null);
    setSelectedUserEmail('');
  };

  // Confirm Delete
  const confirmDelete = () => {
    handleDeleteUser(selectedUserId);
    closeModal();
  };

  if (loadingUsers) {
    return (
      <div className="flex justify-center mt-10">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-900 min-h-screen mb-12">
      <h2 className="text-2xl mb-6 text-center text-white">Zarządzanie Użytkownikami</h2>
      
      {/* Feedback Messages */}
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}
      
      {/* Filters and Actions */}
      <Filters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortConfig={sortConfig}
        handleSort={handleSort}
        itemsPerPage={itemsPerPage}
        handleItemsPerPageChange={handleItemsPerPageChange}
        itemsPerPageOptions={itemsPerPageOptions}
      />
      
      {/* Actions Section */}
      <div className="flex flex-col sm:flex-row justify-between mb-4">
        {/* Export CSV */}
        <div className="mb-2 sm:mb-0">
          <CSVLink
            data={users}
            headers={headers}
            filename="users.csv"
            className="btn btn-secondary btn-outline"
          >
            Eksportuj CSV
          </CSVLink>
        </div>
      </div>
      
      {/* Users Table */}
      {paginatedUsers.length === 0 ? (
        <p className="text-center text-white">Brak użytkowników.</p>
      ) : (
        <div className="shadow-lg rounded-lg overflow-x-auto">
          <table className="table table-zebra w-full border border-gray-700">
            <thead className="bg-gray-700 text-white">
              <tr>
                <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('firstName')}>
                  Imię
                  {sortConfig.key === 'firstName' && (sortConfig.direction === 'ascending' ? ' ↑' : ' ↓')}
                </th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('lastName')}>
                  Nazwisko
                  {sortConfig.key === 'lastName' && (sortConfig.direction === 'ascending' ? ' ↑' : ' ↓')}
                </th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('email')}>
                  Email
                  {sortConfig.key === 'email' && (sortConfig.direction === 'ascending' ? ' ↑' : ' ↓')}
                </th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('role')}>
                  Rola
                  {sortConfig.key === 'role' && (sortConfig.direction === 'ascending' ? ' ↑' : ' ↓')}
                </th>
                <th className="px-4 py-2">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map(user => (
                <UserCard
                  key={user._id}
                  user={user}
                  handleRoleChange={handleRoleChange}
                  handleDeleteUser={() => openModal(user._id, user.email)}
                  isCurrentUser={currentUser._id === user._id}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPagesCount}
        handlePageChange={handlePageChange}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={modalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        userEmail={selectedUserEmail}
      />
    </div>
  );
};

export default UserManagement;
