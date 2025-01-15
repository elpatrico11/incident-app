
import React from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  FormControl,
  FormLabel,
} from '@mui/material';
import useResendVerification from '../../controllers/hooks/useResendVerification';

const ResendVerification = () => {
  const {
    email,
    setEmail,
    error,
    success,
    handleSubmit,
    resetState,
  } = useResendVerification();

//Handles resetting the form state.

  const handleReset = () => {
    resetState();
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
      <Typography variant="h4" gutterBottom>
        Resend Verification Email
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ width: '100%', maxWidth: 400 }}
      >
        <FormControl fullWidth sx={{ mb: 2 }}>
          <FormLabel htmlFor="email">Email</FormLabel>
          <TextField
            required
            fullWidth
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <Button type="submit" variant="contained" fullWidth>
          Resend Verification Email
        </Button>
        {success && (
          <Button
            onClick={handleReset}
            variant="outlined"
            color="secondary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Reset
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ResendVerification;
