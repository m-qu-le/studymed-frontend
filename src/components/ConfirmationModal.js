// src/components/ConfirmationModal.js
import React from 'react';
import Button from './Button';

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) {
    return null;
  }

  return (
    // Lớp phủ nền
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
      {/* Khung Modal */}
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 transform transition-all duration-300 scale-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <Button secondary onClick={onClose}>
            Ở lại
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Có
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;