
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';

const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState(0);

  // State for Account Information
  const [accountData, setAccountData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');

  // State for Change Password
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset messages when switching tabs
    setAccountError('');
    setAccountSuccess('');
    setPasswordError('');
    setPasswordSuccess('');
  };

  // Handlers for Account Information
  const handleAccountChange = (e) => {
    setAccountData({ ...accountData, [e.target.name]: e.target.value });
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setAccountError('');
    setAccountSuccess('');

    try {
      console.log('Submitting Profile Update:', accountData); // Debugging
      const response = await api.put('/auth/me', accountData);
      console.log('Profile Update Response:', response.data); // Debugging
      setUser(response.data);
      setAccountSuccess('Profil został zaktualizowany pomyślnie.');
    } catch (err) {
      console.error('Error updating profile:', err);
      setAccountError(err.response?.data?.msg || 'Błąd podczas aktualizacji profilu.');
    }
  };

  // Handlers for Change Password
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
  e.preventDefault();
  setPasswordError('');
  setPasswordSuccess('');

  const { oldPassword, newPassword, confirmNewPassword } = passwordData;

  // Basic Validation
  if (!oldPassword || !newPassword || !confirmNewPassword) {
    setPasswordError('Wszystkie pola są wymagane.');
    return;
  }

  if (newPassword.length < 6) {
    setPasswordError('Nowe hasło musi mieć co najmniej 6 znaków.');
    return;
  }

  if (newPassword !== confirmNewPassword) {
    setPasswordError('Nowe hasła nie są zgodne.');
    return;
  }

  if (oldPassword === newPassword) {
    setPasswordError('Nowe hasło nie może być takie samo jak stare hasło.');
    return;
  }

  try {
    const response = await api.post('/auth/change-password', {
      oldPassword,
      newPassword,
      confirmNewPassword,
    });
    console.log('Change Password Response:', response.data); // Debugging
    setPasswordSuccess('Hasło zostało zmienione pomyślnie.');

    // Clear password fields after success
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
  } catch (err) {
    console.error('Error changing password:', err);
    setPasswordError(err.response?.data?.msg || 'Błąd podczas zmiany hasła.');
  }
};


  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profil Użytkownika
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Informacje o Koncie" />
          <Tab label="Zmień Hasło" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {activeTab === 0 && (
        <Box component="form" onSubmit={handleAccountSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {accountError && <Alert severity="error">{accountError}</Alert>}
          {accountSuccess && <Alert severity="success">{accountSuccess}</Alert>}
          
          <TextField
            label="Imię"
            name="firstName"
            value={accountData.firstName}
            onChange={handleAccountChange}
            required
          />
          <TextField
            label="Nazwisko"
            name="lastName"
            value={accountData.lastName}
            onChange={handleAccountChange}
            required
          />
          <TextField
            label="Email"
            name="email"
            value={accountData.email}
            onChange={handleAccountChange}
            required
            type="email"
            disabled
          />
          <Button type="submit" variant="contained" color="primary">
            Zaktualizuj Profil
          </Button>
        </Box>
      )}

      {activeTab === 1 && (
        <Box component="form" onSubmit={handlePasswordSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {passwordError && <Alert severity="error">{passwordError}</Alert>}
          {passwordSuccess && <Alert severity="success">{passwordSuccess}</Alert>}
          
          <TextField
            label="Stare Hasło"
            name="oldPassword"
            type="password"
            value={passwordData.oldPassword}
            onChange={handlePasswordChange}
            required
          />
          <TextField
            label="Nowe Hasło"
            name="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            required
          />
          <TextField
            label="Potwierdź Nowe Hasło"
            name="confirmNewPassword"
            type="password"
            value={passwordData.confirmNewPassword}
            onChange={handlePasswordChange}
            required
          />
          <Button type="submit" variant="contained" color="primary">
            Zmień Hasło
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default ProfilePage;
