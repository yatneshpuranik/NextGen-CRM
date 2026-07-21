import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md', light = false }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  const colorClass = light ? 'border-t-white' : 'border-t-[var(--teal-icon)]';

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-solid border-slate-200/50 ${colorClass}`}
        role="status"
      />
    </div>
  );
};

export default Loader;
