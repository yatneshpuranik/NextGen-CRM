import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import api from '../utils/api';

export const DashboardLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout').catch(() => {});
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--surface-page)]">
      {/* 1. Sidebar Nav */}
      <aside className="sidebar w-64 fixed top-0 left-0 bottom-0 p-4 space-y-6 flex flex-col z-35">
        <div className="px-3 py-4">
          <h1 className="text-xl font-medium tracking-tight text-[var(--teal-text-strong)] flex items-center gap-2">
            <span>🚀</span> NextGen ERP
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">Core Enterprise Workspace</p>
        </div>

        <nav className="flex-1 space-y-1.5">
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
          <a href="#" className="sidebar-item cursor-not-allowed opacity-60">
            <span>🏭</span> Inventory
          </a>
          <a href="#" className="sidebar-item cursor-not-allowed opacity-60">
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

      {/* 2. Main Content Container */}
      <main className="ml-64 flex-1 p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
