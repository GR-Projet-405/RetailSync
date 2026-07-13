import React from 'react';
import Modal from './Modal';
import Button from './Button';

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) => {
  const confirmVariant = {
    danger: 'danger',
    warning: 'warning',
    success: 'success',
    primary: 'primary',
  }[type] || 'primary';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-slate-600 text-sm leading-relaxed">{message}</p>
        <div className="flex justify-end space-x-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
