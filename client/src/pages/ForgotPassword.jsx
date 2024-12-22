import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import api from '../utils/api';

export default function ForgotPassword({ open, handleClose }) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [serverError, setServerError] = useState('');

  const validateEmail = () => {
    if (!email) {
      setEmailError(true);
      setEmailErrorMessage('Email is required.');
      return false;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      return false;
    }
    setEmailError(false);
    setEmailErrorMessage('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setServerError('');

    if (!validateEmail()) {
      return;
    }

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSuccessMessage(response.data.msg);
    } catch (error) {
      setServerError(
        error.response?.data?.msg ||
          'An error occurred while processing your request.'
      );
    }
  };

  const handleDialogClose = () => {
    setEmail('');
    setEmailError(false);
    setEmailErrorMessage('');
    setSuccessMessage('');
    setServerError('');
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleDialogClose}>
      <DialogTitle>Forgot Password</DialogTitle>
      <DialogContent>
        {successMessage ? (
          <Alert severity="success">{successMessage}</Alert>
        ) : (
          <>
            {serverError && <Alert severity="error">{serverError}</Alert>}
            <Typography className="mb-4">
              Enter your email address below, and we'll send you a new password.
            </Typography>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className={`w-full p-3 border rounded-md outline-none ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                } focus:border-blue-500`}
              />
              {emailErrorMessage && (
                <p className="text-red-500 text-sm mt-1">{emailErrorMessage}</p>
              )}
            </div>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose} color="secondary">
          {successMessage ? 'Close' : 'Cancel'}
        </Button>
        {!successMessage && (
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
