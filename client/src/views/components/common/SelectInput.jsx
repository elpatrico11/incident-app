import React from 'react';
import PropTypes from 'prop-types';

const SelectInput = ({ label, name, value, onChange, options, required = false }) => {
  return (
    <div>
      <label className="block text-white mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="select select-bordered w-full bg-gray-700 text-white"
        required={required}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
};

SelectInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  })).isRequired,
  required: PropTypes.bool,
};

export default SelectInput;
