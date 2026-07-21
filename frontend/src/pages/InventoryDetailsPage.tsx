import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  fetchInventoryByProductId, 
  updateInventorySettings, 
  fetchTransactionHistory, 
  clearSingleInventory 
} from '../store/slices/inventorySlice';
import type { RootState } from '../store';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

export const InventoryDetailsPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const { singleInventory, transactions, loading, error } = useSelector((state: RootState) => state.inventory);
  const { user } = useSelector((state: RootState) => state.auth);

  // Settings form states
  const [minimumStock, setMinimumStock] = useState(0);
  const [maximumStock, setMaximumStock] = useState(9999);
  const [reorderLevel, setReorderLevel] = useState(0);
  const [warehouseLocation, setWarehouseLocation] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Read only role check
  const isReadOnly = user?.role === 'SALES' || user?.role === 'ACCOUNTS';

  useEffect(() => {
    if (productId) {
      dispatch(fetchInventoryByProductId(productId) as any);
      dispatch(fetchTransactionHistory({ productId, page: 1, limit: 20 }) as any);
    }
    return () => {
      dispatch(clearSingleInventory());
    };
  }, [dispatch, productId]);

  // Sync form state when inventory is loaded
  useEffect(() => {
    if (singleInventory) {
      setMinimumStock(singleInventory.minimumStock);
      setMaximumStock(singleInventory.maximumStock);
      setReorderLevel(singleInventory.reorderLevel);
      setWarehouseLocation(singleInventory.warehouseLocation || '');
    }
  }, [singleInventory]);

  if (loading && !singleInventory) {
    return <Loader />;
  }

  if (!singleInventory) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-[var(--text-secondary)]">Inventory profile not found.</p>
        <Link to="/dashboard/inventory" className="btn-primary-action">
          Return to Inventory List
        </Link>
      </div>
    );
  }

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    const errors: { [key: string]: string } = {};
    if (minimumStock < 0) errors.minimumStock = 'Minimum stock must be >= 0';
    if (maximumStock < minimumStock) errors.maximumStock = 'Maximum stock must be greater than or equal to minimum stock';
    if (reorderLevel < 0) errors.reorderLevel = 'Reorder level must be >= 0';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setFormLoading(true);
    setValidationErrors({});

    try {
      await dispatch(updateInventorySettings({
        productId: productId!,
        data: {
          minimumStock,
          maximumStock,
          reorderLevel,
          warehouseLocation
        }
      }) as any).unwrap();

      setToast({ message: 'Inventory configuration levels updated successfully.', type: 'success' });
      setIsEditing(false);
      // Reload inventory details
      dispatch(fetchInventoryByProductId(productId!) as any);
    } catch (err: any) {
      setToast({ message: err || 'Failed to update configurations.', type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'STOCK_IN':
        return 'border-[var(--teal-border)] bg-[var(--teal-bg)] text-[var(--teal-text-strong)]';
      case 'STOCK_OUT':
        return 'border-[var(--red-icon)] bg-[var(--red-bg)] text-[var(--red-text-strong)]';
      case 'ADJUSTMENT':
        return 'border-[var(--amber-icon)] bg-[var(--amber-bg)] text-[var(--amber-text-strong)]';
      case 'DAMAGE':
        return 'border-[var(--red-icon)] bg-[var(--red-bg)] text-[var(--red-text-strong)]';
      case 'RETURN':
        return 'border-[var(--purple-icon)] bg-[var(--purple-bg)] text-[var(--purple-text-strong)]';
      default:
        return 'border-[var(--border)] bg-[var(--surface-hover)]';
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] mb-1">
            <Link to="/dashboard/inventory" className="hover:underline">Inventory List</Link>
            <span>/</span>
            <span>Product Details</span>
          </div>
          <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)]">
            {singleInventory.product.productName}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            SKU: <span className="font-mono">{singleInventory.product.sku}</span> | Code: <span className="font-mono">{singleInventory.product.productCode}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate('/dashboard/inventory')}
            className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition"
          >
            Back to List
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[var(--red-bg)] border border-[var(--red-icon)] rounded-xl text-[var(--red-text-strong)] text-sm">
          {error}
        </div>
      )}

      {/* Grid: Stock Levels & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Stock Levels */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card purple">
              <span className="stat-icon text-xl">✅</span>
              <span className="stat-number">{singleInventory.availableStock}</span>
              <span className="stat-label">Available Stock</span>
            </div>

            <div className="stat-card teal">
              <span className="stat-icon text-xl">🔒</span>
              <span className="stat-number">{singleInventory.reservedStock}</span>
              <span className="stat-label">Reserved Stock</span>
            </div>

            <div className="stat-card amber">
              <span className="stat-icon text-xl">💔</span>
              <span className="stat-number">{singleInventory.damagedStock}</span>
              <span className="stat-label">Damaged Stock</span>
            </div>
          </div>

          {/* Product Basic Info Card */}
          <div className="content-card space-y-4">
            <h3 className="text-base font-medium text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
              Catalog Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-[var(--text-muted)] text-xs">Category</div>
                <div className="font-medium">{singleInventory.product.category}</div>
              </div>
              <div>
                <div className="text-[var(--text-muted)] text-xs">Brand</div>
                <div className="font-medium">{singleInventory.product.brand}</div>
              </div>
              <div>
                <div className="text-[var(--text-muted)] text-xs">Pricing (Cost / Sell)</div>
                <div className="font-medium">
                  ₹{Number(singleInventory.product.purchasePrice).toFixed(2)} / ₹{Number(singleInventory.product.sellingPrice).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[var(--text-muted)] text-xs">Measurement Unit</div>
                <div className="font-medium">{singleInventory.product.unit}</div>
              </div>
            </div>
          </div>

          {/* Transaction Timeline */}
          <div className="content-card space-y-4">
            <h3 className="text-base font-medium text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
              Stock Movement Log ({transactions.length} entries)
            </h3>

            {transactions && transactions.length > 0 ? (
              <div className="relative pl-6 border-l border-[var(--border)] space-y-6">
                {transactions.map((tx) => (
                  <div key={tx.id} className="relative space-y-1">
                    {/* Circle Node */}
                    <span className="absolute -left-[30px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border bg-[var(--surface-card)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)]" />
                    </span>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 border rounded-full ${getTransactionTypeColor(tx.transactionType)}`}>
                          {tx.transactionType.replace('_', ' ')}
                        </span>
                        <span className="font-semibold text-sm text-[var(--text-primary)]">
                          {tx.transactionType === 'STOCK_OUT' || tx.transactionType === 'DAMAGE' ? '-' : '+'}{Math.abs(tx.quantity)} units
                        </span>
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {new Date(tx.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)]">
                      Stock Level: {tx.previousStock} → <span className="font-semibold text-[var(--text-primary)]">{tx.newStock}</span>
                    </p>

                    {tx.remarks && (
                      <p className="text-xs italic text-[var(--text-muted)]">"{tx.remarks}"</p>
                    )}

                    <div className="text-[10px] text-[var(--text-muted)]">
                      Operator: {tx.createdByUser?.fullName} ({tx.createdByUser?.role})
                      {tx.reference && ` | Ref: ${tx.reference}`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)] py-4 text-center">No transactions recorded for this product.</p>
            )}
          </div>
        </div>

        {/* Right Col: Configuration Form */}
        <div className="content-card space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <h3 className="text-base font-medium text-[var(--text-primary)]">Settings & Limits</h3>
            {!isReadOnly && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-xs text-[var(--teal-icon)] hover:underline font-semibold"
              >
                Configure
              </button>
            )}
          </div>

          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Warehouse Location</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={warehouseLocation}
                  onChange={(e) => setWarehouseLocation(e.target.value)}
                  placeholder="e.g. Aisle 3, Bin B4"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-card)] disabled:opacity-75 disabled:bg-[var(--surface-hover)]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Safety Min</label>
                  <input
                    type="number"
                    disabled={!isEditing}
                    value={minimumStock}
                    onChange={(e) => setMinimumStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-card)] disabled:opacity-75 disabled:bg-[var(--surface-hover)]"
                  />
                  {validationErrors.minimumStock && (
                    <span className="text-[10px] text-[var(--red-icon)]">{validationErrors.minimumStock}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Reorder Pt</label>
                  <input
                    type="number"
                    disabled={!isEditing}
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-card)] disabled:opacity-75 disabled:bg-[var(--surface-hover)]"
                  />
                  {validationErrors.reorderLevel && (
                    <span className="text-[10px] text-[var(--red-icon)]">{validationErrors.reorderLevel}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Max Level</label>
                  <input
                    type="number"
                    disabled={!isEditing}
                    value={maximumStock}
                    onChange={(e) => setMaximumStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-card)] disabled:opacity-75 disabled:bg-[var(--surface-hover)]"
                  />
                  {validationErrors.maximumStock && (
                    <span className="text-[10px] text-[var(--red-icon)]">{validationErrors.maximumStock}</span>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2 justify-end pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset to model
                    if (singleInventory) {
                      setMinimumStock(singleInventory.minimumStock);
                      setMaximumStock(singleInventory.maximumStock);
                      setReorderLevel(singleInventory.reorderLevel);
                      setWarehouseLocation(singleInventory.warehouseLocation || '');
                    }
                  }}
                  className="px-3 py-1.5 border border-[var(--border)] rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-3 py-1.5 bg-[var(--teal-bg)] border border-[var(--teal-border)] text-[var(--teal-text)] rounded-lg text-xs font-medium hover:bg-[var(--surface-hover)]"
                >
                  {formLoading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetailsPage;
