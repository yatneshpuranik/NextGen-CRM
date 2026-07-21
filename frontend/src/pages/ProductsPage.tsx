import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, AlertTriangle, Package, Upload } from 'lucide-react';
import {
  fetchProducts,
  deleteProduct,
  activateProduct,
  deactivateProduct,
  setFilters,
  resetFilters,
  setPage,
} from '../store/slices/productSlice';
import ProductTable from '../components/products/ProductTable';
import FilterPanel from '../components/products/FilterPanel';
import Loader from '../components/Loader';
import ConfirmationModal from '../components/ConfirmationModal';
import ExportButton from '../components/ExportButton';
import ImportModal from '../components/ImportModal';
import type { RootState, AppDispatch } from '../store';

export const ProductsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { products, pagination, filters, loading, error } = useSelector(
    (state: RootState) => state.product
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  const canWrite = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch, pagination.page, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setFilters({ search: searchQuery }));
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, dispatch]);

  const handleFilterChange = (newFilters: Record<string, string>) => {
    dispatch(setFilters(newFilters));
  };

  const handleFilterReset = () => {
    setSearchQuery('');
    dispatch(resetFilters());
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await dispatch(deleteProduct(deleteId));
      setDeleteId(null);
      dispatch(fetchProducts());
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (currentStatus) {
      await dispatch(deactivateProduct(id));
    } else {
      await dispatch(activateProduct(id));
    }
    dispatch(fetchProducts());
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Products Catalog
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage product inventory items, SKUs, category classifications, and pricing structures.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportButton module="products" />
          {canWrite && (
            <>
              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--surface-card)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4 text-teal-600" /> Import
              </button>
              <button
                onClick={() => navigate('/dashboard/products/new')}
                className="btn-primary-action flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </>
          )}
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative flex items-center bg-[var(--surface-card)] p-2.5 rounded-xl border border-[var(--border)]">
        <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Product Name, SKU code, brand, or catalog code..."
          className="w-full text-sm pl-10 pr-12 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none border-0"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium"
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
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" /> {error}
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
            <div className="text-center py-16 border border-dashed border-[var(--border)] bg-[var(--surface-card)] rounded-xl flex flex-col items-center">
              <Package className="w-12 h-12 text-[var(--text-muted)] mb-3" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">No products matching filters found</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">Try adjusting your search queries or resetting all filtering metrics.</p>
              {canWrite && (
                <button
                  onClick={() => navigate('/dashboard/products/new')}
                  className="mt-4 px-4 py-2 border border-[var(--teal-primary)] text-[var(--teal-text)] text-xs font-semibold rounded-lg hover:bg-teal-50 transition"
                >
                  Create Product
                </button>
              )}
            </div>
          )
        )}
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        module="products"
        moduleTitle="Products"
        onSuccess={() => dispatch(fetchProducts())}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteId)}
        title="Delete Product Listing"
        message="Are you sure you want to permanently delete this product? This action cannot be undone."
        confirmText="Delete Product"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default ProductsPage;
