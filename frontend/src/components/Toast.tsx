import React, { useEffect } from 'react';
import { CircleCheck, CircleAlert, Info, X } from 'lucide-react';

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

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-lg border p-4 shadow-md transition-all ${typeStyles[type]} max-w-sm`}>
      <span className="shrink-0">
        {type === 'success' && <CircleCheck className="w-5 h-5 text-emerald-600" />}
        {type === 'error' && <CircleAlert className="w-5 h-5 text-red-600" />}
        {type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
      </span>
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-auto p-1 text-xs opacity-75 hover:opacity-100 focus:outline-none rounded hover:bg-black/5"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
