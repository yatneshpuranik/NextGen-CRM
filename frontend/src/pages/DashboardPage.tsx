import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store';
import api from '../utils/api';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

export const DashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});

  // Admin-only User Creation State
  const [registerFullName, setRegisterFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerRole, setRegisterRole] = useState('SALES');

  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerErrors, setRegisterErrors] = useState<{ [key: string]: string }>({});

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleLogout = async () => {
    try {
      // Optional: Inform the backend of the logout session clear
      await api.post('/auth/logout').catch(() => {});
    } finally {
      dispatch(logout());
      setToast({ message: 'Logged out successfully!', type: 'success' });
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'New password must contain at least 8 characters';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Confirm password must match new password';
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    setPasswordLoading(true);
    setPasswordErrors({});

    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setToast({
        message: 'Password rotated successfully! A confirmation email has been dispatched.',
        type: 'success',
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData && responseData.errors) {
        const valErrors: { [key: string]: string } = {};
        responseData.errors.forEach((errObj: any) => {
          if (errObj.field) {
            valErrors[errObj.field] = errObj.message;
          }
        });
        setPasswordErrors(valErrors);
      }
      setToast({
        message: responseData?.message || 'Failed to rotate password. Check inputs.',
        type: 'error',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAdminRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!registerFullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!registerEmail.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(registerEmail)) {
      newErrors.email = 'Must be a valid email address';
    }
    if (!registerPassword) {
      newErrors.password = 'Password is required';
    } else if (registerPassword.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!registerConfirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (registerConfirmPassword !== registerPassword) {
      newErrors.confirmPassword = 'Confirm password must match password';
    }

    if (Object.keys(newErrors).length > 0) {
      setRegisterErrors(newErrors);
      return;
    }

    setRegisterLoading(true);
    setRegisterErrors({});

    try {
      const response = await api.post('/auth/register', {
        fullName: registerFullName,
        email: registerEmail,
        password: registerPassword,
        confirmPassword: registerConfirmPassword,
        role: registerRole,
      });

      setToast({
        message: `Registered new user profile: ${response.data.data.fullName} (${response.data.data.role})!`,
        type: 'success',
      });

      setRegisterFullName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      setRegisterRole('SALES');
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData && responseData.errors) {
        const valErrors: { [key: string]: string } = {};
        responseData.errors.forEach((errObj: any) => {
          if (errObj.field) {
            valErrors[errObj.field] = errObj.message;
          }
        });
        setRegisterErrors(valErrors);
      }
      setToast({
        message: responseData?.message || 'Failed to create user profile.',
        type: 'error',
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--surface-page)]">
      {/* 1. Sidebar Nav Grid */}
      <aside className="sidebar w-64 fixed top-0 left-0 bottom-0 p-4 space-y-6 flex flex-col">
        <div className="px-3 py-4">
          <h1 className="text-xl font-medium tracking-tight text-[var(--teal-text-strong)] flex items-center gap-2">
            <span>🚀</span> NextGen ERP
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">Core Enterprise Workspace</p>
        </div>

        <nav className="flex-1 space-y-1.5">
          <a href="#" className="sidebar-item active">
            <span>📊</span> Dashboard
          </a>
          <a href="#" className="sidebar-item">
            <span>👥</span> Customers
          </a>
          <a href="#" className="sidebar-item">
            <span>📦</span> Products
          </a>
          <a href="#" className="sidebar-item">
            <span>🏭</span> Inventory
          </a>
          <a href="#" className="sidebar-item">
            <span>📜</span> Delivery Challans
          </a>
        </nav>

        <div className="pt-4 border-t border-[var(--border)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--red-icon)] bg-[var(--red-bg)] hover:bg-[var(--surface-hover)] transition-colors rounded-lg font-medium"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 p-8 space-y-8 max-w-7xl">
        {/* Header Block */}
        <header className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-2xl font-medium text-[var(--text-primary)]">Enterprise Panel</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">Welcome back, {user?.fullName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="status-badge confirmed">Session Active</span>
            <button className="btn-primary-action">
              <span>➕</span> New Challan
            </button>
          </div>
        </header>

        {/* 2. Tinted Stat Cards Grid (No White/Plain Cards) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card teal">
            <span className="stat-icon text-xl">👥</span>
            <div className="stat-number">128</div>
            <div className="stat-label">Total Customers</div>
          </div>
          <div className="stat-card purple">
            <span className="stat-icon text-xl">📜</span>
            <div className="stat-number">45</div>
            <div className="stat-label">Active Challans</div>
          </div>
          <div className="stat-card red">
            <span className="stat-icon text-xl">⚠️</span>
            <div className="stat-number">12</div>
            <div className="stat-label">Low Stock Items</div>
          </div>
          <div className="stat-card amber">
            <span className="stat-icon text-xl">⏳</span>
            <div className="stat-number">8</div>
            <div className="stat-label">Pending Follow-ups</div>
          </div>
        </section>

        {/* Badges Demo Segment */}
        <section className="content-card space-y-4">
          <h3 className="text-lg font-medium text-[var(--text-primary)]">Status Badge Formatting Showcase</h3>
          <p className="text-sm text-[var(--text-secondary)]">Status indicators rendering rounded pill-shapes:</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)]">Confirmed state:</span>
              <span className="status-badge confirmed">Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)]">Draft state:</span>
              <span className="status-badge draft">Draft</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)]">Alerts / Cancelled state:</span>
              <span className="status-badge cancelled">Cancelled</span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Profile Card */}
          <div className="content-card space-y-6">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Your Security Context</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-[var(--border)] text-sm">
                <span className="text-[var(--text-secondary)]">Full Name</span>
                <span className="font-medium text-[var(--text-primary)]">{user?.fullName}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-[var(--border)] text-sm">
                <span className="text-[var(--text-secondary)]">Email Address</span>
                <span className="font-medium text-[var(--text-primary)]">{user?.email}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-[var(--border)] text-sm">
                <span className="text-[var(--text-secondary)]">Assigned Role</span>
                <span>
                  <span className="status-badge confirmed text-[10px] uppercase font-bold">{user?.role}</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-[var(--border)] text-sm">
                <span className="text-[var(--text-secondary)]">Account Status</span>
                <span>
                  {user?.isActive ? (
                    <span className="status-badge confirmed">Active</span>
                  ) : (
                    <span className="status-badge cancelled">Inactive</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="content-card space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Change Password</h3>
            
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm"
                  placeholder="••••••••"
                  disabled={passwordLoading}
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm"
                  placeholder="••••••••"
                  disabled={passwordLoading}
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm"
                  placeholder="••••••••"
                  disabled={passwordLoading}
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="btn-primary-action w-full mt-2"
              >
                {passwordLoading ? <Loader size="sm" light /> : 'Rotate Password'}
              </button>
            </form>
          </div>
        </section>

        {/* 3. Add User Card (Admins Only) */}
        {user?.role === 'ADMIN' && (
          <section className="content-card space-y-4 max-w-2xl">
            <div>
              <h3 className="text-lg font-medium text-[var(--text-primary)]">Admin Console: Create User Account</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">As an Administrator, you can onboard new users directly from this dashboard.</p>
            </div>
            
            <form onSubmit={handleAdminRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={registerFullName}
                    onChange={(e) => setRegisterFullName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm"
                    placeholder="e.g. Sales Rep"
                    disabled={registerLoading}
                  />
                  {registerErrors.fullName && (
                    <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{registerErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm"
                    placeholder="e.g. user@nextgenerp.com"
                    disabled={registerLoading}
                  />
                  {registerErrors.email && (
                    <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{registerErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm"
                    placeholder="••••••••"
                    disabled={registerLoading}
                  />
                  {registerErrors.password && (
                    <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{registerErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm"
                    placeholder="••••••••"
                    disabled={registerLoading}
                  />
                  {registerErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{registerErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                  Assign Security Role
                </label>
                <select
                  value={registerRole}
                  onChange={(e) => setRegisterRole(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm bg-white"
                  disabled={registerLoading}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="SALES">SALES</option>
                  <option value="WAREHOUSE">WAREHOUSE</option>
                  <option value="ACCOUNTS">ACCOUNTS</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={registerLoading}
                className="btn-primary-action w-full mt-2"
              >
                {registerLoading ? <Loader size="sm" light /> : 'Create User Account'}
              </button>
            </form>
          </section>
        )}
      </main>

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

export default DashboardPage;
