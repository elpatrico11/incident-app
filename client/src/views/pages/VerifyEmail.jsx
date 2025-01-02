
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, CircularProgress, Box, Button } from '@mui/material';
import useVerifyEmail from '../../controllers/hooks/useVerifyEmail';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const verificationStatus = useVerifyEmail();

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      padding={2}
    >
      {verificationStatus.loading ? (
        <CircularProgress />
      ) : (
        <>
          <Alert severity={verificationStatus.success ? 'success' : 'error'} sx={{ mb: 2 }}>
            {verificationStatus.message}
          </Alert>
          {verificationStatus.success && (
            <Button variant="contained" onClick={handleLoginRedirect}>
              Zaloguj się
            </Button>
          )}
        </>
      )}
    </Box>
  );
};

export default VerifyEmail;
