import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Save, Building2, FileText } from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { fetchSettings, updateSettings } from '../store/slices/enterpriseSlice';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

export const SettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { settings, loading } = useSelector((state: RootState) => state.enterprise);

  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [invoicePrefix, setInvoicePrefix] = useState('INV-');
  const [challanPrefix, setChallanPrefix] = useState('CH-');
  const [currency, setCurrency] = useState('INR');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [theme, setTheme] = useState('light');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setCompanyName(settings.companyName || '');
      setGstNumber(settings.gstNumber || '');
      setAddress(settings.address || '');
      setPhone(settings.phone || '');
      setEmail(settings.email || '');
      setWebsite(settings.website || '');
      setInvoicePrefix(settings.invoicePrefix || 'INV-');
      setChallanPrefix(settings.challanPrefix || 'CH-');
      setCurrency(settings.currency || 'INR');
      setTimezone(settings.timezone || 'Asia/Kolkata');
      setTheme(settings.theme || 'light');
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        companyName,
        gstNumber: gstNumber || null,
        address: address || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
        invoicePrefix,
        challanPrefix,
        currency,
        timezone,
        theme
      };

      await dispatch(updateSettings(payload)).unwrap();
      setToastMsg('Company settings saved successfully.');

      document.documentElement.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
    } catch (err: any) {
      setToastMsg(err || 'Failed to update settings');
    }
  };

  if (loading && !settings) {
    return <Loader />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {toastMsg && <Toast message={toastMsg} type="info" onClose={() => setToastMsg(null)} />}

      {/* Header */}
      <div className="border-b border-[var(--border)] pb-4">
        <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)] flex items-center gap-2">
          <Building2 className="w-6 h-6 text-[var(--teal-text)]" /> System Settings & Profile
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Manage corporate profile details, document prefix defaults, and regional configuration preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Corporate Information Panel */}
        <div className="content-card space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <Building2 className="w-5 h-5 text-[var(--teal-text)]" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Company Profile</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-[var(--text-secondary)] mb-1">Company Registered Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full border border-[var(--border)] rounded-lg p-2.5 bg-[var(--surface-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--teal-border)]"
                placeholder="e.g. NextGen Enterprise Solutions Ltd."
              />
            </div>

            <div>
              <label className="block font-medium text-[var(--text-secondary)] mb-1">Corporate GSTIN Number</label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="w-full border border-[var(--border)] rounded-lg p-2.5 bg-[var(--surface-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--teal-border)]"
                placeholder="e.g. 27AAAAA1111A1Z1"
              />
            </div>

            <div>
              <label className="block font-medium text-[var(--text-secondary)] mb-1">Office Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-[var(--border)] rounded-lg p-2.5 bg-[var(--surface-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--teal-border)]"
                placeholder="+91 22 5555 4444"
              />
            </div>

            <div>
              <label className="block font-medium text-[var(--text-secondary)] mb-1">Corporate Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[var(--border)] rounded-lg p-2.5 bg-[var(--surface-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--teal-border)]"
                placeholder="billing@company.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-[var(--text-secondary)] mb-1">Corporate Website URL</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full border border-[var(--border)] rounded-lg p-2.5 bg-[var(--surface-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--teal-border)]"
                placeholder="https://www.nextgenerp.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-[var(--text-secondary)] mb-1">Corporate Registered Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full border border-[var(--border)] rounded-lg p-2.5 bg-[var(--surface-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--teal-border)]"
                placeholder="Plot 12, SEZ Tech Park, Sector 4, Mumbai, India"
              />
            </div>
          </div>
        </div>

        {/* Document Prefixes & Localization Panel */}
        <div className="content-card space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <FileText className="w-5 h-5 text-[var(--teal-text)]" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Document Prefixes & Regional Settings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-[var(--text-secondary)] mb-1">Invoice Reference Prefix *</label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                required
                className="w-full border border-[var(--border)] rounded-lg p-2.5 bg-[var(--surface-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--teal-border)]"
              />
            </div>

            <div>
              <label className="block font-medium text-[var(--text-secondary)] mb-1">Delivery Challan Prefix *</label>
              <input
                type="text"
                value={challanPrefix}
                onChange={(e) => setChallanPrefix(e.target.value)}
                required
                className="w-full border border-[var(--border)] rounded-lg p-2.5 bg-[var(--surface-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--teal-border)]"
              />
            </div>

            <div>
              <label className="block font-medium text-[var(--text-secondary)] mb-1">Functional Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full border border-[var(--border)] rounded-lg p-2.5 bg-[var(--surface-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--teal-border)]"
              >
                <option value="INR">INR (₹) — Indian Rupee</option>
                <option value="USD">USD ($) — US Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[var(--text-secondary)] mb-1">Default Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full border border-[var(--border)] rounded-lg p-2.5 bg-[var(--surface-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--teal-border)]"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Theme Preference Panel */}


        {/* Submit Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3 bg-[var(--teal-bg)] border border-[var(--teal-border)] text-[var(--teal-text)] hover:bg-[var(--surface-hover)] font-semibold rounded-xl text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>

      </form>
    </div>
  );
};

export default SettingsPage;
