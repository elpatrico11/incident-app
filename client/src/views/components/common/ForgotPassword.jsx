
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import useForgotPassword from '../../../controllers/hooks/useForgotPassword';

const ForgotPassword = ({ open, handleClose }) => {
  const {
    email,
    setEmail,
    emailError,
    emailErrorMessage,
    successMessage,
    serverError,
    handleSubmit,
    resetState,
  } = useForgotPassword();

  const handleDialogClose = () => {
    resetState();
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
          {successMessage ? 'Close' : 'Anuluj'}
        </Button>
        {!successMessage && (
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Potwierdź
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPassword;
