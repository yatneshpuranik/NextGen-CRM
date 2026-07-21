import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-page)] px-4">
      <div className="content-card w-full max-w-md text-center flex flex-col items-center">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-2" />
        <h2 className="mt-2 text-2xl font-medium tracking-tight text-[var(--text-primary)]">Access Forbidden</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          You do not have the required permissions to view this resource. Please contact your system administrator.
        </p>
        <div className="mt-6 w-full">
          <Link to="/dashboard" className="btn-primary-action w-full inline-block text-center">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
