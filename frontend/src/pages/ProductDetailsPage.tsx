import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2, Package, AlertTriangle } from 'lucide-react';
import type { AppDispatch, RootState } from '../store';
import {
  fetchProductById,
  deleteProduct,
  activateProduct,
  deactivateProduct,
  clearSingleProduct,
} from '../store/slices/productSlice';
import { ConfirmationModal } from '../components/ConfirmationModal';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user } = useSelector((state: RootState) => state.auth);
  const { singleProduct, loading, error } = useSelector((state: RootState) => state.product);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
    return () => {
      dispatch(clearSingleProduct());
    };
  }, [id, dispatch]);

  const handleConfirmStatusToggle = async () => {
    if (!singleProduct) return;
    try {
      if (singleProduct.isActive) {
        await dispatch(deactivateProduct(singleProduct.id)).unwrap();
        setToast({ message: 'Product profile deactivated successfully', type: 'info' });
      } else {
        await dispatch(activateProduct(singleProduct.id)).unwrap();
        setToast({ message: 'Product profile activated successfully', type: 'success' });
      }
    } catch (err: any) {
      setToast({ message: err || 'Failed to toggle product status', type: 'error' });
    } finally {
      setStatusModal(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!singleProduct) return;
    try {
      await dispatch(deleteProduct(singleProduct.id)).unwrap();
      setToast({ message: 'Product profile deleted successfully', type: 'success' });
      setTimeout(() => navigate('/dashboard/products'), 1000);
    } catch (err: any) {
      setToast({ message: err || 'Failed to delete product profile', type: 'error' });
    } finally {
      setDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="content-card py-20 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !singleProduct) {
    return (
      <div className="content-card py-16 text-center space-y-4">
        <p className="text-[var(--red-icon)] font-medium flex items-center justify-center gap-1.5"><AlertTriangle className="w-5 h-5 text-red-500" /> Error loading product records</p>
        <p className="text-sm text-[var(--text-secondary)]">{error || 'Product profile not found.'}</p>
        <button
          type="button"
          onClick={() => navigate('/dashboard/products')}
          className="btn-primary-action text-xs"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  const canEdit = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';
  const canDelete = user?.role === 'ADMIN';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Dashboard</span>
            <span>/</span>
            <span className="cursor-pointer hover:text-[var(--text-primary)]" onClick={() => navigate('/dashboard/products')}>
              Products
            </span>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">{singleProduct.productName}</span>
          </div>
          <h2 className="text-xl font-medium tracking-tight text-[var(--text-primary)] flex items-center gap-3">
            {singleProduct.productName}
            <span className={`status-badge ${singleProduct.isActive ? 'confirmed' : 'cancelled'}`}>
              {singleProduct.isActive ? 'Active' : 'Inactive'}
            </span>
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5 font-mono">
            ID Code: {singleProduct.productCode}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard/products')}
            className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition"
          >
            Directory List
          </button>
          
          {canEdit && (
            <>
              <button
                type="button"
                onClick={() => navigate(`/dashboard/products/${singleProduct.id}/edit`)}
                className="px-4 py-2 border border-[var(--teal-border)] bg-[var(--teal-bg)] text-[var(--teal-text-strong)] rounded-lg text-sm font-medium hover:bg-[var(--surface-hover)] transition flex items-center gap-2"
              >
                <Pencil className="w-4 h-4 text-amber-500" /> Edit Specs
              </button>
              <button
                type="button"
                onClick={() => setStatusModal(true)}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition ${
                  singleProduct.isActive
                    ? 'border-[var(--amber-icon)] text-[var(--amber-text-strong)] bg-[var(--amber-bg)]'
                    : 'border-[var(--teal-border)] text-[var(--teal-text-strong)] bg-[var(--teal-bg)]'
                }`}
              >
                {singleProduct.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => setDeleteModal(true)}
              className="px-4 py-2 border border-[var(--red-icon)] bg-[var(--red-bg)] text-[var(--red-text-strong)] rounded-lg text-sm font-medium hover:bg-[var(--surface-hover)] transition flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4 text-red-500" /> Archive
            </button>
          )}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Product Details */}
        <div className="content-card md:col-span-2 space-y-6">
          <h3 className="text-base font-medium text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
            Specifications & Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Product Name
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)] mt-1">
                {singleProduct.productName}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                SKU Code
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)] mt-1 font-mono">
                {singleProduct.sku}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Category
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)] mt-1">
                {singleProduct.category}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Brand
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)] mt-1">
                {singleProduct.brand}
              </p>
            </div>

            {singleProduct.barcode && (
              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Barcode (UPC/EAN)
                </p>
                <p className="text-sm font-medium text-[var(--text-primary)] mt-1 font-mono">
                  {singleProduct.barcode}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Measurement Unit
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)] mt-1">
                {singleProduct.unit}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Catalog Created
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)] mt-1">
                {new Date(singleProduct.createdAt).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {singleProduct.description && (
            <div className="pt-4 border-t border-[var(--border)]">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Item Description
              </p>
              <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed whitespace-pre-line bg-[var(--surface-page)] p-3 rounded-lg border border-[var(--border)] font-sans">
                {singleProduct.description}
              </p>
            </div>
          )}
        </div>

        {/* Pricing, Stocks & Image Panel */}
        <div className="space-y-6">
          {/* Image Box */}
          <div className="content-card flex flex-col items-center justify-center text-center p-6 min-h-[200px]">
            {singleProduct.imageUrl ? (
              <img
                src={singleProduct.imageUrl}
                alt={singleProduct.productName}
                className="w-full h-auto rounded-lg object-cover border border-[var(--border)] max-h-48 shadow-sm"
              />
            ) : (
              <div className="space-y-2 flex flex-col items-center">
                <Package className="w-12 h-12 text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-secondary)] font-medium">No Image Uploaded</span>
              </div>
            )}
          </div>

          {/* Metrics Box */}
          <div className="content-card space-y-4">
            <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] pb-1.5">
              Financials & Stock Levels
            </h4>
            
            <div className="space-y-3.5">
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Purchase Price</p>
                <p className="text-base font-mono font-bold text-[var(--text-primary)] mt-0.5">
                  ₹{Number(singleProduct.purchasePrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Selling Price</p>
                <p className="text-lg font-mono font-bold text-[var(--teal-text)] mt-0.5">
                  ₹{Number(singleProduct.sellingPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">GST Tax Class</p>
                <p className="text-sm font-mono font-medium text-[var(--text-secondary)] mt-0.5">
                  {singleProduct.gstPercentage}% GST Taxable
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--border)] grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Current Stock</p>
                  <p className={`text-base font-mono font-bold mt-0.5 ${singleProduct.currentStock <= singleProduct.minimumStock ? 'text-[var(--status-cancelled)]' : 'text-[var(--text-primary)]'}`}>
                    {singleProduct.currentStock} {singleProduct.unit}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Min Threshold</p>
                  <p className="text-base font-mono font-medium text-[var(--text-secondary)] mt-0.5">
                    {singleProduct.minimumStock} {singleProduct.unit}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={deleteModal}
        title="Confirm Archiving Product"
        message="Are you sure you want to archive/delete this product profile? This will hide the profile from catalog listings and search lists. This action is restricted to Administrators."
        confirmText="Archive Product"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal(false)}
      />

      <ConfirmationModal
        isOpen={statusModal}
        title={singleProduct.isActive ? 'Deactivate Product' : 'Activate Product'}
        message={`Are you sure you want to ${
          singleProduct.isActive ? 'deactivate' : 'activate'
        } this product? Deactivated items cannot be added to new challans.`}
        confirmText={singleProduct.isActive ? 'Deactivate' : 'Activate'}
        type={singleProduct.isActive ? 'warning' : 'info'}
        onConfirm={handleConfirmStatusToggle}
        onCancel={() => setStatusModal(false)}
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

export default ProductDetailsPage;
