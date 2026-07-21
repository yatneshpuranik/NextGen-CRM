import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
}) => {
  if (!isOpen) return null;

  const btnColors = {
    danger: 'bg-[var(--red-bg)] border-[var(--red-icon)] text-[var(--red-text-strong)] hover:bg-[var(--surface-hover)]',
    warning: 'bg-[var(--amber-bg)] border-[var(--amber-icon)] text-[var(--amber-text-strong)] hover:bg-[var(--surface-hover)]',
    info: 'bg-[var(--teal-bg)] border-[var(--teal-border)] text-[var(--teal-text)] hover:bg-[var(--surface-hover)]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="content-card w-full max-w-md space-y-4">
        <h3 className="text-lg font-medium text-[var(--text-primary)]">
          {title}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {message}
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-page)] transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition ${btnColors[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
