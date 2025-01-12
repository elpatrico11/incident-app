import React from 'react';
import PropTypes from 'prop-types';

const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
  const blueStyle = {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  };

  return (
    <div className="flex justify-center items-center mt-8 space-x-4">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        style={currentPage === 1 ? {} : blueStyle}
        className={`btn text-white px-4 py-2 rounded ${currentPage === 1 ? 'btn-disabled' : ''}`}
      >
        Poprzednia
      </button>
      <span className="text-white">
        Strona {currentPage} z {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        style={currentPage === totalPages ? {} : blueStyle}
        className={`btn text-white px-4 py-2 rounded ${currentPage === totalPages ? 'btn-disabled' : ''}`}
      >
        Następna
      </button>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
};

export default Pagination;
