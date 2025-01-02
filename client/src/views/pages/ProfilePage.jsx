import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import useProfile from '../../controllers/hooks/useProfile';
import TextInput from '../components/features/profileManagement/TextInput';
import AlertMessage from '../components/common/AlertMessage';
import Notifications from '../components/common/Notifications';
import Loader from '../components/common/Loader'; // Corrected import path

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
  // Utilize the custom hook
  const {
    // Account Info
    accountData,
    accountError,
    accountSuccess,
    handleAccountChange,
    handleAccountSubmit,
    updatingProfile,

    // Password Change
    passwordData,
    passwordError,
    passwordSuccess,
    handlePasswordChange,
    handlePasswordSubmit,
    changingPassword,

    // Loading
    loadingProfile,
  } = useProfile();

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
    // You might need to implement functions to clear messages based on activeTab
    // For now, assuming messages are handled per form submission
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
            <Tabs value={activeTab} onChange={handleTabChange} textColor="inherit" indicatorColor="primary">
              <Tab label="Informacje o Koncie" />
              <Tab label="Zmień Hasło" />
              <Tab label="Powiadomienia" />
            </Tabs>
          </Box>

          {/* Conditional Rendering Based on Loading State */}
          {loadingProfile ? (
            <Loader />
          ) : (
            <>
              {/* Tab #0 - Account Info */}
              {activeTab === 0 && (
                <Box
                  component="form"
                  onSubmit={handleAccountSubmit}
                  sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                  {accountError && <AlertMessage type="error" message={accountError} />}
                  {accountSuccess && <AlertMessage type="success" message={accountSuccess} />}

                  <TextInput
                    label="Imię"
                    name="firstName"
                    value={accountData.firstName}
                    onChange={handleAccountChange}
                    required
                  />

                  <TextInput
                    label="Nazwisko"
                    name="lastName"
                    value={accountData.lastName}
                    onChange={handleAccountChange}
                    required
                  />

                  <TextInput
                    label="Email"
                    name="email"
                    value={accountData.email}
                    onChange={handleAccountChange}
                    required
                    type="email"
                    disabled // Email is not editable
                  />

                  {/* Read-Only Field for Role */}
                  <TextInput
                    label="Rola"
                    name="role"
                    value={accountData.role}
                    disabled
                    required
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={updatingProfile}
                  >
                    {updatingProfile ? 'Aktualizowanie...' : 'Zaktualizuj Profil'}
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
                  {passwordError && <AlertMessage type="error" message={passwordError} />}
                  {passwordSuccess && <AlertMessage type="success" message={passwordSuccess} />}

                  <TextInput
                    label="Stare Hasło"
                    name="oldPassword"
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    required
                  />

                  <TextInput
                    label="Nowe Hasło"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />

                  <TextInput
                    label="Potwierdź Nowe Hasło"
                    name="confirmNewPassword"
                    type="password"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    required
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={changingPassword}
                  >
                    {changingPassword ? 'Zmiana...' : 'Zmień Hasło'}
                  </Button>
                </Box>
              )}

              {/* Tab #2 - Notifications */}
              {activeTab === 2 && (
                <Box sx={{ mt: 2 }}>
                  <Notifications />
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ProfilePage;
