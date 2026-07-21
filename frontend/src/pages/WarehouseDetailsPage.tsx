import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, User, ArrowLeft, Pencil, Package, FileText } from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { fetchWarehouseDetails, fetchWarehouseStock, fetchWarehouseHistory } from '../store/slices/warehouseSlice';
import Loader from '../components/Loader';

export const WarehouseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentWarehouse, warehouseStock, warehouseHistory, historyPagination, loading } = useSelector((state: RootState) => state.warehouse);

  const [activeTab, setActiveTab] = useState<'STOCK' | 'HISTORY'>('STOCK');

  useEffect(() => {
    if (id) {
      dispatch(fetchWarehouseDetails(id));
      dispatch(fetchWarehouseStock(id));
      dispatch(fetchWarehouseHistory({ id }));
    }
  }, [dispatch, id]);

  if (loading || !currentWarehouse) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[var(--teal-bg)] text-[var(--teal-text)] rounded-md font-mono text-xs font-bold">
              {currentWarehouse.code}
            </span>
            <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)]">{currentWarehouse.name}</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-center gap-2">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" /> {currentWarehouse.address}</span>
            <span>|</span>
            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Contact: {currentWarehouse.contactPerson} ({currentWarehouse.contactNumber})</span>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate('/dashboard/warehouses')}
            className="px-4 py-2 border rounded-lg text-xs font-medium hover:bg-[var(--surface-hover)] flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Warehouses
          </button>
          <button
            onClick={() => navigate(`/dashboard/warehouses/${id}/edit`)}
            className="px-4 py-2 bg-[var(--teal-bg)] border border-[var(--teal-border)] text-[var(--teal-text-strong)] font-semibold text-xs rounded-lg hover:bg-[var(--surface-hover)] flex items-center gap-1.5"
          >
            <Pencil className="w-4 h-4 text-amber-500" /> Edit Warehouse
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] gap-6">
        <button
          onClick={() => setActiveTab('STOCK')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 ${
            activeTab === 'STOCK' ? 'border-b-2 border-[var(--teal-icon)] text-[var(--teal-text-strong)]' : 'text-[var(--text-secondary)]'
          }`}
        >
          <Package className="w-4 h-4" /> Local Warehouse Stock ({warehouseStock.length})
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 ${
            activeTab === 'HISTORY' ? 'border-b-2 border-[var(--teal-icon)] text-[var(--teal-text-strong)]' : 'text-[var(--text-secondary)]'
          }`}
        >
          <FileText className="w-4 h-4" /> Transaction History ({historyPagination?.totalRecords || 0})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'STOCK' ? (
        <div className="content-card p-0 overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--surface-hover)] border-b text-[var(--text-secondary)]">
                <th className="p-3">SKU</th>
                <th className="p-3">Product Name</th>
                <th className="p-3 text-right">Available Stock</th>
                <th className="p-3 text-right">Reserved</th>
                <th className="p-3 text-right">Damaged</th>
                <th className="p-3 text-right">Min Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {warehouseStock.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">No inventory stocked at this location.</td>
                </tr>
              ) : (
                warehouseStock.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[var(--surface-hover)]">
                    <td className="p-3 font-mono font-bold text-[var(--teal-text-strong)]">{inv.product?.sku}</td>
                    <td className="p-3 font-medium text-[var(--text-primary)]">{inv.product?.productName}</td>
                    <td className="p-3 text-right font-bold text-[var(--text-primary)]">{inv.availableStock}</td>
                    <td className="p-3 text-right text-[var(--amber-icon)] font-semibold">{inv.reservedStock}</td>
                    <td className="p-3 text-right text-[var(--red-icon)] font-semibold">{inv.damagedStock}</td>
                    <td className="p-3 text-right text-[var(--text-muted)]">{inv.minimumStock}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="content-card p-0 overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--surface-hover)] border-b text-[var(--text-secondary)]">
                <th className="p-3">Date</th>
                <th className="p-3">Type</th>
                <th className="p-3">Product SKU</th>
                <th className="p-3 text-right">Quantity</th>
                <th className="p-3 text-right">Prev Stock</th>
                <th className="p-3 text-right">New Stock</th>
                <th className="p-3">Reference / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {warehouseHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">No stock transaction history logged for this warehouse.</td>
                </tr>
              ) : (
                warehouseHistory.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[var(--surface-hover)]">
                    <td className="p-3 text-[var(--text-secondary)]">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.transactionType === 'STOCK_IN' ? 'bg-[var(--teal-bg)] text-[var(--teal-text)]' : 'bg-[var(--red-bg)] text-[var(--red-text)]'
                      }`}>
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-[var(--text-primary)]">{tx.product?.sku}</td>
                    <td className="p-3 text-right font-bold">{tx.quantity}</td>
                    <td className="p-3 text-right text-[var(--text-muted)]">{tx.previousStock}</td>
                    <td className="p-3 text-right font-semibold text-[var(--teal-text-strong)]">{tx.newStock}</td>
                    <td className="p-3 text-[var(--text-secondary)]">{tx.reference} - {tx.remarks}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WarehouseDetailsPage;
