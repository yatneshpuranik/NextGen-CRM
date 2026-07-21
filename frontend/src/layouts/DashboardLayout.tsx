import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store';
import api from '../utils/api';
import { NotificationDropdown } from '../components/NotificationDropdown';
import { GlobalSearchModal } from '../components/GlobalSearchModal';

export const DashboardLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [showSearch, setShowSearch] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout').catch(() => {});
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut triggering if typing inside input or textarea elements
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearch((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setShowSearch(false);
        return;
      }

      if (isInput) return;

      const key = e.key.toLowerCase();
      if (key === 'n') {
        e.preventDefault();
        navigate('/dashboard/customers/new');
      } else if (key === 'p') {
        e.preventDefault();
        navigate('/dashboard/products/new');
      } else if (key === 'c') {
        e.preventDefault();
        navigate('/dashboard/sales-challans/new');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="flex min-h-screen bg-[var(--surface-page)]">
      {/* Search drawer modal */}
      <GlobalSearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />

      {/* 1. Sidebar Nav */}
      <aside className="sidebar w-64 fixed top-0 left-0 bottom-0 p-4 space-y-6 flex flex-col z-35">
        <div className="px-3 py-4">
          <h1 className="text-xl font-medium tracking-tight text-[var(--teal-text-strong)] flex items-center gap-2">
            <span>🚀</span> NextGen ERP
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">Core Enterprise Workspace</p>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <span>📊</span> Dashboard
          </NavLink>
          <NavLink
            to="/dashboard/customers"
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <span>👥</span> Customers
          </NavLink>
          <NavLink
            to="/dashboard/products"
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <span>📦</span> Products
          </NavLink>
          <NavLink
            to="/dashboard/inventory"
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <span>🏭</span> Inventory
          </NavLink>
          <NavLink
            to="/dashboard/warehouses"
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <span>🏙️</span> Warehouses
          </NavLink>
          <NavLink
            to="/dashboard/sales-challans"
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <span>📜</span> Delivery Challans
          </NavLink>
          <NavLink
            to="/dashboard/analytics"
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <span>📈</span> Analytics
          </NavLink>
          <NavLink
            to="/dashboard/reports"
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <span>📋</span> Reports
          </NavLink>

          {/* Admin Restricted Paths */}
          {isAdmin && (
            <div className="pt-4 border-t border-[var(--border)] mt-4 space-y-1.5">
              <span className="block px-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Admin Panel</span>
              <NavLink
                to="/dashboard/audit-logs"
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              >
                <span>🕵️‍♂️</span> Audit Trails
              </NavLink>
              <NavLink
                to="/dashboard/backup-restore"
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              >
                <span>💾</span> Backup & Export
              </NavLink>
              <NavLink
                to="/dashboard/settings"
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              >
                <span>⚙️</span> Settings
              </NavLink>
              <NavLink
                to="/dashboard/email-logs"
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              >
                <span>✉️</span> Email Logs
              </NavLink>
            </div>
          )}
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

      {/* 2. Main Content Container */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top bar header */}
        <header className="h-16 border-b border-[var(--border)] bg-[var(--surface-card)] px-8 flex items-center justify-between sticky top-0 z-30">
          <button 
            onClick={() => setShowSearch(true)} 
            className="flex items-center gap-2 px-3 py-1.5 border border-[var(--border)] bg-[var(--surface-page)] hover:bg-[var(--surface-hover)] rounded-lg text-xs text-[var(--text-secondary)] transition-colors min-w-[200px]"
          >
            <span>🔍</span> Search...
            <kbd className="ml-auto text-[10px] px-1.5 py-0.5 bg-[var(--surface-card)] border border-[var(--border)] rounded-md font-mono">Ctrl+K</kbd>
          </button>

          <div className="flex items-center gap-4">
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              Role: <span className="font-semibold text-[var(--teal-text-strong)]">{user?.role}</span>
            </span>
            <NotificationDropdown />
          </div>
        </header>

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
