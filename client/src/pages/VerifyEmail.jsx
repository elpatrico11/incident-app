import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, CircularProgress, Box, Button } from '@mui/material';
import api from '../utils/api';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState({
    loading: true,
    success: null,
    message: '',
  });

  useEffect(() => {
    let isMounted = true; 

    const verifyEmail = async () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get('token');
      const email = queryParams.get('email');

      if (!token || !email) {
        if (isMounted) {
          setVerificationStatus({
            loading: false,
            success: false,
            message: 'Invalid verification link.',
          });
        }
        return;
      }

      try {
        const response = await api.get(`/auth/verify-email`, {
          params: { token, email }
        });
        if (isMounted) {
          setVerificationStatus({
            loading: false,
            success: true,
            message: response.data.msg || 'Email verified successfully.',
          });
        }
      } catch (error) {
        console.error('Verification error:', error);
        if (isMounted) {
          setVerificationStatus({
            loading: false,
            success: false,
            message: error.response?.data?.msg || 'Verification failed.',
          });
        }
      }
    };

    verifyEmail();


    return () => {
      isMounted = false;
    };
  }, [location.search]); 

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
              Go to Login
            </Button>
          )}
        </>
      )}
    </Box>
  );
};

export default VerifyEmail;