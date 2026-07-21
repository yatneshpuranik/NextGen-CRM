import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchTransactionHistory, setTransactionPage } from '../store/slices/inventorySlice';
import type { RootState } from '../store';
import Loader from '../components/Loader';

export const InventoryHistoryPage: React.FC = () => {
  const dispatch = useDispatch();
  const { transactions, loading, error, transactionPagination } = useSelector((state: RootState) => state.inventory);

  const [transactionType, setTransactionType] = useState('');
  const [productId, setProductId] = useState('');

  // Local fetch trigger
  const loadHistory = () => {
    dispatch(fetchTransactionHistory({
      transactionType: transactionType || undefined,
      productId: productId || undefined
    }) as any);
  };

  useEffect(() => {
    loadHistory();
  }, [dispatch, transactionPagination.page, transactionType, productId]);

  const handlePageChange = (newPage: number) => {
    dispatch(setTransactionPage(newPage));
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
          <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)]">Stock Audit Ledger</h2>
          <p className="text-sm text-[var(--text-secondary)]">Historical record of all inventory stock movements and adjustments.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/inventory" className="btn-primary-action">
            <span>🏭</span> Inventory Workspace
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[var(--red-bg)] border border-[var(--red-icon)] rounded-xl text-[var(--red-text-strong)] text-sm">
          {error}
        </div>
      )}

      {/* Filter Row */}
      <div className="content-card flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Filter by Type</label>
          <select
            value={transactionType}
            onChange={(e) => {
              setTransactionType(e.target.value);
              dispatch(setTransactionPage(1));
            }}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-card)]"
          >
            <option value="">All Transactions</option>
            <option value="STOCK_IN">STOCK_IN (Intake)</option>
            <option value="STOCK_OUT">STOCK_OUT (Dispatch)</option>
            <option value="ADJUSTMENT">ADJUSTMENT (Auditing)</option>
            <option value="DAMAGE">DAMAGE (Loss/Breakage)</option>
            <option value="RETURN">RETURN (Refunds/Re-stocks)</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Search Product UUID (Optional)</label>
          <input
            type="text"
            placeholder="e.g. d68a3f89..."
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              dispatch(setTransactionPage(1));
            }}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-card)]"
          />
        </div>

        <div className="flex items-end h-full">
          <button
            onClick={() => {
              setTransactionType('');
              setProductId('');
              dispatch(setTransactionPage(1));
            }}
            className="w-full md:w-auto px-4 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Log List */}
      <div className="content-card space-y-4">
        {loading ? (
          <Loader />
        ) : transactions && transactions.length > 0 ? (
          <div className="space-y-4">
            <div className="hidden md:grid grid-cols-6 text-xs font-semibold text-[var(--text-muted)] border-b border-[var(--border)] pb-2 px-3">
              <div>Date & Time</div>
              <div className="col-span-2">Product Details</div>
              <div>Movement Type</div>
              <div>Quantity & Stocks</div>
              <div>Operator & References</div>
            </div>

            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-4 p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors text-sm items-center"
              >
                {/* Date */}
                <div className="text-xs text-[var(--text-secondary)]">
                  {new Date(tx.createdAt).toLocaleString()}
                </div>

                {/* Product details */}
                <div className="col-span-2 space-y-0.5">
                  <div className="font-medium text-[var(--text-primary)]">
                    {tx.product?.productName}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">SKU: {tx.product?.sku}</div>
                </div>

                {/* Badge */}
                <div>
                  {getTransactionTypeBadge(tx.transactionType)}
                </div>

                {/* Quantity */}
                <div className="space-y-0.5">
                  <div className="font-semibold">
                    {tx.transactionType === 'STOCK_OUT' || tx.transactionType === 'DAMAGE' ? '-' : '+'}{Math.abs(tx.quantity)}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Prev: {tx.previousStock} → New: {tx.newStock}
                  </div>
                </div>

                {/* User/Remarks */}
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="font-medium text-[var(--text-secondary)]">{tx.createdByUser?.fullName}</span>{' '}
                    <span className="text-[var(--text-muted)]">({tx.createdByUser?.role})</span>
                  </div>
                  {tx.reference && (
                    <div className="text-[var(--text-muted)] font-mono">Ref: {tx.reference}</div>
                  )}
                  {tx.remarks && (
                    <div className="italic text-[var(--text-muted)]">"{tx.remarks}"</div>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
              <span className="text-xs text-[var(--text-secondary)]">
                Showing page <span className="font-semibold">{transactionPagination.page}</span> of{' '}
                <span className="font-semibold">{transactionPagination.totalPages}</span> ({transactionPagination.totalRecords} records)
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(transactionPagination.page - 1)}
                  disabled={transactionPagination.page === 1}
                  className="px-3 py-1.5 border border-[var(--border)] rounded-lg text-xs font-medium hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(transactionPagination.page + 1)}
                  disabled={transactionPagination.page === transactionPagination.totalPages}
                  className="px-3 py-1.5 border border-[var(--border)] rounded-lg text-xs font-medium hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--text-muted)] text-sm">
            No stock audit logs found matching the selected filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryHistoryPage;
