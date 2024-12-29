import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/api';

const EditUser = () => {
  const { id } = useParams(); // Get user ID from URL
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      setUserData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        email: response.data.email || '',
        role: response.data.role || 'user',
      });
    } catch (err) {
      console.error(err);
      setError('Błąd podczas pobierania danych użytkownika.');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setUserData(prevData => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Simple validation
    if (!userData.firstName || !userData.lastName || !userData.email) {
      setError('Imię, nazwisko i email są wymagane.');
      return;
    }

    try {
      await api.put(`/admin/users/${id}`, userData);
      setSuccess('Dane użytkownika zostały zaktualizowane.');
      // Optionally, redirect back to user management after a delay
      setTimeout(() => navigate('/admin/users'), 2000);
    } catch (err) {
      console.error(err);
      setError('Błąd podczas aktualizacji danych użytkownika.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-10">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-gray-800 rounded-lg shadow-lg mt-10">
      <h2 className="text-2xl mb-6 text-center text-white">Edytuj Użytkownika</h2>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First Name */}
        <div>
          <label className="block text-white mb-1">Imię</label>
          <input
            type="text"
            name="firstName"
            value={userData.firstName}
            onChange={handleChange}
            className="input input-bordered w-full bg-gray-700 text-white"
            required
          />
        </div>
        {/* Last Name */}
        <div>
          <label className="block text-white mb-1">Nazwisko</label>
          <input
            type="text"
            name="lastName"
            value={userData.lastName}
            onChange={handleChange}
            className="input input-bordered w-full bg-gray-700 text-white"
            required
          />
        </div>
        {/* Email */}
        <div>
          <label className="block text-white mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            className="input input-bordered w-full bg-gray-700 text-white"
            required
          />
        </div>
        {/* Role */}
        <div>
          <label className="block text-white mb-1">Rola</label>
          <select
            name="role"
            value={userData.role}
            onChange={handleChange}
            className="select select-bordered w-full bg-gray-700 text-white"
          >
            <option value="user">Użytkownik</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        {/* Submit Button */}
        <div className="flex justify-center">
          <button type="submit" className="btn btn-primary">
            Zaktualizuj
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
