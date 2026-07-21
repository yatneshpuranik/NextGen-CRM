import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
  fetchSummary, 
  fetchSalesOverview, 
  fetchRecentActivity, 
  fetchTopProducts, 
  fetchLowStock 
} from '../store/slices/dashboardSlice';
import type { RootState } from '../store';
import api from '../utils/api';
import Toast from '../components/Toast';
import Loader from '../components/Loader';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const { 
    summary, 
    salesOverview, 
    recentActivity, 
    topProducts, 
    lowStock, 
    loading 
  } = useSelector((state: RootState) => state.dashboard);

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

  // Show profile config panel state
  const [showSettings, setShowSettings] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    dispatch(fetchSummary() as any);
    dispatch(fetchRecentActivity() as any);

    const role = user?.role;
    if (role === 'ADMIN' || role === 'SALES' || role === 'ACCOUNTS') {
      dispatch(fetchSalesOverview() as any);
      dispatch(fetchTopProducts() as any);
    }
    if (role === 'ADMIN' || role === 'WAREHOUSE') {
      dispatch(fetchLowStock() as any);
    }
  }, [dispatch, user?.role]);

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

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'CUSTOMER': return '👥';
      case 'STOCK': return '🏭';
      case 'CHALLAN': return '📜';
      case 'PRODUCT': return '📦';
      default: return '⚡';
    }
  };

  if (loading && !summary) {
    return <Loader />;
  }

  const isWarehouseRole = user?.role === 'WAREHOUSE';
  const isAccountsRole = user?.role === 'ACCOUNTS';
  const canSeeSales = user?.role === 'ADMIN' || user?.role === 'SALES' || user?.role === 'ACCOUNTS';
  const canSeeInventory = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Greeting and Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)]">
            Welcome back, {user?.fullName}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Core Enterprise Operations Control Center.
          </p>
        </div>

        <div className="flex gap-2">
          {!isAccountsRole && (
            <Link to="/dashboard/inventory" className="btn-secondary-action flex items-center gap-1.5">
              <span>🏭</span> Record Stock-In
            </Link>
          )}
          {!isWarehouseRole && !isAccountsRole && (
            <Link to="/dashboard/sales-challans/new" className="btn-primary-action flex items-center gap-1.5">
              <span>➕</span> Raise Challan
            </Link>
          )}
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className="btn-secondary-action flex items-center gap-1.5"
          >
            <span>⚙️</span> Security & Profile
          </button>
        </div>
      </div>

      {/* Security Context Expandable Settings drawer */}
      {showSettings && (
        <div className={`grid grid-cols-1 ${user?.role === 'ADMIN' ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6 bg-[var(--surface-hover)] p-6 rounded-xl border border-[var(--border)]`}>
          {/* User profile details */}
          <div className="content-card space-y-4">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Your Identity Context</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-[var(--border)] pb-2">
                <span className="text-[var(--text-secondary)] font-medium">Username</span>
                <span className="font-semibold">{user?.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border)] pb-2">
                <span className="text-[var(--text-secondary)] font-medium">Email</span>
                <span>{user?.email}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border)] pb-2">
                <span className="text-[var(--text-secondary)] font-medium">Assigned Role</span>
                <span className="status-badge confirmed text-[9px] uppercase font-bold">{user?.role}</span>
              </div>
            </div>
          </div>

          {/* Password Form */}
          <div className="content-card space-y-3">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Change Password</h3>
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-3 text-xs">
              <div>
                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full text-xs"
                  disabled={passwordLoading}
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-[10px] text-[var(--red-icon)] font-medium">{passwordErrors.currentPassword}</p>
                )}
              </div>
              <div>
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs"
                  disabled={passwordLoading}
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-[10px] text-[var(--red-icon)] font-medium">{passwordErrors.newPassword}</p>
                )}
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-xs"
                  disabled={passwordLoading}
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-[10px] text-[var(--red-icon)] font-medium">{passwordErrors.confirmPassword}</p>
                )}
              </div>
              <button type="submit" disabled={passwordLoading} className="btn-primary-action py-1.5 w-full text-xs">
                Rotate Password
              </button>
            </form>
          </div>

          {/* Admin user register form (ONLY FOR ADMIN) */}
          {user?.role === 'ADMIN' && (
            <div className="content-card space-y-3">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Register New Profile</h3>
              <form onSubmit={handleAdminRegisterSubmit} className="space-y-3 text-xs">
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={registerFullName}
                    onChange={(e) => setRegisterFullName(e.target.value)}
                    className="w-full text-xs"
                    disabled={registerLoading}
                  />
                  {registerErrors.fullName && (
                    <p className="mt-1 text-[10px] text-[var(--red-icon)] font-medium">{registerErrors.fullName}</p>
                  )}
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full text-xs"
                    disabled={registerLoading}
                  />
                  {registerErrors.email && (
                    <p className="mt-1 text-[10px] text-[var(--red-icon)] font-medium">{registerErrors.email}</p>
                  )}
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Security Password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full text-xs"
                    disabled={registerLoading}
                  />
                  {registerErrors.password && (
                    <p className="mt-1 text-[10px] text-[var(--red-icon)] font-medium">{registerErrors.password}</p>
                  )}
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Confirm Security Password"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    className="w-full text-xs"
                    disabled={registerLoading}
                  />
                  {registerErrors.confirmPassword && (
                    <p className="mt-1 text-[10px] text-[var(--red-icon)] font-medium">{registerErrors.confirmPassword}</p>
                  )}
                </div>
                <div>
                  <select
                    value={registerRole}
                    onChange={(e) => setRegisterRole(e.target.value)}
                    className="w-full text-xs"
                    disabled={registerLoading}
                  >
                    <option value="SALES">SALES ROLE</option>
                    <option value="WAREHOUSE">WAREHOUSE ROLE</option>
                    <option value="ACCOUNTS">ACCOUNTS ROLE</option>
                    <option value="ADMIN">ADMIN ADMINISTRATOR</option>
                  </select>
                </div>
                <button type="submit" disabled={registerLoading} className="btn-primary-action py-1.5 w-full text-xs">
                  Create Account
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {canSeeSales && (
          <div className="stat-card teal cursor-pointer hover:opacity-90" onClick={() => navigate('/dashboard/customers')}>
            <span className="stat-icon text-xl">👥</span>
            <span className="stat-number">{summary?.totalCustomers || 0}</span>
            <span className="stat-label">Active Customers</span>
          </div>
        )}

        {canSeeSales && (
          <div className="stat-card purple cursor-pointer hover:opacity-90" onClick={() => navigate('/dashboard/sales-challans')}>
            <span className="stat-icon text-xl">₹</span>
            <span className="stat-number">
              ₹{(summary?.monthlyRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
            <span className="stat-label">Monthly Gross Revenue</span>
          </div>
        )}

        {canSeeInventory && (
          <div className="stat-card red cursor-pointer hover:opacity-90" onClick={() => navigate('/dashboard/inventory/low-stock')}>
            <span className="stat-icon text-xl">⚠️</span>
            <span className="stat-number">{summary?.lowStockProducts || 0}</span>
            <span className="stat-label">Low Stock Alarms</span>
          </div>
        )}

        {canSeeSales && (
          <div className="stat-card amber cursor-pointer hover:opacity-90" onClick={() => navigate('/dashboard/sales-challans')}>
            <span className="stat-icon text-xl">⏳</span>
            <span className="stat-number">{summary?.draftChallans || 0}</span>
            <span className="stat-label">Pending Draft Orders</span>
          </div>
        )}
      </div>

      {/* Sales Overview Chart Row (ADMIN, SALES, ACCOUNTS) */}
      {canSeeSales && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Trend (2 cols) */}
          <div className="lg:col-span-2 content-card space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Sales Revenue Trend (Past 6 Months)</h3>
              <span className="text-xs text-[var(--teal-text-strong)] font-semibold">₹{(summary?.monthlyRevenue || 0).toLocaleString('en-IN')} this month</span>
            </div>

            <div className="h-64">
              {salesOverview && salesOverview.monthly ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesOverview.monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                    <XAxis dataKey="label" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--surface-card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                      labelStyle={{ fontWeight: 500 }}
                    />
                    <Bar dataKey="revenue" fill="var(--purple-icon)" radius={[4, 4, 0, 0]} maxBarSize={40} name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Loader />
              )}
            </div>
          </div>

          {/* Top Products Spenders (1 col) */}
          <div className="content-card space-y-4">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Top Selling Products</h3>
            
            <div className="space-y-4">
              {topProducts && topProducts.length > 0 ? (
                topProducts.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-[var(--border)] pb-2 text-xs">
                    <div>
                      <span className="font-semibold block text-[var(--text-primary)]">{p.name}</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">{p.sku}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-[var(--teal-text-strong)] block">{p.quantity} units sold</span>
                      <span className="text-[10px] text-[var(--text-secondary)]">₹{Number(p.revenue).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-xs text-[var(--text-muted)]">No sales items logged yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Activities and Low Stock Grids */}
      <div className={`grid grid-cols-1 ${canSeeInventory ? 'lg:grid-cols-3' : ''} gap-6`}>
        
        {/* Low Stock Warning Alarm board (2 cols for ADMIN / WAREHOUSE) */}
        {canSeeInventory && (
          <div className="lg:col-span-2 content-card space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Low Stock Warnings</h3>
              <Link to="/dashboard/inventory/low-stock" className="text-xs text-[var(--teal-text)] hover:underline font-medium">
                View All Low Stock
              </Link>
            </div>

            <div className="overflow-x-auto">
              {lowStock && lowStock.length > 0 ? (
                <table className="modern-table text-xs">
                  <thead>
                    <tr>
                      <th className="pb-2">Product Name</th>
                      <th className="pb-2">Category</th>
                      <th className="pb-2 text-center">Available</th>
                      <th className="pb-2 text-center">Min Level</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.slice(0, 5).map((item) => (
                      <tr key={item.id} className="hover:bg-[var(--surface-hover)]">
                        <td className="py-2.5">
                          <span className="font-semibold text-[var(--text-primary)]">{item.productName}</span>
                          <div className="text-[9px] text-[var(--text-muted)] font-mono">{item.sku}</div>
                        </td>
                        <td className="py-2.5 text-[var(--text-secondary)]">{item.category}</td>
                        <td className="py-2.5 text-center text-[var(--red-icon)] font-semibold">{item.currentStock}</td>
                        <td className="py-2.5 text-center">{item.minimumStock}</td>
                        <td className="py-2.5 text-right">
                          <Link 
                            to={`/dashboard/inventory/${item.id}`} 
                            className="px-2 py-0.5 text-[10px] border border-[var(--border)] rounded hover:bg-[var(--surface-hover)]"
                          >
                            Stock In
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12 text-xs text-[var(--text-muted)]">All stocks healthy. Zero alerts active.</div>
              )}
            </div>
          </div>
        )}

        {/* Recent Activities feed */}
        <div className="content-card space-y-4">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Unified Timeline Feed</h3>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((act, idx) => (
                <div key={idx} className="flex gap-3 text-xs align-top border-l-2 border-[var(--border)] pl-3 relative pb-2">
                  <span className="absolute -left-[10px] bg-[var(--surface-card)] rounded-full text-xs">
                    {getTimelineIcon(act.type)}
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-[var(--text-primary)] font-medium leading-tight">{act.description}</p>
                    <span className="text-[10px] text-[var(--text-muted)] block">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                      {new Date(act.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-xs text-[var(--text-muted)]">No recent logs recorded.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
