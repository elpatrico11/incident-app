import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';

const TextInput = ({ label, name, value, onChange, type = 'text', required = false, disabled = false, error = false, helperText = '' }) => {
  return (
    <TextField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      required={required}
      disabled={disabled}
      fullWidth
      variant="outlined"
      error={error}
      helperText={helperText}
      InputLabelProps={{
        style: { color: '#ffffff' },
      }}
      InputProps={{
        style: { color: '#ffffff' },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: '#ffffff',
          },
          '&:hover fieldset': {
            borderColor: '#ffffff',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#ffffff',
          },
        },
        '& .MuiInputLabel-root': {
          color: '#ffffff',
        },
        '& .MuiFormHelperText-root': {
          color: '#ff6b6b',
        },
      }}
    />
  );
};

TextInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  helperText: PropTypes.string,
};

export default TextInput;
