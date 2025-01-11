import React from 'react';


const PaginationControls = ({
  currentPage,
  setCurrentPage,
  totalPages,
}) => {
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

export default PaginationControls;
