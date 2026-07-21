import React from 'react';
import { Link } from 'react-router-dom';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-page)] px-4">
      <div className="content-card w-full max-w-md text-center">
        <span className="text-4xl text-[var(--red-icon)] font-bold">⚠</span>
        <h2 className="mt-4 text-2xl font-medium tracking-tight text-[var(--text-primary)]">Access Forbidden</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          You do not have the required permissions to view this resource. Please contact your system administrator.
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

export default UnauthorizedPage;
