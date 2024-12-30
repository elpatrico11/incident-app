import React from 'react';
import PropTypes from 'prop-types';

const Pagination = ({ currentPage, totalPages, handlePageChange }) => {
  const generatePageNumbers = () => {
    const pages = [];
    for(let i=1; i<= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex justify-between items-center mt-4">
      {/* Informacja o stronie */}
      <div>
        <p className="text-white">
          Strona {currentPage} z {totalPages}
        </p>
      </div>
      
      {/* Kontrolki Paginacji */}
      <div className="flex space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`btn btn-outline btn-sm ${currentPage === 1 ? 'btn-disabled' : ''}`}
        >
          Poprzednia
        </button>
        {generatePageNumbers().map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`btn btn-outline btn-sm ${currentPage === totalPages ? 'btn-disabled' : ''}`}
        >
          Następna
        </button>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  handlePageChange: PropTypes.func.isRequired,
};

export default Pagination;
