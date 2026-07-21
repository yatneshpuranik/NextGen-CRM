import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchInventorySummary } from '../store/slices/inventorySlice';
import type { RootState } from '../store';
import Loader from '../components/Loader';

export const InventoryDashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { summary, loading, error } = useSelector((state: RootState) => state.inventory);

  useEffect(() => {
    dispatch(fetchInventorySummary() as any);
  }, [dispatch]);

  if (loading && !summary) {
    return <Loader />;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'STOCK_IN':
        return <span className="status-badge confirmed">📥 Stock In</span>;
      case 'STOCK_OUT':
        return <span className="status-badge cancelled">📤 Stock Out</span>;
      case 'ADJUSTMENT':
        return <span className="status-badge draft">🔧 Adjustment</span>;
      case 'DAMAGE':
        return <span className="status-badge low-stock">⚠️ Damage</span>;
      case 'RETURN':
        return <span className="status-badge draft">🔄 Return</span>;
      default:
        return <span className="status-badge">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)]">Inventory Dashboard</h2>
          <p className="text-sm text-[var(--text-secondary)]">Overview of stock levels, values, and recent warehouse activities.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/dashboard/inventory')}
            className="btn-primary-action"
          >
            <span>🏭</span> Go to Inventory Workspace
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[var(--red-bg)] border border-[var(--red-icon)] rounded-xl text-[var(--red-text-strong)] text-sm">
          {error}
        </div>
      )}

      {/* Grid of stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="stat-card teal">
            <span className="stat-icon text-2xl">📦</span>
            <span className="stat-number">{summary.totalProducts}</span>
            <span className="stat-label">Total Product Profiles</span>
          </div>

          <div className="stat-card purple">
            <span className="stat-icon text-2xl">🏭</span>
            <span className="stat-number">{summary.availableStock}</span>
            <span className="stat-label">Total Available Stock</span>
          </div>

          <div className="stat-card red">
            <span className="stat-icon text-2xl">⚠️</span>
            <span className="stat-number">{summary.lowStockProducts}</span>
            <span className="stat-label">Low Stock Products</span>
          </div>

          <div className="stat-card red">
            <span className="stat-icon text-2xl">🚫</span>
            <span className="stat-number">{summary.outOfStockProducts}</span>
            <span className="stat-label">Out of Stock Products</span>
          </div>

          <div className="stat-card amber">
            <span className="stat-icon text-2xl">💔</span>
            <span className="stat-number">{summary.damagedStock}</span>
            <span className="stat-label">Damaged Stock Items</span>
          </div>

          <div className="stat-card teal col-span-2 md:col-span-1 lg:col-span-2">
            <span className="stat-icon text-2xl">💰</span>
            <span className="stat-number">{formatCurrency(summary.inventoryValue)}</span>
            <span className="stat-label">Total Inventory Value (Asset Cost)</span>
          </div>
        </div>
      )}

      {/* Recent Movements & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List */}
        <div className="content-card lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h3 className="text-base font-medium text-[var(--text-primary)]">Recent Stock Movements</h3>
            <Link to="/dashboard/inventory/history" className="text-xs text-[var(--teal-icon)] hover:underline font-medium">
              View Audit Ledger →
            </Link>
          </div>

          {summary?.recentTransactions && summary.recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {summary.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-start justify-between p-3 rounded-lg hover:bg-[var(--surface-hover)] transition-colors border border-[var(--border)]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-[var(--text-primary)]">
                        {tx.product?.productName}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">({tx.product?.sku})</span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      Previous: <span className="font-medium">{tx.previousStock}</span> | New: <span className="font-medium">{tx.newStock}</span>
                    </div>
                    {tx.remarks && (
                      <p className="text-xs italic text-[var(--text-muted)]">"{tx.remarks}"</p>
                    )}
                    <div className="text-[10px] text-[var(--text-muted)]">
                      Logged by {tx.createdByUser?.fullName} | {new Date(tx.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="text-right space-y-1.5">
                    {getTransactionTypeBadge(tx.transactionType)}
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {tx.transactionType === 'STOCK_OUT' || tx.transactionType === 'DAMAGE' ? '-' : '+'}{Math.abs(tx.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)] py-4 text-center">No recent stock transactions recorded.</p>
          )}
        </div>

        {/* Quick Utilities */}
        <div className="content-card space-y-4 h-fit">
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="text-base font-medium text-[var(--text-primary)]">Inventory Utilities</h3>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              to="/dashboard/inventory/low-stock"
              className="p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] transition flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-3">
                <span>⚠️</span>
                <div>
                  <div className="font-medium">Low Stock Report</div>
                  <div className="text-xs text-[var(--text-muted)]">Items below safety levels</div>
                </div>
              </div>
              <span className="text-[var(--text-muted)]">→</span>
            </Link>

            <Link
              to="/dashboard/inventory"
              className="p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] transition flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-3">
                <span>🏭</span>
                <div>
                  <div className="font-medium">Stock Operations</div>
                  <div className="text-xs text-[var(--text-muted)]">In, Out, Returns & Transfers</div>
                </div>
              </div>
              <span className="text-[var(--text-muted)]">→</span>
            </Link>

            <Link
              to="/dashboard/inventory/history"
              className="p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] transition flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-3">
                <span>📜</span>
                <div>
                  <div className="font-medium">Audit History</div>
                  <div className="text-xs text-[var(--text-muted)]">Full log of stock activities</div>
                </div>
              </div>
              <span className="text-[var(--text-muted)]">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboardPage;
