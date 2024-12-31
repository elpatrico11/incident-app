import React from 'react';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

const DownloadButton = ({ onClick }) => {
  return (
    <Button variant="contained" color="primary" onClick={onClick}>
      Pobierz Raport CSV
    </Button>
  );
};

DownloadButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default DownloadButton;
