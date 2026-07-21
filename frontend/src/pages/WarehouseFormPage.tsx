import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import { createWarehouse, updateWarehouse, fetchWarehouseDetails } from '../store/slices/warehouseSlice';

export const WarehouseFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentWarehouse } = useSelector((state: RootState) => state.warehouse);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    contactPerson: '',
    contactNumber: '',
    status: 'ACTIVE'
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      dispatch(fetchWarehouseDetails(id));
    }
  }, [dispatch, isEdit, id]);

  useEffect(() => {
    if (isEdit && currentWarehouse) {
      setFormData({
        code: currentWarehouse.code || '',
        name: currentWarehouse.name || '',
        address: currentWarehouse.address || '',
        contactPerson: currentWarehouse.contactPerson || '',
        contactNumber: currentWarehouse.contactNumber || '',
        status: currentWarehouse.status || 'ACTIVE'
      });
    }
  }, [isEdit, currentWarehouse]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      setSubmitting(true);
      if (isEdit && id) {
        await dispatch(updateWarehouse({ id, payload: formData })).unwrap();
      } else {
        await dispatch(createWarehouse(formData)).unwrap();
      }
      navigate('/dashboard/warehouses');
    } catch (err: any) {
      setErrorMsg(err || 'Failed to save warehouse');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)]">
            {isEdit ? 'Edit Warehouse Location' : 'Register New Warehouse'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">Define warehouse profile metadata, address, and primary contact manager.</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/warehouses')}
          className="px-4 py-2 border rounded-lg text-xs font-medium hover:bg-[var(--surface-hover)]"
        >
          ← Back
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-[var(--red-bg)] text-[var(--red-text)] rounded-lg text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="content-card space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Warehouse Code *</label>
            <input
              type="text"
              name="code"
              disabled={isEdit}
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g. WH-NORTH-01"
              className="w-full border rounded-lg p-2.5 bg-[var(--surface-card)] disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Warehouse Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Northern Regional Distribution Hub"
              className="w-full border rounded-lg p-2.5 bg-[var(--surface-card)]"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Contact Person *</label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="e.g. Robert Smith"
              className="w-full border rounded-lg p-2.5 bg-[var(--surface-card)]"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Contact Phone *</label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="e.g. +91 9876543210"
              className="w-full border rounded-lg p-2.5 bg-[var(--surface-card)]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Full Physical Address *</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street address, city, state, postal code..."
            className="w-full border rounded-lg p-2.5 bg-[var(--surface-card)]"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Operational Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded-lg p-2.5 bg-[var(--surface-card)]"
          >
            <option value="ACTIVE">Active (Operational)</option>
            <option value="INACTIVE">Inactive (Suspended)</option>
          </select>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/dashboard/warehouses')}
            className="px-4 py-2 border rounded-lg text-xs font-medium hover:bg-[var(--surface-hover)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-[var(--teal-bg)] border border-[var(--teal-border)] text-[var(--teal-text-strong)] font-semibold rounded-lg hover:bg-[var(--surface-hover)]"
          >
            {submitting ? 'Saving...' : isEdit ? 'Update Warehouse' : 'Save Warehouse'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WarehouseFormPage;
