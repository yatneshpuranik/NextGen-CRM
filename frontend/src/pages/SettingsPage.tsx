import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchSettings, updateSettings } from '../store/slices/enterpriseSlice';
import api from '../utils/api';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

export const SettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { settings, loading } = useSelector((state: RootState) => state.enterprise);

  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
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
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setCompanyName(settings.companyName || '');
      setCompanyLogo(settings.companyLogo || '');
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setToastMsg('Image file size must be less than 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const res = await api.post('/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setCompanyLogo(res.data.data.url);
      setToastMsg('Company Logo uploaded successfully');
    } catch (err: any) {
      setToastMsg(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        companyName,
        companyLogo: companyLogo || null,
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

      // Dynamic theme class application
      document.documentElement.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
    } catch (err: any) {
      setToastMsg(err || 'Failed to update settings');
    }
  };

  if (loading && !settings) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Toasts */}
      {toastMsg && <Toast message={toastMsg} type="info" onClose={() => setToastMsg(null)} />}

      <div>
        <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)]">ERP Workspace Config</h2>
        <p className="text-sm text-[var(--text-secondary)]">Manage document prefixes, company branding profiles, and global currency layouts.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Company Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="content-card space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)] border-b border-[var(--border)] pb-2">Company Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Company Registered Name</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="w-full border rounded-lg p-2.5 bg-[var(--surface-card)]"
                  placeholder="e.g. NextGen Enterprise Solutions Ltd."
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Corporate GSTIN Number</label>
                <input 
                  type="text" 
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full border rounded-lg p-2.5 bg-[var(--surface-card)]"
                  placeholder="e.g. 27AAAAA1111A1Z1"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Office Contact Phone</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border rounded-lg p-2.5 bg-[var(--surface-card)]"
                  placeholder="+91 22 5555 4444"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Corporate Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-lg p-2.5 bg-[var(--surface-card)]"
                  placeholder="billing@company.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Corporate Website URL</label>
                <input 
                  type="text" 
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full border rounded-lg p-2.5 bg-[var(--surface-card)]"
                  placeholder="https://www.nextgenerp.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Corporate Mailing Address</label>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full border rounded-lg p-2.5 bg-[var(--surface-card)]"
                  placeholder="Plot 12, SEZ Tech Park, Sector 4, Mumbai, India"
                />
              </div>
            </div>
          </div>

          <div className="content-card space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)] border-b border-[var(--border)] pb-2">Document Prefix & Localization</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Invoice Reference Prefix</label>
                <input 
                  type="text" 
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  required
                  className="w-full border rounded-lg p-2.5 bg-[var(--surface-card)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Delivery Challan Prefix</label>
                <input 
                  type="text" 
                  value={challanPrefix}
                  onChange={(e) => setChallanPrefix(e.target.value)}
                  required
                  className="w-full border rounded-lg p-2.5 bg-[var(--surface-card)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Functional Currency</label>
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full border rounded-lg p-2.5 bg-[var(--surface-card)]"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Default Timezone</label>
                <select 
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full border rounded-lg p-2.5 bg-[var(--surface-card)]"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Logo Branding & Theme panel */}
        <div className="space-y-6">
          <div className="content-card space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)] border-b border-[var(--border)] pb-2">Branding & Logo</h3>
            
            <div className="space-y-4 text-xs text-center">
              <div className="w-32 h-32 mx-auto bg-[var(--surface-page)] border rounded-lg overflow-hidden flex items-center justify-center relative">
                {companyLogo ? (
                  <img src={companyLogo} alt="Company Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs text-[var(--text-muted)]">No Logo</span>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-semibold">
                    Uploading...
                  </div>
                )}
              </div>
              
              <div>
                <input 
                  type="file" 
                  id="logoUpload" 
                  accept="image/*" 
                  onChange={handleLogoUpload}
                  className="hidden" 
                />
                <label 
                  htmlFor="logoUpload"
                  className="inline-block px-4 py-2 border border-[var(--teal-border)] bg-[var(--teal-bg)] text-[var(--teal-text)] font-semibold rounded-lg cursor-pointer hover:bg-[var(--surface-hover)] transition-colors"
                >
                  Upload Logo
                </label>
              </div>
            </div>
          </div>

          <div className="content-card space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)] border-b border-[var(--border)] pb-2">Application Interface Theme</h3>
            
            <div className="text-xs space-y-3">
              <label className="block font-semibold text-[var(--text-secondary)]">Preferred Color Theme</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-3 border rounded-lg text-center font-medium ${theme === 'light' ? 'border-[var(--teal-border)] bg-[var(--teal-bg)] text-[var(--teal-text)]' : 'hover:bg-[var(--surface-hover)]'}`}
                >
                  ☀️ Light Mode
                </button>
                <button 
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-3 border rounded-lg text-center font-medium ${theme === 'dark' ? 'border-[var(--teal-border)] bg-[var(--teal-bg)] text-[var(--teal-text)]' : 'hover:bg-[var(--surface-hover)]'}`}
                >
                  🌙 Dark Mode
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              type="submit" 
              className="w-full py-3 bg-[var(--teal-bg)] border border-[var(--teal-border)] text-[var(--teal-text)] hover:bg-[var(--surface-hover)] font-semibold rounded-lg text-sm text-center shadow-xs transition-colors"
            >
              💾 Save Configuration
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default SettingsPage;
