
import React from 'react';

/**
 * PaginationControls component for navigating between pages.
 */
const PaginationControls = ({
  currentPage,
  setCurrentPage,
  totalPages,
}) => {
  return (
    <div className="flex justify-center items-center mt-8 space-x-4">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className={`btn btn-secondary ${
          currentPage === 1 ? 'btn-disabled' : ''
        }`}
      >
        Poprzednia
      </button>
      <span className="text-white">
        Strona {currentPage} z {totalPages}
      </span>
      <button
        onClick={() =>
          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
        }
        disabled={currentPage === totalPages}
        className={`btn btn-secondary ${
          currentPage === totalPages ? 'btn-disabled' : ''
        }`}
      >
        Następna
      </button>
    </div>
  );
};

export default PaginationControls;
