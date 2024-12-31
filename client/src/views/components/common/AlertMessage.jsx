import React from 'react';
import PropTypes from 'prop-types';

const AlertMessage = ({ type, message }) => {
  const baseClasses = "mb-4 p-4 rounded";
  const typeClasses = {
    error: "bg-red-600 text-white",
    success: "bg-green-600 text-white",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      {message}
    </div>
  );
};

AlertMessage.propTypes = {
  type: PropTypes.oneOf(['error', 'success']).isRequired,
  message: PropTypes.string.isRequired,
};

export default AlertMessage;
