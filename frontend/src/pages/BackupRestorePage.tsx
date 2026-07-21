import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AlertTriangle, Download, Upload, Users, Package, Warehouse, FileText } from 'lucide-react';
import type { AppDispatch } from '../store';
import { restoreDatabase } from '../store/slices/enterpriseSlice';
import Toast from '../components/Toast';

export const BackupRestorePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingBackupData, setPendingBackupData] = useState<any>(null);

  const getAuthToken = () => localStorage.getItem('token') || '';
  const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const triggerJsonExport = () => {
    window.open(`${getApiUrl()}/backup/export?token=${getAuthToken()}`, '_blank');
    setToastMsg('Downloading JSON Database backup envelope...');
  };

  const triggerCsvExport = (type: string) => {
    window.open(`${getApiUrl()}/backup/csv/${type}?token=${getAuthToken()}`, '_blank');
    setToastMsg(`Downloading CSV file for ${type}...`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.tables || !parsed.version) {
          setToastMsg('Invalid database backup JSON schema.');
          return;
        }
        setPendingBackupData(parsed);
        setShowConfirmModal(true);
      } catch (err) {
        setToastMsg('Failed to parse file as valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  const executeRestore = async () => {
    if (!pendingBackupData) return;

    try {
      await dispatch(restoreDatabase(pendingBackupData)).unwrap();
      setToastMsg('Database restored successfully! Reloading...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setToastMsg(err || 'Failed to execute database restore');
    } finally {
      setShowConfirmModal(false);
      setPendingBackupData(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && <Toast message={toastMsg} type="info" onClose={() => setToastMsg(null)} />}

      {/* Double Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--surface-card)] rounded-lg p-6 max-w-md w-full border border-[var(--border)] space-y-4">
            <h4 className="text-lg font-medium text-[var(--red-text)] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Warning: Destructive Restore Action
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              This action will completely truncate and clear all active records inside your database tables (including Customers, Products, Stock Transactions, Inventory levels, and Delivery Challans) and reload them from the backup envelope.
            </p>
            <p className="text-xs font-semibold text-[var(--text-primary)]">
              Are you absolutely sure you want to proceed?
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingBackupData(null);
                }}
                className="px-4 py-2 border rounded-lg text-xs font-medium hover:bg-[var(--surface-hover)]"
              >
                Cancel
              </button>
              <button
                onClick={executeRestore}
                className="px-4 py-2 bg-[var(--red-bg)] border border-[var(--red-icon)] text-[var(--red-text)] rounded-lg text-xs font-medium hover:bg-[var(--surface-hover)]"
              >
                Yes, Restore Database
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)]">Data Backup & Restore Center</h2>
        <p className="text-sm text-[var(--text-secondary)]">Export full JSON backups, import historical databases, or download localized CSV tables.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Backup Operations */}
        <div className="content-card space-y-4">
          <h3 className="text-lg font-medium text-[var(--text-primary)] border-b border-[var(--border)] pb-2">JSON Backup & Restore</h3>

          <div className="space-y-4 text-xs">
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Export the entire relational database (tables: users, products, stock ledgers, CRM databases, delivery details) as a consolidated JSON payload. Keep this file secure as it contains all transactional history.
            </p>

            <button
              onClick={triggerJsonExport}
              className="w-full py-2.5 bg-[var(--teal-bg)] border border-[var(--teal-border)] text-[var(--teal-text)] font-semibold rounded-lg hover:bg-[var(--surface-hover)] transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Full JSON Backup
            </button>

            <div className="border-t border-[var(--border)] pt-4 space-y-2">
              <span className="block font-semibold text-[var(--text-secondary)]">Restore Database from JSON Backup</span>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Upload a previously exported JSON backup file to overwrite current database state.
              </p>

              <input
                type="file"
                id="restoreUpload"
                accept="application/json"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="restoreUpload"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 border border-[var(--red-icon)] bg-[var(--red-bg)] text-[var(--red-text)] font-semibold rounded-lg cursor-pointer hover:bg-[var(--surface-hover)] transition-colors text-center"
              >
                <Upload className="w-4 h-4" /> Upload & Restore JSON Database
              </label>
            </div>
          </div>
        </div>

        {/* CSV Ledger Exports */}
        <div className="content-card space-y-4">
          <h3 className="text-lg font-medium text-[var(--text-primary)] border-b border-[var(--border)] pb-2">CSV Ledger Tables Export</h3>

          <div className="space-y-4 text-xs">
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Download clean spreadsheet-compatible CSV tables for localized accounting integrations or dashboard auditing reports.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => triggerCsvExport('customers')}
                className="p-3 border border-[var(--border)] hover:border-[var(--teal-border)] rounded-lg text-center hover:bg-[var(--surface-hover)] transition-all font-semibold flex items-center justify-center gap-1.5"
              >
                <Users className="w-4 h-4 text-purple-600" /> Customers CSV
              </button>
              <button
                onClick={() => triggerCsvExport('products')}
                className="p-3 border border-[var(--border)] hover:border-[var(--teal-border)] rounded-lg text-center hover:bg-[var(--surface-hover)] transition-all font-semibold flex items-center justify-center gap-1.5"
              >
                <Package className="w-4 h-4 text-teal-600" /> Products CSV
              </button>
              <button
                onClick={() => triggerCsvExport('inventory')}
                className="p-3 border border-[var(--border)] hover:border-[var(--teal-border)] rounded-lg text-center hover:bg-[var(--surface-hover)] transition-all font-semibold flex items-center justify-center gap-1.5"
              >
                <Warehouse className="w-4 h-4 text-blue-600" /> Inventory CSV
              </button>
              <button
                onClick={() => triggerCsvExport('sales')}
                className="p-3 border border-[var(--border)] hover:border-[var(--teal-border)] rounded-lg text-center hover:bg-[var(--surface-hover)] transition-all font-semibold flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-amber-600" /> Sales Challans CSV
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BackupRestorePage;
