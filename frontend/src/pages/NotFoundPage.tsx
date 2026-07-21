import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-page)] px-4">
      <div className="content-card w-full max-w-md text-center">
        <span className="text-4xl text-[var(--purple-icon)] font-bold">404</span>
        <h2 className="mt-4 text-2xl font-medium tracking-tight text-[var(--text-primary)]">Page Not Found</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          The requested page could not be located in the NextGen core services router.
        </p>
        <div className="mt-6">
          <Link to="/dashboard" className="btn-primary-action w-full">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
