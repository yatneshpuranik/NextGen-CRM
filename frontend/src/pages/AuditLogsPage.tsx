import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchAuditLogs } from '../store/slices/enterpriseSlice';
import Loader from '../components/Loader';

export const AuditLogsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { auditLogs, auditPagination, loading, error } = useSelector((state: RootState) => state.enterprise);

  const [search, setSearch] = useState('');
  const [module, setModule] = useState('');
  const [action, setAction] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const handleFetchLogs = (targetPage: number) => {
    const params: any = {
      page: targetPage.toString(),
      limit: '15',
      search: search || undefined,
      module: module || undefined,
      action: action || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    };
    dispatch(fetchAuditLogs(params));
    setPage(targetPage);
  };

  useEffect(() => {
    handleFetchLogs(1);
  }, []);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFetchLogs(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setModule('');
    setAction('');
    setStartDate('');
    setEndDate('');
    const params: any = { page: '1', limit: '15' };
    dispatch(fetchAuditLogs(params));
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)]">System Audit Trails</h2>
        <p className="text-sm text-[var(--text-secondary)]">Inspect transactional mutations, logins, settings, and database alterations.</p>
      </div>

      {/* Filter panel */}
      <form onSubmit={handleFilterSubmit} className="content-card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-[var(--text-secondary)] mb-1">Search Keywords</label>
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search user, emails, status..." 
              className="w-full border rounded-lg p-2 bg-[var(--surface-card)]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-secondary)] mb-1">Target Module</label>
            <select 
              value={module} 
              onChange={(e) => setModule(e.target.value)} 
              className="w-full border rounded-lg p-2 bg-[var(--surface-card)]"
            >
              <option value="">All Modules</option>
              <option value="AUTH">Authentication</option>
              <option value="CUSTOMER">Customer CRM</option>
              <option value="PRODUCT">Product Catalog</option>
              <option value="INVENTORY">Inventory Management</option>
              <option value="CHALLAN">Sales Challan</option>
              <option value="SETTINGS">Company Settings</option>
              <option value="BACKUP">Database Backup</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-secondary)] mb-1">Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="w-full border rounded-lg p-2 bg-[var(--surface-card)]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-secondary)] mb-1">End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="w-full border rounded-lg p-2 bg-[var(--surface-card)]"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button 
            type="button" 
            onClick={handleResetFilters} 
            className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-[var(--surface-hover)]"
          >
            Clear Filters
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-[var(--teal-bg)] border border-[var(--teal-border)] text-[var(--teal-text)] rounded-lg text-sm font-medium hover:bg-[var(--surface-hover)]"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {/* Logs Table */}
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="p-4 bg-[var(--red-bg)] text-[var(--red-text)] rounded-lg text-sm">{error}</div>
      ) : (
        <div className="content-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-hover)]">
                  <th className="p-4 font-semibold text-[var(--text-secondary)]">Timestamp</th>
                  <th className="p-4 font-semibold text-[var(--text-secondary)]">User</th>
                  <th className="p-4 font-semibold text-[var(--text-secondary)]">Module</th>
                  <th className="p-4 font-semibold text-[var(--text-secondary)]">Action</th>
                  <th className="p-4 font-semibold text-[var(--text-secondary)]">IP Address</th>
                  <th className="p-4 font-semibold text-[var(--text-secondary)]">User Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-[var(--text-muted)]">
                      No audit trail logs match your active query.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="p-4 text-[var(--text-muted)] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 font-medium text-[var(--text-primary)]">
                        {log.user ? `${log.user.fullName} (${log.user.role})` : 'System Daemon'}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-[var(--purple-bg)] text-[var(--purple-text)] rounded-md font-semibold text-[10px]">
                          {log.module}
                        </span>
                      </td>
                      <td className="p-4 font-semibold">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                          log.action === 'DELETE' ? 'bg-[var(--red-bg)] text-[var(--red-text)]' :
                          log.action === 'CREATE' ? 'bg-[var(--teal-bg)] text-[var(--teal-text)]' :
                          'bg-[var(--amber-bg)] text-[var(--amber-text)]'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-[var(--text-secondary)]">{log.ipAddress || '127.0.0.1'}</td>
                      <td className="p-4 text-[var(--text-muted)] truncate max-w-[200px]" title={log.userAgent || ''}>
                        {log.userAgent || 'API request'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {auditPagination && auditPagination.totalPages > 1 && (
            <div className="p-4 border-t border-[var(--border)] flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)]">
                Showing Page {page} of {auditPagination.totalPages} ({auditPagination.totalRecords} total entries)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => handleFetchLogs(page - 1)}
                  className="px-3 py-1.5 border rounded-lg font-medium hover:bg-[var(--surface-hover)] disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= auditPagination.totalPages}
                  onClick={() => handleFetchLogs(page + 1)}
                  className="px-3 py-1.5 border rounded-lg font-medium hover:bg-[var(--surface-hover)] disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
