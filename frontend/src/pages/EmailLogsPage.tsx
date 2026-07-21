import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/Loader';

interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  status: string;
  failureReason?: string;
  sentTime: string;
}

export const EmailLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/email-logs', {
        params: { search, status, page, limit: 15 }
      });
      setLogs(res.data.data.records);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error('Failed to fetch email logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, status, page]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)]">Intelligent Email Logs</h2>
        <p className="text-sm text-[var(--text-secondary)]">Audit automated system notifications, welcome messages, low stock warnings, and invoice dispatches.</p>
      </div>

      {/* Filter panel */}
      <div className="content-card flex flex-col md:flex-row gap-4 justify-between items-center text-xs">
        <div className="flex flex-1 gap-3 w-full md:w-auto items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search recipient email or subject..."
              className="w-full border rounded-lg py-2 pl-10 pr-3 bg-[var(--surface-card)] text-sm"
            />
          </div>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="border rounded-lg p-2.5 bg-[var(--surface-card)]"
          >
            <option value="">All Statuses</option>
            <option value="SENT">Sent Successfully</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-2 border rounded-lg hover:bg-[var(--surface-hover)] font-medium"
        >
          🔄 Refresh Logs
        </button>
      </div>

      {/* Email Table */}
      {loading ? (
        <Loader />
      ) : (
        <div className="content-card p-0 overflow-hidden space-y-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--surface-hover)] border-b text-[var(--text-secondary)]">
                <th className="p-3">Sent Timestamp</th>
                <th className="p-3">Recipient Email</th>
                <th className="p-3">Subject Line</th>
                <th className="p-3">Delivery Status</th>
                <th className="p-3">Failure Diagnostic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">No automated email dispatches recorded yet.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--surface-hover)]">
                    <td className="p-3 text-[var(--text-secondary)] whitespace-nowrap">{new Date(log.sentTime).toLocaleString()}</td>
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{log.recipient}</td>
                    <td className="p-3 text-[var(--text-primary)] font-medium">{log.subject}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SENT' ? 'bg-[var(--teal-bg)] text-[var(--teal-text)]' : 'bg-[var(--red-bg)] text-[var(--red-text)]'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-[var(--red-text)] font-mono text-[11px]">{log.failureReason || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t flex justify-between items-center text-xs">
              <span>Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalRecords} total logs)</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-40"
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

export default EmailLogsPage;
