import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@mui/material';

const AlertMessage = ({ type, message }) => {
  return (
    <Alert severity={type} sx={{ mb: 2 }}>
      {message}
    </Alert>
  );
};

AlertMessage.propTypes = {
  type: PropTypes.oneOf(['error', 'success']).isRequired,
  message: PropTypes.string.isRequired,
};

export default AlertMessage;
