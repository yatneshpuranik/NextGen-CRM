import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('SALES');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Must be a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Confirm password must match password';
    }
    if (!role) newErrors.role = 'Role is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    
    try {
      await api.post('/auth/register', {
        fullName,
        email,
        password,
        confirmPassword,
        role,
      });

      setToast({
        message: 'Account registered successfully! Redirecting to login...',
        type: 'success',
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData && responseData.errors) {
        const valErrors: { [key: string]: string } = {};
        responseData.errors.forEach((errObj: any) => {
          if (errObj.field) {
            valErrors[errObj.field] = errObj.message;
          }
        });
        setErrors(valErrors);
      }
      
      setToast({
        message: responseData?.message || 'Registration failed. Permissions check rejected request.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-page)] px-4 py-12">
      <div className="content-card w-full max-w-lg space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)]">
            Create Account
          </h2>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            Bootstrapping or Admin account register panel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm"
              placeholder="e.g. Jane Doe"
              disabled={loading}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm"
              placeholder="e.g. jane@company.com"
              disabled={loading}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm"
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm"
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Assign Security Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm bg-white"
              disabled={loading}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="SALES">SALES</option>
              <option value="WAREHOUSE">WAREHOUSE</option>
              <option value="ACCOUNTS">ACCOUNTS</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{errors.role}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-action w-full mt-2"
          >
            {loading ? <Loader size="sm" light /> : 'Register User'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--teal-icon)] font-medium hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default RegisterPage;
