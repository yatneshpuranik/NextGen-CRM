import React, { useState } from 'react';
import { Download, ChevronDown, FileText, FileSpreadsheet } from 'lucide-react';
import api from '../utils/api';

interface ExportButtonProps {
  module: string;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ module, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    setLoading(true);
    setIsOpen(false);

    try {
      const response = await api.get(`/import-export/export/${module}?format=${format}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `${module}_export_${dateStr}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error('Export error:', err);
      let errorMsg = 'Failed to generate export file';
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          if (parsed.message) errorMsg = parsed.message;
        } catch (_) {}
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      alert(`Export Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={
          className ||
          'px-3.5 py-2 border border-[var(--border)] rounded-lg text-xs font-semibold bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] transition flex items-center gap-1.5 disabled:opacity-50'
        }
      >
        <Download className="w-4 h-4" /> {loading ? 'Exporting...' : 'Export'}
        <ChevronDown className="w-3 h-3 text-[var(--text-muted)] ml-0.5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1 w-44 bg-[var(--surface-card)] border border-[var(--border)] rounded-lg shadow-lg py-1 text-left z-30 text-xs font-medium">
            <button
              type="button"
              onClick={() => handleExport('csv')}
              className="w-full px-4 py-2 hover:bg-[var(--surface-hover)] text-[var(--text-primary)] flex items-center gap-2 transition"
            >
              <FileText className="w-4 h-4 text-blue-500" /> Export CSV (.csv)
            </button>
            <button
              type="button"
              onClick={() => handleExport('xlsx')}
              className="w-full px-4 py-2 hover:bg-[var(--surface-hover)] text-[var(--teal-text-strong)] flex items-center gap-2 transition border-t border-[var(--border)]"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export Excel (.xlsx)
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
