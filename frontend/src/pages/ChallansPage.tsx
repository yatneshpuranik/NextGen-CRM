import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FileText, Clock3, CheckCircle2, Package, Warehouse, Plus } from 'lucide-react';
import ExportButton from '../components/ExportButton';
import { fetchSalesChallans, setFilters, resetFilters, setPage } from '../store/slices/salesChallanSlice';
import { fetchCustomers } from '../store/slices/customerSlice';
import type { RootState } from '../store';
import Loader from '../components/Loader';

export const ChallansPage: React.FC = () => {
  const dispatch = useDispatch();
  const { challanList, loading, pagination, filters } = useSelector((state: RootState) => state.salesChallan);
  const { customers } = useSelector((state: RootState) => state.customer);
  const { user } = useSelector((state: RootState) => state.auth);

  // Filter local states
  const [search, setSearch] = useState(filters.search);
  const [status, setStatus] = useState(filters.status);
  const [customerId, setCustomerId] = useState(filters.customerId);

  const isReadOnly = user?.role === 'WAREHOUSE' || user?.role === 'ACCOUNTS';

  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'SALES' || user?.role === 'ACCOUNTS') {
      dispatch(fetchCustomers() as any);
    }
  }, [dispatch, user?.role]);

  useEffect(() => {
    dispatch(fetchSalesChallans() as any);
  }, [dispatch, pagination.page, pagination.limit, filters.search, filters.status, filters.customerId, filters.sortBy, filters.sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilters({ search, status, customerId }));
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setCustomerId('');
    dispatch(resetFilters());
  };

  const getStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case 'DRAFT':
        return <span className="status-badge draft">Draft</span>;
      case 'CONFIRMED':
        return <span className="status-badge confirmed">Confirmed</span>;
      case 'CANCELLED':
        return <span className="status-badge low-stock">Cancelled</span>;
      case 'COMPLETED':
        return <span className="status-badge completed">Completed</span>;
      default:
        return <span className="status-badge">{statusStr}</span>;
    }
  };

  const challanItems = Array.isArray(challanList) ? challanList : [];

  // Compute local summary counts
  const totalCount = pagination.totalRecords || challanItems.length;
  const draftCount = challanItems.filter((c) => c.status === 'DRAFT').length;
  const confirmedCount = challanItems.filter((c) => c.status === 'CONFIRMED').length;
  const completedCount = challanItems.filter((c) => c.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)]">Sales Challan Hub</h2>
          <p className="text-sm text-[var(--text-secondary)]">Create, track, and process outbound customer shipments and delivery challans.</p>
        </div>
        {!isReadOnly && (
          <div className="flex flex-wrap items-center gap-3">
            <ExportButton module="challans" />
            <Link to="/dashboard/inventory" className="btn-secondary-action flex items-center gap-1.5">
              <Warehouse className="w-4 h-4 text-teal-600" /> Stock Center
            </Link>
            <Link to="/dashboard/sales-challans/new" className="btn-primary-action flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Create Sales Challan
            </Link>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card purple flex items-center justify-between">
          <div>
            <span className="stat-number block">{totalCount}</span>
            <span className="stat-label">Total Delivery Challans</span>
          </div>
          <FileText className="w-7 h-7 text-purple-600 opacity-80" />
        </div>

        <div className="stat-card amber flex items-center justify-between">
          <div>
            <span className="stat-number block">{draftCount}</span>
            <span className="stat-label">Draft Orders</span>
          </div>
          <Clock3 className="w-7 h-7 text-amber-600 opacity-80" />
        </div>

        <div className="stat-card teal flex items-center justify-between">
          <div>
            <span className="stat-number block">{confirmedCount}</span>
            <span className="stat-label">Confirmed Challans</span>
          </div>
          <CheckCircle2 className="w-7 h-7 text-teal-600 opacity-80" />
        </div>

        <div className="stat-card teal flex items-center justify-between">
          <div>
            <span className="stat-number block">{completedCount}</span>
            <span className="stat-label">Completed Delivery Loads</span>
          </div>
          <Package className="w-7 h-7 text-emerald-600 opacity-80" />
        </div>
      </div>

      {/* Filter Row */}
      <form onSubmit={handleSearchSubmit} className="content-card grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Search Challan</label>
          <input
            type="text"
            placeholder="Challan Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-card)]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Customer Filter</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-card)]"
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Status Filter</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-card)]"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">DRAFT (Edit Mode)</option>
            <option value="CONFIRMED">CONFIRMED (Stock Dispatched)</option>
            <option value="CANCELLED">CANCELLED (Stock Restored)</option>
            <option value="COMPLETED">COMPLETED (Delivered)</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-[var(--teal-bg)] border border-[var(--teal-border)] text-[var(--teal-text)] rounded-lg text-sm font-medium hover:bg-[var(--surface-hover)] transition"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-page)] transition"
          >
            Reset
          </button>
        </div>
      </form>

      {/* List Table */}
      <div className="content-card">
        {loading && challanItems.length === 0 ? (
          <Loader />
        ) : challanItems && challanItems.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="modern-table text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="pb-3 pr-4">Challan Number</th>
                    <th className="pb-3 pr-4">Customer Company</th>
                    <th className="pb-3 pr-4">Challan Date</th>
                    <th className="pb-3 pr-4 text-center">Status</th>
                    <th className="pb-3 pr-4 text-right">Grand Total</th>
                    <th className="pb-3 pr-4">Operator</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {challanItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="py-4 pr-4">
                        <Link to={`/dashboard/sales-challans/${item.id}`} className="font-mono font-medium text-[var(--teal-text)] hover:underline">
                          {item.challanNumber}
                        </Link>
                      </td>
                      <td className="py-4 pr-4 font-medium text-[var(--text-primary)]">
                        {item.customer?.companyName}
                        <div className="text-[10px] text-[var(--text-muted)] font-normal">{item.customer?.customerCode}</div>
                      </td>
                      <td className="py-4 pr-4 text-[var(--text-secondary)]">
                        {new Date(item.challanDate || item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 pr-4 text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-4 pr-4 text-right font-semibold text-[var(--text-primary)]">
                        ₹{Number(item.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 pr-4 text-[var(--text-secondary)]">
                        {item.createdByUser?.fullName}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/dashboard/sales-challans/${item.id}`}
                            className="px-2 py-1 text-xs border border-[var(--border)] rounded hover:bg-[var(--surface-hover)] transition text-[var(--text-primary)]"
                          >
                            View
                          </Link>
                          {item.status === 'DRAFT' && !isReadOnly && (
                            <Link
                              to={`/dashboard/sales-challans/${item.id}/edit`}
                              className="px-2 py-1 text-xs bg-[var(--teal-bg)] border border-[var(--teal-border)] text-[var(--teal-text)] rounded hover:bg-[var(--surface-hover)] transition font-medium"
                            >
                              Edit
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
              <span className="text-xs text-[var(--text-secondary)]">
                Showing page <span className="font-semibold">{pagination.page}</span> of{' '}
                <span className="font-semibold">{pagination.totalPages}</span> ({pagination.totalRecords} records)
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => dispatch(setPage(pagination.page - 1))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1.5 border border-[var(--border)] rounded-lg text-xs font-medium hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => dispatch(setPage(pagination.page + 1))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1.5 border border-[var(--border)] rounded-lg text-xs font-medium hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-[var(--text-muted)] text-sm">
            {loading ? <Loader /> : 'No Sales Challans found. Get started by raising a new delivery challan.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallansPage;
