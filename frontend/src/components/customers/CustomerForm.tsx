import React, { useState, useEffect } from 'react';
import Loader from '../Loader';

interface CustomerFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  backendErrors?: { [key: string]: string };
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
  backendErrors = {},
}) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    alternatePhone: '',
    gstNumber: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    customerType: 'RETAIL',
    notes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        companyName: initialData.companyName || '',
        contactPerson: initialData.contactPerson || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        alternatePhone: initialData.alternatePhone || '',
        gstNumber: initialData.gstNumber || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        country: initialData.country || 'India',
        pincode: initialData.pincode || '',
        customerType: initialData.customerType || 'RETAIL',
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Must be a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
      newErrors.gstNumber = 'Invalid GSTIN format (e.g. 27AAAAA1111A1Z1)';
    }

    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be exactly 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  // Merge client and server errors
  const mergedErrors = { ...errors, ...backendErrors };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Name */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Company Name *
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm"
            placeholder="Acme Corp"
          />
          {mergedErrors.companyName && (
            <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{mergedErrors.companyName}</p>
          )}
        </div>

        {/* Contact Person */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Contact Person *
          </label>
          <input
            type="text"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm"
            placeholder="John Doe"
          />
          {mergedErrors.contactPerson && (
            <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{mergedErrors.contactPerson}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm"
            placeholder="billing@acme.com"
          />
          {mergedErrors.email && (
            <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{mergedErrors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Phone *
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm"
            placeholder="+919876543210"
          />
          {mergedErrors.phone && (
            <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{mergedErrors.phone}</p>
          )}
        </div>

        {/* Alternate Phone */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Alternate Phone
          </label>
          <input
            type="text"
            name="alternatePhone"
            value={formData.alternatePhone}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm"
            placeholder="+919876543211"
          />
          {mergedErrors.alternatePhone && (
            <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{mergedErrors.alternatePhone}</p>
          )}
        </div>

        {/* GSTIN */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            GST Number
          </label>
          <input
            type="text"
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm uppercase"
            placeholder="27AAAAA1111A1Z1"
          />
          {mergedErrors.gstNumber && (
            <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{mergedErrors.gstNumber}</p>
          )}
        </div>

        {/* Customer Type */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Customer Type *
          </label>
          <select
            name="customerType"
            value={formData.customerType}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm bg-white"
          >
            <option value="RETAIL">Retail</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
          </select>
          {mergedErrors.customerType && (
            <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{mergedErrors.customerType}</p>
          )}
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Pincode *
          </label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm"
            placeholder="400001"
          />
          {mergedErrors.pincode && (
            <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{mergedErrors.pincode}</p>
          )}
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Street Address *
          </label>
          <textarea
            name="address"
            rows={3}
            value={formData.address}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm resize-none"
            placeholder="Unit 201, Industrial Zone..."
          />
          {mergedErrors.address && (
            <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{mergedErrors.address}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm"
            placeholder="Mumbai"
          />
          {mergedErrors.city && (
            <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{mergedErrors.city}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            State *
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm"
            placeholder="Maharashtra"
          />
          {mergedErrors.state && (
            <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{mergedErrors.state}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Country *
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm"
            placeholder="India"
          />
          {mergedErrors.country && (
            <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{mergedErrors.country}</p>
          )}
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Notes / Internal Remarks
          </label>
          <textarea
            name="notes"
            rows={2}
            value={formData.notes}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--teal-border)] text-sm resize-none"
            placeholder="Any special remarks or shipping terms."
          />
          {mergedErrors.notes && (
            <p className="mt-1 text-xs text-[var(--red-icon)] font-medium">{mergedErrors.notes}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border border-[var(--border)] hover:bg-[var(--surface-hover)] rounded-lg text-sm font-medium text-[var(--text-secondary)] transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary-action min-w-[100px]"
        >
          {loading ? <Loader size="sm" light /> : 'Save Profile'}
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;
