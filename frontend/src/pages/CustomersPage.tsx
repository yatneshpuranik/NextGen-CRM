import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store';
import {
  fetchCustomers,
  setFilters,
  setPage,
  deleteCustomer,
  activateCustomer,
  deactivateCustomer,
  resetFilters,
} from '../store/slices/customerSlice';
import CustomerTable from '../components/customers/CustomerTable';
import FilterPanel from '../components/customers/FilterPanel';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

export const CustomersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user } = useSelector((state: RootState) => state.auth);
  const { customers, loading, error, pagination, filters } = useSelector(
    (state: RootState) => state.customer
  );

  // Modals and Toasts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; customerId: string | null }>({
    isOpen: false,
    customerId: null,
  });
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    customerId: string | null;
    currentActive: boolean;
  }>({
    isOpen: false,
    customerId: null,
    currentActive: false,
  });

  // Local search query to prevent typing lag
  const [searchQuery, setSearchQuery] = useState(filters.search);

  // Trigger search filter in Redux after debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setFilters({ search: searchQuery }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, dispatch]);

  // Sync search state if reset
  useEffect(() => {
    setSearchQuery(filters.search);
  }, [filters.search]);

  // Refetch when filters or pagination page change
  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch, pagination.page, pagination.limit, filters.search, filters.isActive, filters.customerType, filters.sortBy, filters.sortOrder]);

  const handleFilterChange = (newFilters: any) => {
    dispatch(setFilters(newFilters));
  };

  const handleFilterReset = () => {
    dispatch(resetFilters());
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleToggleStatus = (id: string, currentActive: boolean) => {
    setStatusModal({
      isOpen: true,
      customerId: id,
      currentActive,
    });
  };

  const handleConfirmStatusToggle = async () => {
    const { customerId, currentActive } = statusModal;
    if (!customerId) return;

    try {
      if (currentActive) {
        await dispatch(deactivateCustomer(customerId)).unwrap();
        setToast({ message: 'Customer profile deactivated successfully', type: 'info' });
      } else {
        await dispatch(activateCustomer(customerId)).unwrap();
        setToast({ message: 'Customer profile activated successfully', type: 'success' });
      }
    } catch (err: any) {
      setToast({ message: err || 'Failed to toggle customer status', type: 'error' });
    } finally {
      setStatusModal({ isOpen: false, customerId: null, currentActive: false });
    }
  };

  const handleDelete = (id: string) => {
    setDeleteModal({
      isOpen: true,
      customerId: id,
    });
  };

  const handleConfirmDelete = async () => {
    const { customerId } = deleteModal;
    if (!customerId) return;

    try {
      await dispatch(deleteCustomer(customerId)).unwrap();
      setToast({ message: 'Customer profile archived/deleted successfully', type: 'success' });
      dispatch(fetchCustomers());
    } catch (err: any) {
      setToast({ message: err || 'Failed to archive customer profile', type: 'error' });
    } finally {
      setDeleteModal({ isOpen: false, customerId: null });
    }
  };

  const canCreate = user?.role === 'ADMIN' || user?.role === 'SALES';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Customers</span>
          </div>
          <h2 className="text-xl font-medium tracking-tight text-[var(--text-primary)]">
            Customers Directory
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Manage customer directories, addresses, GSTIN data, and partner statuses.
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => navigate('/dashboard/customers/new')}
            className="btn-primary-action"
          >
            <span>➕</span> Add Customer
          </button>
        )}
      </div>

      {/* Search and Filters Block */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-xl p-4 flex items-center">
          <span className="text-lg mr-3">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company name, contact person, email, or phone..."
            className="w-full text-sm focus:outline-none bg-transparent placeholder-[var(--text-muted)]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2 font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters Selectors */}
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleFilterReset}
        />
      </div>

      {/* Main Listing Grid */}
      {loading && customers.length === 0 ? (
        <div className="content-card py-16 flex items-center justify-center">
          <Loader size="lg" />
        </div>
      ) : error ? (
        <div className="content-card py-12 text-center space-y-3">
          <p className="text-[var(--red-icon)] font-medium">⚠️ Error loading customer records</p>
          <p className="text-sm text-[var(--text-secondary)]">{error}</p>
          <button
            type="button"
            onClick={() => dispatch(fetchCustomers())}
            className="btn-primary-action text-xs mt-2"
          >
            Retry Fetching
          </button>
        </div>
      ) : customers.length === 0 ? (
        <div className="content-card py-16 text-center space-y-3">
          <span className="text-4xl block">👥</span>
          <h4 className="text-base font-medium text-[var(--text-primary)]">No Customers Found</h4>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            We couldn't find any customer profiles matching your criteria. Try adjusting the search queries or filters.
          </p>
          {searchQuery || filters.isActive || filters.customerType ? (
            <button
              type="button"
              onClick={handleFilterReset}
              className="btn-primary-action text-xs mt-2"
            >
              Reset Filters
            </button>
          ) : (
            canCreate && (
              <button
                type="button"
                onClick={() => navigate('/dashboard/customers/new')}
                className="btn-primary-action text-xs mt-2"
              >
                Onboard First Customer
              </button>
            )
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <CustomerTable
            customers={customers}
            userRole={user?.role || 'WAREHOUSE'}
            onView={(id) => navigate(`/dashboard/customers/${id}`)}
            onEdit={(id) => navigate(`/dashboard/customers/${id}/edit`)}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalRecords} total records)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="px-3 py-1.5 border border-[var(--border)] rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:pointer-events-none transition"
              >
                Previous
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => handlePageChange(pNum)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    pagination.page === pNum
                      ? 'bg-[var(--teal-bg)] border border-[var(--teal-border)] text-[var(--teal-text-strong)]'
                      : 'border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  {pNum}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="px-3 py-1.5 border border-[var(--border)] rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:pointer-events-none transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Confirm Archiving Customer"
        message="Are you sure you want to archive/delete this customer profile? This will hide the profile from normal views. This action is restricted to Administrators."
        confirmText="Archive Profile"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, customerId: null })}
      />

      <ConfirmationModal
        isOpen={statusModal.isOpen}
        title={statusModal.currentActive ? 'Deactivate Customer' : 'Activate Customer'}
        message={`Are you sure you want to ${
          statusModal.currentActive ? 'deactivate' : 'activate'
        } this customer? Deactivated customers will not be eligible to raise new delivery challans.`}
        confirmText={statusModal.currentActive ? 'Deactivate' : 'Activate'}
        type={statusModal.currentActive ? 'warning' : 'info'}
        onConfirm={handleConfirmStatusToggle}
        onCancel={() => setStatusModal({ isOpen: false, customerId: null, currentActive: false })}
      />

      {/* Toasts */}
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

export default CustomersPage;
