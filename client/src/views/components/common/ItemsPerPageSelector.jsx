
import React from 'react';


const ItemsPerPageSelector = ({
  itemsPerPage,
  setItemsPerPage,
  itemsPerPageOptions,
}) => {
  return (
    <select
      value={itemsPerPage}
      onChange={(e) => setItemsPerPage(Number(e.target.value))}
      className="select select-bordered w-32 bg-gray-800 text-white"
    >
      {itemsPerPageOptions.map((option) => (
        <option key={option} value={option}>
          {option} na stronę
        </option>
      ))}
    </select>
  );
};

export default ItemsPerPageSelector;
