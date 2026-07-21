import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchInventory, setFilters, resetFilters } from '../store/slices/inventorySlice';
import type { RootState } from '../store';
import Loader from '../components/Loader';

export const LowStockReportPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { inventoryList, loading, error, pagination } = useSelector((state: RootState) => state.inventory);

  useEffect(() => {
    // Reset filters and fetch with lowStock = 'true'
    dispatch(resetFilters());
    dispatch(setFilters({ lowStock: 'true' }));
    dispatch(fetchInventory() as any);
  }, [dispatch]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:p-0 print:bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <span>⚠️</span> Low Stock Alert Report
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">Products whose available stock levels have reached or dropped below their defined safety threshold.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="btn-primary-action bg-white border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
          >
            <span>🖨️</span> Print Report
          </button>
          <Link to="/dashboard/inventory" className="btn-primary-action">
            <span>🏭</span> Inventory Workspace
          </Link>
        </div>
      </div>

      {/* Printable Heading (Only visible during print) */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold text-black">NextGen ERP - Inventory Management</h1>
        <h2 className="text-lg text-gray-700">Low Stock & Safety Level Report</h2>
        <p className="text-xs text-gray-500 mt-1">Generated: {new Date().toLocaleString()}</p>
      </div>

      {error && (
        <div className="p-4 bg-[var(--red-bg)] border border-[var(--red-icon)] rounded-xl text-[var(--red-text-strong)] text-sm print:hidden">
          {error}
        </div>
      )}

      {/* Low Stock Table */}
      <div className="content-card print:border-none print:shadow-none print:p-0">
        {loading ? (
          <Loader />
        ) : inventoryList && inventoryList.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-xs font-semibold">
                    <th className="pb-3 pr-4">Product Code / SKU</th>
                    <th className="pb-3 pr-4">Product Name</th>
                    <th className="pb-3 pr-4">Category / Brand</th>
                    <th className="pb-3 pr-4 text-center">Available Stock</th>
                    <th className="pb-3 pr-4 text-center">Safety Minimum</th>
                    <th className="pb-3 pr-4 text-center">Reorder Level</th>
                    <th className="pb-3 pr-4">Warehouse Location</th>
                    <th className="pb-3 print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryList.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="py-4 pr-4">
                        <div className="font-mono text-xs">{item.product.productCode}</div>
                        <div className="text-xs text-[var(--text-muted)]">{item.product.sku}</div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="font-medium text-[var(--text-primary)]">{item.product.productName}</div>
                        <div className="text-xs text-[var(--text-muted)]">{item.product.unit}</div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="text-xs text-[var(--text-secondary)]">{item.product.category}</div>
                        <div className="text-xs text-[var(--text-muted)]">{item.product.brand}</div>
                      </td>
                      <td className="py-4 pr-4 text-center">
                        <span className={`status-badge low-stock font-bold`}>
                          {item.availableStock}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-center text-[var(--text-secondary)] font-medium">
                        {item.minimumStock}
                      </td>
                      <td className="py-4 pr-4 text-center text-[var(--text-secondary)]">
                        {item.reorderLevel}
                      </td>
                      <td className="py-4 pr-4 text-[var(--text-secondary)]">
                        {item.warehouseLocation || <span className="text-[var(--text-muted)]">N/A</span>}
                      </td>
                      <td className="py-4 print:hidden">
                        <button
                          onClick={() => navigate(`/dashboard/inventory/${item.productId}`)}
                          className="text-[var(--teal-icon)] hover:underline text-xs font-semibold"
                        >
                          View Activity
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 print:hidden">
              <span className="text-xs text-[var(--text-secondary)]">
                Showing page <span className="font-semibold">{pagination.page}</span> of{' '}
                <span className="font-semibold">{pagination.totalPages}</span> ({pagination.totalRecords} alerts)
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    dispatch(setFilters({ lowStock: 'true' }));
                    dispatch(fetchInventory() as any);
                  }}
                  disabled={pagination.page === 1}
                  className="px-3 py-1.5 border border-[var(--border)] rounded-lg text-xs font-medium hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    // Handled automatically by redux pagination
                  }}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1.5 border border-[var(--border)] rounded-lg text-xs font-medium hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--text-muted)] text-sm">
            🎉 Excellent! No products are currently below safety stock levels.
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStockReportPage;
