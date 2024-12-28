import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Tabs,
  Tab,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';
import Notifications from '../components/Notifications';

// Create a dark theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',  // Very dark background
      paper: '#1e1e1e',    // Slightly lighter background for cards
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
});

const ProfilePage = () => {
  const { user, setUser } = useAuthStore();

  // Read ?tab=... from URL
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = parseInt(searchParams.get('tab') || '0', 10);
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);

    // If newValue is 0, remove the query param; otherwise set ?tab=newValue
    if (newValue === 0) {
      setSearchParams({});
    } else {
      setSearchParams({ tab: newValue });
    }

    // Clear out any success/error messages
    setAccountError('');
    setAccountSuccess('');
    setPasswordError('');
    setPasswordSuccess('');
  };

  // Account info states
  const [accountData, setAccountData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');

  // Password change states
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Handlers for Account Info
  const handleAccountChange = (e) => {
    setAccountData({ ...accountData, [e.target.name]: e.target.value });
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setAccountError('');
    setAccountSuccess('');

    try {
      const response = await api.put('/auth/me', accountData);
      setUser(response.data);
      setAccountSuccess('Profil został zaktualizowany pomyślnie.');
    } catch (err) {
      setAccountError(err.response?.data?.msg || 'Błąd podczas aktualizacji profilu.');
    }
  };

  // Handlers for Password
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const { oldPassword, newPassword, confirmNewPassword } = passwordData;

    // Basic validations
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
      await api.post('/auth/change-password', {
        oldPassword,
        newPassword,
        confirmNewPassword,
      });
      setPasswordSuccess('Hasło zostało zmienione pomyślnie.');
      setPasswordData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.msg || 'Błąd podczas zmiany hasła.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {/* Outer Box with dark background and some vertical padding */}
      <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', py: 4 }}>
        {/* Centered Container with 'paper' background and padding */}
        <Container
          maxWidth="md"
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Profil Użytkownika
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Informacje o Koncie" />
              <Tab label="Zmień Hasło" />
              <Tab label="Powiadomienia" />
            </Tabs>
          </Box>

          {/* Tab #0 - Account Info */}
          {activeTab === 0 && (
            <Box
              component="form"
              onSubmit={handleAccountSubmit}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
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

          {/* Tab #1 - Change Password */}
          {activeTab === 1 && (
            <Box
              component="form"
              onSubmit={handlePasswordSubmit}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
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

          {/* Tab #2 - Notifications */}
          {activeTab === 2 && (
            <Box sx={{ mt: 2 }}>
              <Notifications />
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ProfilePage;
