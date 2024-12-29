import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CSVLink } from 'react-csv'; 
import api from '../../../api/api';
import useAuthStore from '../../../store/useAuthStore';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'firstName', direction: 'ascending' });

  // Paginacja
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPageOptions = [5, 10, 20, 50];
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Wyszukiwanie
  const [searchTerm, setSearchTerm] = useState('');

  const currentUser = useAuthStore(state => state.user);

  // Definicja nagłówków CSV
  const headers = [
    { label: 'Imię', key: 'firstName' },
    { label: 'Nazwisko', key: 'lastName' },
    { label: 'Email', key: 'email' },
    { label: 'Rola', key: 'role' },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error(err);
      setError('Błąd podczas pobierania użytkowników.');
    }
    setLoadingUsers(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    const user = users.find(u => u._id === userId);
    if (!user) return;

    if (user.role === newRole) return; // Brak zmiany

    const confirmChange = window.confirm(`Czy na pewno chcesz zmienić rolę użytkownika ${user.email} na ${newRole}?`);
    if (!confirmChange) {
      setError('Zmiana roli została anulowana.');
      return;
    }

    try {
      const response = await api.put(`/admin/users/${userId}`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? response.data : u));
      setSuccess('Rola użytkownika została zaktualizowana.');
    } catch (err) {
      console.error(err);
      setError('Błąd podczas aktualizacji roli użytkownika.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (currentUser._id === userId) {
      setError('Nie możesz usunąć własnego konta.');
      return;
    }

    const confirmDelete = window.confirm("Czy na pewno chcesz usunąć tego użytkownika?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
      setSuccess('Użytkownik został usunięty.');
    } catch (err) {
      console.error(err);
      setError('Błąd podczas usuwania użytkownika.');
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower))
      );
    });
  }, [users, searchTerm]);

  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers];
    sorted.sort((a, b) => {
      const aKey = a[sortConfig.key] ? a[sortConfig.key].toString().toLowerCase() : '';
      const bKey = b[sortConfig.key] ? b[sortConfig.key].toString().toLowerCase() : '';
      if (aKey < bKey) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aKey > bKey) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [filteredUsers, sortConfig]);

  // Paginacja
  const totalItems = sortedUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedUsers, currentPage, itemsPerPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset do pierwszej strony
  };

  if (loadingUsers) {
    return (
      <div className="flex justify-center mt-10">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <h2 className="text-2xl mb-6 text-center text-white">Zarządzanie Użytkownikami</h2>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}
      {users.length === 0 ? (
        <p className="text-center text-white">Brak użytkowników.</p>
      ) : (
        <>
          {/* Sekcja Akcji: Wyszukiwanie i Eksport CSV */}
          <div className="flex flex-col sm:flex-row justify-between mb-4">
            {/* Wyszukiwanie */}
            <div className="mb-2 sm:mb-0">
              <input
                type="text"
                placeholder="Wyszukaj użytkownika..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered bg-gray-600 text-white w-full max-w-xs"
              />
            </div>
            {/* Eksport CSV */}
            <div className="flex items-center space-x-2">
              <CSVLink
                data={sortedUsers}
                headers={headers}
                filename="users.csv"
                className="btn btn-secondary btn-outline"
              >
                Eksportuj CSV
              </CSVLink>
              {/* Opcja liczby elementów na stronę */}
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="select select-bordered bg-gray-600 text-white"
              >
                {itemsPerPageOptions.map(option => (
                  <option key={option} value={option}>
                    {option} na stronę
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabela Użytkowników */}
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
                  <tr key={user._id} className="hover:bg-gray-600">
                    <td className="border-t border-gray-700 px-4 py-2">{user.firstName || 'N/A'}</td>
                    <td className="border-t border-gray-700 px-4 py-2">{user.lastName || 'N/A'}</td>
                    <td className="border-t border-gray-700 px-4 py-2">{user.email || 'N/A'}</td>
                    <td className="border-t border-gray-700 px-4 py-2">
                      <select 
                        value={user.role || 'user'} 
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="select select-bordered bg-gray-600 text-white w-full max-w-xs"
                      >
                        <option value="user">Użytkownik</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                    <td className="border-t border-gray-700 px-4 py-2">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          className="btn btn-error btn-outline btn-sm w-full sm:w-auto"
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={currentUser._id === user._id}
                          title={currentUser._id === user._id ? "Nie możesz usunąć siebie" : "Usuń użytkownika"}
                        >
                          Usuń
                        </button>
                        <Link to={`/admin/users/${user._id}/edit`} className="w-full sm:w-auto">
                          <button 
                            className="btn btn-primary btn-outline btn-sm w-full sm:w-auto"
                            title="Edytuj użytkownika"
                          >
                            Edytuj
                          </button>
                        </Link>
                      </div>
                      {currentUser._id === user._id && (
                        <span className="text-xs text-red-500 mt-1 block text-center">Nie możesz usunąć siebie</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginacja */}
          <div className="flex justify-between items-center mt-4">
            {/* Informacja o liczbie użytkowników */}
            <div>
              <p className="text-white">
                Strona {currentPage} z {totalPages} (łącznie {totalItems} użytkowników)
              </p>
            </div>
            {/* Kontrolki Paginacji */}
            <div className="flex space-x-2">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Poprzednia
              </button>
              {/* Numeracja stron */}
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                <button
                  key={page}
                  className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Następna
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserManagement;
