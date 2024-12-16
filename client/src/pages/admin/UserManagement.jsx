import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import api from '../../utils/api';
import { Alert } from 'daisyui'; // Tylko Alert importowany jako komponent

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');

  const currentUser = useAuthStore(state => state.user);

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
    try {
      const response = await api.put(`/admin/users/${userId}`, { role: newRole });
      setUsers(users.map(user => user._id === userId ? response.data : user));
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

    if (!window.confirm("Czy na pewno chcesz usunąć tego użytkownika?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      console.error(err);
      setError('Błąd podczas usuwania użytkownika.');
    }
  };

  if (loadingUsers) {
    return (
      <div className="flex justify-center mt-10">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl mb-6 text-center text-white">Zarządzanie Użytkownikami</h2>
      {error && <Alert className="mb-4">{error}</Alert>}
      {users.length === 0 ? (
        <p className="text-center text-white">Brak użytkowników.</p>
      ) : (
        <div className="shadow-lg rounded-lg overflow-x-auto">
          <table className="table table-zebra w-full border border-gray-700">
            <thead className="bg-gray-700 text-white">
              <tr>
                <th className="px-4 py-2">Imię</th>
                <th className="px-4 py-2">Nazwisko</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Rola</th>
                <th className="px-4 py-2">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="hover:bg-gray-600">
                  <td className="border-t border-gray-700 px-4 py-2">{user.firstName || 'N/A'}</td>
                  <td className="border-t border-gray-700 px-4 py-2">{user.lastName || 'N/A'}</td>
                  <td className="border-t border-gray-700 px-4 py-2">{user.email || 'N/A'}</td>
                  <td className="border-t border-gray-700 px-4 py-2">
                    <select 
                      value={user.role || 'user'} 
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="select select-bordered bg-gray-600 text-white"
                    >
                      <option value="user">Użytkownik</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>
                  <td className="border-t border-gray-700 px-4 py-2 space-x-2">
                    <button 
                      className="btn btn-error btn-outline btn-xs"
                      onClick={() => handleDeleteUser(user._id)}
                      disabled={currentUser._id === user._id}
                      title={currentUser._id === user._id ? "Nie możesz usunąć siebie" : "Usuń użytkownika"}
                    >
                      Usuń
                    </button>
                    {currentUser._id === user._id && (
                      <span className="text-xs text-red-500">Nie możesz usunąć siebie</span>
                    )}
                    <Link to={`/admin/users/${user._id}/edit`}>
                      <button 
                        className="btn btn-primary btn-outline btn-xs"
                        title="Edytuj użytkownika"
                      >
                        Edytuj
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
