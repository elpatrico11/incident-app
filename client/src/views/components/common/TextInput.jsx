import React from 'react';
import PropTypes from 'prop-types';

const TextInput = ({ label, name, value, onChange, type = 'text', required = false }) => {
  return (
    <div>
      <label className="block text-white mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="input input-bordered w-full bg-gray-700 text-white"
        required={required}
      />
    </div>
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
};

export default TextInput;
