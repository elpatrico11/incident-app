import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, FormControl, FormLabel } from '@mui/material';
import api from '../utils/api';


const ResendVerification = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      const response = await api.post(`/auth/resend-verification`, { email });
      setSuccess(response.data.msg);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error resending verification email.');
    }
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
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
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
      </Box>
    </Box>
  );
};

export default ResendVerification;