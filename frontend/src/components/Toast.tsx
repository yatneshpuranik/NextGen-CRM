import React, { useEffect } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeStyles = {
    success: 'bg-[var(--teal-bg)] text-[var(--teal-text-strong)] border-[var(--teal-border)]',
    error: 'bg-[var(--red-bg)] text-[var(--red-text-strong)] border-[var(--red-icon)]',
    info: 'bg-[var(--purple-bg)] text-[var(--purple-text-strong)] border-[var(--purple-icon)]',
  };

  const iconColor = {
    success: 'text-[var(--teal-icon)]',
    error: 'text-[var(--red-icon)]',
    info: 'text-[var(--purple-icon)]',
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-lg border p-4 shadow-sm transition-all animate-bounce ${typeStyles[type]} max-w-sm`}>
      <span className={`text-lg font-bold ${iconColor[type]}`}>
        {type === 'success' && '✓'}
        {type === 'error' && '⚠'}
        {type === 'info' && 'ℹ'}
      </span>
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-auto text-xs opacity-75 hover:opacity-100 focus:outline-none"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
