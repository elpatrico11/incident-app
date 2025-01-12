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

// Adjust the theme to match the MyIncidentsPage
const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1a202c', // Matches the dark blue-gray background
      paper: '#2d3748',   // Slightly lighter for card backgrounds
    },
    text: {
      primary: '#e2e8f0', // Light text
      secondary: '#a0aec0', // Muted text
    },
    primary: {
      main: '#6366f1', // Indigo for buttons, similar to MyIncidentsPage
    },
  },
});

const ProfilePage = () => {
  // Utilize the custom hook
  const {
    accountData,
    accountError,
    accountSuccess,
    handleAccountChange,
    handleAccountSubmit,
    updatingProfile,

    passwordData,
    passwordError,
    passwordSuccess,
    handlePasswordChange,
    handlePasswordSubmit,
    changingPassword,

    loadingProfile,
  } = useProfile();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = parseInt(searchParams.get('tab') || '0', 10);
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 0) {
      setSearchParams({});
    } else {
      setSearchParams({ tab: newValue });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', py: 4 }}>
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
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              textColor="inherit"
              indicatorColor="primary"
            >
              <Tab label="Informacje o Koncie" />
              <Tab label="Zmień Hasło" />
              <Tab label="Powiadomienia" />
            </Tabs>
          </Box>

          {loadingProfile ? (
            <Loader />
          ) : (
            <>
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
                    disabled
                  />

                 <TextInput
                    label="Rola"
                    name="role"
                    value={accountData.role}
                    disabled
                    required
                    onChange={() => {}}
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
