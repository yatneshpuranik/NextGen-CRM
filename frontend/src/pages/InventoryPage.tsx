import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  BarChart3,
  AlertTriangle,
  Eye,
  Plus,
  Minus,
  Wrench,
  HeartCrack,
  RotateCcw,
  X
} from 'lucide-react';
import ExportButton from '../components/ExportButton';
import ImportModal from '../components/ImportModal';
import {
  fetchInventory,
  setFilters,
  resetFilters,
  setPage,
  stockIn,
  stockOut,
  adjustStock,
  markDamage,
  returnStock
} from '../store/slices/inventorySlice';
import type { RootState } from '../store';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

export const InventoryPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { inventoryList, loading, pagination, filters } = useSelector((state: RootState) => state.inventory);
  const { user } = useSelector((state: RootState) => state.auth);

  // Modal forms states
  const [activeModal, setActiveModal] = useState<'in' | 'out' | 'adjust' | 'damage' | 'return' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Form input states
  const [quantity, setQuantity] = useState<number>(0);
  const [reference, setReference] = useState('');
  const [remarks, setRemarks] = useState('');
  const [returnToType, setReturnToType] = useState<'AVAILABLE' | 'DAMAGED'>('AVAILABLE');

  const [modalLoading, setModalLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [showImportModal, setShowImportModal] = useState(false);

  // Read only role check
  const isReadOnly = user?.role === 'SALES' || user?.role === 'ACCOUNTS';
  const canWrite = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  useEffect(() => {
    dispatch(fetchInventory() as any);
  }, [dispatch, pagination.page, pagination.limit, filters.search, filters.category, filters.brand, filters.lowStock, filters.outOfStock, filters.damaged, filters.warehouse, filters.sortBy, filters.sortOrder]);

  const handleFilterChange = (field: string, value: string) => {
    dispatch(setFilters({ [field]: value }));
  };

  const handleClearFilters = () => {
    dispatch(resetFilters());
  };

  const openTransactionModal = (type: 'in' | 'out' | 'adjust' | 'damage' | 'return', productInv: any) => {
    if (isReadOnly) return;
    setSelectedProduct(productInv);
    setQuantity(0);
    setReference('');
    setRemarks('');
    setReturnToType('AVAILABLE');
    setValidationErrors({});
    setActiveModal(type);
  };

  const closeTransactionModal = () => {
    setActiveModal(null);
    setSelectedProduct(null);
    setQuantity(0);
    setReference('');
    setRemarks('');
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || isReadOnly) return;

    const errors: { [key: string]: string } = {};
    if (activeModal !== 'adjust' && quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }
    if (activeModal === 'adjust' && quantity < 0) {
      errors.quantity = 'Quantity cannot be negative';
    }
    if ((activeModal === 'out' || activeModal === 'damage') && quantity > selectedProduct.availableStock) {
      errors.quantity = `Quantity exceeds available stock level (${selectedProduct.availableStock})`;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setModalLoading(true);
    setValidationErrors({});

    try {
      const payload: any = {
        productId: selectedProduct.productId,
        quantity,
        remarks,
        reference
      };

      if (activeModal === 'in') {
        await dispatch(stockIn(payload) as any).unwrap();
        setToast({ message: `Successfully checked in ${quantity} units of ${selectedProduct.product.productName}`, type: 'success' });
      } else if (activeModal === 'out') {
        await dispatch(stockOut(payload) as any).unwrap();
        setToast({ message: `Successfully dispatched ${quantity} units of ${selectedProduct.product.productName}`, type: 'success' });
      } else if (activeModal === 'adjust') {
        await dispatch(adjustStock({ productId: selectedProduct.productId, quantity, remarks }) as any).unwrap();
        setToast({ message: `Successfully adjusted stock of ${selectedProduct.product.productName} to ${quantity}`, type: 'success' });
      } else if (activeModal === 'damage') {
        await dispatch(markDamage(payload) as any).unwrap();
        setToast({ message: `Successfully marked ${quantity} units of ${selectedProduct.product.productName} as damaged`, type: 'success' });
      } else if (activeModal === 'return') {
        await dispatch(returnStock({ ...payload, returnToType }) as any).unwrap();
        setToast({ message: `Successfully recorded return of ${quantity} units of ${selectedProduct.product.productName} (${returnToType})`, type: 'success' });
      }

      closeTransactionModal();
      // Reload inventory list
      dispatch(fetchInventory() as any);
    } catch (err: any) {
      setToast({ message: err || 'Failed to submit transaction.', type: 'error' });
    } finally {
      setModalLoading(false);
    }
  };

  const getStockStatusBadge = (item: any) => {
    if (item.availableStock === 0) {
      return <span className="status-badge cancelled">Out of Stock</span>;
    }
    if (item.availableStock <= item.minimumStock) {
      return <span className="status-badge low-stock">Low Stock</span>;
    }
    return <span className="status-badge confirmed">In Stock</span>;
  };

  // Get unique categories and brands from list for filters (fallback standard ones if list is empty)
  const categories = Array.from(new Set(inventoryList.map(item => item.product.category))).filter(Boolean);
  const brands = Array.from(new Set(inventoryList.map(item => item.product.brand))).filter(Boolean);

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
          <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)]">Inventory & Stock Manager</h2>
          <p className="text-sm text-[var(--text-secondary)]">Single source of truth for tracking, managing, and auditing inventory levels.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ExportButton module="inventory" />
          {canWrite && (
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--surface-card)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4 text-teal-600" /> Stock Intake
            </button>
          )}
          <Link
            to="/dashboard/inventory/dashboard"
            className="btn-primary-action flex items-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4" /> Analytics Dashboard
          </Link>
          <Link
            to="/dashboard/inventory/low-stock"
            className="btn-primary-action bg-white border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Report
          </Link>
        </div>
      </div>

      {/* Filter Options Card */}
      <div className="content-card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search bar */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Search Products</label>
            <input
              type="text"
              placeholder="Search Name, SKU, Code..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-card)]"
            />
          </div>

          {/* Category dropdown */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Filter Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-card)]"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Brand dropdown */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Filter Brand</label>
            <select
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-card)]"
            >
              <option value="">All Brands</option>
              {brands.map((brnd) => (
                <option key={brnd} value={brnd}>{brnd}</option>
              ))}
            </select>
          </div>

          {/* Stock Level Alert Filter */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Stock Status Filter</label>
            <select
              value={filters.lowStock === 'true' ? 'low' : filters.outOfStock === 'true' ? 'out' : filters.damaged === 'true' ? 'damaged' : ''}
              onChange={(e) => {
                const val = e.target.value;
                dispatch(setFilters({
                  lowStock: val === 'low' ? 'true' : '',
                  outOfStock: val === 'out' ? 'true' : '',
                  damaged: val === 'damaged' ? 'true' : ''
                }));
              }}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-card)]"
            >
              <option value="">All Stock Levels</option>
              <option value="low">⚠️ Low Stock Alerts</option>
              <option value="out">🚫 Out of Stock</option>
              <option value="damaged">💔 Damaged Items Only</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-[var(--border)] pt-3">
          <div className="flex items-center gap-4 text-sm">
            {/* Sort field */}
            <div>
              <span className="text-xs text-[var(--text-muted)] mr-1">Sort by:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-2 py-1 border border-none rounded-lg text-xs bg-[var(--surface-hover)] font-medium"
              >
                <option value="productName">Product Name</option>
                <option value="currentStock">Current Stock</option>
                <option value="updatedAt">Last Updated</option>
              </select>
            </div>
            {/* Sort order */}
            <div>
              <span className="text-xs text-[var(--text-muted)] mr-1">Order:</span>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                className="px-2 py-1 border border-none rounded-lg text-xs bg-[var(--surface-hover)] font-medium"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleClearFilters}
            className="text-xs font-semibold text-[var(--text-secondary)] hover:underline flex items-center gap-1"
          >
            🔄 Reset Filters
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="content-card">
        {loading && inventoryList.length === 0 ? (
          <Loader />
        ) : inventoryList && inventoryList.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-xs font-semibold">
                    <th className="pb-3 pr-4">Code / SKU</th>
                    <th className="pb-3 pr-4">Product details</th>
                    <th className="pb-3 pr-4 text-center">Available</th>
                    <th className="pb-3 pr-4 text-center">Reserved</th>
                    <th className="pb-3 pr-4 text-center">Damaged</th>
                    <th className="pb-3 pr-4 text-center">Status</th>
                    <th className="pb-3 pr-4">Location</th>
                    <th className="pb-3 text-right">Stock Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryList.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="py-4 pr-4">
                        <div className="font-mono text-xs text-[var(--text-primary)]">{item.product.productCode}</div>
                        <div className="text-xs text-[var(--text-muted)]">{item.product.sku}</div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="font-medium text-[var(--text-primary)]">{item.product.productName}</div>
                        <div className="text-xs text-[var(--text-muted)]">{item.product.category} | {item.product.brand}</div>
                      </td>
                      <td className="py-4 pr-4 text-center font-semibold text-[var(--text-primary)]">
                        {item.availableStock} <span className="text-[10px] text-[var(--text-muted)] font-normal">{item.product.unit}</span>
                      </td>
                      <td className="py-4 pr-4 text-center text-[var(--text-secondary)]">
                        {item.reservedStock}
                      </td>
                      <td className="py-4 pr-4 text-center text-[var(--text-secondary)]">
                        {item.damagedStock > 0 ? (
                          <span className="status-badge low-stock font-semibold">{item.damagedStock}</span>
                        ) : (
                          <span>0</span>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-center">
                        {getStockStatusBadge(item)}
                      </td>
                      <td className="py-4 pr-4 text-[var(--text-secondary)]">
                        {item.warehouseLocation || <span className="text-[var(--text-muted)] italic">Not set</span>}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/dashboard/inventory/${item.productId}`)}
                            title="View activity timeline"
                            className="p-1.5 text-xs border border-[var(--border)] rounded hover:bg-[var(--surface-hover)] transition"
                          >
                            <Eye className="w-3.5 h-3.5 text-teal-600" />
                          </button>

                          {!isReadOnly && (
                            <>
                              <button
                                onClick={() => openTransactionModal('in', item)}
                                title="Stock In Intake"
                                className="px-2 py-1 text-xs bg-[var(--teal-bg)] border border-[var(--teal-border)] text-[var(--teal-text)] rounded hover:bg-[var(--surface-hover)] transition font-medium flex items-center gap-0.5"
                              >
                                <Plus className="w-3 h-3" /> In
                              </button>
                              <button
                                onClick={() => openTransactionModal('out', item)}
                                disabled={item.availableStock <= 0}
                                title="Stock Out Dispatch"
                                className="px-2 py-1 text-xs bg-[var(--red-bg)] border border-[var(--red-icon)] text-[var(--red-text)] rounded hover:bg-[var(--surface-hover)] transition disabled:opacity-40 disabled:cursor-not-allowed font-medium flex items-center gap-0.5"
                              >
                                <Minus className="w-3 h-3" /> Out
                              </button>
                              <button
                                onClick={() => openTransactionModal('adjust', item)}
                                title="Adjust Stock Level"
                                className="p-1.5 text-xs bg-[var(--amber-bg)] border border-[var(--amber-icon)] text-[var(--amber-text)] rounded hover:bg-[var(--surface-hover)] transition font-medium"
                              >
                                <Wrench className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openTransactionModal('damage', item)}
                                disabled={item.availableStock <= 0}
                                title="Mark Damaged Stock"
                                className="p-1.5 text-xs bg-[var(--red-bg)] border border-[var(--red-icon)] text-[var(--red-text)] rounded hover:bg-[var(--surface-hover)] transition disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                              >
                                <HeartCrack className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openTransactionModal('return', item)}
                                title="Record Returned Stock"
                                className="p-1.5 text-xs bg-[var(--purple-bg)] border border-[var(--purple-icon)] text-[var(--purple-text)] rounded hover:bg-[var(--surface-hover)] transition font-medium"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
            {loading ? <Loader /> : 'No products or stock levels found in database.'}
          </div>
        )}
      </div>

      {/* Transaction Modal (Universal Overlay Modal dialog) */}
      {activeModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="content-card w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                {activeModal === 'in' && <><Plus className="w-4 h-4 text-emerald-500" /> Stock Intake (Stock In)</>}
                {activeModal === 'out' && <><Minus className="w-4 h-4 text-red-500" /> Stock Dispatch (Stock Out)</>}
                {activeModal === 'adjust' && <><Wrench className="w-4 h-4 text-amber-500" /> Stock Adjustment Audit</>}
                {activeModal === 'damage' && <><HeartCrack className="w-4 h-4 text-red-500" /> Record Damaged Inventory</>}
                {activeModal === 'return' && <><RotateCcw className="w-4 h-4 text-purple-500" /> Record Stock Return</>}
              </h3>
              <button
                type="button"
                onClick={closeTransactionModal}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-[var(--text-secondary)] bg-[var(--surface-hover)] p-3 rounded-lg border border-[var(--border)]">
              <div>Product: <span className="font-semibold text-[var(--text-primary)]">{selectedProduct.product.productName}</span></div>
              <div>SKU: <span className="font-mono">{selectedProduct.product.sku}</span></div>
              <div>Current Available: <span className="font-semibold text-[var(--text-primary)]">{selectedProduct.availableStock}</span></div>
            </div>

            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div className="space-y-3">
                {/* Quantity Input */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    {activeModal === 'adjust' ? 'New Available Stock Level' : 'Quantity to Move'}
                  </label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-card)]"
                  />
                  {validationErrors.quantity && (
                    <span className="text-xs text-[var(--red-icon)] mt-1 block">{validationErrors.quantity}</span>
                  )}
                </div>

                {/* Return pool select (Return only) */}
                {activeModal === 'return' && (
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Deposit Into</label>
                    <select
                      value={returnToType}
                      onChange={(e) => setReturnToType(e.target.value as 'AVAILABLE' | 'DAMAGED')}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-card)]"
                    >
                      <option value="AVAILABLE">Available Pool (Good stock)</option>
                      <option value="DAMAGED">Damaged Pool (Unusable/Quarantined)</option>
                    </select>
                  </div>
                )}

                {/* Reference Input (Non-adjust only) */}
                {activeModal !== 'adjust' && (
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Reference Code (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Challan #, PO #, Bill #"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-card)]"
                    />
                  </div>
                )}

                {/* Remarks Input */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Remarks</label>
                  <textarea
                    rows={2}
                    placeholder="Enter operation details or audit notes..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-card)]"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={closeTransactionModal}
                  className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 bg-[var(--teal-bg)] border border-[var(--teal-border)] text-[var(--teal-text)] rounded-lg text-sm font-medium hover:bg-[var(--surface-hover)] disabled:opacity-50"
                >
                  {modalLoading ? 'Processing...' : 'Submit Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        module="inventory"
        moduleTitle="Inventory Stock"
        onSuccess={() => dispatch(fetchInventory() as any)}
      />
    </div>
  );
};

export default InventoryPage;
