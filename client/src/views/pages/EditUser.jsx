import React from 'react';
import { Typography, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import useEditUser from '../../controllers/hooks/useEditUser';
import TextInput from '../components/common/TextInput';
import SelectInput from '../components/common/SelectInput';
import AlertMessage from '../components/common/AlertMessage';
import Loader from '../components/common/Loader';
import { USER_ROLES } from '../../constants/userConstants';

const EditUser = () => {
  const { id } = useParams(); // Get user ID from URL
  const navigate = useNavigate();

  // Utilize the custom hook
  const {
    userData,
    loading,
    error,
    success,
    handleChange,
    handleSubmit,
    currentUser, // Now used for RBAC
  } = useEditUser(id);

  // Define role options
  const roleOptions = [
    { label: 'Użytkownik', value: USER_ROLES.USER },
    { label: 'Administrator', value: USER_ROLES.ADMIN },
  ];

  // Implement Role-Based Access Control (RBAC)
  if (currentUser.role !== USER_ROLES.ADMIN) {
    return (
      <div className="p-4 bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <Typography variant="h4">
          Nie masz uprawnień do edycji użytkowników.
        </Typography>
      </div>
    );
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-gray-800 rounded-lg shadow-lg mt-10">
      <Typography variant="h4" gutterBottom className="text-center mb-6 text-white">
        Edytuj Użytkownika
      </Typography>
      
      {/* Feedback Messages */}
      {error && <AlertMessage type="error" message={error} />}
      {success && <AlertMessage type="success" message={success} />}

      <form onSubmit={(e) => handleSubmit(e, navigate)} className="space-y-4">
        {/* First Name */}
        <TextInput
          label="Imię"
          name="firstName"
          value={userData.firstName}
          onChange={handleChange}
          required
        />

        {/* Last Name */}
        <TextInput
          label="Nazwisko"
          name="lastName"
          value={userData.lastName}
          onChange={handleChange}
          required
        />

        {/* Email */}
        <TextInput
          label="Email"
          name="email"
          type="email"
          value={userData.email}
          onChange={handleChange}
          required
        />

        {/* Role */}
        <SelectInput
          label="Rola"
          name="role"
          value={userData.role}
          onChange={handleChange}
          options={roleOptions}
          required
        />

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button type="submit" variant="contained" color="primary">
            Zaktualizuj
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
