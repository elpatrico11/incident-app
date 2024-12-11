import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';

const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/auth/me', formData);
      setUser(response.data);
      setSuccess('Profil został zaktualizowany pomyślnie.');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Błąd podczas aktualizacji profilu.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profil Użytkownika
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Imię"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <TextField
          label="Nazwisko"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        <TextField
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          type="email"
          disabled
        />
        <Button type="submit" variant="contained" color="primary">
          Zaktualizuj Profil
        </Button>
      </Box>
    </Container>
  );
};

export default ProfilePage;
