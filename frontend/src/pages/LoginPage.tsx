import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../utils/api';
import { setCredentials, setLoading, setError } from '../store/slices/authSlice';
import type { RootState } from '../store';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  
  const { loading } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Redirect destination after login
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Must be a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(setLoading(true));
    setErrors({});
    
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { accessToken, user } = response.data.data;
      
      dispatch(setCredentials({ accessToken, user }));
      
      setToast({
        message: 'Successfully logged in!',
        type: 'success',
      });

      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (err: any) {
      const responseData = err.response?.data;
      const errMsg = responseData?.message || 'Invalid email address or password';
      
      dispatch(setError(errMsg));
      setToast({
        message: errMsg,
        type: 'error',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-page)] px-4 py-12">
      <div className="content-card w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)]">
            Sign In
          </h2>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            Enter your credentials to access NextGen ERP
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm"
              placeholder="e.g. name@company.com"
              disabled={loading}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{errors.email}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Password
              </label>
            </div>
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

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-action w-full mt-2"
          >
            {loading ? <Loader size="sm" light /> : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-[var(--text-secondary)]">
            Need an account setup?{' '}
            <Link to="/register" className="text-[var(--teal-icon)] font-medium hover:underline">
              Create Admin Account
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

export default LoginPage;
