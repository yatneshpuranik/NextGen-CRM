import React, { useState } from 'react';
import { Upload, FileText, FileSpreadsheet, X, AlertTriangle, CircleCheck, Download } from 'lucide-react';
import api from '../utils/api';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: string;
  moduleTitle: string;
  onSuccess: () => void;
}

export interface ImportErrorDetail {
  rowNumber: number;
  identifier: string;
  reason: string;
  rawData?: Record<string, any>;
}

export interface ImportResult {
  totalRows: number;
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: ImportErrorDetail[];
  failedRowsCsv?: string;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  module,
  moduleTitle,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx') {
      setErrorMsg('Invalid file extension. Only .csv and .xlsx files are supported.');
      setFile(null);
      return;
    }

    setErrorMsg(null);
    setFile(selectedFile);
    setResult(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    const ext = droppedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx') {
      setErrorMsg('Invalid file extension. Only .csv and .xlsx files are supported.');
      setFile(null);
      return;
    }

    setErrorMsg(null);
    setFile(droppedFile);
    setResult(null);
  };

  const downloadTemplate = async (format: 'csv' | 'xlsx') => {
    try {
      const response = await api.get(`/import-export/template/${module}?format=${format}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${module}_sample_template.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setErrorMsg('Failed to download template file');
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a file to upload');
      return;
    }

    setLoading(true);
    setProgress(30);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setProgress(60);
      const res = await api.post(`/import-export/import/${module}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProgress(100);
      setResult(res.data.data);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Bulk import request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFailedRows = async () => {
    if (!result?.failedRowsCsv) return;

    try {
      const response = await api.post(
        '/import-export/download-failed',
        { failedRowsCsv: result.failedRowsCsv, module },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${module}_failed_rows.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setErrorMsg('Failed to download error records CSV');
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setErrorMsg(null);
    setProgress(0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[var(--surface-card)] rounded-xl max-w-2xl w-full border border-[var(--border)] p-6 space-y-6 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Bulk Import — {moduleTitle}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Upload .CSV or .XLSX file to perform bulk create or update operations.
            </p>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg hover:bg-[var(--surface-hover)] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Downloads bar */}
        <div className="bg-[var(--surface-hover)] p-3 rounded-lg flex items-center justify-between text-xs">
          <span className="text-[var(--text-secondary)] font-medium">Need a starter structure?</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => downloadTemplate('csv')}
              className="px-2.5 py-1 border border-[var(--border)] rounded bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] font-semibold text-[var(--text-primary)] transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-blue-500" /> CSV Template
            </button>
            <button
              type="button"
              onClick={() => downloadTemplate('xlsx')}
              className="px-2.5 py-1 border border-[var(--border)] rounded bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] font-semibold text-[var(--teal-text-strong)] transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Excel (.xlsx) Template
            </button>
          </div>
        </div>

        {/* Upload Form or Summary Report */}
        {!result ? (
          <form onSubmit={handleImportSubmit} className="space-y-4">
            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center space-y-3 hover:border-[var(--teal-border)] transition bg-[var(--surface-page)]"
            >
              <Upload className="w-10 h-10 mx-auto text-[var(--teal-text-strong)] opacity-80" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {file ? file.name : 'Drag & drop file here, or click to browse'}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Supported extensions: <span className="font-mono font-bold text-[var(--text-secondary)]">.csv, .xlsx</span> (Max 10 MB)
                </p>
              </div>

              <input
                type="file"
                accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv"
                onChange={handleFileChange}
                className="hidden"
                id="bulk-import-file-input"
              />
              <label
                htmlFor="bulk-import-file-input"
                className="inline-block px-4 py-2 bg-[var(--surface-card)] border border-[var(--border)] rounded-lg text-xs font-semibold cursor-pointer hover:bg-[var(--surface-hover)] transition"
              >
                {file ? 'Change File' : 'Select File'}
              </label>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-[var(--red-bg)] text-[var(--red-text)] rounded-lg text-xs font-medium border border-[var(--red-border)] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Progress Bar */}
            {loading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-[var(--text-secondary)]">
                  <span>Uploading & validating rows...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-[var(--border)] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[var(--teal-bg)] h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                disabled={loading}
                className="px-4 py-2 border border-[var(--border)] rounded-lg text-xs font-medium hover:bg-[var(--surface-hover)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file || loading}
                className="btn-primary-action text-xs px-5 py-2 disabled:opacity-50 flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                {loading ? 'Processing Upload...' : 'Upload & Start Import'}
              </button>
            </div>
          </form>
        ) : (
          /* Import Result & Error Summary */
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-page)]">
                <span className="text-xl font-bold block text-[var(--text-primary)]">{result.totalRows}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">Total Rows</span>
              </div>
              <div className="p-3 rounded-lg border border-[var(--teal-border)] bg-[var(--teal-bg)] text-[var(--teal-text-strong)]">
                <span className="text-xl font-bold block">{result.imported}</span>
                <span className="text-[10px] font-semibold uppercase">Imported</span>
              </div>
              <div className="p-3 rounded-lg border border-purple-200 bg-purple-50 text-purple-700">
                <span className="text-xl font-bold block">{result.updated}</span>
                <span className="text-[10px] font-semibold uppercase">Updated</span>
              </div>
              <div className="p-3 rounded-lg border border-[var(--red-border)] bg-[var(--red-bg)] text-[var(--red-icon)]">
                <span className="text-xl font-bold block">{result.failed}</span>
                <span className="text-[10px] font-semibold uppercase">Failed</span>
              </div>
            </div>

            {/* Error Report List if failed > 0 */}
            {result.errors.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-[var(--red-icon)] uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    Error Log ({result.errors.length} Rows Flagged)
                  </h4>
                  {result.failedRowsCsv && (
                    <button
                      type="button"
                      onClick={handleDownloadFailedRows}
                      className="px-2.5 py-1 text-xs bg-[var(--red-bg)] border border-[var(--red-border)] text-[var(--red-icon)] font-semibold rounded hover:opacity-90 transition flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Failed Rows CSV
                    </button>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto border border-[var(--border)] rounded-lg">
                  <table className="modern-table text-xs">
                    <thead>
                      <tr>
                        <th className="py-2">Row #</th>
                        <th className="py-2">Identifier</th>
                        <th className="py-2">Failure Cause</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((err, idx) => (
                        <tr key={idx} className="hover:bg-[var(--surface-hover)]">
                          <td className="py-1.5 font-mono text-[var(--text-muted)]">#{err.rowNumber}</td>
                          <td className="py-1.5 font-medium text-[var(--text-primary)]">{err.identifier}</td>
                          <td className="py-1.5 text-[var(--red-icon)] font-medium">{err.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[var(--teal-bg)] border border-[var(--teal-border)] text-[var(--teal-text-strong)] rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-2">
                <CircleCheck className="w-4 h-4 text-teal-600" />
                <span>All {result.totalRows} rows processed and ingested cleanly with zero validation errors!</span>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 border border-[var(--border)] rounded-lg text-xs font-medium hover:bg-[var(--surface-hover)]"
              >
                Upload Another File
              </button>
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                className="btn-primary-action text-xs px-5 py-2"
              >
                Done & Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportModal;
