import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store';
import {
  fetchProducts,
  setFilters,
  setPage,
  deleteProduct,
  activateProduct,
  deactivateProduct,
  resetFilters,
} from '../store/slices/productSlice';
import { ProductTable } from '../components/products/ProductTable';
import { FilterPanel } from '../components/products/FilterPanel';
import { ConfirmationModal } from '../components/ConfirmationModal';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

export const ProductsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user } = useSelector((state: RootState) => state.auth);
  const { products, loading, error, pagination, filters } = useSelector(
    (state: RootState) => state.product
  );

  // Modals and Toasts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; productId: string | null }>({
    isOpen: false,
    productId: null,
  });
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    productId: string | null;
    currentActive: boolean;
  }>({
    isOpen: false,
    productId: null,
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
    dispatch(fetchProducts());
  }, [
    dispatch,
    pagination.page,
    pagination.limit,
    filters.search,
    filters.isActive,
    filters.category,
    filters.brand,
    filters.sortBy,
    filters.sortOrder,
  ]);

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
      productId: id,
      currentActive,
    });
  };

  const handleConfirmStatusToggle = async () => {
    const { productId, currentActive } = statusModal;
    if (!productId) return;

    try {
      if (currentActive) {
        await dispatch(deactivateProduct(productId)).unwrap();
        setToast({ message: 'Product profile deactivated successfully', type: 'info' });
      } else {
        await dispatch(activateProduct(productId)).unwrap();
        setToast({ message: 'Product profile activated successfully', type: 'success' });
      }
    } catch (err: any) {
      setToast({ message: err || 'Failed to toggle product status', type: 'error' });
    } finally {
      setStatusModal({ isOpen: false, productId: null, currentActive: false });
    }
  };

  const handleDelete = (id: string) => {
    setDeleteModal({
      isOpen: true,
      productId: id,
    });
  };

  const handleConfirmDelete = async () => {
    const { productId } = deleteModal;
    if (!productId) return;

    try {
      await dispatch(deleteProduct(productId)).unwrap();
      setToast({ message: 'Product profile archived successfully', type: 'success' });
      dispatch(fetchProducts());
    } catch (err: any) {
      setToast({ message: err || 'Failed to delete product', type: 'error' });
    } finally {
      setDeleteModal({ isOpen: false, productId: null });
    }
  };

  const canWrite = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Product Profile"
        message="Are you sure you want to archive this product? This action is soft-reversible but hides the product from new challan listings."
        confirmText="Archive Product"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, productId: null })}
      />

      <ConfirmationModal
        isOpen={statusModal.isOpen}
        title={statusModal.currentActive ? 'Deactivate Product' : 'Activate Product'}
        message={
          statusModal.currentActive
            ? 'Deactivating this product hides it from active listings and prevents it from being added to new challans.'
            : 'Activating this product makes it visible and available for catalog allocations.'
        }
        confirmText={statusModal.currentActive ? 'Deactivate' : 'Activate'}
        type="warning"
        onConfirm={handleConfirmStatusToggle}
        onCancel={() => setStatusModal({ isOpen: false, productId: null, currentActive: false })}
      />

      {/* Header Block */}
      <header className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-2xl font-medium text-[var(--text-primary)]">Product Directory</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Manage enterprise product catalogs, stock benchmarks, and pricing.</p>
        </div>
        {canWrite && (
          <button
            onClick={() => navigate('/dashboard/products/new')}
            className="btn-primary-action"
          >
            <span>➕</span> Add Product
          </button>
        )}
      </header>

      {/* Search Bar */}
      <div className="flex gap-4 items-center bg-[var(--surface-card)] p-4 rounded-xl border border-[var(--border)]">
        <span className="text-lg text-[var(--text-secondary)]">🔍</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Product Name, SKU code, brand, or catalog code..."
          className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Clear
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      <FilterPanel
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Content Table / Loader */}
      <div className="relative min-h-[250px]">
        {loading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-xl">
            <Loader size="lg" />
          </div>
        )}

        {products.length > 0 ? (
          <div className="space-y-4">
            <ProductTable
              products={products}
              userRole={user?.role || 'SALES'}
              onView={(id) => navigate(`/dashboard/products/${id}`)}
              onEdit={(id) => navigate(`/dashboard/products/${id}/edit`)}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />

            {/* Pagination Controls */}
            <div className="flex justify-between items-center px-2 py-1">
              <span className="text-xs text-[var(--text-secondary)] font-mono">
                Showing Page {pagination.page} of {pagination.totalPages} ({pagination.totalRecords} records found)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3.5 py-1.5 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3.5 py-1.5 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="text-center py-16 border border-dashed border-[var(--border)] bg-[var(--surface-card)] rounded-xl">
              <span className="text-4xl block mb-3">📦</span>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">No products matching filters found</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">Try adjusting your search queries or resetting all filtering metrics.</p>
              {canWrite && (
                <button
                  onClick={() => navigate('/dashboard/products/new')}
                  className="mt-4 px-4 py-2 border border-[var(--teal-primary)] text-[var(--teal-text)] text-xs font-semibold rounded-lg hover:bg-teal-50 transition"
                >
                  Add New Product
                </button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
