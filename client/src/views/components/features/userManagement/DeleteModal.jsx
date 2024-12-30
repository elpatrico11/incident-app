import React from 'react';
import PropTypes from 'prop-types';

const DeleteModal = ({ isOpen, onClose, onConfirm, userEmail }) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Potwierdzenie Usunięcia</h3>
        <p className="py-4">Czy jesteś pewien, że chcesz usunąć użytkownika <strong>{userEmail}</strong>?</p>
        <div className="modal-action">
          <button onClick={onClose} className="btn">
            Anuluj
          </button>
          <button onClick={onConfirm} className="btn btn-error">
            Usuń
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  userEmail: PropTypes.string,
};

DeleteModal.defaultProps = {
  userEmail: '',
};

export default DeleteModal;
