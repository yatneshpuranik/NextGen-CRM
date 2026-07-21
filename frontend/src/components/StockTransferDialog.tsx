import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchWarehouses, transferStock } from '../store/slices/warehouseSlice';
import { fetchProducts } from '../store/slices/productSlice';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const StockTransferDialog: React.FC<Props> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { warehouses } = useSelector((state: RootState) => state.warehouse);
  const { products } = useSelector((state: RootState) => state.product);

  const [sourceWarehouseId, setSourceWarehouseId] = useState('');
  const [destWarehouseId, setDestWarehouseId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchWarehouses({ limit: 100 }));
    dispatch(fetchProducts());
  }, [dispatch]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!sourceWarehouseId || !destWarehouseId || !productId) {
      setModalError('Please select source warehouse, destination warehouse, and target product.');
      return;
    }
    if (sourceWarehouseId === destWarehouseId) {
      setModalError('Source and Destination warehouses cannot be identical.');
      return;
    }
    if (quantity <= 0) {
      setModalError('Transfer quantity must be greater than zero.');
      return;
    }

    try {
      setSubmitting(true);
      await dispatch(transferStock({
        sourceWarehouseId,
        destWarehouseId,
        productId,
        quantity,
        remarks
      })).unwrap();

      onClose();
    } catch (err: any) {
      setModalError(err || 'Failed to complete stock transfer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--surface-card)] rounded-xl shadow-xl border max-w-lg w-full p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-medium text-[var(--text-primary)]">🔄 Stock Transfer Request</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
        </div>

        {modalError && (
          <div className="p-3 bg-[var(--red-bg)] text-[var(--red-text)] rounded-lg text-xs font-semibold">
            {modalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Source Warehouse</label>
            <select
              value={sourceWarehouseId}
              onChange={(e) => setSourceWarehouseId(e.target.value)}
              className="w-full border rounded-lg p-2.5 bg-[var(--surface-card)]"
              required
            >
              <option value="">-- Select Source --</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Destination Warehouse</label>
            <select
              value={destWarehouseId}
              onChange={(e) => setDestWarehouseId(e.target.value)}
              className="w-full border rounded-lg p-2.5 bg-[var(--surface-card)]"
              required
            >
              <option value="">-- Select Destination --</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full border rounded-lg p-2.5 bg-[var(--surface-card)]"
              required
            >
              <option value="">-- Select Product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.sku} - {p.productName} (Global Stock: {p.currentStock})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Transfer Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border rounded-lg p-2.5 bg-[var(--surface-card)]"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Remarks / Notes</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Inter-branch stock rebalancing"
              className="w-full border rounded-lg p-2.5 bg-[var(--surface-card)]"
              rows={2}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-xs font-medium hover:bg-[var(--surface-hover)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[var(--teal-bg)] border border-[var(--teal-border)] text-[var(--teal-text-strong)] font-semibold rounded-lg hover:bg-[var(--surface-hover)]"
            >
              {submitting ? 'Processing...' : 'Execute Stock Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockTransferDialog;
