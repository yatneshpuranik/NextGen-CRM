import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Plus, Warehouse, Boxes, RefreshCw, Search, MapPin, User, Pencil, Eye } from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { fetchWarehouses, fetchWarehouseDashboardSummary } from '../store/slices/warehouseSlice';
import Loader from '../components/Loader';
import StockTransferDialog from '../components/StockTransferDialog';

export const WarehouseListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { warehouses, dashboardSummary, loading, error } = useSelector((state: RootState) => state.warehouse);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);

  useEffect(() => {
    dispatch(fetchWarehouses({ search, status }));
    dispatch(fetchWarehouseDashboardSummary());
  }, [dispatch, search, status]);

  const warehouseList = Array.isArray(warehouses) ? warehouses : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)]">Warehouse Management</h2>
          <p className="text-sm text-[var(--text-secondary)]">Manage multi-location inventory hubs, physical stock allocations, and inter-warehouse transfers.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-4 py-2.5 bg-[var(--purple-bg)] border border-[var(--purple-icon)] text-[var(--purple-text-strong)] font-semibold text-xs rounded-lg hover:bg-[var(--surface-hover)] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeftRight className="w-4 h-4" /> Transfer Stock
          </button>
          <button
            onClick={() => navigate('/dashboard/warehouses/new')}
            className="px-4 py-2.5 bg-[var(--teal-bg)] border border-[var(--teal-border)] text-[var(--teal-text-strong)] font-semibold text-xs rounded-lg hover:bg-[var(--surface-hover)] transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Warehouse
          </button>
        </div>
      </div>

      {/* Stock Transfer Modal */}
      {showTransferModal && (
        <StockTransferDialog
          isOpen={showTransferModal}
          onClose={() => {
            setShowTransferModal(false);
            dispatch(fetchWarehouses({ search, status }));
            dispatch(fetchWarehouseDashboardSummary());
          }}
        />
      )}

      {/* Dashboard Summary Cards */}
      {dashboardSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="content-card p-4 flex items-center gap-4 border-l-4 border-l-[var(--teal-border)]">
            <Warehouse className="w-8 h-8 text-teal-600 shrink-0" />
            <div>
              <span className="text-xs text-[var(--text-secondary)] font-semibold block uppercase">Total Active Locations</span>
              <span className="text-xl font-bold text-[var(--text-primary)]">{dashboardSummary.totalWarehouses} Warehouses</span>
            </div>
          </div>

          <div className="content-card p-4 flex items-center gap-4 border-l-4 border-l-[var(--purple-icon)]">
            <Boxes className="w-8 h-8 text-purple-600 shrink-0" />
            <div>
              <span className="text-xs text-[var(--text-secondary)] font-semibold block uppercase">Total Physical Stock</span>
              <span className="text-xl font-bold text-[var(--text-primary)]">{dashboardSummary.totalPhysicalStock.toLocaleString()} Units</span>
            </div>
          </div>

          <div className="content-card p-4 flex items-center gap-4 border-l-4 border-l-[var(--amber-icon)]">
            <RefreshCw className="w-8 h-8 text-amber-600 shrink-0" />
            <div>
              <span className="text-xs text-[var(--text-secondary)] font-semibold block uppercase">Warehouse Network</span>
              <span className="text-xl font-bold text-[var(--text-primary)]">Synced Real-Time</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter panel */}
      <div className="content-card flex flex-col md:flex-row gap-4 justify-between items-center text-xs">
        <div className="flex flex-1 gap-3 w-full md:w-auto items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search warehouse code, name, contact..."
              className="w-full border rounded-lg p-2.5 pl-9 bg-[var(--surface-card)]"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-lg p-2.5 bg-[var(--surface-card)]"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Warehouse Grid Cards */}
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="p-4 bg-[var(--red-bg)] text-[var(--red-text)] rounded-lg text-sm">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouseList.length === 0 ? (
            <div className="col-span-full content-card p-12 text-center text-sm text-[var(--text-muted)]">
              No warehouse locations matching query criteria.
            </div>
          ) : (
            warehouseList.map((wh) => (
              <div
                key={wh.id}
                className="content-card space-y-4 hover:border-[var(--teal-border)] transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 bg-[var(--teal-bg)] text-[var(--teal-text)] rounded-md font-mono text-[10px] font-bold">
                      {wh.code}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${wh.status === 'ACTIVE' ? 'bg-[var(--teal-bg)] text-[var(--teal-text)]' : 'bg-[var(--red-bg)] text-[var(--red-text)]'
                      }`}>
                      {wh.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-medium text-[var(--text-primary)]">{wh.name}</h3>

                  <div className="text-xs text-[var(--text-secondary)] space-y-1">
                    <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" /> {wh.address}</p>
                    <p className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" /> Contact: <span className="font-semibold text-[var(--text-primary)]">{wh.contactPerson}</span> ({wh.contactNumber})</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)] flex gap-2 justify-end">
                  <button
                    onClick={() => navigate(`/dashboard/warehouses/${wh.id}/edit`)}
                    className="px-3 py-1.5 border rounded-lg text-xs font-medium hover:bg-[var(--surface-hover)] flex items-center gap-1"
                  >
                    <Pencil className="w-3.5 h-3.5 text-amber-500" /> Edit
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/warehouses/${wh.id}`)}
                    className="px-3 py-1.5 bg-[var(--teal-bg)] border border-[var(--teal-border)] text-[var(--teal-text)] rounded-lg text-xs font-semibold hover:bg-[var(--surface-hover)] flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-teal-600" /> View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default WarehouseListPage;
